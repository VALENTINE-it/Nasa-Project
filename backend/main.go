package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

const (
	sessionCookieName = "aura_session"
	maxRequestsPerMin = 60
)

var (
	db *sql.DB
	mu sync.Mutex

	sessionStore   = map[string]sessionUser{}
	rateLimitStore = map[string][]time.Time{}
)

type sessionUser struct {
	AstronautID int    `json:"astronautId"`
	Username    string `json:"username"`
	Role        string `json:"role"`
}

type astronautProfile struct {
	ID                  int    `json:"id"`
	AstronautID         string `json:"astronautId"`
	FullName            string `json:"fullName"`
	AvatarURL           string `json:"avatarUrl"`
	Mission             string `json:"mission"`
	MonitoringStatus    string `json:"monitoringStatus"`
	PersonalOverview    string `json:"personalOverview"`
	CurrentHealthStatus string `json:"currentHealthStatus"`
	LoginUsername       string `json:"loginUsername,omitempty"`
}

type healthRecord struct {
	ID                 int     `json:"id"`
	AstronautID        int     `json:"astronautId"`
	HeartRate          int     `json:"heartRate"`
	BloodPressure      string  `json:"bloodPressure"`
	BloodOxygen        int     `json:"bloodOxygen"`
	BodyTemperature    float64 `json:"bodyTemperature"`
	RespiratoryRate    int     `json:"respiratoryRate"`
	SleepDuration      float64 `json:"sleepDuration"`
	PhysicalActivity   int     `json:"physicalActivity"`
	RecordedAt         string  `json:"recordedAt"`
	WarningDescription string  `json:"warningDescription,omitempty"`
}

type healthAlert struct {
	ID            int    `json:"id"`
	AstronautID   int    `json:"astronautId"`
	Severity      string `json:"severity"`
	MetricName    string `json:"metricName"`
	Description   string `json:"description"`
	ObservedValue string `json:"observedValue"`
	Threshold     string `json:"threshold"`
	Status        string `json:"status"`
	CreatedAt     string `json:"createdAt"`
}

type dashboardResponse struct {
	Profile astronautProfile   `json:"profile"`
	Latest  healthRecord       `json:"latest"`
	History []healthRecord     `json:"history"`
	Alerts  []healthAlert      `json:"alerts"`
	Summary map[string]float64 `json:"summary"`
}

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type createHealthRequest struct {
	HeartRate              int     `json:"heartRate"`
	BloodPressureSystolic  int     `json:"bloodPressureSystolic"`
	BloodPressureDiastolic int     `json:"bloodPressureDiastolic"`
	BloodOxygen            int     `json:"bloodOxygen"`
	BodyTemperature        float64 `json:"bodyTemperature"`
	RespiratoryRate        int     `json:"respiratoryRate"`
	SleepDuration          float64 `json:"sleepDuration"`
	PhysicalActivity       int     `json:"physicalActivity"`
}

func initDB() error {
	if err := os.MkdirAll(filepath.Join(".", "data"), 0o755); err != nil {
		return err
	}

	dbPath := filepath.Join(".", "data", "aura_med.db")
	var err error
	db, err = sql.Open("sqlite3", dbPath)
	if err != nil {
		return err
	}

	statements := []string{
		`CREATE TABLE IF NOT EXISTS astronauts (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			astronaut_id TEXT NOT NULL UNIQUE,
			full_name TEXT NOT NULL,
			avatar_url TEXT NOT NULL,
			mission TEXT NOT NULL,
			monitoring_status TEXT NOT NULL,
			personal_health_overview TEXT NOT NULL,
			current_health_status TEXT NOT NULL,
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			astronaut_id INTEGER NOT NULL UNIQUE,
			username TEXT NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			role TEXT NOT NULL DEFAULT 'astronaut',
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(astronaut_id) REFERENCES astronauts(id)
		);`,
		`CREATE TABLE IF NOT EXISTS health_records (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			astronaut_id INTEGER NOT NULL,
			heart_rate INTEGER NOT NULL,
			blood_pressure_systolic INTEGER NOT NULL,
			blood_pressure_diastolic INTEGER NOT NULL,
			blood_oxygen INTEGER NOT NULL,
			body_temperature REAL NOT NULL,
			respiratory_rate INTEGER NOT NULL,
			sleep_duration_hours REAL NOT NULL,
			physical_activity INTEGER NOT NULL,
			recorded_at TEXT NOT NULL,
			FOREIGN KEY(astronaut_id) REFERENCES astronauts(id)
		);`,
		`CREATE TABLE IF NOT EXISTS health_alerts (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			astronaut_id INTEGER NOT NULL,
			severity TEXT NOT NULL,
			metric_name TEXT NOT NULL,
			description TEXT NOT NULL,
			observed_value TEXT NOT NULL,
			threshold_value TEXT NOT NULL,
			status TEXT NOT NULL,
			created_at TEXT NOT NULL,
			FOREIGN KEY(astronaut_id) REFERENCES astronauts(id)
		);`,
	}

	for _, stmt := range statements {
		if _, err = db.Exec(stmt); err != nil {
			return err
		}
	}

	if err = seedDemoData(); err != nil {
		return err
	}
	return nil
}

