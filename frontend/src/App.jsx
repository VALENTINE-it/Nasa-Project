import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshSession = async () => {
    try {
      const response = await fetch('/api/auth/session', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setSession(data)
      } else {
        setSession(null)
      }
    } catch {
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshSession()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      setSession(null)
    }
  }

  if (loading) {
    return <div className="loading-screen">Loading mission systems...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            session ? (
              <Navigate to={`/astronaut/dashboard/${session.astronautId}`} replace />
            ) : (
              <LoginPage onAuthenticated={setSession} />
            )
          }
        />
        <Route
          path="/astronaut/dashboard/:id"
          element={<ProtectedDashboard session={session} onLogout={handleLogout} />}
        />
        <Route
          path="*"
          element={
            <Navigate to={session ? `/astronaut/dashboard/${session.astronautId}` : '/'} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

function LoginPage({ onAuthenticated }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
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
        throw new Error('Invalid credentials')
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
    <div className="login-shell">
      <div className="login-panel">
        <div className="login-header">
          <p className="eyebrow">Astronaut health command</p>
          <h1>AURA-MED</h1>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="elena"
              autoComplete="username"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="mission-2041"
              autoComplete="current-password"
            />
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <button type="submit" disabled={submitting} className="primary-button">
            {submitting ? 'Authenticating...' : 'Log in'}
          </button>
        </form>

        <div className="credential-box">
          <p className="box-title">Demo credentials</p>
          <ul>
            <li>Elena Park — username: elenapark | password: mission-2041</li>
            <li>Daniel Ortiz — username: danielortiz | password: mission-2056</li>
            <li>Priya Shah — username: priyashah | password: mission-2089</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function ProtectedDashboard({ session, onLogout }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const astronautId = Number(id)
  const [dashboardData, setDashboardData] = useState(null)
  const [timeframe, setTimeframe] = useState('week')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      navigate('/', { replace: true })
      return
    }

    if (session.astronautId !== astronautId) {
      navigate(`/astronaut/dashboard/${session.astronautId}`, { replace: true })
      return
    }

    const loadDashboard = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/astronauts/${astronautId}/dashboard`, {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Not authorized')
        }

        const data = await response.json()
        setDashboardData(data)
      } catch {
        navigate('/', { replace: true })
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [astronautId, navigate, session])

  if (!session || session.astronautId !== astronautId) {
    return null
  }

  if (loading || !dashboardData) {
    return <div className="loading-screen">Loading astronaut record...</div>
  }

  const { profile, latest, history, alerts, summary } = dashboardData
  const statusClass = latest && latest.heartRate > 90 ? 'warning' : 'stable'

  const records = [...history].reverse()
  const limit = timeframe === 'daily' ? 3 : timeframe === 'week' ? 7 : Math.min(records.length, 12)
  const chartSeries = records.slice(0, limit)

  const heartPoints = buildChartPoints(chartSeries.map((record) => record.heartRate))
  const oxygenPoints = buildChartPoints(chartSeries.map((record) => record.bloodOxygen))

  return (
    <div className="dashboard-shell">
      <header className="mission-topbar">
        <div className="title-block">
          <div className="avatar-wrap">
            <img src={profile.avatarUrl} alt={profile.fullName} />
          </div>
          <div>
            <p className="eyebrow">Astronaut monitoring</p>
            <h2>{profile.fullName}</h2>
          </div>
        </div>

        <div className="header-actions">
          <span className={`status-pill ${statusClass}`}>{profile.currentHealthStatus}</span>
          <button type="button" className="logout-button" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <main className="astronaut-dashboard">
        <section className="overview-panel panel">
          <div className="panel-header">
            <h3>Mission profile</h3>
          </div>
          <div className="profile-grid">
            <div>
              <span className="meta-label">Astronaut ID</span>
              <strong>{profile.astronautId}</strong>
            </div>
            <div>
              <span className="meta-label">Mission</span>
              <strong>{profile.mission}</strong>
            </div>
            <div>
              <span className="meta-label">Monitoring status</span>
              <strong>{profile.monitoringStatus}</strong>
            </div>
            <div>
              <span className="meta-label">Current status</span>
              <strong>{profile.currentHealthStatus}</strong>
            </div>
          </div>
          <p className="overview-copy">{profile.personalOverview}</p>
        </section>

        <section className="metrics-grid">
          <MetricCard label="Heart Rate" value={`${latest.heartRate}`} unit="bpm" tone="blue" />
          <MetricCard label="Blood Pressure" value={latest.bloodPressure} unit="mmHg" tone="cyan" />
          <MetricCard label="Blood Oxygen" value={`${latest.bloodOxygen}`} unit="% SpO2" tone="green" />
          <MetricCard label="Body Temp" value={`${latest.bodyTemperature.toFixed(1)}`} unit="°C" tone="amber" />
          <MetricCard label="Respiratory Rate" value={`${latest.respiratoryRate}`} unit="rpm" tone="magenta" />
          <MetricCard label="Sleep Duration" value={`${latest.sleepDuration.toFixed(1)}`} unit="hrs" tone="purple" />
          <MetricCard label="Physical Activity" value={`${latest.physicalActivity}`} unit="steps" tone="red" />
        </section>

        <section className="trends-panel panel">
          <div className="panel-header split-header">
            <h3>Health trends</h3>
            <div className="toggle-row">
              {['daily', 'week', 'month'].map((range) => (
                <button
                  key={range}
                  type="button"
                  className={`range-toggle ${timeframe === range ? 'active' : ''}`}
                  onClick={() => setTimeframe(range)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="chart-grid">
            <div className="chart-card">
              <div className="chart-label-row">
                <span>Heart rate</span>
                <strong>{summary.avgHeartRate || latest.heartRate} bpm</strong>
              </div>
              <svg viewBox="0 0 320 120" preserveAspectRatio="none" className="line-chart">
                <polyline points={heartPoints} fill="none" stroke="#74c7ff" strokeWidth="3" />
              </svg>
            </div>

            <div className="chart-card">
              <div className="chart-label-row">
                <span>Blood oxygen</span>
                <strong>{summary.avgBloodOxygen || latest.bloodOxygen}%</strong>
              </div>
              <svg viewBox="0 0 320 120" preserveAspectRatio="none" className="line-chart">
                <polyline points={oxygenPoints} fill="none" stroke="#7ef5bf" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </section>

        <section className="bottom-grid">
          <div className="panel alerts-panel">
            <div className="panel-header">
              <h3>Health alerts</h3>
            </div>
            <div className="alert-list">
              {alerts.length ? (
                alerts.map((alert) => (
                  <div key={alert.id} className={`alert-item ${alert.severity}`}>
                    <div className="alert-title-row">
                      <span className={`severity-badge ${alert.severity}`}>{alert.severity}</span>
                      <strong>{alert.metricName}</strong>
                    </div>
                    <p>{alert.description}</p>
                    <small>
                      {alert.observedValue} vs {alert.threshold}
                    </small>
                  </div>
                ))
              ) : (
                <div className="alert-item normal">
                  <p>No active alerts. Monitoring remains within nominal parameters.</p>
                </div>
              )}
            </div>
          </div>

          <div className="panel history-panel">
            <div className="panel-header">
              <h3>Monitoring history</h3>
            </div>
            <div className="history-list">
              {history.slice(0, 6).map((record) => (
                <div key={record.id} className="history-item">
                  <div>
                    <strong>{new Date(record.recordedAt).toLocaleDateString()}</strong>
                    <span>{record.heartRate} bpm · {record.bloodPressure} · {record.bloodOxygen}%</span>
                  </div>
                  <small>{record.sleepDuration.toFixed(1)} hrs sleep</small>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function MetricCard({ label, value, unit, tone }) {
  return (
    <article className={`metric-card ${tone}`}>
      <span className="label">{label}</span>
      <strong>{value}</strong>
      <small>{unit}</small>
    </article>
  )
}

function buildChartPoints(values) {
  if (!values.length) return '0,120 320,120'

  const width = 320
  const height = 120
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width
      const y = height - ((value - min) / range) * (height - 20) - 10
      return `${x},${y}`
    })
    .join(' ')
}

export default App
