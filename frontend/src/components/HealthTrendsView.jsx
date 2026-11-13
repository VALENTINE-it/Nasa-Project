import React from 'react'
import { TrendingUp } from 'lucide-react'

export function HealthTrendsView({
  latest,
  timeframe,
  setTimeframe,
  heartPoints,
  oxygenPoints,
}) {
  return (
    <div className="view-pane trends-pane">
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

      <div className="vitals-group-heading">
        <TrendingUp size={14} strokeWidth={2} />
        <span>Telemetry Trends</span>
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
            <line x1="0" y1="30" x2="320" y2="30" stroke="var(--border-subtle)" strokeDasharray="3 3" />
            <line x1="0" y1="60" x2="320" y2="60" stroke="var(--border-subtle)" strokeDasharray="3 3" />
            <line x1="0" y1="90" x2="320" y2="90" stroke="var(--border-subtle)" strokeDasharray="3 3" />
            <polyline points={heartPoints} fill="none" stroke="currentColor" strokeWidth="2.5" />
          </svg>
          <div className="chart-labels-row">
            <span>Baseline History</span>
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
            <line x1="0" y1="30" x2="320" y2="30" stroke="var(--border-subtle)" strokeDasharray="3 3" />
            <line x1="0" y1="60" x2="320" y2="60" stroke="var(--border-subtle)" strokeDasharray="3 3" />
            <line x1="0" y1="90" x2="320" y2="90" stroke="var(--border-subtle)" strokeDasharray="3 3" />
            <polyline points={oxygenPoints} fill="none" stroke="currentColor" strokeWidth="2.5" />
          </svg>
          <div className="chart-labels-row">
            <span>Baseline History</span>
            <span>Live Telemetry Stream</span>
          </div>
        </div>
      </div>

      <details className="view-accordion">
        <summary>Trend Information &amp; Time Window Notes</summary>
        <div className="accordion-body">
          <p>Dynamic polyline advancing with sensor stream. Comparison against baseline history.</p>
        </div>
      </details>
    </div>
  )
}

export default HealthTrendsView
