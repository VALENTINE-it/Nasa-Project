# NASA Space Apps Challenge Requirements Traceability Matrix
## AURA-MED (Autonomous Resilient Health Assessment for Astronauts)

> **Document Status:** Complete & Verified  
> **Target Audience:** NASA Space Apps Evaluation Panel, NASA HRP Flight Surgeons, Technical Reviewers  
> **Repository Branch:** `feat/web-bluetooth-oraimo-direct`

---

### Executive Summary

AURA-MED was built under the premise that **"Astronauts are not doctors."** When crew members are halfway to Mars, light-speed communications delay Earth telemetry by **3 to 22 minutes each way**, rendering real-time guidance from Houston impossible. 

This traceability matrix maps every single requirement and prompt prompt from `content.md` and `references.md` directly to the exact implementation in the AURA-MED codebase.

---

### Master Traceability Table

| # | Challenge Requirement (`content.md`) | Implementation in Codebase | Scientific / Engineering Authority | Status |
|---|---|---|---|---|
| **1** | **Halfway to Mars Emergency Guidance**<br>*"What if a crew member feels sick halfway to mars? Create S/W that helps astronauts assess their health and guide emergency situations."* | • `frontend/src/components/EmergencyGuidanceView.jsx`<br>• `frontend/src/components/MedicalAdviceView.jsx`<br>• `backend/main.go` (`/api/v1/triage`, `/api/v1/anomalies`) | NASA Flight Medicine Clinic Clinical Practice Guidelines (CPGs); autonomous offline decision-tree triage. | **Fulfilled** |
| **2** | **"Astronauts are not doctors"**<br>*Non-technical plain language, step-by-step guidance without cognitive overload.* | • Plain-language triage instructions<br>• Bulkhead medical locker item locators (e.g., Locker 3, Valacyclovir, O2 mask)<br>• Immediate visual risk triage colors | Human-Centered Design for Extreme Environments (NASA-STD-3001 Vol 2). | **Fulfilled** |
| **3** | **How to Take Each Measurement**<br>*"Tool should explain: How to take each measurement"* | • Clickable cards in `frontend/src/components/DailyVitalsView.jsx`<br>• Compact `VitalMetricModal`<br>• Step-by-step sensor placement SOPs (arm position, resting duration, saliva collection) | NASA HRP Standard Measures SOPs. | **Fulfilled** |
| **4** | **Why It Matters**<br>*"Tool should explain: Why it matters"* | • Spaceflight physiology rationale inside `VitalMetricModal`<br>• Microgravity fluid shift, osteopenia (Wolff's Law), Space Fever, ECLSS CO2 buildup | NASA HRP Human Physiology in Space Handbook; Harvard & Lancet space health studies. | **Fulfilled** |
| **5** | **What to Do if Value is Abnormal**<br>*"Tool should explain: What to do when a value does not look normal"* | • "What to Do if Abnormal" section in modal<br>• Direct CTA button: **"View Protocols in Medical Advice"** which jumps directly to `activeTab = 'notices'` for full clinical countermeasures | NASA Emergency Medical Protocol Algorithms. | **Fulfilled** |
| **6** | **Remind the Crew to Take Measures (Bonus)**<br>*"Remind the crew to take measures (bonus)"* | • Prominent measurement reminder banner at top of dashboard (`upcomingReminder` in `DailyVitalsView.jsx`)<br>• Interactive "Mark Taken" button<br>• "Set Shift Reminder" button inside modal | Behavioral Health & Performance (BHP) Operational Schedules. | **Fulfilled (Bonus)** |
| **7** | **Environmental Adaptation**<br>*"Adapt it to different environments like a space craft, base and on the surface of the moon"* | • Dynamic Environment Selector in header and dashboard (`App.jsx`, `DailyVitalsView.jsx`)<br>• Spacecraft (0.00g, 101.3 kPa)<br>• Lunar Base (0.16g, 70.3 kPa hyperoxic 32% O2)<br>• Mars EVA (0.38g, 29.6 kPa 100% O2 space suit)<br>• Live baseline metric re-calibration | NASA Man-Systems Integration Standards (NASA-STD-3000). | **Fulfilled** |
| **8** | **NASA HRP & NASA OSDR Data**<br>*"Use NASA HRP and NASA Open Science Data Repository (OSDR)"* | • Integrated biomarkers from NASA GeneLab OSDR-379<br>• HRP physiological baselines in `backend/main.go` and `docs/NASA_HRP_BENCHMARKS.md` | NASA GeneLab OSDR-379 (Viral reactivation & immune dysregulation in microgravity). | **Fulfilled** |
| **9** | **Key Health Domains Covered**<br>*Bone & Joint, Cardio, Activity, Sleep, Movements, Fatigue.* | • **Bone/Joint & Movements:** 6,000 steps T2 treadmill counter (`docs/T2_TREADMILL_PROTOCOL.md`)<br>• **Cardiovascular:** Continuous HR & oscillometric BP<br>• **Sleep:** Actigraphy REM/deep sleep architecture<br>• **Fatigue:** Salivary cortisol neuroendocrine curve | Wolff's Law (1892); NASA Bone Summit guidelines. | **Fulfilled** |
| **10** | **Smart Watch Telemetry Integration**<br>*"Highlight if this is possible using a normal smart watch that counts or monitors health... mostly a watch that is easily accessible"* | • Dual-route Web Bluetooth & BLE Bridge for budget **Oraimo smart watch** (`frontend/src/utils/webBluetooth.js`, `bridge/oraimo_ble_bridge.py`)<br>• Open Web Bluetooth probe (`acceptAllDevices`)<br>• Real-time decoding of proprietary SEWear Protobuf frames (HR, live steps)<br>• Documented in `docs/PANEL_DEFENSE_AND_TELEMETRY_TRUTH.md` | Bluetooth SIG Core Specification v5.2; reverse-engineered Oraimo GATT service `16186f00-...`. | **Fulfilled** |
| **11** | **Graceful Simulation Fallback**<br>*"Software and data we have access to... fallback when watch is not connected"* | • Instant fallback to realistic NASA HRP simulation engine when BLE is disconnected or running in non-Chrome environments (`frontend/src/App.jsx`, `frontend/src/utils/stream.js`) | Continuous data continuity under deep-space loss of signal (LOS). | **Fulfilled** |
| **12** | **Salivary Immune Biomarkers & Latent Viruses**<br>*"Immune Biomarker - uses saliva... viruses can re-awaken in space"* | • Salivary Cortisol (nmol/L), Secretory IgA (µg/mL), CD4+/CD8+ T-cell ratio<br>• Latent Viral Shedding panel (EBV, HSV, VZV in copies/mL)<br>• Simulated viral flare trigger and Valacyclovir treatment SOP | NASA OSDR-379; Mehta et al., *Frontiers in Microbiology* (Latent virus shedding in astronauts). | **Fulfilled** |
| **13** | **Space Flight Standard Measures**<br>*Nutrition, Heart health, Immune system.* | • Dedicated telemetry blocks in `DailyVitalsView.jsx`<br>• Nutrition & fluid balance (2,840 kcal, 2.4 L, sodium monitoring for SANS risk)<br>• Heart health & salivary immune surveillance | NASA Artemis Standard Measures Protocol. | **Fulfilled** |
| **14** | **Dual Dashboards**<br>*"Two dashboards: one for the astronauts on the go and the other for the watch centre on earth."* | • **Astronaut View:** High-contrast, touch-optimized, low-latency autonomous interface (`ProtectedDashboard`)<br>• **Ground Control / Earth Station:** Multi-astronaut fleet monitor, communication delay simulator (3–22 min Mars radio delay), telemetry ingest (`GroundControlView`) | NASA Mission Control Center (MCC) flight console architecture. | **Fulfilled** |
| **15** | **Flight Phase Testing**<br>*"Test these cases using different conditions: Before lift off. In space. After the mission"* | • Phase Selector in `TrendsView.jsx` and `App.jsx`<br>• Pre-Launch Baseline (1.00g Earth baseline)<br>• In-Flight Transit (0.00g Microgravity)<br>• Post-Mission Rehabilitation (1.00g recovery) | Longitudinal human adaptation profiles (NASA Twins Study). | **Fulfilled** |
| **16** | **Terrestrial & Humanitarian Applications**<br>*"Could help in extreme situations on marginalized communities or people without readily available health services."* | • Completely offline-first operation (zero internet required)<br>• Low-cost commercial wearable integration ($20–$30 smartwatch)<br>• Rural and austere triage applicability | WHO Austere & Remote Telehealth Guidelines. | **Fulfilled** |

---

### Conclusion

AURA-MED satisfies **100% of the primary requirements** and **100% of the bonus requirements** outlined in the NASA Space Apps Challenge brief. The codebase is thoroughly tested, documented, and ready for panel defense.
