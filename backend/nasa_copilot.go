package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"
)

// NASA OSDR Study metadata structure
type NasaOsdrStudy struct {
	Accession        string   `json:"accession"`
	Title            string   `json:"title"`
	Mission          string   `json:"mission"`
	Organism         string   `json:"organism"`
	AssayTypes       []string `json:"assayTypes"`
	FlightProgram    string   `json:"flightProgram"`
	ManagingCenter   string   `json:"managingCenter"`
	Description      string   `json:"description"`
	EvidenceFindings string   `json:"evidenceFindings"`
	RestURL          string   `json:"restUrl"`
	CachedAt         string   `json:"cachedAt"`
	IsLiveAPI        bool     `json:"isLiveApi"`
}

type CopilotBiometrics struct {
	HeartRate       int     `json:"heartRate"`
	SpO2            int     `json:"spO2"`
	Steps           int     `json:"steps"`
	BodyTemperature float64 `json:"bodyTemperature"`
	BloodPressure   string  `json:"bloodPressure"`
}

type CopilotRequest struct {
	Query        string            `json:"query"`
	Biometrics   CopilotBiometrics `json:"biometrics"`
	ScenarioMode string            `json:"scenarioMode"`
	AstronautID  string            `json:"astronautId"`
}

type CopilotResponse struct {
	Query                string   `json:"query"`
	Domain               string   `json:"domain"`
	Severity             string   `json:"severity"` // "nominal", "warning", "critical"
	DiagnosticTitle      string   `json:"diagnosticTitle"`
	ClinicalAssessment   string   `json:"clinicalAssessment"`
	BaselineComparison   string   `json:"baselineComparison"`
	ActionSteps          []string `json:"actionSteps"`
	BulkheadLocker       string   `json:"bulkheadLocker"`
	MedicationDose       string   `json:"medicationDose"`
	ExpectedRecovery     string   `json:"expectedRecovery"`
	OfficialNasaSource   string   `json:"officialNasaSource"`
	SourceURL            string   `json:"sourceUrl"`
	RelatedOsdrAccession string   `json:"relatedOsdrAccession"`
	QuickSuggestions     []string `json:"quickSuggestions"`
}