func seedDemoData() error {
	profiles := []astronautProfile{
		{
			FullName:            "Elena Park",
			AstronautID:         "A-2041",
			AvatarURL:           "/avatars/astronaut-1.svg",
			Mission:             "Artemis Lunar Surface Simulation",
			MonitoringStatus:    "Nominal",
			PersonalOverview:    "Crew physiologist and EVA specialist focused on endurance and recovery stability.",
			CurrentHealthStatus: "Stable",
		},
		{
			FullName:            "Daniel Ortiz",
			AstronautID:         "A-2056",
			AvatarURL:           "/avatars/astronaut-2.svg",
			Mission:             "Mars Transit Logistics",
			MonitoringStatus:    "Watchlist",
			PersonalOverview:    "Mission operations specialist tracking sleep debt and cardiovascular strain.",
			CurrentHealthStatus: "Warning",
		},
		{
			FullName:            "Priya Shah",
			AstronautID:         "A-2089",
			AvatarURL:           "/avatars/astronaut-3.svg",
			Mission:             "Deep-Space Habitat Systems",
			MonitoringStatus:    "Nominal",
			PersonalOverview:    "Habitat systems engineer monitoring respiratory efficiency and immune resilience.",
			CurrentHealthStatus: "Stable",
		},
	}

	for _, profile := range profiles {
		var exists int
		if err := db.QueryRow("SELECT COUNT(1) FROM astronauts WHERE astronaut_id = ?", profile.AstronautID).Scan(&exists); err != nil {
			return err
		}
		if exists > 0 {
			continue
		}

		result, err := db.Exec(
			"INSERT INTO astronauts (astronaut_id, full_name, avatar_url, mission, monitoring_status, personal_health_overview, current_health_status) VALUES (?, ?, ?, ?, ?, ?, ?)",
			profile.AstronautID,
			profile.FullName,
			profile.AvatarURL,
			profile.Mission,
			profile.MonitoringStatus,
			profile.PersonalOverview,
			profile.CurrentHealthStatus,
		)
		if err != nil {
			return err
		}

		astronautID, err := result.LastInsertId()
		if err != nil {
			return err
		}

		username := strings.ToLower(strings.ReplaceAll(profile.FullName, " ", ""))
		hash, err := bcrypt.GenerateFromPassword([]byte(defaultPasswordFor(profile.AstronautID)), bcrypt.DefaultCost)
		if err != nil {
			return err
		}

		if _, err = db.Exec(
			"INSERT INTO users (astronaut_id, username, password_hash, role) VALUES (?, ?, ?, 'astronaut')",
			astronautID,
			username,
			string(hash),
		); err != nil {
			return err
		}

		if err = insertDemoMeasurements(int(astronautID), profile.AstronautID); err != nil {
			return err
		}
	}
	return nil
}

func defaultPasswordFor(astronautID string) string {
	switch astronautID {
	case "A-2041":
		return "mission-2041"
	case "A-2056":
		return "mission-2056"
	case "A-2089":
		return "mission-2089"
	default:
		return "mission-demo"
	}
}

