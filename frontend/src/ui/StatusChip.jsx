export default function StatusChip({
  children,
  variant = 'neutral',
  dot = true,
  className = '',
  ...rest
}) {
  const normalizedVariant =
    variant === 'nominal' || variant === 'stable'
      ? 'good'
      : variant === 'watchlist'
        ? 'warning'
        : variant === 'critical'
          ? 'danger'
          : variant

  return (
    <span
      className={`hd-chip hd-chip--${normalizedVariant} ${className}`}
      role="status"
      {...rest}
    >
      {dot && <span className="hd-chip__dot" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  )
}