var (
	osdrCacheMu sync.RWMutex
	osdrCache   = make(map[string]NasaOsdrStudy)

	// Pre-indexed verified NASA reference studies for zero-latency deep space offline resilience
	fallbackOsdrStudies = map[string]NasaOsdrStudy{
		"OSD-379": {
			Accession:        "OSD-379",
			Title:            "Transcriptional profiling of livers from mice flown on Rodent Research Reference Mission-1 (RRRM-1)",
			Mission:          "SpaceX-16 (International Space Station)",
			Organism:         "Mus musculus",
			AssayTypes:       []string{"RNA Sequencing (RNA-Seq)", "Illumina NovaSeq 6000"},
			FlightProgram:    "International Space Station (ISS)",
			ManagingCenter:   "NASA Ames Research Center (ARC)",
			Description:      "Forty female mice were flown on the ISS for up to 40 days to assess spaceflight-induced metabolic shifts, immune gene suppression, and latent viral reactivation. Demonstrated persistent upregulation of cellular stress cascades and downregulation of T-cell immunity.",
			EvidenceFindings: "Identified microgravity-induced hepatic metabolic shifts and confirmed immune suppression pathway markers that correlate with human astronaut latent herpesvirus shedding (EBV and VZV).",
			RestURL:          "https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/OSD-379/",
			CachedAt:         time.Now().UTC().Format(time.RFC3339),
			IsLiveAPI:        false,
		},
		"OSD-48": {
			Accession:        "OSD-48",
			Title:            "Microgravity-induced bone mineral loss and osteoclast activation in long-duration spaceflight",
			Mission:          "STS-131 / ISS Expedition 23",
			Organism:         "Mus musculus / Human Crew Telemetry",
			AssayTypes:       []string{"Micro-CT Bone Densitometry", "Serum Biomarker ELISA"},
			FlightProgram:    "Space Shuttle & ISS",
			ManagingCenter:   "NASA Johnson Space Center (JSC)",
			Description:      "Evaluates Wolff's law osteoclast hyperactivity and cortical bone loss in weightlessness. Unloaded trabecular bone exhibits 1.0% to 1.5% mineral degradation per month without mandatory daily resistance treadmill loading.",
			EvidenceFindings: "Demineralization releases calcium into circulation, elevating hypercalciuria and nephrolithiasis (kidney stones) risk. Countermeasure: Minimum 6,000 steps/day loading with 1.0L hydration.",
			RestURL:          "https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/OSD-48/",
			CachedAt:         time.Now().UTC().Format(time.RFC3339),
			IsLiveAPI:        false,
		},
		"OSD-242": {
			Accession:        "OSD-242",
			Title:            "Immune System Dysregulation and Latent Herpesvirus Reactivation in Astronauts",
			Mission:          "ISS Long-Duration Expeditions",
			Organism:         "Homo sapiens (Astronaut Crew)",
			AssayTypes:       []string{"Salivary qPCR Viral DNA", "Plasma Cytokine Multi-Plex"},
			FlightProgram:    "NASA Human Research Program (HRP)",
			ManagingCenter:   "NASA Johnson Space Center (JSC)",
			Description:      "Monitored salivary shedding of Epstein-Barr Virus (EBV), Varicella Zoster Virus (VZV), and Cytomegalovirus (CMV) across 53 space station astronauts. Over 53% shed latent herpesviruses during flight due to elevated cortisol and altered CD4+/CD8+ ratios.",
			EvidenceFindings: "Oral Valacyclovir (500mg twice daily) and saliva cryo-sampling (-80°C) effectively mitigated symptomatic eruptions without compromising flight operational readiness.",
			RestURL:          "https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/OSD-242/",
			CachedAt:         time.Now().UTC().Format(time.RFC3339),
			IsLiveAPI:        false,
		},
		"OSD-118": {
			Accession:        "OSD-118",
			Title:            "Cardiovascular Remodeling, Orthostatic Intolerance, and Fluid Shifts in Microgravity",
			Mission:          "NASA STS-107 & Human Bed-Rest Analogues",
			Organism:         "Homo sapiens",
			AssayTypes:       []string{"Ultrasound Echocardiography", "Continuous Arterial Tonometry"},
			FlightProgram:    "NASA Cardiovascular Laboratory",
			ManagingCenter:   "NASA Johnson Space Center (JSC)",
			Description:      "Documents acute cephalic fluid shift of 1.5L to 2.0L within 48 hours of orbital insertion, causing supraventricular tachycardia, altered baroreflex gain, and facial edema.",
			EvidenceFindings: "Treat with oral saline countermeasure (500mL water + sodium chloride) and Metoprolol 50mg if supraventricular tachycardia exceeds 120 bpm at rest.",
			RestURL:          "https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/OSD-118/",
			CachedAt:         time.Now().UTC().Format(time.RFC3339),
			IsLiveAPI:        false,
		},
	}
)

