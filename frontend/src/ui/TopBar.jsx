import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import Button from './Button'
import StatusChip from './StatusChip'

export default function TopBar({
  brandIcon: BrandIcon,
  brandTitle = 'NASA Houston Desk',
  brandSubtitle = 'Deep-Space Health Console',
  sideChipText = 'Ground Side',
  brandLink = '#',
  crewIdentity = null,
  primaryAction = null,
  theme = 'light',
  onToggleTheme,
  authAction = null,
  children,
}) {
  return (
    <header className="hd-topbar">
      <div className="hd-topbar__left">
        <Link to={brandLink} className="hd-topbar__brand">
          {BrandIcon && (
            <div className="hd-topbar__logo-icon">
              <BrandIcon size={20} strokeWidth={2} />
            </div>
          )}
          <div className="hd-topbar__titles">
            <span className="hd-topbar__title">{brandTitle}</span>
            <span className="hd-topbar__subtitle">{brandSubtitle}</span>
          </div>
        </Link>
        {sideChipText && (
          <StatusChip variant="info" size="sm">
            {sideChipText}
          </StatusChip>
        )}
      </div>

      {crewIdentity && (
        <div className="hd-topbar__center">
          <div className="hd-topbar__crew-identity">
            <img
              src={crewIdentity.avatarUrl || '/avatars/astronaut-1.svg'}
              alt={crewIdentity.fullName || 'Crew member'}
              className="hd-topbar__avatar"
            />
            <div className="hd-topbar__crew-meta">
              <span className="hd-topbar__crew-name">
                {crewIdentity.fullName} ({crewIdentity.astronautId})
              </span>
              <span className="hd-topbar__crew-sub">
                {crewIdentity.mission}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="hd-topbar__right">
        {primaryAction}
        {onToggleTheme && (
          <Button
            variant="icon"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun size={17} strokeWidth={2} />
            ) : (
              <Moon size={17} strokeWidth={2} />
            )}
          </Button>
        )}
        {authAction}
        {children}
      </div>
    </header>
  )
}
