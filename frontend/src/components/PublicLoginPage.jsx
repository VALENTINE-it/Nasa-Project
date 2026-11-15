import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, LogIn, Moon, Rocket, Sun, ShieldCheck } from 'lucide-react'
import { Button, Alert, StatusChip } from '../ui'

const DEMO_USERS = [
  {
    id: 1,
    username: 'elenapark',
    password: 'mission-2041',
    name: 'Elena Park',
    role: 'Mission Commander',
    avatar: '/avatars/astronaut-1.svg',
  },
  {
    id: 2,
    username: 'danielortiz',
    password: 'mission-2056',
    name: 'Daniel Ortiz',
    role: 'Medical Officer',
    avatar: '/avatars/astronaut-2.svg',
  },
  {
    id: 3,
    username: 'priyashah',
    password: 'mission-2089',
    name: 'Priya Shah',
    role: 'Science Specialist',
    avatar: '/avatars/astronaut-3.svg',
  },
]

export default function PublicLoginPage({ onAuthenticated, theme, onToggleTheme }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('elenapark')
  const [password, setPassword] = useState('mission-2041')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSelectDemoUser = (user) => {
    setUsername(user.username)
    setPassword(user.password)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        throw new Error('Incorrect username or password. Please try again.')
      }

      const user = await response.json()
      onAuthenticated(user)
      navigate(`/astronaut/dashboard/${user.astronautId}`)
    } catch (loginError) {
      setError(loginError.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-screen-wrapper hd-login-page">
      <header className="login-top-bar hd-login-topbar">
        <div className="brand-badge-group hd-login-brand">
          <div className="hd-login-brand-icon">
            <Rocket className="app-icon" size={20} strokeWidth={2} />
          </div>
          <div>
            <span className="hd-login-brand-title">AURA-MED</span>
            <span className="badge-caption hd-login-brand-caption">
              NASA Autonomous Health Workstation
            </span>
          </div>
          <StatusChip variant="accent">Crew Side</StatusChip>
        </div>
        <div className="top-bar-controls hd-login-controls">
          <Button
            variant="icon"
            onClick={onToggleTheme}
            ariaLabel={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            icon={theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          />
          <Link to="/console" style={{ textDecoration: 'none' }}>
            <Button
              variant="outline"
              icon={<ArrowRight size={15} />}
              style={{ minHeight: '40px' }}
            >
              Earth Mission Control
            </Button>
          </Link>
        </div>
      </header>

      <main className="login-center-content hd-login-center">
        <div className="auth-card-container hd-login-card">
          <div className="auth-card-header hd-login-header">
            <div className="hd-login-tag">
              <ShieldCheck size={14} />
              <span>AURA-MED CLINICAL DECISION SUITE</span>
            </div>
            <h2 className="hd-login-title">Astronaut Workstation Sign In</h2>
            <p className="hd-login-desc">
              Autonomous clinical decision support and health monitoring for deep-space transit to Mars.
            </p>
          </div>

          <div className="quick-crew-picker hd-login-crew-picker">
            <span className="picker-label hd-login-picker-label">
              Click a crew member to pre-fill credentials:
            </span>
            <div className="crew-picker-cards hd-login-crew-grid" role="group" aria-label="Demo Crew Accounts">
              {DEMO_USERS.map((user) => {
                const isSelected = username === user.username
                return (
                  <button
                    key={user.id}
                    type="button"
                    aria-pressed={isSelected}
                    className={`picker-member-btn hd-login-crew-card ${
                      isSelected ? 'active hd-login-crew-card--active' : ''
                    }`}
                    onClick={() => handleSelectDemoUser(user)}
                  >
                    <div className="hd-login-crew-avatar-box">
                      <img src={user.avatar} alt={user.name} />
                    </div>
                    <strong className="hd-login-crew-name">{user.name}</strong>
                    <span className="hd-login-crew-role">{user.role}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-body hd-login-form">
            <div className="input-field-block hd-login-field">
              <label htmlFor="auth-username" className="hd-login-label">
                Astronaut Username
              </label>
              <input
                id="auth-username"
                type="text"
                className="hd-login-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. elenapark"
                required
                autoComplete="username"
              />
            </div>

            <div className="input-field-block hd-login-field">
              <label htmlFor="auth-password" className="hd-login-label">
                Security Password
              </label>
              <input
                id="auth-password"
                type="password"
                className="hd-login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <Alert variant="danger">
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              icon={<LogIn size={16} strokeWidth={2} />}
              style={{ width: '100%', minHeight: '46px', marginTop: '0.25rem' }}
            >
              {submitting ? 'Authenticating...' : 'Open Health Workstation'}
            </Button>
          </form>

          <div className="ground-switch-bar hd-login-footer-bar">
            <span>Ground Monitoring Team:</span>
            <Link to="/console" className="ground-link hd-login-console-link">
              <span>Open Earth Mission Control Console</span>
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