func insertDemoMeasurements(astronautID int, code string) error {
	series := [][]int{{72, 118, 76, 98, 36, 15, 7, 6900}, {74, 120, 78, 97, 36, 16, 6, 7200}, {70, 116, 74, 99, 36, 15, 8, 8300}, {76, 122, 78, 96, 36, 17, 5, 5400}, {82, 126, 80, 95, 36, 18, 5, 4800}, {78, 120, 76, 97, 36, 16, 7, 7600}, {73, 118, 75, 98, 36, 15, 8, 8100}}
	if code == "A-2056" {
		series = [][]int{{88, 132, 82, 94, 36, 20, 5, 4100}, {92, 138, 86, 93, 36, 22, 4, 3800}, {85, 130, 81, 95, 36, 19, 5, 4300}, {90, 136, 84, 94, 36, 21, 6, 4700}, {94, 142, 88, 92, 36, 23, 4, 3500}, {87, 134, 82, 96, 36, 20, 6, 5300}, {83, 128, 80, 95, 36, 18, 7, 6200}}
	}
	if code == "A-2089" {
		series = [][]int{{68, 112, 72, 99, 36, 14, 8, 8900}, {71, 116, 74, 98, 36, 15, 7, 7600}, {69, 110, 70, 99, 36, 14, 8, 9100}, {74, 118, 76, 97, 36, 15, 6, 7200}, {72, 114, 72, 99, 36, 14, 8, 8800}, {70, 112, 72, 98, 36, 15, 7, 7900}, {68, 110, 70, 99, 36, 14, 9, 9300}}
	}

	baseTime := time.Now().Add(-6 * 24 * time.Hour)
	for i, item := range series {
		recordedAt := baseTime.Add(time.Duration(i*24) * time.Hour).Format(time.RFC3339)
		_, err := db.Exec(
			`INSERT INTO health_records (astronaut_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, blood_oxygen, body_temperature, respiratory_rate, sleep_duration_hours, physical_activity, recorded_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			astronautID,
			item[0],
			item[1],
			item[2],
			item[3],
			36.8,
			item[4],
			float64(item[6]),
			item[7],
			recordedAt,
		)
		if err != nil {
			return err
		}
	}

	alerts := []struct {
		Severity  string
		Metric    string
		Message   string
		Value     string
		Threshold string
	}{
		{Severity: "warning", Metric: "heart_rate", Message: "Demo alert: heart rate above baseline range.", Value: "92 bpm", Threshold: "> 90 bpm"},
		{Severity: "critical", Metric: "blood_oxygen", Message: "Demo alert: oxygen saturation below safe threshold.", Value: "92%", Threshold: "< 94%"},
		{Severity: "warning", Metric: "sleep_duration", Message: "Demo alert: reduced rest below recommended window.", Value: "4.5 hrs", Threshold: "< 5 hrs"},
	}
	if code == "A-2041" {
		alerts = []struct{ Severity, Metric, Message, Value, Threshold string }{{Severity: "normal", Metric: "monitoring", Message: "No active health alert. System remains nominal.", Value: "Nominal", Threshold: "Nominal"}}
	}
	if code == "A-2089" {
		alerts = []struct{ Severity, Metric, Message, Value, Threshold string }{{Severity: "warning", Metric: "respiratory_rate", Message: "Demo alert: respiratory rate trending elevated.", Value: "19 rpm", Threshold: "> 18 rpm"}}
	}
	for i, alert := range alerts {
		_, err := db.Exec(
			`INSERT INTO health_alerts (astronaut_id, severity, metric_name, description, observed_value, threshold_value, status, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			astronautID,
			alert.Severity,
			alert.Metric,
			alert.Message,
			alert.Value,
			alert.Threshold,
			"active",
			time.Now().Add(-time.Duration(i*12)*time.Hour).Format(time.RFC3339),
		)
		if err != nil {
			return err
		}
	}
	return nil
}

func withCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next(w, r)
	}
}

func rateLimitMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ip := clientIP(r)
		if ip == "" {
			next(w, r)
			return
		}

		mu.Lock()
		requests := rateLimitStore[ip]
		now := time.Now()
		filtered := make([]time.Time, 0, len(requests))
		for _, ts := range requests {
			if now.Sub(ts) <= time.Minute {
				filtered = append(filtered, ts)
			}
		}
		if len(filtered) >= maxRequestsPerMin {
			mu.Unlock()
			http.Error(w, "too many requests", http.StatusTooManyRequests)
			return
		}
		filtered = append(filtered, now)
		rateLimitStore[ip] = filtered
		mu.Unlock()
		next(w, r)
	}
}

func clientIP(r *http.Request) string {
	for _, header := range []string{"X-Forwarded-For", "X-Real-IP"} {
		if value := r.Header.Get(header); value != "" {
			parts := strings.Split(value, ",")
			return strings.TrimSpace(parts[0])
		}
	}
	if ip, _, err := net.SplitHostPort(r.RemoteAddr); err == nil {
		return ip
	}
	return strings.TrimSpace(r.RemoteAddr)
}

func requireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie(sessionCookieName)
		if err != nil {
			http.Error(w, "authentication required", http.StatusUnauthorized)
			return
		}

		mu.Lock()
		user, ok := sessionStore[cookie.Value]
		mu.Unlock()
		if !ok {
			http.Error(w, "session expired", http.StatusUnauthorized)
			return
		}

		ctx := contextWithUser(r.Context(), user)
		next(w, r.WithContext(ctx))
	}
}

func contextWithUser(ctx context.Context, user sessionUser) context.Context {
	return context.WithValue(ctx, "sessionUser", user)
}

