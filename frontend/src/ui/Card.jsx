export default function Card({
  title,
  subtitle,
  action,
  header,
  footer,
  interactive = false,
  selected = false,
  children,
  className = '',
  onClick,
  ...rest
}) {
  const classes = [
    'hd-card',
    interactive ? 'hd-card--interactive' : '',
    selected ? 'hd-card--selected' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const hasHeader = header || title || subtitle || action

  return (
    <div
      className={classes}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive && onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick(e)
              }
            }
          : undefined
      }
      {...rest}
    >
      {hasHeader && (
        <div className="hd-card__header">
          {header || (
            <>
              <div>
                {title && <h3 className="hd-card__title">{title}</h3>}
                {subtitle && <p className="hd-card__subtitle">{subtitle}</p>}
              </div>
              {action && <div>{action}</div>}
            </>
          )}
        </div>
      )}
      <div className="hd-card__body">{children}</div>
      {footer && <div className="hd-card__footer">{footer}</div>}
    </div>
  )
}