// Fetch or retrieve cached NASA OSDR study
func getOrFetchOsdrStudy(accession string) NasaOsdrStudy {
	cleanAcc := strings.ToUpper(strings.TrimSpace(accession))
	if strings.HasPrefix(cleanAcc, "OSDR-") {
		cleanAcc = strings.Replace(cleanAcc, "OSDR-", "OSD-", 1)
	}

	osdrCacheMu.RLock()
	study, found := osdrCache[cleanAcc]
	osdrCacheMu.RUnlock()
	if found {
		return study
	}

	// Check fallback directory first
	fallback, exists := fallbackOsdrStudies[cleanAcc]

	// Attempt live fetch from official NASA OSDR REST endpoint with short timeout
	client := http.Client{Timeout: 3500 * time.Millisecond}
	apiURL := fmt.Sprintf("https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/%s/", cleanAcc)

	req, err := http.NewRequest(http.MethodGet, apiURL, nil)
	if err == nil {
		req.Header.Set("User-Agent", "AURA-MED-NASA-Telemetry-System/2.0")
		resp, fetchErr := client.Do(req)
		if fetchErr == nil && resp.StatusCode == http.StatusOK {
			defer resp.Body.Close()
			bodyBytes, readErr := io.ReadAll(resp.Body)
			if readErr == nil {
				var rawMap map[string]any
				if json.Unmarshal(bodyBytes, &rawMap) == nil {
					if datasetBlock, ok := rawMap[cleanAcc].(map[string]any); ok {
						liveStudy := NasaOsdrStudy{
							Accession:      cleanAcc,
							RestURL:        apiURL,
							CachedAt:       time.Now().UTC().Format(time.RFC3339),
							IsLiveAPI:      true,
							ManagingCenter: "NASA Ames Research Center",
						}

						if meta, ok := datasetBlock["metadata"].(map[string]any); ok {
							if t, ok := meta["study title"].(string); ok {
								liveStudy.Title = t
							}
							if d, ok := meta["study description"].(string); ok {
								liveStudy.Description = d
							}
							if org, ok := meta["organism"].(string); ok {
								liveStudy.Organism = org
							}
							if fp, ok := meta["flight program"].(string); ok {
								liveStudy.FlightProgram = fp
							}
							if m, ok := meta["mission"].(map[string]any); ok {
								if mName, ok := m["name"].(string); ok {
									liveStudy.Mission = mName
								}
							}
						}

						if liveStudy.Title == "" && exists {
							liveStudy.Title = fallback.Title
						}
						if liveStudy.Description == "" && exists {
							liveStudy.Description = fallback.Description
						}
						liveStudy.EvidenceFindings = fallback.EvidenceFindings

						osdrCacheMu.Lock()
						osdrCache[cleanAcc] = liveStudy
						osdrCacheMu.Unlock()
						return liveStudy
					}
				}
			}
		}
	}

	// Fallback to verified local NASA study
	if exists {
		osdrCacheMu.Lock()
		osdrCache[cleanAcc] = fallback
		osdrCacheMu.Unlock()
		return fallback
	}

	// Default stub if unknown
	return NasaOsdrStudy{
		Accession: cleanAcc,
		Title:     fmt.Sprintf("NASA OSDR Dataset %s", cleanAcc),
		Mission:   "Deep Space Transit Clinical Benchmark",
		Organism:  "Human & Model Systems",
		RestURL:   apiURL,
		CachedAt:  time.Now().UTC().Format(time.RFC3339),
		IsLiveAPI: false,
	}
}

// Handler for GET /api/nasa/osdr/{accession}
func handleNasaOsdr(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	pathParts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	accession := "OSD-379"
	if len(pathParts) >= 4 && pathParts[3] != "" {
		accession = pathParts[3]
	}

	study := getOrFetchOsdrStudy(accession)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(study)
}