func getSessionUser(r *http.Request) (sessionUser, error) {
	user, ok := r.Context().Value("sessionUser").(sessionUser)
	if !ok {
		return sessionUser{}, errors.New("missing session user")
	}
	return user, nil
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok", "time": time.Now().UTC().Format(time.RFC3339)})
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid login payload", http.StatusBadRequest)
		return
	}

	var userRow struct {
		AstronautID  int
		Username     string
		PasswordHash string
		Role         string
	}
	if err := db.QueryRow("SELECT u.astronaut_id, u.username, u.password_hash, u.role FROM users u WHERE u.username = ?", strings.ToLower(strings.TrimSpace(req.Username))).Scan(&userRow.AstronautID, &userRow.Username, &userRow.PasswordHash, &userRow.Role); err != nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(userRow.PasswordHash), []byte(req.Password)); err != nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	user := sessionUser{AstronautID: userRow.AstronautID, Username: userRow.Username, Role: userRow.Role}
	sessionID := generateSessionID()
	mu.Lock()
	sessionStore[sessionID] = user
	mu.Unlock()

	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    sessionID,
		Path:     "/",
		HttpOnly: true,
		Secure:   isSecureRequest(r),
		SameSite: http.SameSiteLaxMode,
		MaxAge:   12 * 60 * 60,
	})

	json.NewEncoder(w).Encode(map[string]any{
		"astronautId": userRow.AstronautID,
		"username":    userRow.Username,
		"role":        userRow.Role,
	})
}

func isSecureRequest(r *http.Request) bool {
	return r.TLS != nil || strings.EqualFold(r.Header.Get("X-Forwarded-Proto"), "https")
}

func generateSessionID() string {
	return fmt.Sprintf("sess-%d-%d", time.Now().UnixNano(), os.Getpid())
}

func handleSession(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	cookie, err := r.Cookie(sessionCookieName)
	if err != nil {
		http.Error(w, "not authenticated", http.StatusUnauthorized)
		return
	}

	mu.Lock()
	user, ok := sessionStore[cookie.Value]
	mu.Unlock()
	if !ok {
		http.Error(w, "not authenticated", http.StatusUnauthorized)
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"astronautId": user.AstronautID, "username": user.Username, "role": user.Role})
}

func handleLogout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	cookie, err := r.Cookie(sessionCookieName)
	if err == nil {
		mu.Lock()
		delete(sessionStore, cookie.Value)
		mu.Unlock()
	}
	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   isSecureRequest(r),
		SameSite: http.SameSiteLaxMode,
	})
	w.WriteHeader(http.StatusOK)
}

