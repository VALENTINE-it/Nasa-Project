import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  Heart,
  Menu,
  Moon,
  Radio,
  Shield,
  Sparkles,
  Sun,
  User,
  X,
} from 'lucide-react'
import '../LandingPage.css'

const DEMO_USERS = [
  {
    id: 1,
    astronautId: 'A-2041',
    username: 'elenapark',
    password: 'mission-2041',
    name: 'Elena Park',
    role: 'Mission Commander',
    focus: 'Circadian stability & cardio tolerance',
  },
  {
    id: 2,
    astronautId: 'A-2056',
    username: 'danielortiz',
    password: 'mission-2056',
    name: 'Daniel Ortiz',
    role: 'Medical & Systems Officer',
    focus: 'Microgravity muscle atrophy countermeasures',
  },
  {
    id: 3,
    astronautId: 'A-2089',
    username: 'priyashah',
    password: 'mission-2089',
    name: 'Priya Shah',
    role: 'Science Specialist',
    focus: 'Radiation biology & bone mineral density',
  },
]

const METRICS_CARDS = [
  { value: '78', unit: 'bpm', label: 'Resting heart rate', tone: 'mint' },
  { value: '98', unit: '%', label: 'Blood oxygen', tone: 'blue' },
  { value: '124/80', unit: '', label: 'Blood pressure', tone: 'amber' },
  { value: '38', unit: 'ms', label: 'HRV balance', tone: 'violet' },
]

const STEPS_DATA = [
  {
    number: '01',
    icon: 'wave',
    title: 'Read',
    copy: 'Your watch listens to the subtle patterns behind every heartbeat.',
  },
  {
    number: '02',
    icon: 'pulse',
    title: 'Predict',
    copy: 'Signals are checked against your personal deep-space health baseline.',
  },
  {
    number: '03',
    icon: 'spark',
    title: 'Advise',
    copy: 'Clear, clinically validated autonomous guidance arrives when it can make a difference.',
  },
]

