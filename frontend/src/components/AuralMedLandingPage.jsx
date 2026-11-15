import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  Check,
  Database,
  FlaskConical,
  HeartPulse,
  Menu,
  Radio,
  Satellite,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  Watch,
  Waves,
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
    focus: 'Heart health & sleep rhythm in space',
  },
  {
    id: 2,
    astronautId: 'A-2056',
    username: 'danielortiz',
    password: 'mission-2056',
    name: 'Daniel Ortiz',
    role: 'Medical & Systems Officer',
    focus: 'Daily workouts & muscle strength',
  },
  {
    id: 3,
    astronautId: 'A-2089',
    username: 'priyashah',
    password: 'mission-2089',
    name: 'Priya Shah',
    role: 'Science Specialist',
    focus: 'Immune defense & bone strength',
  },
]

const HOW_IT_WORKS = [
  {
    number: '01',
    icon: 'waves',
    title: 'Track Vitals',
    copy: 'Collects heart rate, footsteps, and sleep directly from the watch every 2 seconds—no internet or cloud required.',
  },
  {
    number: '02',
    icon: 'shield',
    title: 'Spot Warning Signs',
    copy: 'Compares current readings against your personal healthy baseline to notice low oxygen, fever, or fatigue early.',
  },
  {
    number: '03',
    icon: 'sparkles',
    title: 'Get Clear Guidance',
    copy: 'Gives astronauts simple, step-by-step health suggestions, medicine reminders, and daily workout tweaks.',
  },
]

const SENSOR_CATEGORIES = [
  {
    badgeClass: 'badge-watch',
    badgeText: 'Smart Watch',
    icon: Watch,
    title: 'From the Oraimo Watch',
    desc: 'Streams straight from your wrist to the screen over Bluetooth. Completely private and works 100% offline.',
    items: [
      { name: 'Heart Rate', desc: 'Continuous pulse monitoring to track how your heart adapts to zero gravity.' },
      { name: 'Daily Movement', desc: 'Steps and activity counts to keep your bones and muscles strong.' },
      { name: 'Sleep & Rest', desc: 'Tracks sleep duration and rest quality during deep-space travel.' },
    ],
  },
  {
    badgeClass: 'badge-spacecraft',
    badgeText: 'Cabin Equipment',
    icon: Stethoscope,
    title: 'From the Medical Locker',
    desc: 'Standard medical tools kept on board for daily check-ups and morning routines.',
    items: [
      { name: 'Blood Pressure', desc: 'Arm cuff measurements to check circulation and blood flow.' },
      { name: 'Body Temperature', desc: 'Quick ear thermometer checks to watch for fever or overheating.' },
      { name: 'Breathing Rate', desc: 'Breaths per minute to make sure cabin air is fresh and safe.' },
      { name: 'Meals & Hydration', desc: 'Logging daily food intake and water balance.' },
    ],
  },
  {
    badgeClass: 'badge-nasa',
    badgeText: 'NASA Science',
    icon: FlaskConical,
    title: 'From NASA Flight Studies',
    desc: 'Health guidelines and safe ranges backed by published NASA space medicine research.',
    items: [
      { name: 'Stress Hormone (Cortisol)', desc: 'Saliva swab tests that measure physical strain and mental stress.' },
      { name: 'Immune Defense', desc: 'Checks that dormant childhood viruses stay inactive during long flights.' },
      { name: 'T-Cell Health', desc: 'Monitors immune cell strength to keep you protected in deep space.' },
    ],
  },
]

