import React from 'react'
import { Bluetooth, BluetoothOff } from 'lucide-react'

export function MissionProfileView({ profile, smartwatch, onConnectWatch }) {
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
          <h3>Smartwatch Connection</h3>
          <div className="info-key-val">
            <span>Device:</span>
            <strong>{smartwatch.deviceName || 'No device connected'}</strong>
          </div>
          <div className="info-key-val">
            <span>Bluetooth status:</span>
            <strong>{smartwatch.status}</strong>
          </div>
          <div className="info-key-val">
            <span>Heart-rate service:</span>
            <strong>{smartwatch.heartRateSupported ? 'Available' : 'Not detected'}</strong>
          </div>
          <div className="info-key-val">
            <span>Other readings:</span>
            <strong>SpO2 and steps require a supported manufacturer or Android health integration.</strong>
          </div>
          <div className="info-key-val">
            <span>Compatibility:</span>
            <strong>Chrome on Android, HTTPS, and a standard Bluetooth heart-rate service.</strong>
          </div>
          <button
            type="button"
            className="watch-connect-button profile-watch-connect"
            onClick={smartwatch.status === 'connected' ? smartwatch.disconnect : onConnectWatch}
            disabled={smartwatch.status === 'connecting'}
          >
            {smartwatch.status === 'connected' ? <BluetoothOff size={16} /> : <Bluetooth size={16} />}
            {smartwatch.status === 'connected'
              ? 'Disconnect watch'
              : smartwatch.status === 'connecting'
                ? 'Connecting…'
                : 'Pair smartwatch'}
          </button>
          {smartwatch.error ? <p className="watch-connection-message error">{smartwatch.error}</p> : null}
        </div>
      </div>
    </div>
  )
}

export default MissionProfileView
