import React from 'react'
import { User, Radio, FileText, Wifi } from 'lucide-react'
import { StatusChip, Accordion } from '../ui'

export function MissionProfileView({ profile = {}, environmentMode = 'spacecraft' }) {
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
    <div className="view-pane profile-pane hd-profile-container">
      <div className="hd-profile-grid">
        {/* Card 1: Crew Profile & Assignment */}
        <div className="hd-profile-card">
          <h3 className="hd-profile-title">
            <User size={18} strokeWidth={2} style={{ color: 'var(--accent-color)' }} />
            Crew Profile &amp; Assignment
          </h3>
          <div className="hd-profile-rows">
            <div className="hd-profile-row">
              <span className="hd-profile-label">Astronaut Name:</span>
              <strong className="hd-profile-val">{profile.fullName || '—'}</strong>
            </div>
            <div className="hd-profile-row">
              <span className="hd-profile-label">Astronaut ID:</span>
              <strong className="hd-profile-val hd-profile-val--mono">{profile.astronautId || '—'}</strong>
            </div>
            <div className="hd-profile-row">
              <span className="hd-profile-label">Mission:</span>
              <strong className="hd-profile-val">{profile.mission || '—'}</strong>
            </div>
            <div className="hd-profile-row">
              <span className="hd-profile-label">Assignment:</span>
              <strong className="hd-profile-val">Propulsion Systems &amp; Spacecraft Commander</strong>
            </div>
          </div>

          <Accordion
            title="Health Overview & Bio"
            icon={<FileText size={16} />}
            defaultOpen={false}
          >
            <p className="hd-profile-bio">{profile.personalOverview || 'No bio overview registered.'}</p>
          </Accordion>
        </div>

        {/* Card 2: Wearable & Ship Telemetry Links */}
        <div className="hd-profile-card">
          <h3 className="hd-profile-title">
            <Radio size={18} strokeWidth={2} style={{ color: 'var(--accent-color)' }} />
            Wearable &amp; Ship Telemetry Links
          </h3>
          <div className="hd-profile-rows">
            <div className="hd-profile-row">
              <span className="hd-profile-label">Smart Watch Status:</span>
              <StatusChip variant="good">Connected (Oraimo Watch via Bluetooth)</StatusChip>
            </div>
            <div className="hd-profile-row">
              <span className="hd-profile-label">Operational Environment:</span>
              <strong className="hd-profile-val">{envTitles}</strong>
            </div>
          </div>

          <Accordion
            title="Telemetry Link & Environment Details"
            icon={<Wifi size={16} />}
            defaultOpen={false}
          >
            <div className="hd-profile-rows">
              <div className="hd-profile-row">
                <span className="hd-profile-label">Distance from Earth:</span>
                <strong className="hd-profile-val hd-profile-val--mono">{envDistances}</strong>
              </div>
              <div className="hd-profile-row">
                <span className="hd-profile-label">Radio Delay to Houston:</span>
                <strong className="hd-profile-val hd-profile-val--mono">{envDelays}</strong>
              </div>
              <div className="hd-profile-row">
                <span className="hd-profile-label">Autonomous Computer:</span>
                <strong className="hd-profile-val">
                  Clinical Decision Engine Active (<span style={{ color: 'var(--hd-green)' }}>Ready</span>)
                </strong>
              </div>
            </div>
          </Accordion>
        </div>
      </div>
    </div>
  )
}

export default MissionProfileView
