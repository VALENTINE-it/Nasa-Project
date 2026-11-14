export default function SegmentedControl({
  options = [],
  value,
  onChange,
  ariaLabel = 'Filter options',
  className = '',
}) {
  return (
    <div className={`hd-segmented ${className}`} role="group" aria-label={ariaLabel}>
      {options.map((opt) => {
        const isActive = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            className={`hd-segmented__btn ${isActive ? 'hd-segmented__btn--active' : ''}`}
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && opt.count !== null && (
              <span className="hd-segmented__count" aria-hidden="true">
                {opt.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
