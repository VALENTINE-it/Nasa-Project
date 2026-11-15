import { useState } from 'react'
import { TrendingUp, GitCompare, Compass, Info, Activity } from 'lucide-react'
import { SegmentedControl, StatusChip, Accordion } from '../ui'

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
      restingHr: `${latest?.heartRate || 76} bpm (+8 bpm cephalic shift)`,
      restingBp: `${latest?.bloodPressure || '124/80'} mmHg`,
      spO2: `${latest?.bloodOxygen || 98}% SpO2`,
      sleepAvg: `${latest?.sleepDuration || 7.2} hrs / night (-0.6h)`,
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

  const timeframeOptions = [
    { value: 'daily', label: 'Past 24 Hours' },
    { value: 'week', label: 'Past 7 Days' },
    { value: 'month', label: 'Past 30 Days' },
  ]

  return (
    <div className="view-pane trends-pane hd-trends-container">
      {/* Time Window Controls */}
      <div className="hd-trends-control-bar">
        <span className="hd-trends-intro">Streaming history dynamically updating:</span>
        <div className="timeframe-selector">
          <SegmentedControl
            options={timeframeOptions}
            value={timeframe}
            onChange={setTimeframe}
            ariaLabel="Streaming history timeframe"
          />
        </div>
      </div>

      {/* 1. MISSION FLIGHT PHASE COMPARISON */}
      <div className="hd-trends-section-title">
        <GitCompare size={15} strokeWidth={2} />
        <span>Flight Phase Baseline Comparison (NASA HRP Standard Measures)</span>
      </div>

      <div className="hd-trends-benchmark-card">
        <div className="hd-trends-phase-tabs" role="tablist" aria-label="Flight Phase Baseline">
          <button
            type="button"
            role="tab"
            aria-selected={selectedPhase === 'preflight'}
            className={`hd-trends-phase-tab ${selectedPhase === 'preflight' ? 'hd-trends-phase-tab--active' : ''}`}
            onClick={() => setSelectedPhase('preflight')}
          >
            <Compass size={14} />
            <span>Pre-Flight Baseline (Earth 1G)</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedPhase === 'inflight'}
            className={`hd-trends-phase-tab ${selectedPhase === 'inflight' ? 'hd-trends-phase-tab--active' : ''}`}
            onClick={() => setSelectedPhase('inflight')}
          >
            <TrendingUp size={14} />
            <span>Active In-Flight (Zero-G)</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedPhase === 'postflight'}
            className={`hd-trends-phase-tab ${selectedPhase === 'postflight' ? 'hd-trends-phase-tab--active' : ''}`}
            onClick={() => setSelectedPhase('postflight')}
          >
            <GitCompare size={14} />
            <span>Post-Mission Recovery</span>
          </button>
        </div>

        <div className="hd-trends-benchmark-content">
          <div className="hd-trends-benchmark-header">
            <h4>{phaseBenchmarks.title}</h4>
            <StatusChip
              variant={selectedPhase === 'inflight' ? 'accent' : 'neutral'}
              dot={selectedPhase === 'inflight'}
            >
              {selectedPhase === 'inflight' ? 'CURRENT FLIGHT STREAM' : 'REFERENCE BENCHMARK'}
            </StatusChip>
          </div>

          <div className="hd-trends-stat-grid">
            <div className="hd-trends-stat-box">
              <span className="hd-trends-stat-lbl">Heart Rate</span>
              <strong className="hd-trends-stat-val">{phaseBenchmarks.restingHr}</strong>
            </div>
            <div className="hd-trends-stat-box">
              <span className="hd-trends-stat-lbl">Blood Pressure</span>
              <strong className="hd-trends-stat-val">{phaseBenchmarks.restingBp}</strong>
            </div>
            <div className="hd-trends-stat-box">
              <span className="hd-trends-stat-lbl">Blood Oxygen</span>
              <strong className="hd-trends-stat-val">{phaseBenchmarks.spO2}</strong>
            </div>
            <div className="hd-trends-stat-box">
              <span className="hd-trends-stat-lbl">Sleep Rest Cycle</span>
              <strong className="hd-trends-stat-val">{phaseBenchmarks.sleepAvg}</strong>
            </div>
          </div>

          <div className="hd-trends-note-row">
            <Info size={14} />
            <span>{phaseBenchmarks.note}</span>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC TELEMETRY CHARTS */}
      <div className="hd-trends-section-title">
        <TrendingUp size={15} strokeWidth={2} />
        <span>Live Telemetry Polylines</span>
      </div>

      <div className="hd-trends-charts-grid">
        <div className="hd-trends-chart-card">
          <div className="hd-trends-chart-header">
            <div>
              <h3 className="hd-trends-chart-title">Live Heart Rate Tracking</h3>
              <p className="hd-trends-chart-subtitle">Dynamic polyline advancing with sensor stream</p>
            </div>
            <div className="hd-trends-chart-badge">
              <span>Live Current:</span>
              <strong>{latest?.heartRate} bpm</strong>
            </div>
          </div>
          <svg viewBox="0 0 320 120" preserveAspectRatio="none" className="hd-trends-chart-svg">
            <defs>
              <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Grid Reference Lines with Clinical Tick Values */}
            <line x1="0" y1="30" x2="320" y2="30" stroke="var(--border-subtle)" strokeDasharray="3 3" />
            <text x="6" y="26" fill="var(--text-tertiary)" fontSize="9" fontFamily="var(--font-mono)">140 bpm</text>

            <line x1="0" y1="60" x2="320" y2="60" stroke="var(--border-subtle)" strokeDasharray="3 3" />
            <text x="6" y="56" fill="var(--text-tertiary)" fontSize="9" fontFamily="var(--font-mono)">95 bpm</text>

            <line x1="0" y1="90" x2="320" y2="90" stroke="var(--border-subtle)" strokeDasharray="3 3" />
            <text x="6" y="86" fill="var(--text-tertiary)" fontSize="9" fontFamily="var(--font-mono)">50 bpm</text>

            {/* Gradient Area Fill */}
            <polygon points={`0,120 ${heartPoints || ''} 320,120`} fill="url(#hrGrad)" />

            {/* Live Telemetry Polyline */}
            <polyline
              points={heartPoints || ''}
              fill="none"
              stroke="var(--accent-color)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Live Leading Cursor */}
            <circle cx={heartLast[0]} cy={heartLast[1]} r="3.5" fill="var(--accent-color)" />
            <circle cx={heartLast[0]} cy={heartLast[1]} r="7" fill="var(--accent-color)" opacity="0.3">
              <animate attributeName="r" values="3.5;8;3.5" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0.05;0.4" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </svg>
          <div className="hd-trends-chart-footer">
            <span>Pre-Flight Baseline: 66 bpm</span>
            <span className="hd-trends-stream-badge">
              <span className="hd-trends-stream-dot" aria-hidden="true" />
              Live Telemetry Stream
            </span>
          </div>
        </div>

        <div className="hd-trends-chart-card">
          <div className="hd-trends-chart-header">
            <div>
              <h3 className="hd-trends-chart-title">Blood Oxygen Saturation</h3>
              <p className="hd-trends-chart-subtitle">Live pulmonary exchange absorption</p>
            </div>
            <div className="hd-trends-chart-badge hd-trends-chart-badge--green">
              <span>Live Current:</span>
              <strong>{latest?.bloodOxygen}%</strong>
            </div>
          </div>
          <svg viewBox="0 0 320 120" preserveAspectRatio="none" className="hd-trends-chart-svg">
            <defs>
              <linearGradient id="o2Grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--hd-green)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--hd-green)" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Grid Reference Lines with Clinical Tick Values */}
            <line x1="0" y1="30" x2="320" y2="30" stroke="var(--border-subtle)" strokeDasharray="3 3" />
            <text x="6" y="26" fill="var(--text-tertiary)" fontSize="9" fontFamily="var(--font-mono)">100%</text>

            <line x1="0" y1="60" x2="320" y2="60" stroke="var(--border-subtle)" strokeDasharray="3 3" />
            <text x="6" y="56" fill="var(--text-tertiary)" fontSize="9" fontFamily="var(--font-mono)">94%</text>

            <line x1="0" y1="90" x2="320" y2="90" stroke="var(--border-subtle)" strokeDasharray="3 3" />
            <text x="6" y="86" fill="var(--text-tertiary)" fontSize="9" fontFamily="var(--font-mono)">88%</text>

            {/* Gradient Area Fill */}
            <polygon points={`0,120 ${oxygenPoints || ''} 320,120`} fill="url(#o2Grad)" />

            {/* Live Telemetry Polyline */}
            <polyline
              points={oxygenPoints || ''}
              fill="none"
              stroke="var(--hd-green)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Live Leading Cursor */}
            <circle cx={oxygenLast[0]} cy={oxygenLast[1]} r="3.5" fill="var(--hd-green)" />
            <circle cx={oxygenLast[0]} cy={oxygenLast[1]} r="7" fill="var(--hd-green)" opacity="0.3">
              <animate attributeName="r" values="3.5;8;3.5" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0.05;0.4" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </svg>
          <div className="hd-trends-chart-footer">
            <span>Pre-Flight Baseline: 99%</span>
            <span className="hd-trends-stream-badge">
              <span className="hd-trends-stream-dot" aria-hidden="true" />
              Live Telemetry Stream
            </span>
          </div>
        </div>
      </div>

      <Accordion
        title="Trend Information & Time Window Notes"
        icon={<Activity size={16} />}
        defaultOpen={false}
      >
        <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Longitudinal Flight Shift Data:</strong> Telemetry streams are plotted against each astronaut’s pre-flight Earth baseline to monitor slow adaptation drift, bone demineralization, and cardiovascular reconditioning over extended spaceflight missions.
        </p>
      </Accordion>
    </div>
  )
}

export default HealthTrendsView