const ACTIVITY_BARS = [74, 72, 61, 50, 42, 36, 43]
const DAYS_OF_WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function AuralMedLandingPage({
  sessionUser,
  onAuthenticated,
  onLogout,
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
        throw new Error('Incorrect credentials. Please try again.')
      }

      const user = await response.json()
      if (onAuthenticated) onAuthenticated(user)
      setIsLoginModalOpen(false)
      navigate(`/astronaut/dashboard/${user.astronautId}`)
    } catch (err) {
      setLoginError(err.message || 'Authentication failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCrewCardLaunch = () => {
    if (sessionUser) {
      navigate(`/astronaut/dashboard/${sessionUser.astronautId}`)
      return
    }
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
      {/* 1. SOLID, MINIMALIST NAVIGATION HEADER */}
      <header className="nav-wrap">
        <nav className="nav container" aria-label="Primary navigation">
          <a
            className="brand"
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            aria-label="Aura-med home"
          >
            <span className="brand-mark">
              <HeartPulse size={18} strokeWidth={2.4} />
            </span>
            <span>Aura-med</span>
            <span className="brand-caption">Autonomous Health Workstation</span>
          </a>

          <div className={`nav-links ${isMenuOpen ? 'is-open' : ''}`}>
            <a
              href="#sources"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('sources')
              }}
            >
              Data Sources
            </a>
            <a
              href="#how"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('how')
              }}
            >
              How It Works
            </a>
            <a
              href="#latency"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('latency')
              }}
            >
              Earth Delay
            </a>
            <a
              href="#access"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('access')
              }}
            >
              Mission Portals
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
              style={{ background: 'none', border: 'none', textAlign: 'left', padding: '12px 0' }}
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
                  <ArrowRight size={14} strokeWidth={2.2} />
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
                <span>Astronaut Log in</span>
                <ArrowRight size={14} strokeWidth={2.2} />
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
        {/* 2. 100% FULL-WIDTH HERO SECTION (CLEAN, JARGON-FREE) */}
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <ShieldCheck size={14} color="#315cff" strokeWidth={2.4} />
                <span>NASA Human Research Program · Autonomous Health System</span>
              </div>

              <h1>
                Instant health guidance,<br />
                <em>140 million miles</em><br />
                from Earth.
              </h1>

              <p className="hero-intro">
                Aura-med connects directly to the astronaut’s smart watch to monitor vitals and give
                instant medical advice—keeping the crew safe when Earth is too far away to help in time.
              </p>

              <div className="hero-actions">
                {sessionUser ? (
                  <Link
                    to={`/astronaut/dashboard/${sessionUser.astronautId}`}
                    className="button"
                  >
                    <span>Launch Astronaut Workstation</span>
                    <ArrowRight size={16} strokeWidth={2.2} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="button"
                    onClick={() => scrollToSection('access')}
                  >
                    <span>Explore Astronaut View</span>
                    <ArrowRight size={16} strokeWidth={2.2} />
                  </button>
                )}

                <a
                  className="text-link"
                  href="#sources"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection('sources')
                  }}
                >
                  <span>See Where Data Comes From</span>
                  <ArrowRight size={14} strokeWidth={2.2} />
                </a>
              </div>

              <div className="trust-row">
                <span>
                  <Watch size={15} strokeWidth={2.2} />
                  <span>Direct Smart Watch Link</span>
                </span>
                <span>
                  <FlaskConical size={15} strokeWidth={2.2} />
                  <span>NASA Flight Research</span>
                </span>
                <span>
                  <ShieldCheck size={15} strokeWidth={2.2} />
                  <span>Tested Medical Guidelines</span>
                </span>
              </div>
            </div>

            {/* 3D Holographic Stage with Clean Solid Signal Badges (0 Colored Dots) */}
            <div className="hero-visual" aria-label="3D human health model">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />

              <div className="hologram-stage">
                <div className="model-frame">
                  <iframe
                    title="Interactive holographic human biometric model"
                    src="https://sketchfab.com/models/e749bf773cd34e3f965ad23d01b3cf06/embed?autostart=1&camera=0&preload=1&transparent=1&ui_animations=0&ui_controls=0&ui_hint=0&ui_infos=0&ui_inspector=0&ui_stop=0&ui_watermark=0&dnt=1"
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                    allowFullScreen
                  />
                </div>

                <div className="model-glass" aria-hidden="true">
                  <span className="scan-line" />
                  <span className="model-corner corner-one" />
                  <span className="model-corner corner-two" />
                </div>

                <div className="hologram-readout">
                  <span>AURA-MED ONBOARD SYSTEM</span>
                  <strong>VITALS MONITOR ACTIVE</strong>
                </div>
              </div>

              {/* Solid shaped signal badges (NO colored dots, crisp Lucide icons) */}
              <div className="signal-card signal-heart">
                <span className="signal-icon">
                  <HeartPulse size={15} strokeWidth={2.4} />
                </span>
                <span>
                  <strong>78</strong> bpm · Resting Heart Rate
                </span>
              </div>

              <div className="signal-card signal-status">
                <span className="signal-icon signal-icon-mint">
                  <Watch size={15} strokeWidth={2.2} />
                </span>
                <span>Oraimo Watch Connected</span>
              </div>

              <div className="visual-caption">AURA-MED CREW HEALTH MONITOR</div>
            </div>
          </div>
        </section>

        {/* 3. DEDICATED DATA SOURCING MATRIX (FACTUAL & SIMPLE) */}
        <section className="sources-section" id="sources">
          <div className="container">
            <span className="section-kicker">DATA SOURCES</span>
            <h2>Where your health data comes from.</h2>
            <p>
              Aura-med keeps things simple and honest: some numbers come live from your watch,
              some come from cabin medical tools, and our guidelines are built on NASA flight research.
            </p>

            <div className="sources-grid">
              {SENSOR_CATEGORIES.map((cat) => {
                const CatIcon = cat.icon
                return (
                  <article className="source-card" key={cat.title}>
                    <span className={`source-badge ${cat.badgeClass}`}>
                      <CatIcon size={14} strokeWidth={2.4} />
                      <span>{cat.badgeText}</span>
                    </span>
                    <h3>{cat.title}</h3>
                    <p className="source-desc">{cat.desc}</p>

                    <div className="source-metrics-list">
                      {cat.items.map((item) => (
                        <div className="source-item" key={item.name}>
                          <span className="source-check-icon">
                            <Check size={11} strokeWidth={2.8} />
                          </span>
                          <div>
                            <strong>{item.name}: </strong>
                            <span>{item.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                )
              })}
            </div>

            {/* Small note after the 3 cards specifying NASA HRP and NASA OSDR */}
            <div className="sources-citation-note">
              <div className="sources-citation-inner">
                <span className="sources-citation-pill">
                  <Database size={13} strokeWidth={2.4} />
                  <span>NASA Research Data</span>
                </span>
                <p className="sources-citation-text">
                  Flight health guidelines, diagnostic thresholds, and spaceflight baselines are sourced directly from the{' '}
                  <strong>NASA HRP (Human Research Program)</strong> and the{' '}
                  <strong>NASA OSDR (Open Science Data Repository)</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. COMMUNICATION DELAY (SPEED-OF-LIGHT DELAY) */}
        <section className="latency-section" id="latency">
          <div className="container latency-grid">
            <div>
              <span className="section-kicker">COMMUNICATION DELAY</span>
              <h2>
                Earth is too far<br />
                to reply in time.
              </h2>
              <p>
                On a journey to Mars, radio signals take between 4 and 24 minutes to travel each way.
                In an emergency, astronauts cannot wait up to 48 minutes for Houston to answer.
                Aura-med runs completely on board, giving instant answers in under a second.
              </p>
            </div>

            <div className="latency-bars">
              <div className="latency-label">
                <span>Radio message to Mission Control on Earth</span>
                <strong>25+ min delay</strong>
              </div>
              <div className="track">
                <span className="earth-bar" />
              </div>

              <div className="latency-label">
                <span>Aura-med on-board guidance</span>
                <strong>Instant (&lt; 1 sec)</strong>
              </div>
              <div className="track">
                <span className="aural-bar" />
              </div>
            </div>
          </div>
        </section>

        {/* 5. HOW IT WORKS (SIMPLE & SOLID) */}
        <section className="process-section" id="how">
          <div className="container">
            <div className="section-heading inverse">
              <span className="section-kicker">HOW IT WORKS</span>
              <h2>Track. Understand. Guide.</h2>
              <p>A complete health cycle that runs continuously, with or without a connection to Earth.</p>
            </div>

            <div className="steps-grid">
              {HOW_IT_WORKS.map((step) => (
                <article className="step-card" key={step.title}>
                  <div className="step-top">
                    <span className="step-icon">
                      {step.icon === 'waves' && <Waves size={20} strokeWidth={2.2} />}
                      {step.icon === 'shield' && <ShieldCheck size={20} strokeWidth={2.2} />}
                      {step.icon === 'sparkles' && <Sparkles size={20} strokeWidth={2.2} />}
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

        {/* 6. DAILY EXERCISE & MUSCLE HEALTH */}
        <section className="insight-section">
          <div className="container insight-grid">
            <div className="insight-copy">
              <span className="section-kicker">DAILY EXERCISE</span>
              <h2>
                Protecting muscles<br />
                and bones in space.
              </h2>
              <p>
                Without gravity pulling on the body, bones weaken and muscles lose tone quickly without
                daily loading. Aura-med tracks your daily steps from the watch, spots activity drops,
                and suggests the right workouts to keep you fit.
              </p>
              <div className="tag-row">
                <span>Bone Strength</span>
                <span>Treadmill Runs</span>
                <span>Muscle Retention</span>
                <span>Sleep Rhythm</span>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-head">
                <div>
                  <span>ACTIVITY TRACKER</span>
                  <h3>Daily Step Count</h3>
                </div>
                <span className="target-pill">
                  <Activity size={13} strokeWidth={2.4} />
                  <span>Goal: 6,000+ steps</span>
                </span>
              </div>

              <div className="chart-area">
                <div className="target-line">
                  <span>Target 6,000</span>
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
                  <Sparkles size={16} strokeWidth={2.2} />
                </span>
                <div>
                  <strong>Today’s Recommended Workout</strong>
                  <p>Add a 45-minute treadmill session with resistance bungees to keep your bones strong.</p>
                </div>
                <ArrowRight size={16} strokeWidth={2.2} />
              </div>
            </div>
          </div>
        </section>

        {/* 7. MISSION ACCESS (DUAL PORTALS) */}
        <section className="access-section" id="access">
          <div className="container">
            <div className="access-heading">
              <div>
                <span className="section-kicker">MISSION PORTALS</span>
                <h2>
                  Two views.<br />
                  One connected system.
                </h2>
              </div>
              <p>
                Designed specifically for astronauts living in space and flight doctors monitoring from Earth.
              </p>
            </div>

            <div className="access-grid">
              {/* PORTAL 1: ASTRONAUT VIEW */}
              <article className="access-card light-card">
                <div className="access-icon">
                  <User size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="card-label">ASTRONAUT VIEW</span>
                  <h3>Astronaut Health Desk</h3>
                  <p>
                    A private, distraction-free screen to check your vitals, view daily workout targets,
                    and follow health advice.
                  </p>
                </div>

                {/* 1-Click Crew Quick Pick */}
                <div className="landing-crew-selector">
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>
                    Select an astronaut profile:
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
                        <span className="landing-crew-role">{crew.role} · {crew.focus}</span>
                      </div>
                      <span className="landing-crew-id">{crew.astronautId}</span>
                    </button>
                  ))}
                </div>

                {loginError && <div className="landing-modal-error">{loginError}</div>}

                <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '18px' }}>
                  <button
                    type="button"
                    className="button"
                    style={{ flex: 1 }}
                    onClick={handleCrewCardLaunch}
                    disabled={isSubmitting}
                  >
                    <span>
                      {isSubmitting
                        ? 'Logging in...'
                        : sessionUser
                        ? `Open ${sessionUser.fullName.split(' ')[0]}'s View`
                        : `Launch ${selectedCrew.name.split(' ')[0]}'s Desk`}
                    </span>
                    <ArrowRight size={15} strokeWidth={2.2} />
                  </button>

                  <button
                    type="button"
                    className="button button-outline"
                    onClick={() => setIsLoginModalOpen(true)}
                    title="Sign in with custom credentials"
                  >
                    Custom Login
                  </button>
                </div>
              </article>

              {/* PORTAL 2: MISSION CONTROL VIEW */}
              <article className="access-card dark-card">
                <div className="access-icon">
                  <Radio size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="card-label">MISSION CONTROL VIEW</span>
                  <h3>Earth Monitoring Console</h3>
                  <p>
                    A fleet dashboard for doctors in Houston to monitor crew vitals, review trends,
                    and send non-urgent advice.
                  </p>
                </div>

                <div className="earth-console-callout">
                  <div className="earth-callout-header">
                    <Satellite size={14} strokeWidth={2.2} />
                    <span>Live Ground Station Feed · Houston Room 3</span>
                  </div>
                  <p className="earth-callout-copy">
                    Continuous crew telemetry, mission timeline, and medical records with simulated speed-of-light radio delay.
                  </p>
                </div>

                <Link
                  to="/console"
                  className="button button-light"
                  style={{ width: '100%', marginTop: 'auto' }}
                >
                  <span>Open Earth Console</span>
                  <ArrowRight size={15} strokeWidth={2.2} />
                </Link>
              </article>
            </div>
          </div>
        </section>
      </main>

      {/* 8. QUICK ASTRONAUT LOGIN MODAL OVERLAY */}
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
              <X size={16} />
            </button>

            <div className="landing-modal-header">
              <h3>Astronaut Workstation Sign In</h3>
              <p>Select a crew profile or enter credentials to launch the health desk.</p>
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
                <label htmlFor="modal-username">Username</label>
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
                <label htmlFor="modal-password">Password</label>
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
                <span>{isSubmitting ? 'Logging in...' : 'Open Health Workstation'}</span>
                <ArrowRight size={15} strokeWidth={2.2} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 9. MINIMALIST FOOTER */}
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
              <HeartPulse size={16} strokeWidth={2.4} />
            </span>
            <span>Aura-med</span>
          </a>

          <p>Autonomous Deep-Space Health Workstation · Artemis Mars Transit</p>
          <span>Built with NASA Open Science &amp; Clinical Protocols</span>
        </div>
      </footer>
    </div>
  )
}
