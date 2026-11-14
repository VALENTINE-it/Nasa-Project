export default function EcgTrace({
  heartRate = 72,
  variant = 'default',
  className = '',
}) {
  const bpm = Math.max(40, Math.min(180, Number(heartRate) || 72))
  // One cardiac cycle period in seconds
  const periodSeconds = (60 / bpm).toFixed(2)

  // Standard P-Q-R-S-T waveform normalized across 200 units width and 38 height
  // Baseline is at y=20
  const pathD =
    'M 0 20 L 25 20 Q 32 14 38 20 L 45 20 L 50 24 L 56 3 L 64 34 L 70 20 L 78 20 Q 88 12 98 20 L 100 20 ' +
    'M 100 20 L 125 20 Q 132 14 138 20 L 145 20 L 150 24 L 156 3 L 164 34 L 170 20 L 178 20 Q 188 12 198 20 L 200 20'

  return (
    <div
      className={`hd-ecg hd-ecg--${variant} ${className}`}
      style={{ '--hd-ecg-speed': `${periodSeconds}s` }}
      aria-hidden="true"
    >
      <div className="hd-ecg__track">
        <svg className="hd-ecg__wave" viewBox="0 0 200 38" preserveAspectRatio="none">
          <path d={pathD} />
        </svg>
        <svg className="hd-ecg__wave" viewBox="0 0 200 38" preserveAspectRatio="none">
          <path d={pathD} />
        </svg>
      </div>
    </div>
  )
}