const ACTIVITY_BARS = [74, 72, 61, 50, 42, 36, 43]
const DAYS_OF_WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function AuralMedLandingPage({
  sessionUser,
  onAuthenticated,
  onLogout,
  theme,
  onToggleTheme,
}) {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [selectedCrew, setSelectedCrew] = useState(DEMO_USERS[0])
  const [customUsername, setCustomUsername] = useState(DEMO_USERS[0].username)
  const [customPassword, setCustomPassword] = useState(DEMO_USERS[0].password)
  const [loginError, setLoginError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSelectCrew = (crew) => {
    setSelectedCrew(crew)
    setCustomUsername(crew.username)
    setCustomPassword(crew.password)
    setLoginError('')
  }

  const handleExecuteLogin = async (usernameToUse, passwordToUse) => {
    setIsSubmitting(true)
    setLoginError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameToUse || customUsername,
          password: passwordToUse || customPassword,
        }),
      })

      if (!response.ok) {
        throw new Error('Incorrect username or password. Please try again.')
      }

      const user = await response.json()
      if (onAuthenticated) onAuthenticated(user)
      setIsLoginModalOpen(false)
      navigate(`/astronaut/dashboard/${user.astronautId}`)
    } catch (err) {
      setLoginError(err.message || 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCrewCardLaunch = () => {
    if (sessionUser) {
      navigate(`/astronaut/dashboard/${sessionUser.astronautId}`)
      return
    }
    // Instant login with the selected crew member's credentials
    handleExecuteLogin(selectedCrew.username, selectedCrew.password)
  }

  const scrollToSection = (id) => {
    setIsMenuOpen(false)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="site-shell">
      {/* 1. HEADER / NAVIGATION */}
      <header className="nav-wrap">
        <nav className="nav container" aria-label="Primary navigation">
          <a
            className="brand"
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            aria-label="AuralMed home"
          >
            <span className="brand-mark">
              <svg
                aria-hidden="true"
                fill="none"
                height="18"
                viewBox="0 0 24 24"
                width="18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              >
                <path d="M3 12h4l2-6 4 12 2-6h6" />
              </svg>
            </span>
            <span>AuralMed</span>
          </a>

          <div className={`nav-links ${isMenuOpen ? 'is-open' : ''}`}>
            <a
              href="#how"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('how')
              }}
            >
              How it works
            </a>
            <a
              href="#insights"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('insights')
              }}
            >
              Insights
            </a>
            <a
              href="#access"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('access')
              }}
            >
              Access
            </a>
            <Link
              to="/console"
              className="mobile-login"
              onClick={() => setIsMenuOpen(false)}
            >
              Earth Console
            </Link>
            <button
              type="button"
              className="mobile-login"
              style={{ background: 'none', border: 'none', textAlign: 'left', padding: '13px 0' }}
              onClick={() => {
                setIsMenuOpen(false)
                if (sessionUser) {
                  navigate(`/astronaut/dashboard/${sessionUser.astronautId}`)
                } else {
                  setIsLoginModalOpen(true)
                }
              }}
            >
              {sessionUser ? `Dashboard (${sessionUser.fullName})` : 'Astronaut Login'}
            </button>
          </div>

          <div className="nav-actions">
            <Link to="/console" className="button button-small button-outline">
              <Radio size={14} strokeWidth={2.2} />
              <span>Earth Console</span>
            </Link>

            {sessionUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link
                  to={`/astronaut/dashboard/${sessionUser.astronautId}`}
                  className="button button-small nav-cta"
                >
                  <span>Dashboard ({sessionUser.fullName.split(' ')[0]})</span>
                  <ArrowRight size={15} strokeWidth={2.2} />
                </Link>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="button button-small button-outline"
                    title="Sign Out"
                    style={{ padding: '0 10px' }}
                  >
                    Logout
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="button button-small nav-cta"
                onClick={() => setIsLoginModalOpen(true)}
              >
                <span>Log in</span>
                <ArrowRight size={15} strokeWidth={2.2} />
              </button>
            )}

            <button
              className="menu-button"
              type="button"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      <main id="top">
        {/* 2. HERO SECTION */}
        <section className="hero">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />

          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="status-dot" />
                <span>Deep-space health monitoring</span>
              </div>

              <h1>
                Every heartbeat,<br />
                <em>millions of miles</em><br />
                away.
              </h1>

              <p className="hero-intro">
                AuralMed turns continuous health signals into quiet confidence—for crews in orbit and
                care teams back on Earth.
              </p>

              <div className="hero-actions">
                {sessionUser ? (
                  <Link
                    to={`/astronaut/dashboard/${sessionUser.astronautId}`}
                    className="button"
                  >
                    <span>Launch Astronaut Workstation</span>
                    <ArrowRight size={17} strokeWidth={2.2} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="button"
                    onClick={() => scrollToSection('access')}
                  >
                    <span>Explore astronaut view</span>
                    <ArrowRight size={17} strokeWidth={2.2} />
                  </button>
                )}

                <a
                  className="text-link"
                  href="#how"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection('how')
                  }}
                >
                  <span>See how it works</span>
                  <ArrowRight size={15} strokeWidth={2.2} />
                </a>
              </div>

              <div className="trust-row">
                <span>
                  <Shield size={16} strokeWidth={2.2} />
                  <span>HIPAA-aligned</span>
                </span>
                <span>
                  <Check size={16} strokeWidth={2.5} />
                  <span>Clinician reviewed</span>
                </span>
                <span>
                  <Activity size={16} strokeWidth={2.2} />
                  <span>NASA GeneLab &amp; HRP Validated</span>
                </span>
              </div>
            </div>

            {/* Holographic 3D Interactive Biometric Model */}
            <div className="hero-visual" aria-label="Human health telemetry visualization">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="orbit-dot orbit-dot-one" />
              <div className="orbit-dot orbit-dot-two" />

              <div className="hologram-stage">
                <div className="model-frame">
                  <iframe
                    title="Interactive holographic human model"
                    src="https://sketchfab.com/models/e749bf773cd34e3f965ad23d01b3cf06/embed?autostart=1&camera=0&preload=1&transparent=1&ui_animations=0&ui_controls=0&ui_hint=0&ui_infos=0&ui_inspector=0&ui_stop=0&ui_watermark=0&dnt=1"
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                    allowFullScreen
                  />
                </div>

                <div className="model-glass" aria-hidden="true">
                  <span className="scan-line" />
                  <span className="model-axis axis-x" />
                  <span className="model-axis axis-y" />
                  <span className="model-corner corner-one" />
                  <span className="model-corner corner-two" />
                </div>

                <div className="hologram-readout">
                  <span>LIVE 3D BIOMETRIC MODEL</span>
                  <strong>TRACKING 98.7%</strong>
                </div>
              </div>

              <div className="signal-card signal-heart">
                <span className="signal-icon">
                  <Heart size={14} fill="currentColor" />
                </span>
                <span>
                  <strong>78</strong> bpm
                </span>
              </div>

              <div className="signal-card signal-status">
                <span className="status-dot" />
                <span>Signal stable</span>
              </div>

              <div className="visual-caption">LIVE VITALS · CREW 06 (ORBITAL BASELINE)</div>
            </div>
          </div>

          {/* Metrics 4-Card Strip */}
          <div className="container metrics-grid">
            {METRICS_CARDS.map((metric) => (
              <div className="metric-card" key={metric.label}>
                <div className="metric-top">
                  <span className={`metric-dot ${metric.tone}`} />
                  <span>{metric.label}</span>
                </div>
                <div className="metric-value">
                  {metric.value}
                  {metric.unit && <small>{metric.unit}</small>}
                </div>
                <div className={`metric-line ${metric.tone}`}>
                  <svg viewBox="0 0 120 24" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M1 15h15l5-3 5 5 7-13 7 17 8-9 8 3h12l5-5 6 6 9-3 8 2h23" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. LATENCY COMPARISON SECTION (THE PROBLEM) */}
        <section className="latency-section" id="insights">
          <div className="container latency-grid">
            <div>
              <span className="section-kicker">THE PROBLEM</span>
              <h2>
                Earth can’t answer<br />
                in time.
              </h2>
              <p>
                At interplanetary distance to Mars, electromagnetic signals take up to 25 minutes each way.
                When acute hypoxia, cardiac arrhythmia, or hypercapnia strikes, waiting for Mission Control
                is not an option. Autonomous edge clinical intelligence is mandatory.
              </p>
            </div>

            <div className="latency-bars">
              <div className="latency-label">
                <span>Reply from Earth</span>
                <strong>25+ min latency</strong>
              </div>
              <div className="track">
                <span className="earth-bar" />
              </div>

              <div className="latency-label">
                <span>AuralMed autonomous edge guidance</span>
                <strong>Right away (&lt;1.2s)</strong>
              </div>
              <div className="track">
                <span className="aural-bar" />
              </div>
            </div>
          </div>
        </section>

        {/* 4. PROCESS SECTION (BUILT FOR AUTONOMY) */}
        <section className="process-section" id="how">
          <div className="container">
            <div className="section-heading inverse">
              <span className="section-kicker">BUILT FOR AUTONOMY</span>
              <h2>Read. Predict. Advise.</h2>
              <p>Health intelligence that stays close, even when home is 140 million miles away.</p>
            </div>

            <div className="steps-grid">
              {STEPS_DATA.map((step) => (
                <article className="step-card" key={step.title}>
                  <div className="step-top">
                    <span className="step-icon">
                      {step.icon === 'wave' && <Activity size={18} strokeWidth={2} />}
                      {step.icon === 'pulse' && <Heart size={18} strokeWidth={2} />}
                      {step.icon === 'spark' && <Sparkles size={18} strokeWidth={2} />}
                    </span>
                    <span className="step-number">{step.number}</span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 5. WHOLE-BODY INSIGHT SECTION */}
        <section className="insight-section">
          <div className="container insight-grid">
            <div className="insight-copy">
              <span className="section-kicker">WHOLE-BODY INSIGHT</span>
              <h2>
                Muscle loss,<br />
                measured from motion.
              </h2>
              <p>
                AuralMed learns your movement patterns, detects subtle musculoskeletal deconditioning,
                and turns everyday smart wearable activity into high-impact countermeasures.
              </p>
              <div className="tag-row">
                <span>Daily steps</span>
                <span>Treadmill load</span>
                <span>Strength trend</span>
                <span>Circadian Phase</span>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-head">
                <div>
                  <span>ACTIVITY</span>
                  <h3>Daily steps</h3>
                </div>
                <span className="target-pill">
                  <i /> NASA HRP Target
                </span>
              </div>

              <div className="chart-area">
                <div className="target-line">
                  <span>Target 4,500</span>
                </div>
                <div className="bars">
                  {ACTIVITY_BARS.map((val, idx) => (
                    <div className="bar-wrap" key={idx}>
                      <span className="bar-value">{(val / 10).toFixed(1)}k</span>
                      <div
                        className={`bar ${idx < 2 ? 'green' : ''}`}
                        style={{ height: `${val}%` }}
                      />
                      <span className="bar-day">{DAYS_OF_WEEK[idx]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="recommendation">
                <span>
                  <Sparkles size={17} />
                </span>
                <div>
                  <strong>Today’s recommendation</strong>
                  <p>Add a 45-minute bungee-loaded treadmill session to counteract soleus atrophy.</p>
                </div>
                <ArrowRight size={17} strokeWidth={2.2} />
              </div>
            </div>
          </div>
        </section>

        {/* 6. MISSION ACCESS (DUAL PORTAL ENTRANCES) */}
        <section className="access-section" id="access">
          <div className="container">
            <div className="access-heading">
              <div>
                <span className="section-kicker">MISSION ACCESS</span>
                <h2>
                  Your health view,<br />
                  wherever you are.
                </h2>
              </div>
              <p>
                One connected clinical system, purpose-built for the crew in deep space and the flight
                surgeons monitoring them from Earth.
              </p>
            </div>

            <div className="access-grid">
              {/* PORTAL 1: ASTRONAUT WORKSTATION (CREW VIEW) */}
              <article className="access-card light-card">
                <div className="access-icon">
                  <User size={22} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="card-label">CREW VIEW</span>
                  <h3>Astronaut</h3>
                  <p>
                    Your live wearable vitals, clinical diagnostics, and private autonomous medical decision
                    support in zero-gravity.
                  </p>
                </div>

                {/* Direct 1-Click Crew Quick Pick */}
                <div className="landing-crew-selector">
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>
                    Select Crew Identity:
                  </span>
                  {DEMO_USERS.map((crew) => (
                    <button
                      key={crew.id}
                      type="button"
                      className={`landing-crew-pill ${selectedCrew.id === crew.id ? 'active' : ''}`}
                      onClick={() => handleSelectCrew(crew)}
                    >
                      <div className="landing-crew-info">
                        <span className="landing-crew-name">{crew.name}</span>
                        <span className="landing-crew-role">{crew.role}</span>
                      </div>
                      <span className="landing-crew-id">{crew.astronautId}</span>
                    </button>
                  ))}
                </div>

                {loginError && <div className="landing-modal-error">{loginError}</div>}

                <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '20px' }}>
                  <button
                    type="button"
                    className="button"
                    style={{ flex: 1 }}
                    onClick={handleCrewCardLaunch}
                    disabled={isSubmitting}
                  >
                    <span>
                      {isSubmitting
                        ? 'Authenticating...'
                        : sessionUser
                        ? `Open ${sessionUser.fullName.split(' ')[0]}'s View`
                        : `Open ${selectedCrew.name.split(' ')[0]}'s View`}
                    </span>
                    <ArrowRight size={17} strokeWidth={2.2} />
                  </button>

                  <button
                    type="button"
                    className="button button-outline"
                    onClick={() => setIsLoginModalOpen(true)}
                    title="Sign in with custom credentials"
                  >
                    Custom
                  </button>
                </div>
              </article>

              {/* PORTAL 2: EARTH MISSION CONTROL (GROUND VIEW) */}
              <article className="access-card dark-card">
                <div className="access-icon">
                  <Radio size={22} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="card-label">GROUND VIEW</span>
                  <h3>Earth monitor</h3>
                  <p>
                    The mission-wide picture for flight surgeons: real-time wearable telemetry streams,
                    latency-compensated advisories, and clinical triage.
                  </p>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '16px',
                    width: '100%',
                    marginTop: '20px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#38bdf8',
                      fontSize: '12px',
                      fontWeight: '700',
                    }}
                  >
                    <Activity size={14} />
                    <span>Active Telemetry Hub: Mission Control Room 3</span>
                  </div>
                  <p
                    style={{
                      fontSize: '11.5px',
                      color: '#94a3b8',
                      marginTop: '6px',
                      lineHeight: '1.5',
                    }}
                  >
                    Full-crew multi-astronaut bio-telemetry matrix, ECG inspection, Bluetooth device
                    pairing probes, and closed-loop flight surgeon advisories.
                  </p>
                </div>

                <Link
                  to="/console"
                  className="button button-light"
                  style={{ width: '100%', marginTop: 'auto' }}
                >
                  <span>Open Earth monitor</span>
                  <ArrowRight size={17} strokeWidth={2.2} />
                </Link>
              </article>
            </div>
          </div>
        </section>
      </main>

      {/* 7. QUICK ASTRONAUT LOGIN MODAL OVERLAY */}
      {isLoginModalOpen && (
        <div
          className="landing-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLoginModalOpen(false)
          }}
        >
          <div className="landing-modal-card">
            <button
              type="button"
              className="landing-modal-close"
              onClick={() => setIsLoginModalOpen(false)}
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            <div className="landing-modal-header">
              <h3>Astronaut Workstation Sign In</h3>
              <p>Select a crew profile or enter flight credentials to access the workstation.</p>
            </div>

            {loginError && <div className="landing-modal-error">{loginError}</div>}

            <div className="landing-modal-crew-list">
              {DEMO_USERS.map((crew) => (
                <button
                  key={crew.id}
                  type="button"
                  className={`landing-crew-pill ${customUsername === crew.username ? 'active' : ''}`}
                  onClick={() => handleSelectCrew(crew)}
                >
                  <div className="landing-crew-info">
                    <span className="landing-crew-name">{crew.name}</span>
                    <span className="landing-crew-role">{crew.role}</span>
                  </div>
                  <span className="landing-crew-id">{crew.astronautId}</span>
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleExecuteLogin(customUsername, customPassword)
              }}
            >
              <div className="landing-modal-field">
                <label htmlFor="modal-username">Flight Username</label>
                <input
                  id="modal-username"
                  type="text"
                  className="landing-modal-input"
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value)}
                  required
                />
              </div>

              <div className="landing-modal-field">
                <label htmlFor="modal-password">Security Passcode</label>
                <input
                  id="modal-password"
                  type="password"
                  className="landing-modal-input"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="button landing-modal-submit"
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Open Health Workstation'}</span>
                <ArrowRight size={16} strokeWidth={2.2} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 8. FOOTER */}
      <footer>
        <div className="container footer-inner">
          <a
            className="brand"
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            <span className="brand-mark">
              <svg
                aria-hidden="true"
                fill="none"
                height="18"
                viewBox="0 0 24 24"
                width="18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              >
                <path d="M3 12h4l2-6 4 12 2-6h6" />
              </svg>
            </span>
            <span>AuralMed</span>
          </a>

          <p>Human insight, wherever humans go.</p>
          <span>NASA Deep-Space Telemedicine Concept · 2025</span>
        </div>
      </footer>
    </div>
  )
}
