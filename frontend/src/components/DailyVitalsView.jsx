import React from 'react'
import { Activity, ShieldCheck, ArrowRight } from 'lucide-react'

export function DailyVitalsView({
  latest,
  isStreaming,
  setIsStreaming,
  activityMode,
  setActivityMode,
  onJumpToTrends,
}) {
  return (
    <div className="view-pane vitals-pane">
      {/* Dynamic Telemetry Stream Bar */}
      <div className="telemetry-live-control-strip">
        <div className="stream-status-group">
          <span className={`stream-live-indicator ${isStreaming ? 'live' : 'paused'}`}>
            <Activity size={14} strokeWidth={2} />
            <span>
              Oraimo Stream: <strong>{isStreaming ? 'LIVE (Dynamic 2s Stream)' : 'PAUSED'}</strong>
            </span>
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

      <div className="vitals-matrix-row">
        <article className={`vital-block ${latest.heartRate > 90 ? 'warning' : 'good'}`}>
          <div className="block-head">
            <span className="block-title">Heart Rate</span>
            <span className={`vital-tag ${latest.heartRate > 90 ? 'warning' : 'nominal'}`}>
              {latest.heartRate > 90 ? 'ELEVATED' : 'NOMINAL'}
            </span>
          </div>
          <div className="block-val-group">
            <strong className="block-num">{latest.heartRate}</strong>
            <span className="block-unit">beats / min</span>
          </div>
          <span className="block-range">Normal: 60 – 100 bpm</span>
          <p className="block-desc">Continuous optical pulse sensor. Blood gently shifts upward in microgravity.</p>
        </article>

        <article className="vital-block good">
          <div className="block-head">
            <span className="block-title">Blood Pressure</span>
            <span className="vital-tag nominal">NORMAL</span>
          </div>
          <div className="block-val-group">
            <strong className="block-num">{latest.bloodPressure}</strong>
            <span className="block-unit">mmHg</span>
          </div>
          <span className="block-range">Standard: 120 / 80</span>
          <p className="block-desc">Healthy circulatory pressure supplied to the cerebral cortex.</p>
        </article>

        <article className={`vital-block ${latest.bloodOxygen < 95 ? 'warning' : 'good'}`}>
          <div className="block-head">
            <span className="block-title">Blood Oxygen</span>
            <span className={`vital-tag ${latest.bloodOxygen < 95 ? 'warning' : 'nominal'}`}>
              {latest.bloodOxygen < 95 ? 'LOW' : 'NOMINAL'}
            </span>
          </div>
          <div className="block-val-group">
            <strong className="block-num">{latest.bloodOxygen}</strong>
            <span className="block-unit">% SpO2</span>
          </div>
          <span className="block-range">Safe: Above 95%</span>
          <p className="block-desc">Pulse oximeter reading from cabin air respiration.</p>
        </article>

        <article className="vital-block good">
          <div className="block-head">
            <span className="block-title">Body Temperature</span>
            <span className="vital-tag nominal">NORMAL</span>
          </div>
          <div className="block-val-group">
            <strong className="block-num">{Number(latest.bodyTemperature).toFixed(1)}°</strong>
            <span className="block-unit">Celsius</span>
          </div>
          <span className="block-range">Normal: 36.5° – 37.5°C</span>
          <p className="block-desc">Circadian thermoregulation steady. Microgravity core temp nominal.</p>
        </article>
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

        <article className="vital-block good">
          <div className="block-head">
            <span className="block-title">Daily Exercise Steps</span>
            <span className="vital-tag nominal">ACTIVE</span>
          </div>
          <div className="block-val-group">
            <strong className="block-num">{latest.physicalActivity.toLocaleString()}</strong>
            <span className="block-unit">steps</span>
          </div>
          <span className="block-range">Goal: 6,000+ steps</span>
          <p className="block-desc">Live accelerometer count accumulating across current flight shift.</p>
        </article>
      </div>

      <div className="vitals-footer-strip">
        <div className="strip-info">
          <ShieldCheck size={16} strokeWidth={2} />
          <span>
            <strong>Autonomous Medical Engine:</strong> Real-time biometrics streaming. Zero anomalies.
          </span>
        </div>
        <button type="button" className="jump-tab-btn" onClick={onJumpToTrends}>
          <span>View Live Trends</span>
          <ArrowRight size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

export default DailyVitalsView
