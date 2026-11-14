import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function Accordion({
  title,
  subtitle,
  badge,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  children,
  className = '',
  id,
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isControlled = controlledIsOpen !== undefined
  const open = isControlled ? controlledIsOpen : internalOpen

  const handleToggle = () => {
    if (controlledOnToggle) {
      controlledOnToggle(!open)
    }
    if (!isControlled) {
      setInternalOpen(!open)
    }
  }

  const contentId = id ? `${id}-content` : undefined

  return (
    <div className={`hd-accordion ${open ? 'hd-accordion--open' : ''} ${className}`}>
      <button
        type="button"
        className="hd-accordion__trigger"
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls={contentId}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div>
            <span>{title}</span>
            {subtitle && (
              <span
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 400,
                  color: 'var(--text-tertiary)',
                  marginTop: '0.15rem',
                }}
              >
                {subtitle}
              </span>
            )}
          </div>
          {badge}
        </div>
        <ChevronDown size={18} strokeWidth={2} className="hd-accordion__chevron" aria-hidden="true" />
      </button>
      {open && (
        <div className="hd-accordion__content" id={contentId}>
          {children}
        </div>
      )}
    </div>
  )
}
