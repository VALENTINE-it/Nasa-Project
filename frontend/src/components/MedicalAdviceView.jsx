import React from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'

export function MedicalAdviceView({ dynamicAlerts = [] }) {
  return (
    <div className="view-pane notices-pane">
      <div className="pane-scrollable-safe">
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
                  <strong>Recommended Action:</strong>
                  <span>Sit down in a quiet spot, drink 500 mL of fluids, and rest for 15 minutes.</span>
                </div>
              </div>
            ))
          ) : (
            <div className="notice-full-card good">
              <div className="notice-card-top">
                <div className="notice-headline-group">
                  <CheckCircle2 size={18} strokeWidth={2.5} />
                  <h3>All Vital Signs Are Normal</h3>
                </div>
                <span className="notice-level-tag">NOMINAL</span>
              </div>
              <p className="notice-detail-text">
                No health anomalies or abnormal vital readings have been detected during this shift.
              </p>
              <div className="notice-action-guide">
                <strong>Daily Guidance:</strong>
                <span>
                  Continue your scheduled flight activities, stay hydrated, and complete your 45-minute exercise cycle.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MedicalAdviceView
