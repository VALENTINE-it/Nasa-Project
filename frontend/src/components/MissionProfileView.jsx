import React from 'react'

export function MissionProfileView({ profile, environmentMode = 'spacecraft' }) {
  const envTitles = {
    spacecraft: 'Deep-Space Mars Transit Habitat (0.00g)',
    lunar_base: 'Artemis Lunar Outpost (0.16g Shackleton Base)',
    mars_eva: 'Mars Planetary Surface EVA (0.38g Jezero Field)',
  }[environmentMode] || 'Deep-Space Mars Transit Habitat'

  const envDistances = {
    spacecraft: '142 million miles away (Interplanetary Transit)',
    lunar_base: '238,900 miles away (Lunar South Pole)',
    mars_eva: '142 million miles away (Martian Surface)',
  }[environmentMode] || '142 million miles away'

  const envDelays = {
    spacecraft: '12 minutes, 44 seconds (Deep-Space Latency)',
    lunar_base: '1.3 seconds (Near Earth Moon Link)',
    mars_eva: '12 minutes, 44 seconds (Direct-to-Earth Carrier)',
  }[environmentMode] || '12 minutes, 44 seconds'

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
          <details className="view-accordion">
            <summary>Health Overview &amp; Bio</summary>
            <div className="accordion-body">
              <p className="profile-bio-text">{profile.personalOverview}</p>
            </div>
          </details>
        </div>

        <div className="profile-info-card">
          <h3>Wearable &amp; Ship Telemetry Links</h3>
          <div className="info-key-val">
            <span>Smart Watch Status:</span>
            <strong className="status-good-text">Connected (Oraimo Watch via Bluetooth)</strong>
          </div>
          <div className="info-key-val">
            <span>Operational Environment:</span>
            <strong>{envTitles}</strong>
          </div>
          <details className="view-accordion">
            <summary>Telemetry Link &amp; Environment Details</summary>
            <div className="accordion-body">
              <div className="info-key-val">
                <span>Distance from Earth:</span>
                <strong>{envDistances}</strong>
              </div>
              <div className="info-key-val">
                <span>Radio Delay to Houston:</span>
                <strong>{envDelays}</strong>
              </div>
              <div className="info-key-val">
                <span>Autonomous Computer:</span>
                <strong>
                  Clinical Decision Engine Active (<span className="status-good-text">Ready</span>)
                </strong>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}

export default MissionProfileView
