import { useState } from 'react'
import { TrendingUp, GitCompare, Compass, Info } from 'lucide-react'

export function HealthTrendsView({
  latest,
  timeframe,
  setTimeframe,
  heartPoints,
  oxygenPoints,
}) {
  const [selectedPhase, setSelectedPhase] = useState('inflight') // 'preflight' | 'inflight' | 'postflight'

  // NASA HRP Phase Benchmark Baselines
  const phaseBenchmarks = {
    preflight: {
      title: 'Pre-Flight Terrestrial Baseline (Johnson Space Center - 1.0G)',
      restingHr: '66 bpm',
      restingBp: '118/74 mmHg',
      spO2: '99% SpO2',
      sleepAvg: '7.8 hrs / night',
      circadianStability: '98% (Earth Circadian Normal)',
      note: 'Certified astronaut baseline established during 60-day quarantine and pre-launch medical evaluation.',
    },
    inflight: {
      title: 'Active In-Flight Telemetry (Deep-Space Mars Transit - 0.0G)',
      restingHr: `${latest.heartRate || 76} bpm (+8 bpm cephalic shift)`,
      restingBp: `${latest.bloodPressure || '124/80'} mmHg`,
      spO2: `${latest.bloodOxygen || 98}% SpO2`,
      sleepAvg: `${latest.sleepDuration || 7.2} hrs / night (-0.6h)`,
      circadianStability: '86% (45-min orbital photoperiod shift)',
      note: 'Microgravity cardiovascular deconditioning and thoracic blood volume expansion observed.',
    },
    postflight: {
      title: 'Post-Mission Orthostatic Target & Recovery (Re-entry Protocol)',
      restingHr: '72 – 82 bpm (Expected orthostatic elevation)',
      restingBp: '115/72 mmHg (Hypovolemia recovery)',
      spO2: '99% SpO2',
      sleepAvg: '8.0+ hrs (Target regenerative rest)',
      circadianStability: 'Recalibrating to 24h solar diurnal cycle',
      note: 'Immediate fluid loading (1.0 L saline + salt tablets) required prior to re-entering 1G gravitational field.',
    },
  }[selectedPhase]

  const heartCoords = heartPoints ? heartPoints.trim().split(' ').map((p) => p.split(',')) : []
  const heartLast = heartCoords.length ? heartCoords[heartCoords.length - 1] : ['320', '60']

  const oxygenCoords = oxygenPoints ? oxygenPoints.trim().split(' ').map((p) => p.split(',')) : []
  const oxygenLast = oxygenCoords.length ? oxygenCoords[oxygenCoords.length - 1] : ['320', '60']

  return (
    <div className="view-pane trends-pane">
      {/* Time Window Controls */}
      <div className="pane-control-bar">
        <span className="pane-intro">Streaming history dynamically updating:</span>
        <div className="timeframe-selector">
          {['daily', 'week', 'month'].map((range) => (
            <button
              key={range}
              type="button"
              className={`timeframe-chip ${timeframe === range ? 'active' : ''}`}
              onClick={() => setTimeframe(range)}
            >
              {range === 'daily'
                ? 'Past 24 Hours'
                : range === 'week'
                ? 'Past 7 Days'
                : 'Past 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* 1. MISSION FLIGHT PHASE COMPARISON (content.md Line 47) */}
      <div className="vitals-group-heading">
        <GitCompare size={14} strokeWidth={2} />
        <span>Flight Phase Baseline Comparison (NASA HRP Standard Measures)</span>
      </div>

      <div className="phase-benchmark-card">
        <div className="phase-selector-tabs">
          <button
            type="button"
            className={`phase-tab-btn ${selectedPhase === 'preflight' ? 'active' : ''}`}
            onClick={() => setSelectedPhase('preflight')}
          >
            <Compass size={13} />
            <span>Pre-Flight Baseline (Earth 1G)</span>
          </button>
          <button
            type="button"
            className={`phase-tab-btn ${selectedPhase === 'inflight' ? 'active' : ''}`}
            onClick={() => setSelectedPhase('inflight')}
          >
            <TrendingUp size={13} />
            <span>Active In-Flight (Zero-G)</span>
          </button>
          <button
            type="button"
            className={`phase-tab-btn ${selectedPhase === 'postflight' ? 'active' : ''}`}
            onClick={() => setSelectedPhase('postflight')}
          >
            <GitCompare size={13} />
            <span>Post-Mission Recovery</span>
          </button>
        </div>

        <div className="phase-benchmark-content">
          <div className="phase-benchmark-header">
            <h4>{phaseBenchmarks.title}</h4>
            <span className="phase-condition-tag">
              {selectedPhase === 'inflight' ? 'CURRENT FLIGHT STREAM' : 'REFERENCE BENCHMARK'}
            </span>
          </div>

          <div className="phase-metrics-grid">
            <div className="phase-stat-box">
              <span className="stat-box-lbl">Heart Rate</span>
              <strong>{phaseBenchmarks.restingHr}</strong>
            </div>
            <div className="phase-stat-box">
              <span className="stat-box-lbl">Blood Pressure</span>
              <strong>{phaseBenchmarks.restingBp}</strong>
            </div>
            <div className="phase-stat-box">
              <span className="stat-box-lbl">Blood Oxygen</span>
              <strong>{phaseBenchmarks.spO2}</strong>
            </div>
            <div className="phase-stat-box">
              <span className="stat-box-lbl">Sleep Rest Cycle</span>
              <strong>{phaseBenchmarks.sleepAvg}</strong>
            </div>
          </div>

          <div className="phase-note-line">
            <Info size={13} />
            <span>{phaseBenchmarks.note}</span>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC TELEMETRY CHARTS */}
      <div className="vitals-group-heading" style={{ marginTop: '16px' }}>
        <TrendingUp size={14} strokeWidth={2} />
        <span>Live Telemetry Polylines</span>
      </div>

      <div className="charts-full-grid">
        <div className="single-chart-card">
          <div className="chart-title-line">
            <div>
              <h3>Live Heart Rate Tracking</h3>
              <p>Dynamic polyline advancing with sensor stream</p>
            </div>
            <div className="chart-stat-badge">
              <span>Live Current:</span>
              <strong>{latest.heartRate} bpm</strong>
            </div>
          </div>
          <svg viewBox="0 0 320 120" preserveAspectRatio="none" className="graph-svg">
            <defs>
              <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Grid Reference Lines with Clinical Tick Values */}
            <line x1="0" y1="30" x2="320" y2="30" stroke="var(--border-subtle)" strokeDasharray="3 3" />
            <text x="6" y="26" fill="var(--text-tertiary)" fontSize="9" fontFamily="monospace">140 bpm</text>

            <line x1="0" y1="60" x2="320" y2="60" stroke="var(--border-subtle)" strokeDasharray="3 3" />
            <text x="6" y="56" fill="var(--text-tertiary)" fontSize="9" fontFamily="monospace">95 bpm</text>

            <line x1="0" y1="90" x2="320" y2="90" stroke="var(--border-subtle)" strokeDasharray="3 3" />
            <text x="6" y="86" fill="var(--text-tertiary)" fontSize="9" fontFamily="monospace">50 bpm</text>

            {/* Gradient Area Fill */}
            <polygon points={`0,120 ${heartPoints} 320,120`} fill="url(#hrGrad)" />

            {/* Live Telemetry Polyline */}
            <polyline points={heartPoints} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Live Leading Cursor */}
            <circle cx={heartLast[0]} cy={heartLast[1]} r="3.5" fill="var(--accent-color)" />
            <circle cx={heartLast[0]} cy={heartLast[1]} r="7" fill="var(--accent-color)" opacity="0.3">
              <animate attributeName="r" values="3.5;8;3.5" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0.05;0.4" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </svg>
          <div className="chart-labels-row">
            <span>Pre-Flight Baseline: 66 bpm</span>
            <span>Live Telemetry Stream</span>
          </div>
        </div>

        <div className="single-chart-card">
          <div className="chart-title-line">
            <div>
              <h3>Blood Oxygen Saturation</h3>
              <p>Live pulmonary exchange absorption</p>
            </div>
            <div className="chart-stat-badge green">
              <span>Live Current:</span>
              <strong>{latest.bloodOxygen}%</strong>
            </div>
          </div>
          <svg viewBox="0 0 320 120" preserveAspectRatio="none" className="graph-svg green">
            <defs>
              <linearGradient id="o2Grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--status-good-text)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--status-good-text)" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Grid Reference Lines with Clinical Tick Values */}
            <line x1="0" y1="30" x2="320" y2="30" stroke="var(--border-subtle)" strokeDasharray="3 3" />
            <text x="6" y="26" fill="var(--text-tertiary)" fontSize="9" fontFamily="monospace">100%</text>

            <line x1="0" y1="60" x2="320" y2="60" stroke="var(--border-subtle)" strokeDasharray="3 3" />
            <text x="6" y="56" fill="var(--text-tertiary)" fontSize="9" fontFamily="monospace">94%</text>

            <line x1="0" y1="90" x2="320" y2="90" stroke="var(--border-subtle)" strokeDasharray="3 3" />
            <text x="6" y="86" fill="var(--text-tertiary)" fontSize="9" fontFamily="monospace">88%</text>

            {/* Gradient Area Fill */}
            <polygon points={`0,120 ${oxygenPoints} 320,120`} fill="url(#o2Grad)" />

            {/* Live Telemetry Polyline */}
            <polyline points={oxygenPoints} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Live Leading Cursor */}
            <circle cx={oxygenLast[0]} cy={oxygenLast[1]} r="3.5" fill="var(--status-good-text)" />
            <circle cx={oxygenLast[0]} cy={oxygenLast[1]} r="7" fill="var(--status-good-text)" opacity="0.3">
              <animate attributeName="r" values="3.5;8;3.5" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0.05;0.4" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </svg>
          <div className="chart-labels-row">
            <span>Pre-Flight Baseline: 99%</span>
            <span>Live Telemetry Stream</span>
          </div>
        </div>
      </div>

      <details className="view-accordion">
        <summary>Trend Information &amp; Time Window Notes</summary>
        <div className="accordion-body">
          <p>
            <strong>Longitudinal Flight Shift Data:</strong> Telemetry streams are plotted against each astronaut’s pre-flight Earth baseline to monitor slow adaptation drift, bone demineralization, and cardiovascular reconditioning over extended spaceflight missions.
          </p>
        </div>
      </details>
    </div>
  )
}

export default HealthTrendsView
