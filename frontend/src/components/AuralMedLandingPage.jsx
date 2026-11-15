import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Dna,
  Heart,
  Info,
  Menu,
  Radio,
  Shield,
  Sparkles,
  Stethoscope,
  User,
  Watch,
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
    focus: 'Circadian stability & cardiovascular deconditioning',
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
    focus: 'Deep-space radiation immunology & bone density',
  },
]

const LIVE_VITALS_PREVIEW = [
  { value: '78', unit: 'bpm', label: 'Heart Rate (Pulse Telemetry)', source: 'Oraimo Watch 2 Pro (GATT Stream)', tone: 'mint' },
  { value: '98', unit: '% SpO2', label: 'Blood Oxygen (Oximetry)', source: 'Oraimo Optical Sensor Strap', tone: 'blue' },
  { value: '6,840', unit: 'steps', label: 'Mechanical Footfall Strides', source: 'Live Tri-Axial Accelerometer', tone: 'amber' },
  { value: '36.8°', unit: 'C', label: 'Core Body Temperature', source: 'Spacecraft Medical Radio Capsule', tone: 'violet' },
]

const AUTONOMY_PILLARS = [
  {
    number: '01',
    icon: 'wave',
    title: 'Continuous Read',
    copy: 'Live Web Bluetooth GATT telemetry ingests wrist PPG pulse and tri-axial acceleration every 2 seconds without cloud dependencies.',
  },
  {
    number: '02',
    icon: 'pulse',
    title: 'Autonomous Predict',
    copy: 'Onboard algorithms compare biometrics against personalized astronaut baselines, detecting early hypoxia, space fever, or osteopenia trends.',
  },
  {
    number: '03',
    icon: 'spark',
    title: 'Clinical Advise',
    copy: 'Contextual NASA clinical decision support delivers immediate pharmacological guidance and countermeasure adjustments inside the habitat.',
  },
]

