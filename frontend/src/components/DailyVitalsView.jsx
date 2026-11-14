import { useState } from 'react'
import {
  Activity,
  ShieldCheck,
  ArrowRight,
  Clock,
  Dna,
  Info,
  Globe2,
  CheckCircle2,
  X,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react'

export function DailyVitalsView({
  latest,
  isStreaming,
  setIsStreaming,
  activityMode,
  setActivityMode,
  environmentMode = 'spacecraft',
  scenarioMode = 'nominal',
  onJumpToTrends,
  onJumpToMedicalAdvice,
  upcomingReminder,
  onCompleteReminder,
}) {
  const [activeModalKey, setActiveModalKey] = useState(null)

  // Environmental context parameters
  const envDetails = {
    spacecraft: {
      name: 'Deep-Space Transit (0.00g)',
      gravity: '0.00g Microgravity',
      pressure: '101.3 kPa (Sea-Level Standard)',
      habitat: 'Closed-Loop ECLSS Habitat',
    },
    lunar_base: {
      name: 'Lunar Surface Outpost (0.16g)',
      gravity: '0.16g Partial Lunar Gravity',
      pressure: '70.3 kPa (Hyperoxic 32% O2)',
      habitat: 'Regolith-Shielded Pressurized Base',
    },
    mars_eva: {
      name: 'Mars Surface EVA (0.38g)',
      gravity: '0.38g Martian Surface Gravity',
      pressure: '29.6 kPa (100% O2 Space Suit)',
      habitat: 'xEMU Planetary Exploration Suit',
    },
  }[environmentMode] || {
    name: 'Deep-Space Transit (0.00g)',
    gravity: '0.00g Microgravity',
    pressure: '101.3 kPa',
    habitat: 'Orion Habitat',
  }

  // Dynamic Salivary Immune & Viral Reactivation Biomarkers (NASA GeneLab OSDR-379)
  const isStressOrRadiation = scenarioMode === 'stress' || scenarioMode === 'radiation' || scenarioMode === 'tachycardia'
  const salivaryCortisol = isStressOrRadiation ? '28.4 nmol/L' : '14.2 nmol/L'
  const cortisolStatus = isStressOrRadiation ? 'ELEVATED' : 'NOMINAL'
  const viralShedding = isStressOrRadiation ? '480 copies/mL' : '< 50 copies/mL'
  const viralStatus = isStressOrRadiation ? 'VIRAL FLARE DETECTED' : 'INACTIVE (NOMINAL)'
  const secretoryIgA = isStressOrRadiation ? '142 µg/mL' : '198 µg/mL'
  const tCellRatio = isStressOrRadiation ? '1.42 (Shifted)' : '1.85 (Balanced)'

  // Comprehensive Metric Guide & Clinical SOP dictionary (Addressing content.md lines 8-12)
  const VITAL_MODAL_DETAILS = {
    hr: {
      title: 'Heart Rate (Pulse Telemetry)',
      unit: 'beats / min',
      getValue: () => latest.heartRate,
      range: 'Normal: 60 – 100 bpm (Resting in 0g)',
      isAbnormal: () => latest.heartRate > 90,
      statusText: () => (latest.heartRate > 90 ? 'ELEVATED (>90 bpm)' : 'NOMINAL'),
      whyItMatters:
        'In microgravity, hydrostatic blood pressure disappears and ~2 Liters of venous fluid shifts cephalad (toward the head and chest). This alters baroreceptor responsiveness, reduces stroke volume over time, and alters cardiac workload.',
      howToMeasure:
        'Wear the optical sensor (Oraimo smart band) 1 finger-width above the wrist styloid process. Fasten securely and rest arm motionless across the chest for 30 seconds during active sampling.',
      whatIfAbnormal:
        'If resting heart rate >100 bpm or irregular rhythm: Recline in crew berth, consume 500 mL of chilled electrolyte solution to maintain circulating plasma volume, and review clinical cardiac countermeasures.',
    },
    bp: {
      title: 'Blood Pressure (Arterial Perfusion)',
      unit: 'mmHg',
      getValue: () => latest.bloodPressure,
      range: 'Standard: 120 / 80 mmHg',
      isAbnormal: () => false,
      statusText: () => 'NOMINAL (OPTIMAL)',
      whyItMatters:
        'Essential for monitoring cerebral perfusion pressure and preventing orthostatic intolerance. Fluid shifts can increase intracranial pressure (SANS risk) or lead to cerebral hypoperfusion during high-G maneuvers.',
      howToMeasure:
        'Fit the pneumatic cuff over the brachial artery at heart level. Sit calmly, breathe slowly without speaking, and allow the oscillometric sensor to complete inflation and linear deflation.',
      whatIfAbnormal:
        'If systolic >140 or diastolic >90: Verify cuff position, practice slow 6-breath/min diaphragmatic respiration for 5 minutes, and verify cabin CO2 levels in Medical Advice.',
    },
    o2: {
      title: 'Blood Oxygen (SpO2 Oximetry)',
      unit: '% SpO2',
      getValue: () => `${latest.bloodOxygen}%`,
      range: 'Safe Threshold: 95% – 100%',
      isAbnormal: () => latest.bloodOxygen < 95,
      statusText: () => (latest.bloodOxygen < 95 ? 'HYPOXIC RISK' : 'NOMINAL'),
      whyItMatters:
        'In closed spacecraft environments, stagnant air pockets can form without natural buoyancy convection. Low SpO2 is the primary early warning for localized carbon dioxide accumulation or ECLSS scrubber failure.',
      howToMeasure:
        'Ensure fingertip or wrist optical photoplethysmography sensor is dry and warm. Keep sensor shielded from high cabin ambient light and hold stationary for 15 seconds.',
      whatIfAbnormal:
        'If SpO2 < 95%: Don portable emergency oxygen mask immediately, verify cabin oxygen partial pressure (ppO2) and LiOH CO2 scrubbers, and check Medical Advice protocols.',
    },
    temp: {
      title: 'Core Body Temperature',
      unit: 'Celsius',
      getValue: () => `${Number(latest.bodyTemperature).toFixed(1)}°`,
      range: 'Normal: 36.5° – 37.5°C',
      isAbnormal: () => Number(latest.bodyTemperature) > 37.5,
      statusText: () => (Number(latest.bodyTemperature) > 37.5 ? 'SPACE FEVER' : 'NOMINAL'),
      whyItMatters:
        'Zero-G impairs natural air convection and sweat evaporation from the skin. Astronauts baseline core temperature increases by ~1°C ("Space Fever") during rest and spikes rapidly during physical exertion.',
      howToMeasure:
        'Use the tympanic infrared probe inserted gently into the ear canal or continuous double-sensor forehead heat-flux wearable.',
      whatIfAbnormal:
        'If core temperature > 38.0°C: Don the Liquid Cooling and Ventilation Garment (LCVG), consume chilled electrolyte pouches, and inspect for subclinical infection in Medical Advice.',
    },
    /* Secondary & biomarker details registered in subsequent modules */
  }

  const activeModalData = activeModalKey ? VITAL_MODAL_DETAILS[activeModalKey] : null

  return (
    <div className="view-pane vitals-pane">
      {/* 1. SCHEDULED MEASUREMENT REMINDER PROMPT (content.md Line 12) */}
      {upcomingReminder && (
        <div className={`measurement-reminder-banner ${upcomingReminder.taken ? 'completed' : ''}`}>
          <div className="reminder-left">
            {upcomingReminder.taken ? (
              <CheckCircle2 size={18} className="reminder-icon success" />
            ) : (
              <Clock size={18} className="reminder-icon" />
            )}
            <div>
              <strong>
                {upcomingReminder.taken ? '✓ Measurement Protocol Completed' : `Scheduled Task: ${upcomingReminder.title}`}
              </strong>
              <small>
                {upcomingReminder.taken
                  ? 'Data logged into mission medical telemetry log.'
                  : `Due: ${upcomingReminder.dueIn} · Protocol: ${upcomingReminder.protocol}`}
              </small>
            </div>
          </div>
          {!upcomingReminder.taken && (
            <button
              type="button"
              className="reminder-complete-btn"
              onClick={onCompleteReminder}
            >
              ✓ Mark Taken
            </button>
          )}
        </div>
      )}

      {/* Dynamic Telemetry Stream Bar & Environmental Context */}
      <div className="telemetry-live-control-strip">
        <div className="stream-status-group">
          <span className={`stream-live-indicator ${isStreaming ? 'live' : 'paused'}`}>
            <Activity size={14} strokeWidth={2} />
            <span>
              Oraimo Stream: <strong>{isStreaming ? 'LIVE (Dynamic 2s Stream)' : 'PAUSED'}</strong>
            </span>
          </span>
          <span className="environment-context-tag">
            <Globe2 size={13} strokeWidth={2} />
            <span>{envDetails.gravity} · {envDetails.pressure}</span>
          </span>
        </div>

        <div className="telemetry-mode-selector">
          <span className="mode-selector-lbl">Exertion Mode:</span>
          <button
            type="button"
            className={`telemetry-mode-btn ${activityMode === 'nominal' ? 'active' : ''}`}
            onClick={() => setActivityMode('nominal')}
          >
            Nominal Rest
          </button>
          <button
            type="button"
            className={`telemetry-mode-btn ${activityMode === 'exercise' ? 'active' : ''}`}
            onClick={() => setActivityMode('exercise')}
          >
            Treadmill Workout
          </button>
          <button
            type="button"
            className={`telemetry-mode-btn ${activityMode === 'stress' ? 'active' : ''}`}
            onClick={() => setActivityMode('stress')}
          >
            Zero-G Fluid Surge
          </button>
          <button
            type="button"
            className="telemetry-stream-toggle"
            onClick={() => setIsStreaming((s) => !s)}
          >
            {isStreaming ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* 2. PRIMARY CIRCULATORY VITALS */}
      <div className="vitals-group-heading">
        <Activity size={14} strokeWidth={2} />
        <span>Primary Circulatory Vitals</span>
      </div>

      <div className="vitals-matrix-row">
        {/* Heart Rate Card */}
        <article
          className={`vital-block clickable ${latest.heartRate > 90 ? 'warning' : 'good'}`}
          onClick={() => setActiveModalKey('hr')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setActiveModalKey('hr')}
          title="Click to view How to Measure, Why it Matters, and Clinical SOP"
        >
          <div className="block-head">
            <span className="block-title">Heart Rate</span>
            <div className="block-head-right">
              <span className={`vital-tag ${latest.heartRate > 90 ? 'warning' : 'nominal'}`}>
                {latest.heartRate > 90 ? 'ELEVATED' : 'NOMINAL'}
              </span>
            </div>
          </div>
          <div className="block-val-group">
            <strong className="block-num">{latest.heartRate}</strong>
            <span className="block-unit">beats / min</span>
          </div>
          <span className="block-range">Normal: 60 – 100 bpm</span>
          <p className="block-desc">Continuous optical pulse sensor. Blood gently shifts upward in microgravity.</p>
          <span className="vital-tap-hint">
            <Info size={11} /> Tap card for Measurement SOP &amp; Rationale
          </span>
        </article>

        {/* Blood Pressure Card */}
        <article
          className="vital-block clickable good"
          onClick={() => setActiveModalKey('bp')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setActiveModalKey('bp')}
          title="Click to view How to Measure, Why it Matters, and Clinical SOP"
        >
          <div className="block-head">
            <span className="block-title">Blood Pressure</span>
            <div className="block-head-right">
              <span className="vital-tag nominal">NORMAL</span>
            </div>
          </div>
          <div className="block-val-group">
            <strong className="block-num">{latest.bloodPressure}</strong>
            <span className="block-unit">mmHg</span>
          </div>
          <span className="block-range">Standard: 120 / 80</span>
          <p className="block-desc">Healthy circulatory pressure supplied to the cerebral cortex.</p>
          <span className="vital-tap-hint">
            <Info size={11} /> Tap card for Measurement SOP &amp; Rationale
          </span>
        </article>

        {/* Blood Oxygen Card */}
        <article
          className={`vital-block clickable ${latest.bloodOxygen < 95 ? 'warning' : 'good'}`}
          onClick={() => setActiveModalKey('o2')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setActiveModalKey('o2')}
          title="Click to view How to Measure, Why it Matters, and Clinical SOP"
        >
          <div className="block-head">
            <span className="block-title">Blood Oxygen</span>
            <div className="block-head-right">
              <span className={`vital-tag ${latest.bloodOxygen < 95 ? 'warning' : 'nominal'}`}>
                {latest.bloodOxygen < 95 ? 'LOW' : 'NOMINAL'}
              </span>
            </div>
          </div>
          <div className="block-val-group">
            <strong className="block-num">{latest.bloodOxygen}</strong>
            <span className="block-unit">% SpO2</span>
          </div>
          <span className="block-range">Safe: Above 95%</span>
          <p className="block-desc">Pulse oximeter reading from cabin air respiration.</p>
          <span className="vital-tap-hint">
            <Info size={11} /> Tap card for Measurement SOP &amp; Rationale
          </span>
        </article>

        {/* Body Temperature Card */}
        <article
          className="vital-block clickable good"
          onClick={() => setActiveModalKey('temp')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setActiveModalKey('temp')}
          title="Click to view How to Measure, Why it Matters, and Clinical SOP"
        >
          <div className="block-head">
            <span className="block-title">Body Temperature</span>
            <div className="block-head-right">
              <span className="vital-tag nominal">NORMAL</span>
            </div>
          </div>
          <div className="block-val-group">
            <strong className="block-num">{Number(latest.bodyTemperature).toFixed(1)}°</strong>
            <span className="block-unit">Celsius</span>
          </div>
          <span className="block-range">Normal: 36.5° – 37.5°C</span>
          <p className="block-desc">Circadian thermoregulation steady. Microgravity core temp nominal.</p>
          <span className="vital-tap-hint">
            <Info size={11} /> Tap card for Measurement SOP &amp; Rationale
          </span>
        </article>
      </div>

      {/* 3. RESPIRATION & DAILY ACTIVITY */}
      <div className="vitals-group-heading">
        <ShieldCheck size={14} strokeWidth={2} />
        <span>Respiration &amp; Daily Activity</span>
      </div>

      <div className="vitals-matrix-row secondary-row">
        {/* Breathing Rate Card */}
        <article
          className="vital-block clickable good"
          onClick={() => setActiveModalKey('resp')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setActiveModalKey('resp')}
          title="Click to view How to Measure, Why it Matters, and Clinical SOP"
        >
          <div className="block-head">
            <span className="block-title">Breathing Rate</span>
            <span className="vital-tag nominal">STEADY</span>
          </div>
          <div className="block-val-group">
            <strong className="block-num">{latest.respiratoryRate}</strong>
            <span className="block-unit">breaths / min</span>
          </div>
          <span className="block-range">Normal: 12 – 20 breaths</span>
          <p className="block-desc">Thoracic bio-impedance respiration sensor on smart strap.</p>
          <span className="vital-tap-hint">
            <Info size={11} /> Tap card for Measurement SOP &amp; Rationale
          </span>
        </article>

        {/* Sleep Duration Card */}
        <article
          className={`vital-block clickable ${latest.sleepDuration < 6 ? 'warning' : 'good'}`}
          onClick={() => setActiveModalKey('sleep')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setActiveModalKey('sleep')}
          title="Click to view How to Measure, Why it Matters, and Clinical SOP"
        >
          <div className="block-head">
            <span className="block-title">Sleep Last Night</span>
            <span className={`vital-tag ${latest.sleepDuration < 6 ? 'warning' : 'nominal'}`}>
              {latest.sleepDuration < 6 ? 'LOW' : 'SUFFICIENT'}
            </span>
          </div>
          <div className="block-val-group">
            <strong className="block-num">{Number(latest.sleepDuration).toFixed(1)}</strong>
            <span className="block-unit">hours</span>
          </div>
          <span className="block-range">Goal: 7 – 8 hours</span>
          <p className="block-desc">Sleep cycle recorded. REM and deep rest architecture complete.</p>
          <span className="vital-tap-hint">
            <Info size={11} /> Tap card for Measurement SOP &amp; Rationale
          </span>
        </article>

        {/* Daily Exercise Steps Card */}
        <article
          className={`vital-block clickable ${(latest?.physicalActivity ?? 6000) < 3000 ? 'warning' : 'good'}`}
          onClick={() => setActiveModalKey('steps')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setActiveModalKey('steps')}
          title="Click to view How to Measure, Why it Matters, and Clinical SOP"
        >
          <div className="block-head">
            <span className="block-title">Daily Exercise Steps</span>
            <div className="block-head-right">
              <span className={`vital-tag ${(latest?.physicalActivity ?? 6000) < 3000 ? 'warning' : 'nominal'}`}>
                {(latest?.physicalActivity ?? 6000) < 3000 ? 'UNDER TARGET' : 'ACTIVE'}
              </span>
            </div>
          </div>
          <div className="block-val-group">
            <strong className="block-num">{(latest?.physicalActivity ?? 6000).toLocaleString()}</strong>
            <span className="block-unit">steps</span>
          </div>
          <span className="block-range">Goal: 6,000+ steps</span>
          <p className="block-desc">Live Oraimo wrist accelerometer count &amp; T2 treadmill loading strides.</p>
          <span className="vital-tap-hint">
            <Info size={11} /> Tap card for Measurement SOP &amp; Rationale
          </span>
        </article>

        {/* Nutrition & Fluid Balance (NASA Artemis Standard Measure) */}
        <article
          className="vital-block clickable good"
          onClick={() => setActiveModalKey('nutrition')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setActiveModalKey('nutrition')}
          title="Click to view How to Measure, Why it Matters, and Clinical SOP"
        >
          <div className="block-head">
            <span className="block-title">Nutrition &amp; Hydration</span>
            <div className="block-head-right">
              <span className="vital-tag nominal">BALANCED</span>
            </div>
          </div>
          <div className="block-val-group">
            <strong className="block-num">2,840</strong>
            <span className="block-unit">kcal · 2.4 L</span>
          </div>
          <span className="block-range">Goal: 2,700–3,000 kcal</span>
          <p className="block-desc">Galley RFID nutritional tracking. Low-sodium electrolyte pouch balance nominal.</p>
          <span className="vital-tap-hint">
            <Info size={11} /> Tap card for Measurement SOP &amp; Rationale
          </span>
        </article>
      </div>

      {/* 4. SALIVARY IMMUNE BIOMARKERS & LATENT VIRAL SURVEILLANCE (content.md Lines 33-36 & NASA OSDR-379) */}
      <div className="vitals-group-heading">
        <Dna size={14} strokeWidth={2} />
        <span>Salivary Immune Biomarkers &amp; Viral Surveillance (NASA GeneLab OSDR-379)</span>
      </div>

      <div className="vitals-matrix-row secondary-row">
        {/* Salivary Cortisol Card */}
        <article
          className={`vital-block clickable ${cortisolStatus === 'ELEVATED' ? 'warning' : 'good'}`}
          onClick={() => setActiveModalKey('cortisol')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setActiveModalKey('cortisol')}
          title="Click to view How to Measure, Why it Matters, and Clinical SOP"
        >
          <div className="block-head">
            <span className="block-title">Salivary Cortisol</span>
            <div className="block-head-right">
              <span className={`vital-tag ${cortisolStatus === 'ELEVATED' ? 'warning' : 'nominal'}`}>
                {cortisolStatus}
              </span>
            </div>
          </div>
          <div className="block-val-group">
            <strong className="block-num">{salivaryCortisol}</strong>
          </div>
          <span className="block-range">Nominal: 10.0 – 22.0 nmol/L</span>
          <p className="block-desc">Salivary neuroendocrine stress &amp; circadian rhythm alignment biomarker.</p>
          <span className="vital-tap-hint">
            <Info size={11} /> Tap card for Measurement SOP &amp; Rationale
          </span>
        </article>

        {/* Latent Viral Shedding Card */}
        <article
          className={`vital-block clickable ${viralStatus.includes('FLARE') ? 'warning' : 'good'}`}
          onClick={() => setActiveModalKey('viral')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setActiveModalKey('viral')}
          title="Click to view How to Measure, Why it Matters, and Clinical SOP"
        >
          <div className="block-head">
            <span className="block-title">Latent Viral Shedding (EBV/HSV)</span>
            <div className="block-head-right">
              <span className={`vital-tag ${viralStatus.includes('FLARE') ? 'warning' : 'nominal'}`}>
                {viralStatus.includes('FLARE') ? 'VIRAL FLARE' : 'NOMINAL'}
              </span>
            </div>
          </div>
          <div className="block-val-group">
            <strong className="block-num">{viralShedding}</strong>
          </div>
          <span className="block-range">Safe Threshold: &lt; 50 copies/mL</span>
          <p className="block-desc">Epstein-Barr and Varicella Zoster latent virus reactivation in spaceflight.</p>
          <span className="vital-tap-hint">
            <Info size={11} /> Tap card for Measurement SOP &amp; Rationale
          </span>
        </article>

        {/* T-Cell Ratio Card */}
        <article
          className={`vital-block clickable ${isStressOrRadiation ? 'warning' : 'good'}`}
          onClick={() => setActiveModalKey('tcell')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setActiveModalKey('tcell')}
          title="Click to view How to Measure, Why it Matters, and Clinical SOP"
        >
          <div className="block-head">
            <span className="block-title">T-Cell Ratio (CD4+/CD8+)</span>
            <span className="vital-tag nominal">SURVEILLANCE</span>
          </div>
          <div className="block-val-group">
            <strong className="block-num">{tCellRatio}</strong>
          </div>
          <span className="block-range">Standard: 1.5 – 2.2</span>
          <p className="block-desc">Secretory IgA: {secretoryIgA} · Immune surveillance active against pathogens.</p>
          <span className="vital-tap-hint">
            <Info size={11} /> Tap card for Measurement SOP &amp; Rationale
          </span>
        </article>
      </div>

      <details className="view-accordion">
        <summary>NASA Human Research Program &amp; GeneLab Immune Notes</summary>
        <div className="accordion-body">
          <p>
            <strong>Immune Alterations in Space:</strong> NASA HRP research demonstrates that prolonged exposure to microgravity and cosmic radiation impairs T-cell function and reactivates dormant childhood herpesviruses (EBV, CMV, VZV) shed into saliva.
          </p>
          <p>
            <strong>Measurement Protocol:</strong> Collect 1.5 mL passive-drool saliva using cryo-stabilized Salivette swab after waking and before meals.
          </p>
        </div>
      </details>

      <div className="vitals-footer-strip">
        <div className="strip-info">
          <ShieldCheck size={16} strokeWidth={2} />
          <span>
            <strong>Autonomous Medical Engine:</strong> Real-time biometrics streaming. Zero anomalies.
          </span>
        </div>
        <button type="button" className="jump-tab-btn" onClick={onJumpToTrends}>
          <span>View Live Trends &amp; Flight Phases</span>
          <ArrowRight size={14} strokeWidth={2} />
        </button>
      </div>

      {/* 5. AURA-MED COMPACT MEDICAL METRIC MODAL (Addressing content.md Lines 8-12) */}
      {activeModalData && (
        <div
          className="vital-modal-backdrop"
          onClick={() => setActiveModalKey(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-vital-title"
        >
          <div
            className="vital-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <header className="vital-modal-header">
              <div className="modal-title-group">
                <ShieldCheck size={18} className="text-accent" />
                <h3 id="modal-vital-title" className="modal-title">
                  {activeModalData.title}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveModalKey(null)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </header>

            {/* Reading Status Bar */}
            <div className="modal-reading-bar">
              <div className="modal-reading-val">
                <strong>{activeModalData.getValue()}</strong>
                <span className="modal-reading-unit">{activeModalData.unit}</span>
              </div>
              <span className="modal-reading-range">{activeModalData.range}</span>
            </div>

            {/* Modal Body: Why, How, What to do if abnormal */}
            <div className="vital-modal-body">
              {/* Section 1: Why it matters */}
              <div className="vital-modal-section">
                <div className="section-head">
                  <Info size={14} className="section-icon info" />
                  <span>Why It Matters (Spaceflight Physiology)</span>
                </div>
                <p className="section-text">{activeModalData.whyItMatters}</p>
              </div>

              {/* Section 2: How to measure */}
              <div className="vital-modal-section">
                <div className="section-head">
                  <Activity size={14} className="section-icon activity" />
                  <span>How to Measure (Operational SOP)</span>
                </div>
                <p className="section-text">{activeModalData.howToMeasure}</p>
              </div>

              {/* Section 3: What to do if abnormal + Redirect to Medical Advice */}
              <div
                className={`vital-modal-section abnormal-section ${
                  activeModalData.isAbnormal() ? 'flagged' : ''
                }`}
              >
                <div className="section-head">
                  <AlertTriangle size={14} className="section-icon alert" />
                  <span>What to Do if Reading is Abnormal</span>
                </div>
                <p className="section-text">{activeModalData.whatIfAbnormal}</p>

                {/* Direct CTA button redirecting to Medical Advice */}
                <button
                  type="button"
                  className="modal-redirect-btn"
                  onClick={() => {
                    setActiveModalKey(null)
                    onJumpToMedicalAdvice?.()
                  }}
                >
                  <ExternalLink size={14} />
                  <span>View Protocols in Medical Advice</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <footer className="vital-modal-footer">
              <button
                type="button"
                className="modal-reminder-btn"
                onClick={() => {
                  alert(`Scheduled: Reminder logged for next shift measurement (${activeModalData.title}).`)
                  setActiveModalKey(null)
                }}
              >
                <Clock size={13} />
                <span>Set Shift Reminder</span>
              </button>
              <button
                type="button"
                className="modal-dismiss-btn"
                onClick={() => setActiveModalKey(null)}
              >
                Close
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}

export default DailyVitalsView
