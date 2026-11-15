import { useState } from 'react'
import {
  Activity,
  ArrowRight,
  Dna,
  Globe2,
  Info,
  ShieldCheck,
} from 'lucide-react'
import {
  Alert,
  Button,
  StatusChip,
  MeterBar,
  SegmentedControl,
  Accordion,
} from '../ui'

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
  const isStressOrRadiation =
    scenarioMode === 'stress' ||
    scenarioMode === 'radiation' ||
    scenarioMode === 'tachycardia'
  const salivaryCortisol = isStressOrRadiation ? '28.4 nmol/L' : '14.2 nmol/L'
  const cortisolStatus = isStressOrRadiation ? 'ELEVATED' : 'NOMINAL'
  const viralShedding = isStressOrRadiation ? '480 copies/mL' : '< 50 copies/mL'
  const viralStatus = isStressOrRadiation ? 'VIRAL FLARE DETECTED' : 'INACTIVE (NOMINAL)'
  const secretoryIgA = isStressOrRadiation ? '142 µg/mL' : '198 µg/mL'
  const tCellRatio = isStressOrRadiation ? '1.42 (Shifted)' : '1.85 (Balanced)'

  const systolicBp = latest.bloodPressure
    ? parseInt(String(latest.bloodPressure).split('/')[0], 10)
    : 120

  return (
    <div className="view-pane vitals-pane">
      {/* 1. SCHEDULED MEASUREMENT REMINDER PROMPT */}
      {upcomingReminder && (
        <Alert
          variant={upcomingReminder.taken ? 'good' : 'warning'}
          title={
            upcomingReminder.taken
              ? '✓ Measurement Protocol Completed:'
              : `Scheduled Task: ${upcomingReminder.title}`
          }
          action={
            !upcomingReminder.taken && (
              <Button variant="outline" size="sm" onClick={onCompleteReminder}>
                ✓ Mark Taken
              </Button>
            )
          }
          style={{ marginBottom: '1.25rem' }}
        >
          {upcomingReminder.taken
            ? 'Data logged into mission medical telemetry log.'
            : `Due: ${upcomingReminder.dueIn} · Protocol: ${upcomingReminder.protocol}`}
        </Alert>
      )}

      {/* Dynamic Telemetry Stream Bar & Environmental Context */}
      <div className="hd-vitals-control-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <StatusChip variant={isStreaming ? 'good' : 'neutral'}>
            Oraimo Stream: {isStreaming ? 'LIVE (Dynamic 2s Stream)' : 'PAUSED'}
          </StatusChip>
          <span className="environment-context-tag">
            <Globe2 size={13} strokeWidth={2} />
            <span>
              {envDetails.gravity} · {envDetails.pressure}
            </span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
            Exertion:
          </span>
          <SegmentedControl
            options={[
              { value: 'nominal', label: 'Rest' },
              { value: 'exercise', label: 'Treadmill' },
              { value: 'stress', label: 'Surge' },
            ]}
            value={activityMode}
            onChange={setActivityMode}
            ariaLabel="Exertion Mode Selector"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsStreaming((s) => !s)}
          >
            {isStreaming ? 'Pause' : 'Resume'}
          </Button>
        </div>
      </div>

      {/* 2. PRIMARY CIRCULATORY VITALS */}
      <div className="hd-section-heading">
        <Activity size={16} strokeWidth={2} />
        <span>Primary Circulatory Vitals</span>
      </div>

      <div className="hd-vitals-grid hd-stagger">
        {/* Heart Rate Card */}
        <article className="hd-vital-card">
          <div className="hd-vital-card__head">
            <span className="hd-vital-card__title">Heart Rate</span>
            <div className="hd-vital-card__head-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleEdu('hr')}
                title="View How & Why measurement guide"
                style={{ padding: '0.15rem 0.4rem', minHeight: '28px', fontSize: '0.75rem' }}
              >
                <Info size={12} />
                <span>Guide</span>
              </Button>
              <StatusChip variant={latest.heartRate > 90 ? 'warning' : 'good'}>
                {latest.heartRate > 90 ? 'ELEVATED' : 'NOMINAL'}
              </StatusChip>
            </div>
          </div>
          <div className="hd-vital-card__val-group">
            <strong className="hd-vital-card__num">{latest.heartRate}</strong>
            <span className="hd-vital-card__unit">beats / min</span>
          </div>
          <MeterBar
            value={latest.heartRate}
            min={40}
            max={150}
            variant={latest.heartRate > 90 ? 'warning' : 'good'}
            showValue={false}
          />
          <span className="hd-vital-card__range">Normal Range: 60 – 100 bpm</span>
          <p className="hd-vital-card__desc">
            Continuous optical pulse sensor. Blood gently shifts upward in microgravity.
          </p>

          {activeEduCard === 'hr' && (
            <div className="hd-vital-edu-drawer">
              <div>
                <strong>How to Measure:</strong> Wear watch optical sensor 1 finger-width above wrist bone. Keep arm stationary against chest for 30s.
              </div>
              <div>
                <strong>Why it Matters:</strong> Microgravity fluid shift increases thoracic blood volume, altering baroreceptor reflex and cardiac output.
              </div>
              <div>
                <strong>If Abnormal (&gt;100):</strong> Recline against cabin wall, drink 500 mL fluid with sodium electrolyte pouch.
              </div>
            </div>
          )}
        </article>

        {/* Blood Pressure Card */}
        <article className="hd-vital-card">
          <div className="hd-vital-card__head">
            <span className="hd-vital-card__title">Blood Pressure</span>
            <div className="hd-vital-card__head-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleEdu('bp')}
                title="View How & Why measurement guide"
                style={{ padding: '0.15rem 0.4rem', minHeight: '28px', fontSize: '0.75rem' }}
              >
                <Info size={12} />
                <span>Guide</span>
              </Button>
              <StatusChip variant={systolicBp > 135 ? 'warning' : 'good'}>
                {systolicBp > 135 ? 'ELEVATED' : 'NORMAL'}
              </StatusChip>
            </div>
          </div>
          <div className="hd-vital-card__val-group">
            <strong className="hd-vital-card__num">{latest.bloodPressure}</strong>
            <span className="hd-vital-card__unit">mmHg</span>
          </div>
          <MeterBar
            value={systolicBp}
            min={90}
            max={160}
            variant={systolicBp > 135 ? 'warning' : 'good'}
            showValue={false}
          />
          <span className="hd-vital-card__range">Standard Target: 120 / 80 mmHg</span>
          <p className="hd-vital-card__desc">
            Healthy circulatory pressure supplied to the cerebral cortex.
          </p>

          {activeEduCard === 'bp' && (
            <div className="hd-vital-edu-drawer">
              <div>
                <strong>How to Measure:</strong> Secure arm cuff at heart level. Inhale slowly and remain silent during oscillometric measurement.
              </div>
              <div>
                <strong>Why it Matters:</strong> Monitors arterial perfusion pressure to prevent cephalic hypertension or orthostatic blackout.
              </div>
              <div>
                <strong>If Abnormal (&gt;140/90):</strong> Verify cuff tightness, repeat measurement after 5 mins of calm breathing.
              </div>
            </div>
          )}
        </article>

        {/* Blood Oxygen Card */}
        <article className="hd-vital-card">
          <div className="hd-vital-card__head">
            <span className="hd-vital-card__title">Blood Oxygen</span>
            <div className="hd-vital-card__head-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleEdu('o2')}
                title="View How & Why measurement guide"
                style={{ padding: '0.15rem 0.4rem', minHeight: '28px', fontSize: '0.75rem' }}
              >
                <Info size={12} />
                <span>Guide</span>
              </Button>
              <StatusChip variant={latest.bloodOxygen < 95 ? 'warning' : 'good'}>
                {latest.bloodOxygen < 95 ? 'LOW' : 'NOMINAL'}
              </StatusChip>
            </div>
          </div>
          <div className="hd-vital-card__val-group">
            <strong className="hd-vital-card__num">{latest.bloodOxygen}</strong>
            <span className="hd-vital-card__unit">% SpO2</span>
          </div>
          <MeterBar
            value={latest.bloodOxygen}
            min={80}
            max={100}
            variant={latest.bloodOxygen < 95 ? 'warning' : 'good'}
            showValue={false}
          />
          <span className="hd-vital-card__range">Safe Threshold: Above 95%</span>
          <p className="hd-vital-card__desc">
            Pulse oximeter reading from cabin air respiration.
          </p>

          {activeEduCard === 'o2' && (
            <div className="hd-vital-edu-drawer">
              <div>
                <strong>How to Measure:</strong> Place index fingertip clean and dry into optical chamber. Await stable reading without movement.
              </div>
              <div>
                <strong>Why it Matters:</strong> Spacecraft closed atmosphere ventilation-perfusion matching; early indicator of CO2 scrubber exhaustion.
              </div>
              <div>
                <strong>If Abnormal (&lt;95%):</strong> Don emergency oxygen mask, verify cabin pO2 sensor, check LiOH scrubber canister.
              </div>
            </div>
          )}
        </article>

        {/* Body Temperature Card */}
        <article className="hd-vital-card">
          <div className="hd-vital-card__head">
            <span className="hd-vital-card__title">Body Temperature</span>
            <div className="hd-vital-card__head-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleEdu('temp')}
                title="View How & Why measurement guide"
                style={{ padding: '0.15rem 0.4rem', minHeight: '28px', fontSize: '0.75rem' }}
              >
                <Info size={12} />
                <span>Guide</span>
              </Button>
              <StatusChip
                variant={
                  latest.bodyTemperature > 37.5 || latest.bodyTemperature < 36.0
                    ? 'warning'
                    : 'good'
                }
              >
                NORMAL
              </StatusChip>
            </div>
          </div>
          <div className="hd-vital-card__val-group">
            <strong className="hd-vital-card__num">
              {Number(latest.bodyTemperature).toFixed(1)}°
            </strong>
            <span className="hd-vital-card__unit">Celsius</span>
          </div>
          <MeterBar
            value={latest.bodyTemperature}
            min={35.0}
            max={39.0}
            variant={
              latest.bodyTemperature > 37.5 || latest.bodyTemperature < 36.0
                ? 'warning'
                : 'good'
            }
            showValue={false}
          />
          <span className="hd-vital-card__range">Normal Baseline: 36.5° – 37.5°C</span>
          <p className="hd-vital-card__desc">
            Circadian thermoregulation steady. Microgravity core temp nominal.
          </p>

          {activeEduCard === 'temp' && (
            <div className="hd-vital-edu-drawer">
              <div>
                <strong>How to Measure:</strong> Tympanic infrared ear probe or continuous double-sensor forehead heat-flux wearable.
              </div>
              <div>
                <strong>Why it Matters:</strong> Zero-G eliminates natural air convection cooling; astronauts experience higher baseline core temp ("Space Fever").
              </div>
              <div>
                <strong>If Abnormal (&gt;38.0°C):</strong> Initiate active cooling garment, hydrate with chilled electrolyte pouches.
              </div>
            </div>
          )}
        </article>
      </div>

      {/* 3. RESPIRATION & DAILY ACTIVITY */}
      <div className="hd-section-heading">
        <ShieldCheck size={16} strokeWidth={2} />
        <span>Respiration &amp; Daily Activity</span>
      </div>

      <div className="hd-vitals-grid hd-stagger">
        <article className="hd-vital-card">
          <div className="hd-vital-card__head">
            <span className="hd-vital-card__title">Breathing Rate</span>
            <StatusChip variant="good">STEADY</StatusChip>
          </div>
          <div className="hd-vital-card__val-group">
            <strong className="hd-vital-card__num">{latest.respiratoryRate}</strong>
            <span className="hd-vital-card__unit">breaths / min</span>
          </div>
          <MeterBar
            value={latest.respiratoryRate}
            min={8}
            max={28}
            variant={latest.respiratoryRate > 22 ? 'warning' : 'good'}
            showValue={false}
          />
          <span className="hd-vital-card__range">Normal Target: 12 – 20 breaths</span>
          <p className="hd-vital-card__desc">
            Thoracic bio-impedance respiration sensor on smart strap.
          </p>
        </article>

        <article className="hd-vital-card">
          <div className="hd-vital-card__head">
            <span className="hd-vital-card__title">Sleep Last Night</span>
            <StatusChip variant={latest.sleepDuration < 6 ? 'warning' : 'good'}>
              {latest.sleepDuration < 6 ? 'LOW' : 'SUFFICIENT'}
            </StatusChip>
          </div>
          <div className="hd-vital-card__val-group">
            <strong className="hd-vital-card__num">
              {Number(latest.sleepDuration).toFixed(1)}
            </strong>
            <span className="hd-vital-card__unit">hours</span>
          </div>
          <MeterBar
            value={latest.sleepDuration}
            min={0}
            max={10}
            variant={latest.sleepDuration < 6 ? 'warning' : 'good'}
            showValue={false}
          />
          <span className="hd-vital-card__range">Mission Goal: 7 – 8 hours</span>
          <p className="hd-vital-card__desc">
            Sleep cycle recorded. REM and deep rest architecture complete.
          </p>
        </article>

        <article className="hd-vital-card">
          <div className="hd-vital-card__head">
            <span className="hd-vital-card__title">Daily Exercise Steps</span>
            <div className="hd-vital-card__head-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleEdu('steps')}
                title="View How & Why measurement guide"
                style={{ padding: '0.15rem 0.4rem', minHeight: '28px', fontSize: '0.75rem' }}
              >
                <Info size={12} />
                <span>Guide</span>
              </Button>
              <StatusChip
                variant={(latest?.physicalActivity ?? 6000) < 3000 ? 'warning' : 'good'}
              >
                {(latest?.physicalActivity ?? 6000) < 3000 ? 'UNDER TARGET' : 'ACTIVE'}
              </StatusChip>
            </div>
          </div>
          <div className="hd-vital-card__val-group">
            <strong className="hd-vital-card__num">
              {(latest?.physicalActivity ?? 6000).toLocaleString()}
            </strong>
            <span className="hd-vital-card__unit">steps</span>
          </div>
          <MeterBar
            value={latest?.physicalActivity ?? 6000}
            min={0}
            max={10000}
            variant={(latest?.physicalActivity ?? 6000) < 3000 ? 'warning' : 'good'}
            showValue={false}
          />
          <span className="hd-vital-card__range">Goal: 6,000+ steps</span>
          <p className="hd-vital-card__desc">
            Live Oraimo wrist accelerometer count &amp; T2 treadmill loading strides.
          </p>

          {activeEduCard === 'steps' && (
            <div className="hd-vital-edu-drawer">
              <div>
                <strong>How to Measure:</strong> Wrist optical accelerometer (Oraimo) or T2 treadmill bungee harness stride sensor.
              </div>
              <div>
                <strong>Why it Matters (NASA HRP Hazard):</strong> Microgravity eliminates mechanical ground impact. Without daily steps, astronauts lose 1.0–1.5% bone mineral density per month (osteopenia), triggering calcium leakage, kidney stones, and muscle atrophy.
              </div>
              <div>
                <strong>If Abnormal (&lt;3,000 steps):</strong> Microgravity musculoskeletal deconditioning risk. Complete mandatory 45-min bungee-loaded resistance/treadmill protocol.
              </div>
            </div>
          )}
        </article>

        {/* Nutrition & Fluid Balance Card */}
        <article className="hd-vital-card">
          <div className="hd-vital-card__head">
            <span className="hd-vital-card__title">Nutrition &amp; Hydration</span>
            <div className="hd-vital-card__head-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleEdu('nutrition')}
                title="View How & Why measurement guide"
                style={{ padding: '0.15rem 0.4rem', minHeight: '28px', fontSize: '0.75rem' }}
              >
                <Info size={12} />
                <span>Guide</span>
              </Button>
              <StatusChip variant="good">BALANCED</StatusChip>
            </div>
          </div>
          <div className="hd-vital-card__val-group">
            <strong className="hd-vital-card__num">2,840</strong>
            <span className="hd-vital-card__unit">kcal · 2.4 L</span>
          </div>
          <MeterBar value={2840} min={1500} max={3500} variant="good" showValue={false} />
          <span className="hd-vital-card__range">Goal: 2,700–3,000 kcal</span>
          <p className="hd-vital-card__desc">
            Galley RFID nutritional tracking. Low-sodium electrolyte pouch balance nominal.
          </p>

          {activeEduCard === 'nutrition' && (
            <div className="hd-vital-edu-drawer">
              <div>
                <strong>How to Measure:</strong> Galley barcode scanner on freeze-dried meal packs and RFID metered water dispenser port.
              </div>
              <div>
                <strong>Why it Matters (NASA Standard Measure):</strong> Microgravity increases bone calcium resorption. Controlled sodium (&lt;2,300 mg) prevents intracranial fluid pressure (SANS vision damage), while adequate potassium protects heart rhythms.
              </div>
              <div>
                <strong>If Abnormal (&lt;2,200 kcal or &lt;1.8 L):</strong> Fluid deficit warning. Drink 1 chilled electrolyte hydration pouch immediately to preserve circulating plasma volume.
              </div>
            </div>
          )}
        </article>
      </div>

      {/* 4. SALIVARY IMMUNE BIOMARKERS */}
      <div className="hd-section-heading">
        <Dna size={16} strokeWidth={2} />
        <span>Salivary Immune Biomarkers &amp; Viral Surveillance (NASA GeneLab OSDR-379)</span>
      </div>

      <div className="hd-vitals-grid hd-stagger">
        <article className="hd-vital-card">
          <div className="hd-vital-card__head">
            <span className="hd-vital-card__title">Salivary Cortisol</span>
            <div className="hd-vital-card__head-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleEdu('cortisol')}
                title="View How & Why measurement guide"
                style={{ padding: '0.15rem 0.4rem', minHeight: '28px', fontSize: '0.75rem' }}
              >
                <Info size={12} />
                <span>Guide</span>
              </Button>
              <StatusChip variant={cortisolStatus === 'ELEVATED' ? 'warning' : 'good'}>
                {cortisolStatus}
              </StatusChip>
            </div>
          </div>
          <div className="hd-vital-card__val-group">
            <strong className="hd-vital-card__num">{salivaryCortisol}</strong>
          </div>
          <MeterBar
            value={parseFloat(salivaryCortisol)}
            min={5}
            max={35}
            variant={cortisolStatus === 'ELEVATED' ? 'warning' : 'good'}
            showValue={false}
          />
          <span className="hd-vital-card__range">Nominal Baseline: 10.0 – 22.0 nmol/L</span>
          <p className="hd-vital-card__desc">
            Salivary neuroendocrine stress &amp; circadian rhythm alignment biomarker.
          </p>

          {activeEduCard === 'cortisol' && (
            <div className="hd-vital-edu-drawer">
              <div>
                <strong>How to Measure:</strong> Passive drool for 2 minutes into cryo-vial immediately upon waking before meals.
              </div>
              <div>
                <strong>Why it Matters (NASA HRP Stress):</strong> High cortisol (&gt;22 nmol/L) suppresses T-cell immune activation and accelerates muscle protein breakdown.
              </div>
              <div>
                <strong>If Abnormal (&gt;25 nmol/L):</strong> High neuroendocrine strain. Schedule 30-min relaxation in sleep berth, dim cabin lighting, adjust shift duties.
              </div>
            </div>
          )}
        </article>

        <article className="hd-vital-card">
          <div className="hd-vital-card__head">
            <span className="hd-vital-card__title">Latent Viral Shedding</span>
            <div className="hd-vital-card__head-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleEdu('viral')}
                title="View How & Why measurement guide"
                style={{ padding: '0.15rem 0.4rem', minHeight: '28px', fontSize: '0.75rem' }}
              >
                <Info size={12} />
                <span>Guide</span>
              </Button>
              <StatusChip variant={viralStatus.includes('FLARE') ? 'warning' : 'good'}>
                {viralStatus.includes('FLARE') ? 'VIRAL FLARE' : 'NOMINAL'}
              </StatusChip>
            </div>
          </div>
          <div className="hd-vital-card__val-group">
            <strong className="hd-vital-card__num">{viralShedding}</strong>
          </div>
          <MeterBar
            value={viralStatus.includes('FLARE') ? 480 : 30}
            min={0}
            max={500}
            variant={viralStatus.includes('FLARE') ? 'warning' : 'good'}
            showValue={false}
          />
          <span className="hd-vital-card__range">Safe Threshold: &lt; 50 copies/mL</span>
          <p className="hd-vital-card__desc">
            Epstein-Barr and Varicella Zoster latent virus reactivation in spaceflight.
          </p>

          {activeEduCard === 'viral' && (
            <div className="hd-vital-edu-drawer">
              <div>
                <strong>How to Measure:</strong> Handheld miniPCR cartridge analyzer reads viral DNA copy count from saliva swab.
              </div>
              <div>
                <strong>Why it Matters (NASA OSDR-379):</strong> Dormant childhood herpesviruses re-awaken when deep-space radiation and zero-G suppress T-cell surveillance.
              </div>
              <div>
                <strong>If Abnormal (&gt;50 copies/mL):</strong> Viral flare detected. Administer oral Valacyclovir (500mg 2x daily from Bulkhead Med Locker 3), enforce sleep rest.
              </div>
            </div>
          )}
        </article>

        <article className="hd-vital-card">
          <div className="hd-vital-card__head">
            <span className="hd-vital-card__title">T-Cell Ratio (CD4+/CD8+)</span>
            <StatusChip variant="good">SURVEILLANCE</StatusChip>
          </div>
          <div className="hd-vital-card__val-group">
            <strong className="hd-vital-card__num">{tCellRatio}</strong>
          </div>
          <MeterBar value={parseFloat(tCellRatio)} min={1.0} max={2.5} variant="good" showValue={false} />
          <span className="hd-vital-card__range">Standard Normal: 1.5 – 2.2</span>
          <p className="hd-vital-card__desc">
            Secretory IgA: {secretoryIgA} · Immune surveillance active against pathogens.
          </p>
        </article>
      </div>

      <Accordion
        title="NASA Human Research Program & GeneLab Immune Notes"
        defaultOpen={false}
      >
        <p>
          <strong>Immune Alterations in Space:</strong> NASA HRP research demonstrates that prolonged exposure to microgravity and cosmic radiation impairs T-cell function and reactivates dormant childhood herpesviruses (EBV, CMV, VZV) shed into saliva.
        </p>
        <p>
          <strong>Measurement Protocol:</strong> Collect 1.5 mL passive-drool saliva using cryo-stabilized Salivette swab after waking and before meals.
        </p>
      </Accordion>

      <div className="hd-vitals-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <ShieldCheck size={18} strokeWidth={2} style={{ color: 'var(--hd-green)' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <strong>Autonomous Medical Engine:</strong> Real-time biometrics streaming. Zero anomalies.
          </span>
        </div>
        <Button variant="primary" onClick={onJumpToTrends}>
          <span>View Live Trends &amp; Flight Phases</span>
          <ArrowRight size={14} strokeWidth={2} />
        </Button>
      </div>
    </div>
  )
}

export default DailyVitalsView
