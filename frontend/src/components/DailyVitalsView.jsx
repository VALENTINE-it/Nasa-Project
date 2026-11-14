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
  upcomingReminder,
  onCompleteReminder,
}) {
  const [activeEduCard, setActiveEduCard] = useState(null)

  const toggleEdu = (id) => {
    setActiveEduCard((prev) => (prev === id ? null : id))
  }

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
        <article className={`vital-block ${latest.heartRate > 90 ? 'warning' : 'good'}`}>
          <div className="block-head">
            <span className="block-title">Heart Rate</span>
            <div className="block-head-right">
              <button
                type="button"
                className="vital-edu-info-btn"
                onClick={() => toggleEdu('hr')}
                title="View How & Why measurement guide"
              >
                <Info size={12} />
                <span>Guide</span>
              </button>
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

          {/* Educational How/Why Guide (content.md lines 8-11) */}
          {activeEduCard === 'hr' && (
            <div className="vital-edu-drawer">
              <div><strong>How to Measure:</strong> Wear watch optical sensor 1 finger-width above wrist bone. Keep arm stationary against chest for 30s.</div>
              <div><strong>Why it Matters:</strong> Microgravity fluid shift increases thoracic blood volume, altering baroreceptor reflex and cardiac output.</div>
              <div><strong>If Abnormal (&gt;100):</strong> Recline against cabin wall, drink 500 mL fluid with sodium electrolyte pouch.</div>
            </div>
          )}
        </article>

        {/* Blood Pressure Card */}
        <article className="vital-block good">
          <div className="block-head">
            <span className="block-title">Blood Pressure</span>
            <div className="block-head-right">
              <button
                type="button"
                className="vital-edu-info-btn"
                onClick={() => toggleEdu('bp')}
                title="View How & Why measurement guide"
              >
                <Info size={12} />
                <span>Guide</span>
              </button>
              <span className="vital-tag nominal">NORMAL</span>
            </div>
          </div>
          <div className="block-val-group">
            <strong className="block-num">{latest.bloodPressure}</strong>
            <span className="block-unit">mmHg</span>
          </div>
          <span className="block-range">Standard: 120 / 80</span>
          <p className="block-desc">Healthy circulatory pressure supplied to the cerebral cortex.</p>

          {activeEduCard === 'bp' && (
            <div className="vital-edu-drawer">
              <div><strong>How to Measure:</strong> Secure arm cuff at heart level. Inhale slowly and remain silent during oscillometric measurement.</div>
              <div><strong>Why it Matters:</strong> Monitors arterial perfusion pressure to prevent cephalic hypertension or orthostatic blackout.</div>
              <div><strong>If Abnormal (&gt;140/90):</strong> Verify cuff tightness, repeat measurement after 5 mins of calm breathing.</div>
            </div>
          )}
        </article>

        {/* Blood Oxygen Card */}
        <article className={`vital-block ${latest.bloodOxygen < 95 ? 'warning' : 'good'}`}>
          <div className="block-head">
            <span className="block-title">Blood Oxygen</span>
            <div className="block-head-right">
              <button
                type="button"
                className="vital-edu-info-btn"
                onClick={() => toggleEdu('o2')}
                title="View How & Why measurement guide"
              >
                <Info size={12} />
                <span>Guide</span>
              </button>
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

          {activeEduCard === 'o2' && (
            <div className="vital-edu-drawer">
              <div><strong>How to Measure:</strong> Place index fingertip clean and dry into optical chamber. Await stable reading without movement.</div>
              <div><strong>Why it Matters:</strong> Spacecraft closed atmosphere ventilation-perfusion matching; early indicator of CO2 scrubber exhaustion.</div>
              <div><strong>If Abnormal (&lt;95%):</strong> Don emergency oxygen mask, verify cabin pO2 sensor, check LiOH scrubber canister.</div>
            </div>
          )}
        </article>

        {/* Body Temperature Card */}
        <article className="vital-block good">
          <div className="block-head">
            <span className="block-title">Body Temperature</span>
            <div className="block-head-right">
              <button
                type="button"
                className="vital-edu-info-btn"
                onClick={() => toggleEdu('temp')}
                title="View How & Why measurement guide"
              >
                <Info size={12} />
                <span>Guide</span>
              </button>
              <span className="vital-tag nominal">NORMAL</span>
            </div>
          </div>
          <div className="block-val-group">
            <strong className="block-num">{Number(latest.bodyTemperature).toFixed(1)}°</strong>
            <span className="block-unit">Celsius</span>
          </div>
          <span className="block-range">Normal: 36.5° – 37.5°C</span>
          <p className="block-desc">Circadian thermoregulation steady. Microgravity core temp nominal.</p>

          {activeEduCard === 'temp' && (
            <div className="vital-edu-drawer">
              <div><strong>How to Measure:</strong> Tympanic infrared ear probe or continuous double-sensor forehead heat-flux wearable.</div>
              <div><strong>Why it Matters:</strong> Zero-G eliminates natural air convection cooling; astronauts experience higher baseline core temp ("Space Fever").</div>
              <div><strong>If Abnormal (&gt;38.0°C):</strong> Initiate active cooling garment, hydrate with chilled electrolyte pouches.</div>
            </div>
          )}
        </article>
      </div>

      {/* 3. RESPIRATION & DAILY ACTIVITY */}
      <div className="vitals-group-heading">
        <ShieldCheck size={14} strokeWidth={2} />
        <span>Respiration &amp; Daily Activity</span>
      </div>

      <div className="vitals-matrix-row secondary-row">
        <article className="vital-block good">
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
        </article>

        <article className={`vital-block ${latest.sleepDuration < 6 ? 'warning' : 'good'}`}>
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
        </article>

        <article className={`vital-block ${(latest?.physicalActivity ?? 6000) < 3000 ? 'warning' : 'good'}`}>
          <div className="block-head">
            <span className="block-title">Daily Exercise Steps</span>
            <div className="block-head-right">
              <button
                type="button"
                className="vital-edu-info-btn"
                onClick={() => toggleEdu('steps')}
                title="View How & Why measurement guide"
              >
                <Info size={12} />
                <span>Guide</span>
              </button>
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

          {activeEduCard === 'steps' && (
            <div className="vital-edu-drawer">
              <div><strong>How to Measure:</strong> Wrist optical accelerometer (Oraimo) or T2 treadmill bungee harness stride sensor.</div>
              <div><strong>Why it Matters (NASA HRP Hazard):</strong> Microgravity eliminates mechanical ground impact. Without daily steps, astronauts lose 1.0–1.5% bone mineral density per month (osteopenia), triggering calcium leakage, kidney stones, and muscle atrophy.</div>
              <div><strong>If Abnormal (&lt;3,000 steps):</strong> Microgravity musculoskeletal deconditioning risk. Complete mandatory 45-min bungee-loaded resistance/treadmill protocol.</div>
            </div>
          )}
        </article>

        {/* Nutrition & Fluid Balance (NASA Artemis Standard Measure) */}
        <article className="vital-block good">
          <div className="block-head">
            <span className="block-title">Nutrition &amp; Hydration</span>
            <div className="block-head-right">
              <button
                type="button"
                className="vital-edu-info-btn"
                onClick={() => toggleEdu('nutrition')}
                title="View How & Why measurement guide"
              >
                <Info size={12} />
                <span>Guide</span>
              </button>
              <span className="vital-tag nominal">BALANCED</span>
            </div>
          </div>
          <div className="block-val-group">
            <strong className="block-num">2,840</strong>
            <span className="block-unit">kcal · 2.4 L</span>
          </div>
          <span className="block-range">Goal: 2,700–3,000 kcal</span>
          <p className="block-desc">Galley RFID nutritional tracking. Low-sodium electrolyte pouch balance nominal.</p>

          {activeEduCard === 'nutrition' && (
            <div className="vital-edu-drawer">
              <div><strong>How to Measure:</strong> Galley barcode scanner on freeze-dried meal packs and RFID metered water dispenser port.</div>
              <div><strong>Why it Matters (NASA Standard Measure):</strong> Microgravity increases bone calcium resorption. Controlled sodium (&lt;2,300 mg) prevents intracranial fluid pressure (SANS vision damage), while adequate potassium protects heart rhythms.</div>
              <div><strong>If Abnormal (&lt;2,200 kcal or &lt;1.8 L):</strong> Fluid deficit warning. Drink 1 chilled electrolyte hydration pouch immediately to preserve circulating plasma volume.</div>
            </div>
          )}
        </article>
      </div>

      {/* 4. SALIVARY IMMUNE BIOMARKERS & LATENT VIRAL SURVEILLANCE (content.md Lines 33-36 & NASA OSDR-379) */}
      <div className="vitals-group-heading">
        <Dna size={14} strokeWidth={2} />
        <span>Salivary Immune Biomarkers &amp; Viral Surveillance (NASA GeneLab OSDR-379)</span>
      </div>

      <div className="vitals-matrix-row secondary-row">
        <article className={`vital-block ${cortisolStatus === 'ELEVATED' ? 'warning' : 'good'}`}>
          <div className="block-head">
            <span className="block-title">Salivary Cortisol</span>
            <div className="block-head-right">
              <button
                type="button"
                className="vital-edu-info-btn"
                onClick={() => toggleEdu('cortisol')}
                title="View How & Why measurement guide"
              >
                <Info size={12} />
                <span>Guide</span>
              </button>
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

          {activeEduCard === 'cortisol' && (
            <div className="vital-edu-drawer">
              <div><strong>How to Measure:</strong> Passive drool for 2 minutes into cryo-vial immediately upon waking before meals.</div>
              <div><strong>Why it Matters (NASA HRP Stress):</strong> High cortisol (&gt;22 nmol/L) suppresses T-cell immune activation and accelerates muscle protein breakdown.</div>
              <div><strong>If Abnormal (&gt;25 nmol/L):</strong> High neuroendocrine strain. Schedule 30-min relaxation in sleep berth, dim cabin lighting, adjust shift duties.</div>
            </div>
          )}
        </article>

        <article className={`vital-block ${viralStatus.includes('FLARE') ? 'warning' : 'good'}`}>
          <div className="block-head">
            <span className="block-title">Latent Viral Shedding (EBV/HSV)</span>
            <div className="block-head-right">
              <button
                type="button"
                className="vital-edu-info-btn"
                onClick={() => toggleEdu('viral')}
                title="View How & Why measurement guide"
              >
                <Info size={12} />
                <span>Guide</span>
              </button>
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

          {activeEduCard === 'viral' && (
            <div className="vital-edu-drawer">
              <div><strong>How to Measure:</strong> Handheld miniPCR cartridge analyzer reads viral DNA copy count from saliva swab.</div>
              <div><strong>Why it Matters (NASA OSDR-379):</strong> Dormant childhood herpesviruses re-awaken when deep-space radiation and zero-G suppress T-cell surveillance.</div>
              <div><strong>If Abnormal (&gt;50 copies/mL):</strong> Viral flare detected. Administer oral Valacyclovir (500mg 2x daily from Bulkhead Med Locker 3), enforce sleep rest.</div>
            </div>
          )}
        </article>

        <article className="vital-block good">
          <div className="block-head">
            <span className="block-title">T-Cell Ratio (CD4+/CD8+)</span>
            <span className="vital-tag nominal">SURVEILLANCE</span>
          </div>
          <div className="block-val-group">
            <strong className="block-num">{tCellRatio}</strong>
          </div>
          <span className="block-range">Standard: 1.5 – 2.2</span>
          <p className="block-desc">Secretory IgA: {secretoryIgA} · Immune surveillance active against pathogens.</p>
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
    </div>
  )
}

export default DailyVitalsView
