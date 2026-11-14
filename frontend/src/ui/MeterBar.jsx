export default function MeterBar({
  label,
  value,
  displayValue,
  unit = '',
  min = 0,
  max = 100,
  variant = 'default',
  showValue = true,
  className = '',
}) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0
  const percentage = Math.min(Math.max(((numericValue - min) / (max - min)) * 100, 0), 100)

  return (
    <div className={`hd-meter ${className}`}>
      {(label || showValue) && (
        <div className="hd-meter__header">
          {label && <span className="hd-meter__label">{label}</span>}
          {showValue && (
            <span className="hd-meter__value">
              {displayValue !== undefined ? displayValue : `${numericValue}${unit ? ` ${unit}` : ''}`}
            </span>
          )}
        </div>
      )}
      <div
        className="hd-meter__track"
        role="progressbar"
        aria-valuenow={numericValue}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={label || 'Metric level'}
      >
        <div
          className={`hd-meter__fill hd-meter__fill--${variant}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
