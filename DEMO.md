# AURA-MED Demo Script

Step-by-step demo guide for the NASA Space Apps Challenge presentation.

## Prerequisites

- Docker installed (recommended) OR Go 1.23+ + Node 20+
- Oraimo Watch 2 Pro + Android phone with MacroDroid (optional, for live wearable demo)

---

## 1. Start the System

### Option A: Docker (Single-Origin, Best for Demo)
```bash
docker-compose up --build
```
- Frontend + API served from `http://localhost:8080`
- Web Bluetooth works (HTTPS not required on localhost)
- SQLite persists in named volume `aura-med-data`

### Option B: Local Dev (Two Terminals)
```bash
# Terminal 1
make backend

# Terminal 2
make frontend
```
- API: `http://localhost:8080`
- Frontend: `http://localhost:5173` (CORS configured)

---

## 2. Astronaut Workstation Demo

1. Open `http://localhost:8080` (Docker) or `http://localhost:5173` (local)
2. **Login** as **Elena Park** (Commander): `elenapark` / `mission-2041`
3. **Daily Vitals Overview** (default tab):
   - Live streaming vitals (2s update): HR, SpO2, BP, Temp, RR, Sleep, Steps
   - **Environment selector**: Spacecraft (0g) → Lunar Base (0.16g) → Mars EVA (0.38g)
   - **Scenario injector**: Normal → Tachycardia (>120bpm) → Hypoxia (<95% SpO2) → Radiation
   - **Exertion mode**: Nominal / Treadmill / Fluid Surge
   - **Measurement reminder banner**: "Mid-Shift Salivary Biomarker & BP Check" — click ✓ Mark Taken
   - **Expandable "How/Why/What" guides** on each vital card (click "Guide")
4. **Health Trends & Comparison Charts**:
   - Flight phase tabs: Pre-Flight (Earth 1G) / In-Flight (Zero-G) / Post-Mission Recovery
   - Live HR & SpO2 polylines with clinical reference lines
5. **Medical Notices & Automated Advice**:
   - Active alerts from live vitals + scenario injector
   - **5 NASA-sourced emergency remedies** with step-by-step illustrations:
     - Tachycardia / Fluid Shift → Sit down, saline + salt, Metoprolol, ECG patches
     - Hypoxia / CO₂ Scrubber → O₂ mask, stop exercise, flip LiOH lever, Ibuprofen
     - Solar Radiation → Storm shelter, vitamin pack, dosimeter badge, hydrate
     - SANS / Fluid Shift → Thigh cuffs (Braslet-M), decongestant, eye chart
     - Viral Flare → Valacyclovir, hydrocortisone cream, saliva sample to freezer
   - Each step: checkbox + SVG illustration + plain English
6. **Checkup History**: Chronological log of all vitals entries
7. **Mission Profile**: Crew bio, wearable status, environment details, light delay

### Wearable Integration (Optional Live Demo)
1. Click **Watch icon** in top header → "Pair Oraimo Watch"
2. Browser prompts for Bluetooth device → select "oraimo watch 2 pro"
3. Live HR streams directly via Web Bluetooth (BLE Heart Rate Service 0x180D)
4. **Fallback**: If BLE fails, use phone MacroDroid relay:
   - Phone receives watch notification → HTTP POST to `/api/wearable/telemetry`
   - Backend parses HR/Steps from notification text
   - Frontend polls `/api/wearable/live` every 2s

---

## 3. Earth Mission Control Console Demo

1. Click **"Earth Mission Control"** link on login page, or navigate to `/console`
2. **Crew Roster Matrix** (default):
   - 3 crew cards: live HR, SpO2, BP, Fatigue
   - Click "Open Detailed Vitals" → Clinical Inspection view
3. **Clinical Inspection** (8 gauges):
   - Select flight phase: Pre-Flight / In-Flight / Mars Surface
   - Real-time gauges: HR, SpO2, BP, Temp, RR, Sleep/Fatigue, Immune, Bone/Muscle
   - **Scenario injector**: Tachycardia / Hypoxia / Immune Flare / Reset
4. **Cabin Air & Systems**: Live O₂, CO₂, Pressure, Temp, Radiation, Water
5. **Radio & Doctor Advice**:
   - Incident log with light-delay timestamps
   - **Send advisory to crew**: Type message → "Send Radio Message" → appears in transit queue
   - Simulated 12m 44s one-way delay badge
6. **Emergency Simulation Lab**:
   - One-click anomaly injection for training/eval
   - Watch vitals respond in real-time on both screens

---

## 4. Key Talking Points

| Feature | Demo Action | Why It Matters |
|---------|-------------|----------------|
| **Autonomous triage** | Trigger Tachycardia scenario → watch Medical Advice auto-populate | Astronauts aren't doctors; system explains How/Why/What in plain English |
| **Dual-screen** | Open both `/` and `/console` side-by-side | Houston sees same data with 12min delay; can send advisories |
| **Environment adaptation** | Switch Spacecraft → Lunar → Mars EVA | HR/BP baselines shift per gravity (0g/0.16g/0.38g) per NASA HRP |
| **Wearable ingestion** | Pair Oraimo Watch or trigger phone relay | Real consumer hardware, standard BLE + HTTP relay |
| **NASA-grounded remedies** | Open Medical Advice → expand any remedy | 5 emergencies sourced from NASA HRP Evidence Books |
| **Offline-first** | Stop backend → frontend caches last vitals | Deep space has no cloud; PWA ready (TODO: service worker) |

---

## 5. Fallbacks if Live Demo Fails

| Issue | Fallback |
|-------|----------|
| Web Bluetooth denied / not supported | Use phone MacroDroid relay (pre-configured) |
| Watch won't pair | Pre-recorded scenario injector (Normal/Tachycardia/Hypoxia/Radiation) |
| Backend crashes | Frontend shows last cached vitals; restart with `docker-compose restart` |
| Network issues | Docker single-origin eliminates CORS/cross-origin problems |
| HTTPS required for BLE | `mkcert` for local certs, or use Docker (localhost works without HTTPS) |

---

## 6. Reset Demo Data

```bash
# Clear database and reseed
make demo-reset
# Or manually:
rm backend/data/aura_med.db
make backend
```

---

## 7. Files Referenced in Demo

| Screen | Key Files |
|--------|-----------|
| Astronaut Workstation | `frontend/src/App.jsx`, `DailyVitalsView.jsx`, `MedicalAdviceView.jsx` |
| Earth Console | `frontend/src/EarthWatchConsole.jsx` |
| Wearable BLE | `frontend/src/hooks/useWearableBluetooth.js` |
| Wearable HTTP | `backend/main.go:741-860` (telemetry ingest) |
| Scenarios | `App.jsx:563-579` (scenarioMode logic) |
| NASA Remedies | `MedicalAdviceView.jsx:184-408` (NASA_EMERGENCY_REMEDIES) |

---

*Demo tested on Chrome/Edge (Web Bluetooth) + Android 14 + Oraimo Watch 2 Pro.*