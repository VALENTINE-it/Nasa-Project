import React from 'react'

export function MissionProfileView({ profile }) {
  return (
    <div className="view-pane profile-pane">
      <div className="profile-details-grid">
        <div className="profile-info-card">
          <h3>Crew Profile &amp; Assignment</h3>
          <div className="info-key-val">
            <span>Astronaut Name:</span>
            <strong>{profile.fullName}</strong>
          </div>
          <div className="info-key-val">
            <span>Astronaut ID:</span>
            <strong>{profile.astronautId}</strong>
          </div>
          <div className="info-key-val">
            <span>Mission:</span>
            <strong>{profile.mission}</strong>
          </div>
          <div className="info-key-val">
            <span>Assignment:</span>
            <strong>Propulsion Systems &amp; Spacecraft Commander</strong>
          </div>
          <div className="info-key-val">
            <span>Health Overview:</span>
            <p className="profile-bio-text">{profile.personalOverview}</p>
          </div>
        </div>

        <div className="profile-info-card">
          <h3>Wearable &amp; Ship Telemetry Links</h3>
          <div className="info-key-val">
            <span>Smart Watch Status:</span>
            <strong className="status-good-text">Connected (Oraimo Watch via Bluetooth)</strong>
          </div>
          <div className="info-key-val">
            <span>Location:</span>
            <strong>Deep-Space Mars Transit Habitat</strong>
          </div>
          <div className="info-key-val">
            <span>Distance from Earth:</span>
            <strong>142 million miles away</strong>
          </div>
          <div className="info-key-val">
            <span>Radio Delay to Houston:</span>
            <strong>12 minutes, 44 seconds</strong>
          </div>
          <div className="info-key-val">
            <span>Autonomous Computer:</span>
            <strong>
              Clinical Decision Engine Active (<span className="status-good-text">Ready</span>)
            </strong>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MissionProfileView