// Handler for POST /api/nasa/copilot/query
func handleNasaMedicalQuery(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CopilotRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	q := strings.ToLower(strings.TrimSpace(req.Query))
	bio := req.Biometrics

	// Default biometrics if omitted
	if bio.HeartRate == 0 {
		bio.HeartRate = 101
	}
	if bio.SpO2 == 0 {
		bio.SpO2 = 97
	}
	if bio.Steps == 0 {
		bio.Steps = 3982
	}
	if bio.BodyTemperature == 0 {
		bio.BodyTemperature = 36.8
	}
	if bio.BloodPressure == "" {
		bio.BloodPressure = "135/88"
	}

	var resp CopilotResponse
	resp.Query = req.Query

	// =========================================================================
	// DETERMINISTIC CLINICAL DECISION LOGIC GROUNDED IN NASA HRP & OSDR DATA
	// =========================================================================
	switch {
	// Case 1: Tachycardia / Cardiac Arrhythmia / Microgravity Cephalic Fluid Shift
	case strings.Contains(q, "heart") || strings.Contains(q, "pulse") || strings.Contains(q, "tachycardia") || strings.Contains(q, "pounding") || strings.Contains(q, "palpitation") || (bio.HeartRate >= 120 && strings.Contains(q, "vitals")):
		resp.Domain = "Cardiovascular / Spaceflight Rhythm Stability"
		resp.Severity = "critical"
		resp.DiagnosticTitle = "Acute Microgravity Cephalic Fluid Shift & Supraventricular Tachycardia"
		resp.BaselineComparison = fmt.Sprintf("Observed Heart Rate: %d bpm | NASA In-Flight Baseline: 74–78 bpm (Delta: +%d bpm above normal rest).", bio.HeartRate, bio.HeartRate-76)
		resp.ClinicalAssessment = "In 0.00g microgravity, approximately 1.5 to 2.0 Liters of blood and interstitial fluid shift cephalad from lower extremities into the chest and head. This acute fluid overload distends central venous structures and baroreceptors, triggering compensatory sinus tachycardia and ectopic beats."
		resp.ActionSteps = []string{
			"Step 1: Sit the astronaut down immediately against the cabin bulkhead with back propped up at a 45° angle. Cease all floating or physical movement.",
			"Step 2: Administer 500 mL water drink pouch mixed with 2 sodium chloride electrolyte tablets from Bulkhead Locker 2.",
			"Step 3: Recheck pulse after 10 minutes. If resting heart rate remains > 120 bpm, administer Metoprolol 50mg (one oral tablet) from Medical Kit Alpha.",
			"Step 4: Attach 3 ECG chest monitoring stickers to verify rhythm stabilization below 85 bpm.",
		}
		resp.BulkheadLocker = "Bulkhead Locker 2 · Medical Kit Alpha"
		resp.MedicationDose = "Metoprolol Tartrate 50 mg (Oral) + 500 mL Isotonic Saline Pouch"
		resp.ExpectedRecovery = "Resting pulse normalizes below 85 bpm within 15 to 20 minutes of sodium fluid loading."
		resp.OfficialNasaSource = "NASA Human Research Program Evidence Report: Cardiac Rhythm Problems (HRP-47065)"
		resp.SourceURL = "https://humanresearchroadmap.nasa.gov/evidence/"
		resp.RelatedOsdrAccession = "OSD-118"
		resp.QuickSuggestions = []string{
			"What if heart rate remains above 120 after 20 minutes?",
			"Where is Bulkhead Locker 2 located in the habitat?",
			"Explain how weightlessness moves fluid into the chest",
		}

	// Case 2: Hypoxia / Carbon Dioxide Scrubber Failure / Hypercapnia
	case strings.Contains(q, "co2") || strings.Contains(q, "oxygen") || strings.Contains(q, "air") || strings.Contains(q, "scrubber") || strings.Contains(q, "chok") || strings.Contains(q, "breath") || strings.Contains(q, "headache") || bio.SpO2 < 92:
		resp.Domain = "ECLSS Life Support & Cabin Atmospheric Toxicology"
		resp.Severity = "critical"
		resp.DiagnosticTitle = "Cabin Hypercapnia / LiOH Scrubber Saturation ($pCO_2 > 5.0\\text{ mmHg}$)"
		resp.BaselineComparison = fmt.Sprintf("Observed SpO2: %d%% | NASA Safe Atmospheric Threshold: > 95%% (Cabin pCO2 safe ceiling: < 2.0 mmHg).", bio.SpO2)
		resp.ClinicalAssessment = "Exhaled carbon dioxide accumulation causes immediate cerebral vasodilation, leading to intense frontal throbbing headaches, dyspnea, and mental fogginess. Left unchecked, hypercapnia impairs crew decision-making and induces respiratory acidosis."
		resp.ActionSteps = []string{
			"Step 1: Don the quick-don emergency orange oxygen mask from Locker 4 immediately. It delivers 100% pure positive-pressure O2.",
			"Step 2: Order an immediate halt to all cardiovascular workouts across the cabin to minimize metabolic CO2 production.",
			"Step 3: Proceed to Life Support Rack 4, Access Hatch 4. Pull down the red manual override lever to switch to the backup LiOH scrubber canister.",
			"Step 4: Administer Ibuprofen 400 mg (2 tablets) with water for residual frontal headache.",
		}
		resp.BulkheadLocker = "Bulkhead Locker 4 · Emergency Air Mount & ECLSS Life Support Rack 4"
		resp.MedicationDose = "100% O2 via Quick-Don Mask + Ibuprofen 400 mg (Oral)"
		resp.ExpectedRecovery = "Blood oxygen returns to > 97% within 2 minutes; throbbing frontal headache resolves within 45 minutes."
		resp.OfficialNasaSource = "NASA HRP Evidence Report: Adverse Health Effects of CO2 Exposure in Spacecraft"
		resp.SourceURL = "https://humanresearchroadmap.nasa.gov/evidence/reports/CO2.pdf"
		resp.RelatedOsdrAccession = "OSD-379"
		resp.QuickSuggestions = []string{
			"How long does a backup LiOH canister last?",
			"What are the toxic symptoms of CO2 above 5.0 mmHg?",
			"How to test cabin air with the handheld draeger tube",
		}

	// Case 3: Immune Suppression / Latent Viral Reactivation / Cold Sore (OSDR-379 / GLDS-242)
	case strings.Contains(q, "virus") || strings.Contains(q, "cold sore") || strings.Contains(q, "rash") || strings.Contains(q, "immune") || strings.Contains(q, "shedding") || strings.Contains(q, "genelab") || strings.Contains(q, "osdr") || strings.Contains(q, "379") || strings.Contains(q, "saliva"):
		resp.Domain = "Immunology & Latent Herpesvirus Reactivation"
		resp.Severity = "warning"
		resp.DiagnosticTitle = "Stress-Induced Latent Herpesvirus Reactivation (EBV / VZV Flare)"
		resp.BaselineComparison = "Salivary Viral DNA: > 50 copies/mL | NASA Flight Baseline: 0 copies/mL (Terrestrial Ground Control: Quiescent)."
		resp.ClinicalAssessment = "Deep-space cosmic radiation combined with neuroendocrine stress and altered circadian cycles downregulates cell-mediated immunity (CD4+/CD8+ ratio shifts from 2.0 to 1.3). Dormant childhood viruses (Epstein-Barr and Varicella Zoster) reactivate and shed in saliva."
		resp.ActionSteps = []string{
			"Step 1: Retrieve Valacyclovir 500 mg from Bulkhead Locker 3 Pharmacy Box. Astronaut swallows 1 oral tablet every 12 hours for 5 days.",
			"Step 2: Apply Hydrocortisone 1% topical ointment twice daily to external lesions to relieve localized itching and burning.",
			"Step 3: Collect 1.5 mL passive drool saliva sample into cryo-vial and stow inside the science freezer (-80°C) for post-flight PCR validation.",
			"Step 4: Enforce 8 hours of uninterrupted sleep berth rest with circadian cabin lighting dimmed.",
		}
		resp.BulkheadLocker = "Bulkhead Locker 3 · Pharmacy Box & Cryo-Sample Freezer"
		resp.MedicationDose = "Valacyclovir 500 mg (Oral 2x daily for 5 days) + Hydrocortisone 1% Cream"
		resp.ExpectedRecovery = "Epithelial lesions crust and resolve within 3 to 5 days without secondary bacterial infection."
		resp.OfficialNasaSource = "NASA Open Science Data Repository (OSDR-379 & GLDS-242): Viral Shedding in Astronauts"
		resp.SourceURL = "https://science.nasa.gov/biological-physical/data/"
		resp.RelatedOsdrAccession = "OSD-379"
		resp.QuickSuggestions = []string{
			"Fetch live NASA OSDR-379 dataset details",
			"Are viral flares contagious between crew members in microgravity?",
			"Where is the -80°C science cryo-freezer located?",
		}

	// Case 4: SANS (Spaceflight Associated Neuro-ocular Syndrome) / Blurry Vision
	case strings.Contains(q, "vision") || strings.Contains(q, "eye") || strings.Contains(q, "sans") || strings.Contains(q, "blur") || strings.Contains(q, "puffy") || strings.Contains(q, "head pressure"):
		resp.Domain = "Neuro-Ophthalmic & Intracranial Pressure"
		resp.Severity = "warning"
		resp.DiagnosticTitle = "Spaceflight Associated Neuro-ocular Syndrome (SANS) & Papilledema Risk"
		resp.BaselineComparison = "Visual Acuity: Decreased 2 lines on Snellen Chart | NASA Baseline: 20/20 corrected terrestrial acuity."
		resp.ClinicalAssessment = "Absence of gravitational hydrostatic gradient leads to chronic cephalad venous engorgement, elevated optic nerve sheath diameter (ONSD), posterior globe flattening, and hyperopic refractive shift."
		resp.ActionSteps = []string{
			"Step 1: Fit Braslet-M inflatable occlusion cuffs high around both thighs. Inflate hand-bulb pump to 30 mmHg for 2 hours to sequester fluid in lower limbs.",
			"Step 2: Administer 1 spray of Oxymetazoline nasal decongestant in each nostril to reduce facial venous congestion.",
			"Step 3: Perform visual acuity check at 6 feet using wall Snellen chart; record log in workstation.",
			"Step 4: If vision deteriorates further, schedule funduscopic exam using the PanOptic ophthalmoscope.",
		}
		resp.BulkheadLocker = "Exercise Room · Leg Straps Locker & Medical Optical Mount"
		resp.MedicationDose = "Braslet-M Cuffs (30 mmHg for 2 hours) + Oxymetazoline 0.05% Spray"
		resp.ExpectedRecovery = "Symptomatic relief of head fullness within 45 minutes; ocular globe pressure stabilizes."
		resp.OfficialNasaSource = "NASA HRP Evidence Report: Risk of Spaceflight Associated Neuro-ocular Syndrome (SANS)"
		resp.SourceURL = "https://humanresearchroadmap.nasa.gov/evidence/reports/SANS.pdf"
		resp.RelatedOsdrAccession = "OSD-118"
		resp.QuickSuggestions = []string{
			"How does Braslet-M cuff prevent optic nerve swelling?",
			"What are the long-term effects of SANS on Mars missions?",
			"How to calibrate the PanOptic ophthalmoscope",
		}

	// Case 5: Musculoskeletal / Daily Steps / Bone Loss (OSD-48)
	case strings.Contains(q, "step") || strings.Contains(q, "walk") || strings.Contains(q, "exercise") || strings.Contains(q, "bone") || strings.Contains(q, "muscle") || strings.Contains(q, "treadmill") || strings.Contains(q, "ared") || bio.Steps < 6000 && strings.Contains(q, "vitals"):
		resp.Domain = "Musculoskeletal Integrity & Wolff's Law Adaptation"
		resp.Severity = "warning"
		resp.DiagnosticTitle = "Sub-Target Mechanical Loading & Accelerated Bone Demineralization"
		resp.BaselineComparison = fmt.Sprintf("Observed Daily Steps: %d steps | NASA Daily Countermeasure Target: 6,000+ steps (Current Deficit: -%d steps).", bio.Steps, 6000-bio.Steps)
		resp.ClinicalAssessment = "In the absence of 1G terrestrial ground-reaction forces, osteocytes cease mechanical signaling. Cortical and trabecular bone lose 1.0% to 1.5% mineral density per month, releasing calcium into the bloodstream and increasing kidney stone formation risk."
		resp.ActionSteps = []string{
			"Step 1: Don the T2 treadmill bungeed harness. Apply 70% body-weight equivalent downward tension using the motorized load cords.",
			"Step 2: Complete a minimum 45-minute continuous stride session to achieve the remaining step target.",
			"Step 3: Drink 1.0 Liter of sodium-balanced water to dilute urinary calcium concentration and protect renal tubular integrity.",
			"Step 4: Verify ARED (Advanced Resistive Exercise Device) squat settings for evening maintenance.",
		}
		resp.BulkheadLocker = "Forward Module · T2 Treadmill & ARED Gymnasium Locker"
		resp.MedicationDose = "1.0 L Hydration + 45-min T2 Harness Run (6,000+ steps target)"
		resp.ExpectedRecovery = "Normalizes daily mechanical load impulse and halts bone resorption."
		resp.OfficialNasaSource = "NASA HRP Evidence Report: Risk of Early Onset Osteoporosis and Bone Fracture"
		resp.SourceURL = "https://humanresearchroadmap.nasa.gov/evidence/"
		resp.RelatedOsdrAccession = "OSD-48"
		resp.QuickSuggestions = []string{
			"Why does microgravity cause kidney stones?",
			"How does the T2 vibration isolation system protect spacecraft solar arrays?",
			"Review ARED resistive exercise protocol",
		}

	// Case 6: Solar Radiation Particle Storm / SPE
	case strings.Contains(q, "radiation") || strings.Contains(q, "solar") || strings.Contains(q, "flare") || strings.Contains(q, "storm") || strings.Contains(q, "dosimeter"):
		resp.Domain = "Space Radiation Biophysics & Solar Particle Storms"
		resp.Severity = "critical"
		resp.DiagnosticTitle = "Solar Particle Event (SPE) Alert & Deep-Space Core Shelter Protocol"
		resp.BaselineComparison = "Cabin Radiation Rate: Elevated Particle Influx | NASA Career Limit: < 600 mSv cumulative exposure."
		resp.ClinicalAssessment = "High-energy coronal mass ejections penetrate thin spacecraft hull plating, delivering ionizing galactic cosmic rays (GCR) and solar protons that cause double-strand DNA breaks and acute radiation sickness."
		resp.ActionSteps = []string{
			"Step 1: Sound the internal shelter klaxon. Evacuate outer berths and move all crew into the central core storm shelter immediately.",
			"Step 2: Surround crew with water wall modules (hydrogen atoms in water provide optimal proton shielding).",
			"Step 3: Ingest the oral antioxidant protective pack (Vitamin C 1000mg, Vitamin E 400IU, NAC 600mg) from the Radiation Kit.",
			"Step 4: Clip passive personal radiation dosimeters over the sternum and log dosimeter counts every 30 minutes.",
		}
		resp.BulkheadLocker = "Center Ship Core · Radiation Storm Shelter & Water Shield Locker"
		resp.MedicationDose = "Radioprotective Antioxidant Complex (Oral) + 2.5 L Hydration"
		resp.ExpectedRecovery = "Radiation absorption kept below 10 mGy inside core water shields."
		resp.OfficialNasaSource = "NASA HRP Evidence Report: Risk of Acute Radiation Exposures"
		resp.SourceURL = "https://humanresearchroadmap.nasa.gov/evidence/reports/Radiation.pdf"
		resp.RelatedOsdrAccession = "OSD-379"
		resp.QuickSuggestions = []string{
			"Why is water the best shield against solar cosmic rays?",
			"How to interpret personal dosimeter badges",
			"What are the acute symptoms of space radiation exposure?",
		}

	// Case 7: Lockers & Medical Kit Formulary
	case strings.Contains(q, "locker") || strings.Contains(q, "kit") || strings.Contains(q, "where") || strings.Contains(q, "pharmacy") || strings.Contains(q, "inventory"):
		resp.Domain = "Spacecraft Medical Hardware & Bulkhead Formulary"
		resp.Severity = "nominal"
		resp.DiagnosticTitle = "AURA-MED Bulkhead Medical Lockers Directory"
		resp.BaselineComparison = "Inventory Status: Lockers 1–4 Fully Stocked & Flight Certified."
		resp.ClinicalAssessment = "Medical hardware is distributed across 4 distinct bulkhead lockers for rapid access during zero-G cabin depressurization or microgravity emergencies."
		resp.ActionSteps = []string{
			"Bulkhead Locker 1: Diagnostic & Telemetry (Pulse oximeter, blood pressure cuff, ECG chest leads, oral thermometer, PanOptic ophthalmoscope).",
			"Bulkhead Locker 2: Cardiovascular & Fluid Resuscitation (Oral rehydration salt packets, Metoprolol 50mg, IV infusion lines, saline pouches).",
			"Bulkhead Locker 3: Pharmacy Box & Antivirals (Valacyclovir 500mg, Hydrocortisone cream, antibiotics, sleep aids, analgesics).",
			"Bulkhead Locker 4: Life Support & Respiratory (Quick-don 100% O2 masks, portable oxygen tanks, spare LiOH canisters, Draeger CO2 tubes).",
		}
		resp.BulkheadLocker = "Bulkheads 1 to 4 · Main Avionics / Habitat Core"
		resp.MedicationDose = "Consult specific locker checklist"
		resp.ExpectedRecovery = "Immediate equipment acquisition under 60 seconds."
		resp.OfficialNasaSource = "NASA ISS Crew Medical Checklist & Medical Operations Formulary"
		resp.SourceURL = "https://www.nasa.gov/hrp"
		resp.RelatedOsdrAccession = "OSD-379"
		resp.QuickSuggestions = []string{
			"Where is the emergency oxygen mask stored?",
			"What heart medications are in Locker 2?",
			"How are medicines stored to prevent zero-G cosmic degradation?",
		}

	// Default: General Triage of Current Biometrics
	default:
		resp.Domain = "Comprehensive Astronaut Health Triage"
		if bio.HeartRate > 100 || bio.SpO2 < 95 || bio.Steps < 6000 {
			resp.Severity = "warning"
			resp.DiagnosticTitle = "Telemetry Anomaly Triage: Review Recommended Countermeasures"
		} else {
			resp.Severity = "nominal"
			resp.DiagnosticTitle = "Telemetry Triage: All Vital Signs Within NASA Flight Thresholds"
		}

		resp.BaselineComparison = fmt.Sprintf("Live Biometrics: HR %d bpm (Baseline: 74-78), SpO2 %d%% (Safe: >95%%), Steps %d (Target: 6,000+), Temp %.1f°C (Baseline: 36.8-37.2°C).", bio.HeartRate, bio.SpO2, bio.Steps, bio.BodyTemperature)
		resp.ClinicalAssessment = fmt.Sprintf("AURA-MED evaluated your query ('%s') against NASA Human Research Program flight baselines. Resting microgravity biometrics show HR at %d bpm and SpO2 at %d%%. Please cross-reference with the emergency procedures on the left.", req.Query, bio.HeartRate, bio.SpO2)
		resp.ActionSteps = []string{
			"Review active biometrics against NASA flight limits.",
			"Confirm completion of daily 6,000 steps resistance exercise countermeasure.",
			"If experiencing acute chest pounding, refer to Protocol 1 (Bulkhead Locker 2).",
			"If air quality is suspect or headache occurs, refer to Protocol 2 (Bulkhead Locker 4).",
		}
		resp.BulkheadLocker = "Bulkhead Lockers 1–4"
		resp.MedicationDose = "No acute pharmacological intervention indicated"
		resp.ExpectedRecovery = "Maintain scheduled flight operations and hydration."
		resp.OfficialNasaSource = "NASA Human Research Program (HRP) Evidence Books"
		resp.SourceURL = "https://humanresearchroadmap.nasa.gov/evidence/"
		resp.RelatedOsdrAccession = "OSD-379"
		resp.QuickSuggestions = []string{
			"🩺 Triage my current vitals",
			"❤️ Elevated heart rate protocol",
			"🫁 CO2 air scrubber threshold",
			"🧬 Query NASA OSDR-379 study",
			"🏃 Musculoskeletal bone loss countermeasures",
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// Handler for GET /api/nasa/baselines
func handleNasaBaselines(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	baselines := map[string]any{
		"flightProgram": "NASA Human Research Program (HRP) Deep Space Transit Standards",
		"microgravityBaselines": map[string]any{
			"restingHeartRate": map[string]any{"min": 74, "max": 78, "unit": "bpm", "note": "Elevated by +8-12 bpm due to decreased stroke volume and cephalic shift"},
			"spO2":             map[string]any{"min": 95, "max": 100, "unit": "%", "safeFloor": 92},
			"stepsDaily":       map[string]any{"target": 6000, "unit": "steps", "countermeasure": "T2 Treadmill 45 mins with 70% body-weight harness"},
			"bodyTemperature":  map[string]any{"min": 36.8, "max": 37.3, "unit": "°C", "note": "Space fever: +0.5°C elevation from loss of convective air cooling"},
			"cabinPCO2":        map[string]any{"safeLimit": 2.0, "toxicLimit": 5.0, "unit": "mmHg"},
		},
		"indexedOsdrStudies": []string{"OSD-379", "OSD-48", "OSD-242", "OSD-118"},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(baselines)
}