const SENSOR_CATEGORIES = [
  {
    badgeClass: 'badge-watch',
    badgeText: 'Live Smart Wearable (Web Bluetooth GATT)',
    icon: Watch,
    title: 'Smart Watch & Sensor Strap',
    desc: 'Real-time physiological telemetry streamed directly to the browser from the astronaut’s Oraimo Watch 2 Pro via BLE GATT Service 16186f00 without cloud hops.',
    items: [
      { name: 'Heart Rate (Pulse Telemetry)', desc: 'Continuous optical PPG pulse sensor (60–100 bpm baseline).' },
      { name: 'Mechanical Impact Steps', desc: 'Tri-axial accelerometer tracking Wolff’s Law skeletal loading (Target: 6,000+ daily steps to prevent osteopenia).' },
      { name: 'Sleep Duration & Wrist Actigraphy', desc: 'Nocturnal micro-movement tracking circadian disruption in 16 sunrises/day orbit.' },
    ],
  },
  {
    badgeClass: 'badge-spacecraft',
    badgeText: 'Habitat Diagnostic Hardware',
    icon: Stethoscope,
    title: 'Spacecraft Medical Locker',
    desc: 'Diagnostic equipment stored in Bulkhead Medical Locker 3, logged during scheduled morning flight clinical protocols.',
    items: [
      { name: 'Blood Pressure Perfusion', desc: 'Pneumatic oscillometric brachial cuff (120/80 mmHg nominal) monitoring cephalad fluid shifts.' },
      { name: 'Core Body Temperature', desc: 'Tympanic IR / radio capsule monitoring persistent zero-g circadian elevation (“space fever”).' },
      { name: 'Thoracic Respiration Rate', desc: 'Bio-impedance strap detecting hypercapnia and CO2 bubble accumulation during sleep berth rest.' },
      { name: 'Galley Nutrition & Hydration', desc: 'RFID barcode scanner tracking caloric intake (2,840 kcal) and volumetric fluid intake (2.4 L).' },
    ],
  },
  {
    badgeClass: 'badge-nasa',
    badgeText: 'NASA GeneLab & HRP Protocols',
    icon: Dna,
    title: 'Deep-Space Biomarkers & Omics',
    desc: 'Biomarker surveillance grounded in NASA GeneLab Open Science Data and NASA Human Research Program deep-space flight investigations.',
    items: [
      { name: 'Salivary Cortisol (Neuroendocrine Stress)', desc: 'NASA HRP Salivette swab protocol (Nominal: 10–22 nmol/L) monitoring HPA-axis stress response.' },
      { name: 'Latent Viral Reactivation (EBV / VZV)', desc: 'NASA GeneLab Dataset OSDR-379 protocol tracking dormant herpesviruses reactivated by cosmic radiation.' },
      { name: 'T-Cell Ratio (CD4+ / CD8+)', desc: 'Microfluidic leukocyte surface marker assessment detecting space radiation-induced immunosuppression.' },
    ],
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
        throw new Error('Incorrect flight credentials. Please try again.')
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
      {/* 1. MINIMALIST 100% NAVIGATION HEADER */}
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
              <svg
                aria-hidden="true"
                fill="none"
                height="18"
                viewBox="0 0 24 24"
                width="18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.4"
              >
                <path d="M3 12h4l2-6 4 12 2-6h6" />
              </svg>
            </span>
            <span>Aura-med</span>
            <span className="brand-caption">NASA Autonomous Health Workstation</span>
          </a>

          <div className={`nav-links ${isMenuOpen ? 'is-open' : ''}`}>
            <a
              href="#sources"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('sources')
              }}
            >
              NASA Data Sources
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
              Interplanetary Latency
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
        {/* 2. 100% FULL-WIDTH HERO SECTION */}
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="status-dot" />
                <span>NASA Human Research Program · Autonomous Telemedicine</span>
              </div>

              <h1>
                Autonomous health intelligence,<br />
                <em>140 million miles</em><br />
                from Earth.
              </h1>

              <p className="hero-intro">
                Aura-med pairs real-time smart wearable biometrics with autonomous edge clinical reasoning—protecting
                astronauts during deep-space transit to Mars when speed-of-light communication delays make
                real-time Earth medical support impossible.
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
                  <span>NASA Data Sourcing &amp; Science</span>
                  <ArrowRight size={14} strokeWidth={2.2} />
                </a>
              </div>

              <div className="trust-row">
                <span>
                  <Watch size={15} strokeWidth={2.2} />
                  <span>Direct Web Bluetooth Telemetry</span>
                </span>
                <span>
                  <Dna size={15} strokeWidth={2.2} />
                  <span>NASA GeneLab OSDR-379 Validated</span>
                </span>
                <span>
                  <CheckCircle2 size={15} strokeWidth={2.2} />
                  <span>NASA HRP Medical Protocols</span>
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
                  <span>AURA-MED EDGE ENGINE</span>
                  <strong>TELEMETRY ACTIVE · 0.00g</strong>
                </div>
              </div>

              <div className="signal-card signal-heart">
                <span className="signal-icon">
                  <Heart size={13} fill="currentColor" />
                </span>
                <span>
                  <strong>78</strong> bpm · Live PPG
                </span>
              </div>

              <div className="signal-card signal-status">
                <span className="status-dot" />
                <span>GATT Stream Stable</span>
              </div>

              <div className="visual-caption">AURA-MED MISSION MEDICAL TELEMETRY · CREW 06 BASELINE</div>
            </div>
          </div>

          {/* 4-Card Live Vitals Metric Strip */}
          <div className="container metrics-grid">
            {LIVE_VITALS_PREVIEW.map((metric) => (
              <div className="metric-card" key={metric.label}>
                <div className="metric-top">
                  <span className={`metric-dot ${metric.tone}`} />
                  <span>{metric.label}</span>
                </div>
                <div className="metric-value">
                  {metric.value}
                  {metric.unit && <small>{metric.unit}</small>}
                </div>
                <div className="metric-source-tag">
                  <Watch size={11} />
                  <span>{metric.source}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. DEDICATED NASA DATA SOURCING & TELEMETRY MATRIX (FACTUAL BREAKDOWN) */}
        <section className="sources-section" id="sources">
          <div className="container">
            <span className="section-kicker">DATA ORIGINS &amp; SENSOR MATRIX</span>
            <h2>Where our clinical data comes from.</h2>
            <p>
              Aura-med strictly distinguishes between biometrics captured continuously by the smart watch,
              hardware diagnostic telemetry measured inside the habitat locker, and deep-space biomarkers
              derived from peer-reviewed NASA research archives.
            </p>

            <div className="sources-grid">
              {SENSOR_CATEGORIES.map((cat) => {
                const CatIcon = cat.icon
                return (
                  <article className="source-card" key={cat.title}>
                    <span className={`source-badge ${cat.badgeClass}`}>
                      <CatIcon size={12} strokeWidth={2.4} />
                      <span>{cat.badgeText}</span>
                    </span>
                    <h3>{cat.title}</h3>
                    <p className="source-desc">{cat.desc}</p>

                    <div className="source-metrics-list">
                      {cat.items.map((item) => (
                        <div className="source-item" key={item.name}>
                          <Check size={14} className="text-emerald-500" style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
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
          </div>
        </section>

        {/* 4. INTERPLANETARY LATENCY SECTION (SPEED-OF-LIGHT DELAY) */}
        <section className="latency-section" id="latency">
          <div className="container latency-grid">
            <div>
              <span className="section-kicker">THE INTERPLANETARY DELAY</span>
              <h2>
                Earth can’t answer<br />
                in time.
              </h2>
              <p>
                During deep-space transit to Mars, radio signals traveling at the speed of light require
                between 4 and 24 minutes one-way (up to 48-minute round-trip).
                In acute hypoxic emergencies, arrhythmias, or toxic CO2 pooling, waiting for Houston
                flight surgeons is not viable. Aura-med provides autonomous onboard clinical decision
                support right inside the habitat.
              </p>
            </div>

            <div className="latency-bars">
              <div className="latency-label">
                <span>Houston Flight Surgeon Advice (Speed of Light)</span>
                <strong>25+ min comms delay</strong>
              </div>
              <div className="track">
                <span className="earth-bar" />
              </div>

              <div className="latency-label">
                <span>Aura-med Autonomous Onboard Guidance</span>
                <strong>Instant (&lt; 1.2s edge inference)</strong>
              </div>
              <div className="track">
                <span className="aural-bar" />
              </div>
            </div>
          </div>
        </section>

        {/* 5. CLOSED-LOOP TELEMEDICINE (BUILT FOR AUTONOMY) */}
        <section className="process-section" id="how">
          <div className="container">
            <div className="section-heading inverse">
              <span className="section-kicker">CLOSED-LOOP TELEMEDICINE</span>
              <h2>Read. Predict. Advise.</h2>
              <p>Clinical intelligence that operates continuously, even when Earth is 140 million miles away.</p>
            </div>

            <div className="steps-grid">
              {AUTONOMY_PILLARS.map((step) => (
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

        {/* 6. WHOLE-BODY COUNTERMEASURE INSIGHT */}
        <section className="insight-section">
          <div className="container insight-grid">
            <div className="insight-copy">
              <span className="section-kicker">MUSCULOSKELETAL COUNTERMEASURES</span>
              <h2>
                Muscle loss,<br />
                countered by motion.
              </h2>
              <p>
                In zero-gravity, Wolff’s Law dictates rapid bone mineral density leaching (1.0–1.5% loss per month)
                and soleus muscle atrophy. Aura-med continuously tracks live mechanical footfall strides from the
                Oraimo wearable, detects exertion deficits, and automatically prescribes countermeasure workouts.
              </p>
              <div className="tag-row">
                <span>Wolff's Law Mechanical Loading</span>
                <span>T2 Resistance Treadmill</span>
                <span>Osteopenia Prevention</span>
                <span>Circadian Phase</span>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-head">
                <div>
                  <span>ACTIVITY LOADING</span>
                  <h3>Daily Stride Steps</h3>
                </div>
                <span className="target-pill">
                  <i /> NASA HRP Target: 6,000+
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
                  <Sparkles size={16} />
                </span>
                <div>
                  <strong>Today’s Autonomous Countermeasure Prescription</strong>
                  <p>Add a 45-minute bungee-loaded resistance treadmill session (T2) to sustain bone density.</p>
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
                <span className="section-kicker">MISSION ACCESS</span>
                <h2>
                  Two portals.<br />
                  One unified system.
                </h2>
              </div>
              <p>
                A connected clinical network: simplified self-monitoring for astronauts living in microgravity,
                and comprehensive telemetry inspection for flight surgeons monitoring from Earth.
              </p>
            </div>

            <div className="access-grid">
              {/* PORTAL 1: ASTRONAUT WORKSTATION (CREW VIEW) */}
              <article className="access-card light-card">
                <div className="access-icon">
                  <User size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="card-label">CREW VIEW</span>
                  <h3>Astronaut Health Desk</h3>
                  <p>
                    Clean, simplified vitals self-monitoring with live smart watch telemetry, collapsible
                    clinical diagnostics, deep-space biomarkers, and immediate clinical SOPs.
                  </p>
                </div>

                {/* 1-Click Crew Quick Pick */}
                <div className="landing-crew-selector">
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>
                    Select Astronaut Flight Profile:
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
                        ? 'Authenticating...'
                        : sessionUser
                        ? `Open ${sessionUser.fullName.split(' ')[0]}'s View`
                        : `Sign In as ${selectedCrew.name.split(' ')[0]}`}
                    </span>
                    <ArrowRight size={15} strokeWidth={2.2} />
                  </button>

                  <button
                    type="button"
                    className="button button-outline"
                    onClick={() => setIsLoginModalOpen(true)}
                    title="Sign in with custom flight credentials"
                  >
                    Custom
                  </button>
                </div>
              </article>

              {/* PORTAL 2: EARTH MISSION CONTROL (GROUND VIEW) */}
              <article className="access-card dark-card">
                <div className="access-icon">
                  <Radio size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="card-label">GROUND VIEW</span>
                  <h3>Earth Watch Console</h3>
                  <p>
                    Full-fleet bio-telemetry matrix for flight surgeons at Houston Mission Control: 8 clinical
                    gauges, Bluetooth pairing probes, habitat life support monitoring, and doctor advisories.
                  </p>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '14px',
                    width: '100%',
                    marginTop: '18px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#38bdf8',
                      fontSize: '11.5px',
                      fontWeight: '700',
                    }}
                  >
                    <Activity size={13} />
                    <span>Active Telemetry Hub: Mission Control Room 3</span>
                  </div>
                  <p
                    style={{
                      fontSize: '11px',
                      color: '#94a3b8',
                      marginTop: '4px',
                      lineHeight: '1.5',
                    }}
                  >
                    Continuous multi-astronaut telemetry feed, flight phase tracking, closed-loop Houston advisories,
                    and clinical triage with simulated 12m 44s speed-of-light radio delay.
                  </p>
                </div>

                <Link
                  to="/console"
                  className="button button-light"
                  style={{ width: '100%', marginTop: 'auto' }}
                >
                  <span>Open Earth Monitor Console</span>
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
              <svg
                aria-hidden="true"
                fill="none"
                height="16"
                viewBox="0 0 24 24"
                width="16"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.4"
              >
                <path d="M3 12h4l2-6 4 12 2-6h6" />
              </svg>
            </span>
            <span>Aura-med</span>
          </a>

          <p>NASA Autonomous Deep-Space Health Workstation · Artemis Mars Transit Simulation</p>
          <span>Grounded in NASA GeneLab OSDR-379 &amp; NASA HRP Protocols</span>
        </div>
      </footer>
    </div>
  )
}
