# AURA-MED: Autonomous Health Monitoring for Deep Space

**NASA Space Apps Challenge 2026 | Astronaut Health Monitoring Software**

AURA-MED is a dual-screen health monitoring system for deep-space missions: an **Astronaut Workstation** (crew-side) and an **Earth Mission Control Console** (Houston-side). Built for the NASA Space Apps Challenge "Create Health Monitoring Software for Astronauts".

## 🚀 Quick Start

### Local Development (Recommended)
```bash
# Start both backend and frontend
make dev

# Or run separately:
make backend   # Go backend on :8080
make frontend  # Vite frontend on :5173
```

### Docker (Single-Origin, Production-Like)
```bash
# Build and run single container serving both API and SPA
docker-compose up --build

# Access at http://localhost:8080
# API at http://localhost:8080/api/*
```

### Demo Credentials (Hackathon Only)
| Astronaut | Username | Password |
|-----------|----------|----------|
| Elena Park (Commander) | `elenapark` | `mission-2041` |
| Daniel Ortiz (Medical Officer) | `danielortiz` | `mission-2056` |
| Priya Shah (Science Specialist) | `priyashah` | `mission-2089` |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      AURA-MED SYSTEM                            │
├──────────────────────────┬──────────────────────────────────────┤
│      FRONTEND (React)    │          BACKEND (Go)                │
│  ┌────────────────────┐  │  ┌────────────────────────────────┐ │
│  │ Astronaut          │  │  │ SQLite (aura_med.db)           │ │
│  │ Workstation        │◄─┼──┤  • astronauts, users           │ │
│  │  • DailyVitals     │  │  │  • health_records              │ │
│  │  • HealthTrends    │  │  │  • health_alerts               │ │
│  │  • MedicalAdvice   │  │  └────────────────────────────────┘ │
│  │  • CheckupHistory  │  │  ┌────────────────────────────────┐ │
│  │  • MissionProfile  │  │  │ REST API (port 8080)           │ │
│  └────────────────────┘  │  │  • /api/auth/* (session cookie)│ │
│  ┌────────────────────┐  │  │  • /api/astronauts/* (auth)    │ │
│  │ Earth Watch Console│◄─┼──┤  • /api/wearable/*             │ │
│  │  • Crew Roster     │  │  │  • /api/comms/*                │ │
│  │  • Clinical Inspect│  │  └────────────────────────────────┘ │
│  │  • Cabin Systems   │  │         ▲                          │
│  │  • Radio/Comms     │  │         │                          │
│  │  • Simulator       │  │         │                          │
│  └────────────────────┘  │         │                          │
│           ▲              │         │                          │
│           │ WebSocket/   │         │                          │
│           │ Polling      │         │                          │
│  ┌────────┴────────┐     │  ┌──────┴──────┐                   │
│  │ Oraimo Watch    │─────┼──┤ Phone       │                   │
│  │ (BLE HR 0x180D) │     │  │ MacroDroid  │                   │
│  └─────────────────┘     │  │ HTTP Relay  │                   │
└──────────────────────────┴──────────────────────────────────────┘
```

### Tech Stack
- **Backend**: Go 1.23+, SQLite (WAL mode), bcrypt, gorilla/websocket (via stdlib)
- **Frontend**: React 19, Vite 8, React Router 7, lucide-react icons
- **Wearable**: Web Bluetooth API (Heart Rate Service 0x180D) + MacroDroid HTTP relay
- **Container**: Multi-stage Dockerfile, non-root user, HEALTHCHECK, go:embed for SPA

---

## ✅ Feature Status (Verified Against Code)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Two dashboards (astronaut + watch centre) | ✅ Done | `App.jsx` routes + `EarthWatchConsole.jsx` |
| Self-assessment guidance (How/Why/What) | ✅ Done | `DailyVitalsView.jsx:183-360`, `MedicalAdviceView.jsx:184-408` |
| Crew measurement reminders | 🟡 Partial | `DailyVitalsView.jsx:70-99` (single hardcoded banner) |
| Spacecraft / Moon / Mars adaptation | ✅ Done | `App.jsx:792-803`, `DailyVitalsView.jsx:32-56` |
| NASA HRP / OSDR data baselines | 🟡 Partial | `HealthTrendsView.jsx:14-42` (hardcoded baselines) |
| Smartwatch/phone data (BLE + relay) | 🟡 Partial | `hooks/useWearableBluetooth.js`, `main.go:741-860` |
| Bone/joint health (steps ↔ bone loss) | 🟡 Partial | `DailyVitalsView.jsx:329-360` (simulated) |
| Cardiovascular (HR, BP, HRV) | ✅ Done | Live vitals engine + tachycardia scenario |
| Activity/sleep/movement | 🟡 Partial | Steps, sleep duration, respiratory rate (simulated) |
| Fatigue quantification | 🟡 Partial | Fatigue score placeholder |
| Nutrition tracking | 🟡 Partial | Hardcoded "2,840 kcal · 2.4 L" |
| Heart health / arrhythmia | 🟡 Partial | HR, BP, HRV (RR-interval via BLE) |
| Immune biomarkers (saliva) | 🟡 Partial | Cortisol, viral shedding, IgA, CD4/CD8 (simulated) |
| Viral reactivation (OSDR-379) | 🟡 Partial | Simulated flare values, documented |
| Earth-delay / DTN simulation | ❌ Missing | UI badge only (`EarthWatchConsole.jsx:391`) |
| Offline capability (PWA) | ❌ Missing | No service worker, requires backend |

**Legend**: ✅ Done = working end-to-end | 🟡 Partial = wired but simulated/hardcoded | ❌ Missing = not implemented

---

## 📁 Project Structure

```
.
├── backend/
│   ├── main.go              # HTTP server, API, DB, wearable ingest, comms
│   ├── go.mod / go.sum      # Dependencies
│   ├── models/              # Go structs
│   ├── scripts/             # Demo/test shell scripts
│   └── utils/               # Helpers
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Routes, auth, live vitals engine
│   │   ├── EarthWatchConsole.jsx  # Houston console
│   │   ├── components/      # Vitals, Trends, Advice, History, Profile
│   │   ├── hooks/           # useWearableBluetooth, useTelemetryStream
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── DEPLOY.md            # Docker & Fly.io deployment
│   └── *.md                 # NASA references, protocols
├── .github/
│   ├── workflows/ci.yml     # Go + Frontend CI
│   ├── workflows/security.yml  # gitleaks + govulncheck
│   └── dependabot.yml       # Weekly dependency updates
├── Dockerfile               # Multi-stage, go:embed SPA
├── docker-compose.yml       # Single-origin dev/prod
├── Makefile                 # dev, build, test, lint, docker-up, demo-reset
├── .env.example             # All env vars with hackathon defaults
└── .gitignore / .gitattributes / .editorconfig
```

---

## 🔧 Configuration

All settings via environment variables (see `.env.example`):

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_PORT` | `8080` | HTTP port |
| `DB_PATH` | `./data/aura_med.db` | SQLite path |
| `SESSION_COOKIE_NAME` | `aura_session` | Session cookie |
| `MAX_REQUESTS_PER_MIN` | `60` | Rate limit |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080` | CORS allow-list |
| `DEMO_PASSWORD_A2041` | *required* | Elena Park password |
| `DEMO_PASSWORD_A2056` | *required* | Daniel Ortiz password |
| `DEMO_PASSWORD_A2089` | *required* | Priya Shah password |
| `SINGLE_ORIGIN` | `true` | Enable embedded frontend |

**Hackathon defaults** are set in `.env.example` and `docker-compose.yml`. **Rotate for production.**

---

## 🧪 Testing & Quality

```bash
# Backend
cd backend && go build ./... && go test ./... && gofmt -l .

# Frontend
cd frontend && npm ci && npm run lint && npm run build

# CI runs automatically on PRs (Go build/test, npm lint/build)
# Security: gitleaks + govulncheck on every PR
```

---

## 👥 Team

| Handle | Role |
|--------|------|
| @VALENTINE-it | Earth Watch Console, Emergency Dispatch, Backend API |
| @ClayMichael2004 | Telemetry Math, Physiological Bounds, Houston Comms Client |
| @its-ryann | Notification Regex, Comms Handlers, Streaming Fixes |
| @Moraa021 | Senior QA, NASA HRP Benchmark Mapping, Test Scripts |
| @nyabokegrace | Daily Biometrics, T2 Treadmill, OSDR-379 Biomarkers |
| @mmicbee | Backend Telemetry, Go Concurrency, Wearable Models |

---

## 📚 NASA References

- **NASA Human Research Program (HRP)**: Baselines, fluid shifts, SANS, immune
- **NASA OSDR / GeneLab**: OSDR-379 viral shedding, ALSDA flight physiology
- **Space Apps Challenge**: "Create Health Monitoring Software for Astronauts"

See `docs/` for detailed protocol mappings (cortisol, viral shedding, T2 treadmill, fluid shifts, etc.).

---

## 📄 License

MIT License - see `LICENSE` file.

---

*Built for NASA Space Apps Challenge 2026. AURA-MED: Because astronauts are explorers, not doctors.*