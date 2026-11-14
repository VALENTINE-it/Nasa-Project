import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

export default function Alert({
  variant = 'warning',
  title,
  children,
  action,
  icon: CustomIcon,
  className = '',
  ...rest
}) {
  const IconComponent =
    CustomIcon ||
    (variant === 'warning'
      ? AlertTriangle
      : variant === 'danger'
        ? AlertCircle
        : variant === 'good'
          ? CheckCircle2
          : Info)

  return (
    <div
      className={`hd-alert hd-alert--${variant} ${className}`}
      role="alert"
      {...rest}
    >
      <div className="hd-alert__content">
        <IconComponent size={18} strokeWidth={2} className="hd-alert__icon" aria-hidden="true" />
        <div className="hd-alert__text">
          {title && <strong className="hd-alert__title">{title}</strong>}
          <span>{children}</span>
        </div>
      </div>
      {action && <div className="hd-alert__action">{action}</div>}
    </div>
  )
}
