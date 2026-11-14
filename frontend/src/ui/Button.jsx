import { Link } from 'react-router-dom'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  to,
  href,
  className = '',
  disabled = false,
  type = 'button',
  ...rest
}) {
  const classes = [
    'hd-btn',
    `hd-btn--${variant}`,
    size !== 'md' ? `hd-btn--${size}` : '',
    fullWidth ? 'hd-btn--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (to) {
    return (
      <Link
        to={to}
        className={classes}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        {...rest}
      >
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        {...rest}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}