func handleAstronautDashboard(w http.ResponseWriter, r *http.Request) {
	user, err := getSessionUser(r)
	if err != nil {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	pieces := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/astronauts/"), "/")
	if len(pieces) < 2 || pieces[1] != "dashboard" {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	astronautID, err := strconv.Atoi(pieces[0])
	if err != nil {
		http.Error(w, "invalid astronaut id", http.StatusBadRequest)
		return
	}
	if user.AstronautID != astronautID {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	response, err := fetchDashboardData(astronautID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(response)
}

func fetchDashboardData(astronautID int) (dashboardResponse, error) {
	var response dashboardResponse
	row := db.QueryRow(`SELECT id, astronaut_id, full_name, avatar_url, mission, monitoring_status, personal_health_overview, current_health_status FROM astronauts WHERE id = ?`, astronautID)
	var profile astronautProfile
	if err := row.Scan(&profile.ID, &profile.AstronautID, &profile.FullName, &profile.AvatarURL, &profile.Mission, &profile.MonitoringStatus, &profile.PersonalOverview, &profile.CurrentHealthStatus); err != nil {
		return response, err
	}
	response.Profile = profile

	rows, err := db.Query(`SELECT id, astronaut_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, blood_oxygen, body_temperature, respiratory_rate, sleep_duration_hours, physical_activity, recorded_at FROM health_records WHERE astronaut_id = ? ORDER BY recorded_at DESC`, astronautID)
	if err != nil {
		return response, err
	}
	defer rows.Close()

	var history []healthRecord
	for rows.Next() {
		var record healthRecord
		var bloodSystolic, bloodDiastolic int
		if err := rows.Scan(&record.ID, &record.AstronautID, &record.HeartRate, &bloodSystolic, &bloodDiastolic, &record.BloodOxygen, &record.BodyTemperature, &record.RespiratoryRate, &record.SleepDuration, &record.PhysicalActivity, &record.RecordedAt); err != nil {
			return response, err
		}
		record.BloodPressure = fmt.Sprintf("%d/%d", bloodSystolic, bloodDiastolic)
		history = append(history, record)
	}
	if len(history) > 0 {
		response.Latest = history[0]
		response.History = history
	}
	response.Summary = map[string]float64{
		"avgHeartRate":   averageInt(history, func(r healthRecord) float64 { return float64(r.HeartRate) }),
		"avgBloodOxygen": averageInt(history, func(r healthRecord) float64 { return float64(r.BloodOxygen) }),
		"avgSleepHours":  averageFloat(history, func(r healthRecord) float64 { return r.SleepDuration }),
		"avgActivity":    averageInt(history, func(r healthRecord) float64 { return float64(r.PhysicalActivity) }),
	}

	alertRows, err := db.Query(`SELECT id, astronaut_id, severity, metric_name, description, observed_value, threshold_value, status, created_at FROM health_alerts WHERE astronaut_id = ? ORDER BY created_at DESC`, astronautID)
	if err != nil {
		return response, err
	}
	defer alertRows.Close()
	for alertRows.Next() {
		var alert healthAlert
		if err := alertRows.Scan(&alert.ID, &alert.AstronautID, &alert.Severity, &alert.MetricName, &alert.Description, &alert.ObservedValue, &alert.Threshold, &alert.Status, &alert.CreatedAt); err != nil {
			return response, err
		}
		response.Alerts = append(response.Alerts, alert)
	}
	return response, nil
}

func averageInt(records []healthRecord, fn func(healthRecord) float64) float64 {
	if len(records) == 0 {
		return 0
	}
	var total float64
	for _, record := range records {
		total += fn(record)
	}
	return math.Round((total/float64(len(records)))*10) / 10
}

func averageFloat(records []healthRecord, fn func(healthRecord) float64) float64 {
	if len(records) == 0 {
		return 0
	}
	var total float64
	for _, record := range records {
		total += fn(record)
	}
	return math.Round((total/float64(len(records)))*10) / 10
}

func handleCreateHealthRecord(w http.ResponseWriter, r *http.Request) {
	user, err := getSessionUser(r)
	if err != nil {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}
	pieces := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/astronauts/"), "/")
	if len(pieces) < 2 || pieces[1] != "health-record" {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	astronautID, err := strconv.Atoi(pieces[0])
	if err != nil {
		http.Error(w, "invalid astronaut id", http.StatusBadRequest)
		return
	}
	if user.AstronautID != astronautID {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var payload createHealthRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}
	if payload.HeartRate < 30 || payload.HeartRate > 220 || payload.BloodOxygen < 70 || payload.BloodOxygen > 100 || payload.BodyTemperature < 30 || payload.BodyTemperature > 43 || payload.SleepDuration < 0 || payload.SleepDuration > 24 || payload.PhysicalActivity < 0 || payload.PhysicalActivity > 50000 {
		http.Error(w, "health data out of acceptable range", http.StatusBadRequest)
		return
	}

	_, err = db.Exec(
		`INSERT INTO health_records (astronaut_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, blood_oxygen, body_temperature, respiratory_rate, sleep_duration_hours, physical_activity, recorded_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		astronautID,
		payload.HeartRate,
		payload.BloodPressureSystolic,
		payload.BloodPressureDiastolic,
		payload.BloodOxygen,
		payload.BodyTemperature,
		payload.RespiratoryRate,
		payload.SleepDuration,
		payload.PhysicalActivity,
		time.Now().UTC().Format(time.RFC3339),
	)
	if err != nil {
		http.Error(w, "failed to save health data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "record saved"})
}

func main() {
	if err := initDB(); err != nil {
		log.Fatalf("database initialization failed: %v", err)
	}
	defer db.Close()

	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", withCORS(rateLimitMiddleware(handleHealth)))
	mux.HandleFunc("/api/auth/login", withCORS(rateLimitMiddleware(handleLogin)))
	mux.HandleFunc("/api/auth/session", withCORS(rateLimitMiddleware(handleSession)))
	mux.HandleFunc("/api/auth/logout", withCORS(rateLimitMiddleware(handleLogout)))
	mux.HandleFunc("/api/astronauts/", withCORS(rateLimitMiddleware(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case strings.Contains(r.URL.Path, "/dashboard"):
			requireAuth(handleAstronautDashboard)(w, r)
		case strings.Contains(r.URL.Path, "/health-record"):
			requireAuth(handleCreateHealthRecord)(w, r)
		default:
			http.NotFound(w, r)
		}
	})))

	log.Println("AURA-MED astronaut authentication and monitoring backend is running on http://localhost:8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
