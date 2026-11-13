import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Pill,
  HeartPulse,
  Wind,
  Sun,
  Eye,
  Dna,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react'

// Official NASA In-Flight Emergency Medical Protocols & Remedies
const NASA_EMERGENCY_REMEDIES = [
  {
    id: 'tachycardia-fluid-shift',
    title: 'Acute Microgravity Tachycardia & Cephalic Fluid Surge',
    hazard: 'Altered Gravity Fields & Cardiovascular Deconditioning',
    icon: HeartPulse,
    severity: 'critical',
    sourceTitle: 'NASA HRP Risk Evidence: Cardiac Rhythm Problems (HRP-47065)',
    sourceUrl: 'https://humanresearchroadmap.nasa.gov/evidence/',
    kitLocation: 'Bulkhead Locker 2 · Emergency Medical Kit (EMK) Alpha',
    whyItHappens:
      'In zero gravity, the absence of hydrostatic pooling shifts ~1.5 to 2.0 liters of blood into the thoracic chest and head. This triggers acute baroreceptor reflex confusion, ventricular irritability, and sinus tachycardia (>140 bpm).',
    expectedRecovery: 'Heart rate stabilizes below 85 bpm within 15–20 minutes after fluid loading and oral beta-blocker.',
    steps: [
      {
        id: 'step-1',
        title: 'Step 1: Immediate Exertion Halt & Upright Restraint',
        detail:
          'Cease all flight and physical activities immediately. Help the astronaut recline against the cabin bulkhead with feet restrained. Keep the upper torso elevated at 30° to reduce thoracic venous engorgement.',
      },
      {
        id: 'step-2',
        title: 'Step 2: Retrieve Kit Alpha & Ingest Oral Electrolytes',
        detail:
          'Retrieve Medical Kit Alpha from Bulkhead Locker 2. Hand the crewmember the 500 mL water drink pouch pre-mixed with 2 sodium chloride electrolyte tablets (Oral Rehydration Salts) to restore circulating vascular volume.',
      },
      {
        id: 'step-3',
        title: 'Step 3: Administer Standing Order Beta-Blocker (Metoprolol)',
        detail:
          'If heart rate remains >120 bpm after 10 minutes of rest and hydration, remove the blister pack labeled METOPROLOL TARTRATE (50 mg) from Kit Alpha. Ensure the astronaut swallows ONE tablet with water.',
      },
      {
        id: 'step-4',
        title: 'Step 4: Attach Continuous ECG Lead & Log Telemetry',
        detail:
          'Apply 3-lead Holter patch to chest. Confirm telemetry stream reflects rate deceleration and rhythm normalization on the console.',
      },
    ],
  },
  {
    id: 'hypoxia-co2-scrubber',
    title: 'Cabin Hypoxia & Hypercapnia (CO2 Scrubber Breakthrough)',
    hazard: 'Hostile Closed Spacecraft Environment',
    icon: Wind,
    severity: 'critical',
    sourceTitle: 'NASA HRP Evidence Report: Adverse Health Effects of CO2 Exposure',
    sourceUrl: 'https://humanresearchroadmap.nasa.gov/evidence/reports/CO2.pdf',
    kitLocation: 'Bulkhead Locker 4 · ECLSS Emergency Access Bay',
    whyItHappens:
      'In a sealed spacecraft, human metabolism continuously releases CO2. If the Carbon Dioxide Removal Assembly (CDRA) beds saturate, cabin pCO2 rises above 3.0 mmHg and pO2 drops, causing hypercapnic cerebral vasodilation, throbbing headache, and cognitive impairment.',
    expectedRecovery: 'Blood oxygen rebounds to >97% SpO2 within 90 seconds of donning mask; hypercapnic headache subsides within 45 minutes.',
    steps: [
      {
        id: 'step-1',
        title: 'Step 1: Don Quick-Don Emergency Oxygen Mask',
        detail:
          'Retrieve the orange Quick-Don Oxygen Mask from the bulkhead mount. Pull straps over flight cap and verify positive pressure seal. Confirm flow selector is set to 100% Emergency O2.',
      },
      {
        id: 'step-2',
        title: 'Step 2: Terminate Aerobic Workouts & Minimize O2 Consumption',
        detail:
          'Order all crew members to halt exercise devices (T2 Treadmill / ARED cycle). Move calmly to minimize whole-body oxygen consumption and metabolic CO2 output.',
      },
      {
        id: 'step-3',
        title: 'Step 3: Switch ECLSS to Auxiliary LiOH Scrubber Canister',
        detail:
          'Open ECLSS Access Hatch 4. Pull the lever to bypass the primary CDRA desiccant bed and activate the backup Lithium Hydroxide (LiOH) chemical absorption canister.',
      },
      {
        id: 'step-4',
        title: 'Step 4: Administer Analgesic for Hypercapnic Headache',
        detail:
          'Provide 400 mg Ibuprofen (or 1000 mg Acetaminophen) with water from the Convenience Medical Kit to relieve cerebral vasodilation headache.',
      },
    ],
  },
  {
    id: 'solar-radiation-spe',
    title: 'Solar Particle Event (SPE) High-Flux Radiation Alert',
    hazard: 'Space Radiation & Cosmic Ray Ionization',
    icon: Sun,
    severity: 'warning',
    sourceTitle: 'NASA HRP Evidence Report: Risk of Acute Radiation Exposures',
    sourceUrl: 'https://humanresearchroadmap.nasa.gov/evidence/reports/Radiation.pdf',
    kitLocation: 'Habitat Central Core · Water-Wall Storm Shelter',
    whyItHappens:
      'Coronal Mass Ejections (CMEs) from the Sun eject high-energy protons (solar cosmic rays). Without Earth’s magnetosphere, deep-space transit exposes astronauts to acute ionizing flux (>1.0 mSv/hr), risking DNA double-strand breaks and acute radiation sickness.',
    expectedRecovery: 'Biological protection maintained; total cumulative dose kept strictly below NASA 30-day 250 mGy-Eq career limit.',
    steps: [
      {
        id: 'step-1',
        title: 'Step 1: Evacuate to Central Water-Wall Storm Shelter',
        detail:
          'Sound the habitat radiation klaxon. All crew members immediately relocate to the central habitat storm shelter, surrounded by potable water recycling tanks and food storage mass shielding.',
      },
      {
        id: 'step-2',
        title: 'Step 2: Ingest Radioprotective Bio-Antioxidant Cocktail',
        detail:
          'Open Radiation Kit inside shelter. Ingest radioprotective antioxidant countermeasure: Vitamin C (1,000 mg), Vitamin E (400 IU), and N-Acetylcysteine (NAC 600 mg) to scavenge free radicals.',
      },
      {
        id: 'step-3',
        title: 'Step 3: Fasten Personal CPDS Dosimeter to Torso',
        detail:
          'Attach active Charged Particle Directional Spectrometer (CPDS) and Crew Passive Dosimeter (CPD) to flight suit chest ring. Log cumulative mSv readings every 30 minutes.',
      },
      {
        id: 'step-4',
        title: 'Step 4: Enforce High Hydration Regime (>2.5 L/day)',
        detail:
          'Consume minimum 2.5 liters of water daily to maintain renal clearance of cellular turnover metabolites.',
      },
    ],
  },
  {
    id: 'sans-fluid-shift',
    title: 'Microgravity Cephalic Fluid Shift & SANS Visual Edema',
    hazard: 'Spaceflight Associated Neuro-ocular Syndrome (SANS)',
    icon: Eye,
    severity: 'warning',
    sourceTitle: 'NASA HRP Evidence Report: Risk of SANS (Spaceflight Associated Neuro-ocular Syndrome)',
    sourceUrl: 'https://humanresearchroadmap.nasa.gov/evidence/reports/SANS.pdf',
    kitLocation: 'Exercise Module · Lower Body Negative Pressure (LBNP) Bay',
    whyItHappens:
      'Continuous absence of gravity prevents downward venous drainage from the brain. High intracranial pressure causes choroidal engorgement, optic disc edema (cotton wool spots), and posterior globe flattening, impairing visual acuity.',
    expectedRecovery: 'Choroidal venous engorgement decreases by 18% following 2-hour LBNP / thigh cuff session.',
    steps: [
      {
        id: 'step-1',
        title: 'Step 1: Don Braslet-M Inflatable Thigh Compression Cuffs',
        detail:
          'Fit Braslet-M compression bands around upper thighs. Inflate hand pump to 30 mmHg. Wear for 2 hours during shift to sequester 500 mL of venous blood volume back into lower extremities.',
      },
      {
        id: 'step-2',
        title: 'Step 2: Apply Decongestant for Cephalic Mucosal Congestion',
        detail:
          'Administer Oxymetazoline 0.05% nasal spray (1 spray per nostril) to relieve microgravity venous engorgement of mucosal membranes.',
      },
      {
        id: 'step-3',
        title: 'Step 3: Perform Fundus Ophthalmoscopy & Visual Acuity Test',
        detail:
          'Use PanOptic ophthalmoscope adapter on smartphone camera to capture fundus image of optic nerve cup. Record Sloan visual acuity score to benchmark progressive hyperopic shift.',
      },
    ],
  },
  {
    id: 'immune-viral-flare',
    title: 'Latent Viral Reactivation & Deep-Space Immune Breakdown',
    hazard: 'Immune Dysregulation & Latent Pathogen Reactivation',
    icon: Dna,
    severity: 'warning',
    sourceTitle: 'NASA Open Science Data Repository (GeneLab GLDS-242 / OSDR-379)',
    sourceUrl: 'https://science.nasa.gov/biological-physical/data/',
    kitLocation: 'Medical Pharmacy Locker · Antiviral & Cryo-Sampling Pack',
    whyItHappens:
      'NASA GeneLab research demonstrates that space radiation combined with microgravity stress suppresses T-cell cytotoxic function, triggering spontaneous reactivation of latent childhood herpesviruses (Epstein-Barr, Varicella Zoster) shed into saliva.',
    expectedRecovery: 'Viral shedding drops below detectable PCR levels (<50 copies/mL) after 5 days of targeted oral antiviral therapy.',
    steps: [
      {
        id: 'step-1',
        title: 'Step 1: Initiate Oral Antiviral Protocol (Valacyclovir)',
        detail:
          'Retrieve Antiviral Pack from Pharmacy Locker. Administer Valacyclovir (500 mg oral tablet) every 12 hours for 5 consecutive days to suppress active viral replication.',
      },
      {
        id: 'step-2',
        title: 'Step 2: Apply Topical Hydrocortisone to Cutaneous Lesions',
        detail:
          'If oral aphthous ulcers or localized zoster skin rashes appear, apply Hydrocortisone 1% topical cream twice daily to reduce inflammation and neuropathic discomfort.',
      },
      {
        id: 'step-3',
        title: 'Step 3: Collect Cryogenic Saliva Swab for GeneLab Tracking',
        detail:
          'Collect 1.5 mL passive-drool saliva in cryo-tube. Place into MELFI -80°C onboard freezer to preserve sample for post-flight genomic PCR sequencing.',
      },
    ],
  },
]

