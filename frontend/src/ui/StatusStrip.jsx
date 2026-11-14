export default function StatusStrip({
  items = [],
  radioStatus = 'Active',
  oneWayDelay = '12m 44s',
  distance = '142M miles',
  showSignal = false,
  utcClock,
  wearableStatus = null,
  activeAlert = null,
  children,
  className = '',
}) {
  return (
    <aside className={`hd-status-strip ${className}`} aria-label="System status telemetry">
      <div className="hd-status-strip__items">
        {wearableStatus && (
          <div className="hd-status-strip__item">
            <span
              className={`hd-status-strip__dot ${
                wearableStatus.isConnected ? 'hd-status-strip__dot--pulse' : ''
              }`}
              style={{
                backgroundColor: wearableStatus.isConnected
                  ? 'var(--hd-green)'
                  : wearableStatus.isScanning
                    ? 'var(--hd-amber)'
                    : 'var(--text-muted)',
              }}
              aria-hidden="true"
            />
            <span className="hd-status-strip__label">Wearable Sync:</span>
            <span className="hd-status-strip__value">
              {wearableStatus.isConnected
                ? 'Connected'
                : wearableStatus.isScanning
                  ? 'Scanning BLE...'
                  : 'Offline (Simulated)'}
            </span>
            {wearableStatus.battery !== undefined && (
              <span className="hd-status-strip__value">
                ({wearableStatus.battery}% bat)
              </span>
            )}
          </div>
        )}

        {radioStatus && (
          <div className="hd-status-strip__item">
            <span className="hd-status-strip__dot hd-status-strip__dot--pulse" aria-hidden="true" />
            <span className="hd-status-strip__label">Deep-Space Link:</span>
            <span className="hd-status-strip__value">{radioStatus}</span>
          </div>
        )}

        {showSignal && (
          <div className="hd-status-strip__item hd-status-strip__signal" title="Signal Transit: Ground to Crew">
            <span className="hd-status-strip__label">Ground</span>
            <svg className="hd-status-strip__signal-svg" viewBox="0 0 50 12" aria-hidden="true">
              <line x1="2" y1="6" x2="48" y2="6" className="hd-status-strip__signal-line" />
            </svg>
            <span className="hd-status-strip__label">Crew</span>
          </div>
        )}

        {oneWayDelay && (
          <div className="hd-status-strip__item">
            <span className="hd-status-strip__label">One-Way Light Delay:</span>
            <span className="hd-status-strip__value" style={{ color: 'var(--hd-amber)' }}>
              {oneWayDelay}
            </span>
          </div>
        )}

        {distance && (
          <div className="hd-status-strip__item">
            <span className="hd-status-strip__label">Distance:</span>
            <span className="hd-status-strip__value">{distance}</span>
          </div>
        )}

        {items.map((item, idx) => (
          <div key={idx} className="hd-status-strip__item">
            {item.label && <span className="hd-status-strip__label">{item.label}:</span>}
            <span className="hd-status-strip__value">{item.value}</span>
          </div>
        ))}

        {children}
      </div>

      <div className="hd-status-strip__items">
        {activeAlert && (
          <div className="hd-status-strip__item" style={{ color: 'var(--status-warn-text)' }}>
            <span className="hd-status-strip__label">Active Advisory:</span>
            <span className="hd-status-strip__value">{activeAlert}</span>
          </div>
        )}

        {utcClock && (
          <div className="hd-status-strip__item">
            <span className="hd-status-strip__label">UTC:</span>
            <span className="hd-status-strip__value">{utcClock}</span>
          </div>
        )}
      </div>
    </aside>
  )
}
