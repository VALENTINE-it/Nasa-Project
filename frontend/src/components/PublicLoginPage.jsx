import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, LogIn, Moon, Rocket, Sun } from 'lucide-react'

const DEMO_USERS = [
  { id: 1, username: 'elenapark', password: 'mission-2041', name: 'Elena Park', role: 'Mission Commander' },
  { id: 2, username: 'danielortiz', password: 'mission-2056', name: 'Daniel Ortiz', role: 'Medical & Systems Officer' },
  { id: 3, username: 'priyashah', password: 'mission-2089', name: 'Priya Shah', role: 'Science Specialist' },
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
    <div className="login-screen-wrapper">
      <header className="login-top-bar">
        <div className="brand-badge-group">
          <Rocket className="app-icon" size={20} strokeWidth={2} />
          <strong>AURA-MED</strong>
          <span className="badge-caption">NASA Autonomous Health Workstation</span>
        </div>
        <div className="top-bar-controls">
          <button type="button" className="theme-toggle-btn" onClick={onToggleTheme}>
            {theme === 'dark' ? (
              <>
                <Sun size={15} strokeWidth={2} />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={15} strokeWidth={2} />
                <span>Dark Mode</span>
              </>
            )}
          </button>
          <Link to="/console" className="pill-link-btn">
            <span>Earth Mission Control</span>
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>
      </header>

      <main className="login-center-content">
        <div className="auth-card-container">
          <div className="auth-card-header">
            <h2>Astronaut Workstation Sign In</h2>
            <p>
              Autonomous clinical decision support and health monitoring for deep-space transit to Mars.
            </p>
          </div>

          <div className="quick-crew-picker">
            <span className="picker-label">Click a crew member to pre-fill credentials:</span>
            <div className="crew-picker-cards">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className={`picker-member-btn ${username === user.username ? 'active' : ''}`}
                  onClick={() => handleSelectDemoUser(user)}
                >
                  <div className="picker-title-row">
                    <strong>{user.name}</strong>
                    <span className="picker-role">{user.role}</span>
                  </div>
                  <small>Username: {user.username} · Password: {user.password}</small>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-body">
            <div className="input-field-block">
              <label htmlFor="auth-username">Username</label>
              <input
                id="auth-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. elenapark"
                required
              />
            </div>

            <div className="input-field-block">
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && <div className="auth-error-box">{error}</div>}

            <button type="submit" disabled={submitting} className="auth-submit-btn">
              <LogIn size={16} strokeWidth={2} />
              <span>{submitting ? 'Authenticating...' : 'Open Health Workstation'}</span>
            </button>
          </form>

          <div className="ground-switch-bar">
            <span>Ground Monitoring Team:</span>
            <Link to="/console" className="ground-link">
              <span>Open Earth Mission Control Console</span>
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