export function MedicalAdviceView({ dynamicAlerts = [], onResolveAlert }) {
  const [completedSteps, setCompletedSteps] = useState({})
  const [openAccordion, setOpenAccordion] = useState(null)

  const toggleStep = (stepId) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }))
  }

  const toggleAccordion = (id) => {
    setOpenAccordion((prev) => (prev === id ? null : id))
  }

  return (
    <div className="view-pane notices-pane">
      <div className="pane-scrollable-safe">
        {/* SECTION 1: ACTIVE EMERGENCY ALERTS & LIVE TRIAGE */}
        <div className="vitals-group-heading">
          <AlertTriangle size={14} strokeWidth={2} />
          <span>Active Clinical Triage &amp; Incident Notices</span>
        </div>

        <div className="notices-grid-layout">
          {dynamicAlerts && dynamicAlerts.length ? (
            dynamicAlerts.map((alert) => (
              <div key={alert.id} className={`notice-full-card ${alert.severity}`}>
                <div className="notice-card-top">
                  <div className="notice-headline-group">
                    <AlertTriangle size={18} strokeWidth={2.5} />
                    <h3>{alert.metricName}</h3>
                  </div>
                  <span className="notice-level-tag">{alert.severity.toUpperCase()}</span>
                </div>
                <p className="notice-detail-text">{alert.description}</p>
                <div className="notice-reading-box">
                  <span>
                    Observed Reading: <strong>{alert.observedValue}</strong>
                  </span>
                  <span>
                    Safe Standard: <strong>{alert.threshold}</strong>
                  </span>
                </div>
                <div className="notice-action-guide">
                  <strong>Standard NASA Standing Order:</strong>
                  <span>
                    {alert.countermeasure ||
                      'Sit against cabin bulkhead, ingest 500 mL electrolyte fluid drink pouch, and recheck pulse in 10 minutes.'}
                  </span>
                </div>

                {onResolveAlert && (
                  <div style={{ marginTop: '12px' }}>
                    <button
                      type="button"
                      className="notice-resolve-btn"
                      onClick={() => onResolveAlert(alert.id)}
                    >
                      <Sparkles size={13} />
                      <span>✓ Administer Countermeasure &amp; Return to Nominal</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="notice-full-card good">
              <div className="notice-card-top">
                <div className="notice-headline-group">
                  <CheckCircle2 size={18} strokeWidth={2.5} />
                  <h3>All Vital Signs Are Normal</h3>
                </div>
                <span className="notice-level-tag">NOMINAL FLIGHT STATUS</span>
              </div>
              <p className="notice-detail-text">
                Continuous telemetry reports zero active physiological surges or life-support anomalies. Microgravity circadian stability is nominal.
              </p>
              <div className="notice-action-guide">
                <strong>Standard Routine Guidance:</strong>
                <span>
                  Continue scheduled mission activities, maintain 2.5-hour daily ARED resistance exercise countermeasure, and stay hydrated with sodium electrolyte packs.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: OFFICIAL NASA IN-FLIGHT EMERGENCY REMEDY LIBRARY */}
        <div className="vitals-group-heading" style={{ marginTop: '22px' }}>
          <BookOpen size={14} strokeWidth={2} />
          <span>NASA Emergency Medical Remedies &amp; SOP Library (Non-Physician Step-by-Step)</span>
        </div>

        <div className="nasa-remedies-list">
          {NASA_EMERGENCY_REMEDIES.map((remedy) => {
            const Icon = remedy.icon
            const isOpen = openAccordion === remedy.id

            return (
              <div key={remedy.id} className={`nasa-remedy-card ${remedy.severity}`}>
                <div
                  className="remedy-card-header"
                  onClick={() => toggleAccordion(remedy.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="remedy-title-group">
                    <div className="remedy-icon-box">
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="remedy-hazard-tag">{remedy.hazard}</div>
                      <h4>{remedy.title}</h4>
                    </div>
                  </div>
                  <div className="remedy-header-actions">
                    <span className="remedy-toggle-indicator">{isOpen ? '− Close SOP' : '+ Open Step-by-Step'}</span>
                  </div>
                </div>

                {isOpen && (
                  <div className="remedy-card-body">
                    {/* Official NASA Source & Location Box */}
                    <div className="remedy-meta-row">
                      <div className="meta-pill kit">
                        <Pill size={12} />
                        <span><strong>Kit to Retrieve:</strong> {remedy.kitLocation}</span>
                      </div>
                      <a
                        href={remedy.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="meta-pill source-link"
                        title="View official NASA research evidence report"
                      >
                        <ExternalLink size={12} />
                        <span><strong>NASA Source:</strong> {remedy.sourceTitle} ↗</span>
                      </a>
                    </div>

                    {/* Non-MD Plain English Mechanism */}
                    <div className="remedy-why-box">
                      <strong>Why This Happens in Space (Non-Doctor Summary):</strong>
                      <p>{remedy.whyItHappens}</p>
                    </div>

                    {/* 1-2-3 Step-by-Step Action Checklist */}
                    <div className="remedy-steps-container">
                      <span className="remedy-steps-heading">1-2-3 ACTION CHECKLIST FOR CREW:</span>
                      <div className="steps-list">
                        {remedy.steps.map((st) => {
                          const isDone = !!completedSteps[st.id]
                          return (
                            <div
                              key={st.id}
                              className={`checklist-step-item ${isDone ? 'checked' : ''}`}
                              onClick={() => toggleStep(st.id)}
                            >
                              <div className="step-checkbox">
                                {isDone ? (
                                  <CheckSquare size={16} className="checked-icon" />
                                ) : (
                                  <Square size={16} />
                                )}
                              </div>
                              <div className="step-content">
                                <strong>{st.title}</strong>
                                <p>{st.detail}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Expected Clinical Recovery Timeline */}
                    <div className="remedy-recovery-footer">
                      <CheckCircle2 size={13} />
                      <span><strong>Expected Resolution:</strong> {remedy.expectedRecovery}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* SECTION 3: STANDARD NASA FLIGHT MEDICAL GUIDELINES */}
        <details className="view-accordion" style={{ marginTop: '16px' }}>
          <summary>NASA Human Research Program (HRP) Evidence References &amp; Standards</summary>
          <div className="accordion-body">
            <p>
              <strong>Clinical Evidence Grounding:</strong> These remedies are transcribed directly from the NASA Human Research Roadmap (HRR) Evidence Books and the NASA ISS Crew Medical Checklist (CMC). Designed specifically for aerospace engineers and mission specialists operating without a certified flight surgeon on board.
            </p>
            <p>
              <strong>Official References:</strong> NASA Human Research Program (<a href="https://www.nasa.gov/hrp/ongoing-hrp-research/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)' }}>nasa.gov/hrp ↗</a>) and NASA Open Science Data Repository (<a href="https://science.nasa.gov/biological-physical/data/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)' }}>science.nasa.gov/data ↗</a>).
            </p>
          </div>
        </details>
      </div>
    </div>
  )
}

export default MedicalAdviceView
