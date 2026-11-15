import React from 'react'
import { Link } from 'react-router-dom'
import {
  Rocket,
  Activity,
  TrendingUp,
  Bell,
  ClipboardList,
  User,
  Globe,
  Sun,
  Moon,
  LogOut,
  LogIn,
  X,
} from 'lucide-react'

export function AstronautSidebar({
  profile,
  activeTab,
  setActiveTab,
  dynamicAlertsCount = 0,
  theme,
  onToggleTheme,
  session,
  onLogout,
  isOpen = false,
  onClose,
}) {
  const handleTabSelect = (tab) => {
    setActiveTab(tab)
    if (onClose) onClose()
  }

  return (
    <>
      {/* Mobile Off-Canvas Backdrop */}
      <div
        className={`mobile-sidebar-backdrop ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`left-sidebar-navigation ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand-block">
          <Rocket className="sidebar-icon" size={22} strokeWidth={2} />
          <div>
            <strong>AURA-MED</strong>
            <small>Astronaut Health Desk</small>
          </div>
          <span className="dashboard-location-badge">Crew Side</span>

          {/* Close button inside drawer for mobile */}
          <button
            type="button"
            className="mobile-sidebar-close-btn"
            onClick={onClose}
            aria-label="Close Navigation Drawer"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Current Crew Badge in Sidebar */}
        <div className="sidebar-crew-identity">
          <img src={profile.avatarUrl} alt={profile.fullName} className="sidebar-avatar" />
          <div className="sidebar-crew-text">
            <strong>{profile.fullName}</strong>
            <small>
              {profile.astronautId} · {profile.mission}
            </small>
          </div>
        </div>

        {/* Navigation Buttons Dividing Content into Views (No Scrolling) */}
        <nav className="sidebar-nav-menu">
          <span className="nav-group-title">Biometrics</span>

          <button
            type="button"
            className={`nav-menu-button ${activeTab === 'vitals' ? 'active' : ''}`}
            onClick={() => handleTabSelect('vitals')}
          >
            <Activity className="nav-btn-icon" size={18} strokeWidth={2} />
            <div className="nav-btn-text">
              <strong>Daily Vitals</strong>
              <small>Heart, Oxygen, Pressure</small>
            </div>
          </button>

          <button
            type="button"
            className={`nav-menu-button ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => handleTabSelect('trends')}
          >
            <TrendingUp className="nav-btn-icon" size={18} strokeWidth={2} />
            <div className="nav-btn-text">
              <strong>Health Trends</strong>
              <small>Time Charts &amp; Changes</small>
            </div>
          </button>

          <span className="nav-group-title" style={{ marginTop: '12px' }}>Clinical &amp; History</span>

          <button
            type="button"
            className={`nav-menu-button ${activeTab === 'notices' ? 'active' : ''}`}
            onClick={() => handleTabSelect('notices')}
          >
            <Bell className="nav-btn-icon" size={18} strokeWidth={2} />
            <div className="nav-btn-text">
              <strong>Medical Advice</strong>
              <small>{dynamicAlertsCount} Active Notices</small>
            </div>
          </button>

          <button
            type="button"
            className={`nav-menu-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => handleTabSelect('history')}
          >
            <ClipboardList className="nav-btn-icon" size={18} strokeWidth={2} />
            <div className="nav-btn-text">
              <strong>Checkup History</strong>
              <small>Past Logs &amp; Rest Times</small>
            </div>
          </button>

          <span className="nav-group-title" style={{ marginTop: '12px' }}>Spacecraft</span>

          <button
            type="button"
            className={`nav-menu-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabSelect('profile')}
          >
            <User className="nav-btn-icon" size={18} strokeWidth={2} />
            <div className="nav-btn-text">
              <strong>Mission Profile</strong>
              <small>Flight Status &amp; Watch Sync</small>
            </div>
          </button>
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="sidebar-bottom-controls">
          <Link to="/console" className="sidebar-action-link" onClick={onClose}>
            <Globe size={16} strokeWidth={2} />
            <strong>Earth Mission Control</strong>
          </Link>

          <div className="sidebar-utility-row">
            <button type="button" className="utility-btn" onClick={onToggleTheme}>
              {theme === 'dark' ? (
                <>
                  <Sun size={13} strokeWidth={2} />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon size={13} strokeWidth={2} />
                  <span>Dark</span>
                </>
              )}
            </button>
            {session ? (
              <button type="button" className="utility-btn logout" onClick={onLogout}>
                <LogOut size={13} strokeWidth={2} />
                <span>Log Out</span>
              </button>
            ) : (
              <Link to="/" className="utility-btn" onClick={onClose}>
                <LogIn size={13} strokeWidth={2} />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

export default AstronautSidebar
