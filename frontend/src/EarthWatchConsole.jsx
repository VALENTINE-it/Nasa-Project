import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  Clock,
  FlaskConical,
  Globe,
  LogOut,
  Radio,
  RotateCcw,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
  Watch,
  Wind,
  Zap,
} from 'lucide-react'
import {
  TopBar,
  SectionTabs,
  StatusStrip,
  Button,
  SegmentedControl,
  Alert,
  StatusChip,
  MeterBar,
  EcgTrace,
  Accordion,
} from './ui'
import './EarthWatchConsole.css'

const CREW_PROFILES = [
  {
    id: 1,
    astronautId: 'Crew #1',
    fullName: 'Elena Park',
    role: 'Mission Commander',
    avatarUrl: '/avatars/astronaut-1.svg',
    mission: 'Artemis Mars Flight',
    healthStatus: 'Healthy & Normal',
    statusClass: 'good',
    wearableSource: 'Oraimo Smart Watch Linked',
    baseline: {
      preFlight: { hr: 68, bp: '118/76', o2: 99, temp: 36.6, resp: 14, sleep: 7.8, fatigue: 15, immune: 8 },
      inSpace: { hr: 78, bp: '124/80', o2: 98, temp: 36.8, resp: 16, sleep: 6.4, fatigue: 38, immune: 24 },
      surface: { hr: 92, bp: '132/86', o2: 96, temp: 37.0, resp: 18, sleep: 5.9, fatigue: 52, immune: 35 },
    },
    trend: [68, 70, 72, 75, 74, 76, 78],
  },
  {
    id: 2,
    astronautId: 'Crew #2',
    fullName: 'Daniel Ortiz',
    role: 'Medical & Systems Officer',
    avatarUrl: '/avatars/astronaut-2.svg',
    mission: 'Mars Flight Operations',
    healthStatus: 'Needs Attention',
    statusClass: 'warning',
    wearableSource: 'Oraimo Smart Watch Linked',
    baseline: {
      preFlight: { hr: 72, bp: '120/78', o2: 99, temp: 36.7, resp: 15, sleep: 7.2, fatigue: 22, immune: 12 },
      inSpace: { hr: 88, bp: '136/88', o2: 97, temp: 37.2, resp: 18, sleep: 5.2, fatigue: 64, immune: 42 },
      surface: { hr: 104, bp: '142/92', o2: 95, temp: 37.4, resp: 21, sleep: 4.8, fatigue: 76, immune: 58 },
    },
    trend: [74, 78, 82, 85, 87, 86, 88],
  },
  {
    id: 3,
    astronautId: 'Crew #3',
    fullName: 'Priya Shah',
    role: 'Science Specialist',
    avatarUrl: '/avatars/astronaut-3.svg',
    mission: 'Deep-Space Habitat Systems',
    healthStatus: 'Healthy & Normal',
    statusClass: 'good',
    wearableSource: 'Oraimo Smart Watch Linked',
    baseline: {
      preFlight: { hr: 64, bp: '114/72', o2: 99, temp: 36.5, resp: 13, sleep: 8.0, fatigue: 12, immune: 6 },
      inSpace: { hr: 72, bp: '120/76', o2: 98, temp: 36.7, resp: 15, sleep: 6.8, fatigue: 28, immune: 18 },
      surface: { hr: 84, bp: '128/82', o2: 97, temp: 36.9, resp: 17, sleep: 6.2, fatigue: 41, immune: 26 },
    },
    trend: [64, 66, 68, 70, 71, 71, 72],
  },
]

const INCIDENT_LOGS = [
  {
    id: 'INC-081',
    timeOccurred: 'Mission Day 182 at 08:12',
    delayNote: '12 min light delay to Earth',
    person: 'Elena Park (Commander)',
    title: 'Sudden Fast Heartbeat (174 bpm) after floating to command bay',
    whatShipDid: 'The ship computer immediately told Elena to sit down, rest, and drink 500 mL of chilled electrolyte fluid.',
    doctorAdvice: 'Houston doctors agree with the decision. Advise Elena to avoid heavy tasks for the rest of today.',
    status: 'Resolved by Ship Computer',
  },
  {
    id: 'INC-079',
    timeOccurred: 'Mission Day 181 at 19:40',
    delayNote: '12 min light delay to Earth',
    person: 'Daniel Ortiz (Medical Officer)',
    title: 'Disrupted Sleep & Slower Reaction Time on cognitive test',
    whatShipDid: 'Ship computer dimmed the bunk lights early and rescheduled his morning spacewalk.',
    doctorAdvice: 'Earth team recommends taking 8 hours of quiet rest and drinking plenty of water.',
    status: 'Monitoring Crew Comfort',
  },
]

const CONSOLE_TABS = [
  { id: 'crew', label: 'Crew Roster Matrix', icon: Users, subtitle: 'All 3 Astronauts Live', group: 'monitoring' },
  { id: 'telemetry', label: 'Clinical Inspection', icon: Activity, subtitle: '8 Gauges & Flight Phases', group: 'monitoring' },
  { id: 'environment', label: 'Cabin Air & Systems', icon: Shield, subtitle: 'Oxygen, Pressure, Radiation', group: 'habitat' },
  { id: 'comms', label: 'Radio & Doctor Advice', icon: Radio, subtitle: 'Incident Log & Uplink', group: 'habitat' },
  { id: 'simulator', label: 'Emergency Simulation', icon: FlaskConical, subtitle: 'Test Anomaly Injections', group: 'sim' },
]

export default function EarthWatchConsole({ onLogout, theme, onToggleTheme }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('crew')
  const [missionPhase, setMissionPhase] = useState('inSpace')
  const [selectedAstronautId, setSelectedAstronautId] = useState(1)
  const [crewData, setCrewData] = useState(CREW_PROFILES)
  const [crewFilter, setCrewFilter] = useState('all')
  const [activeScenario, setActiveScenario] = useState('nominal')
  const [doctorNote, setDoctorNote] = useState('')
  const [sentMessages, setSentMessages] = useState([])
  const [currentTime, setCurrentTime] = useState(() => new Date().toUTCString())

  // Dynamic cabin environment life-support sensor drift
  const [cabinEnv, setCabinEnv] = useState({
    oxygen: 21.2,
    co2: 0.31,
    pressure: 101.3,
    temp: 21.8,
    radiation: 1.4,
    water: 98.4,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toUTCString())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const envTimer = setInterval(() => {
      setCabinEnv(() => ({
        oxygen: +(21.2 + (Math.random() * 0.08 - 0.04)).toFixed(1),
        co2: +(0.31 + (Math.random() * 0.02 - 0.01)).toFixed(2),
        pressure: +(101.3 + (Math.random() * 0.08 - 0.04)).toFixed(1),
        temp: +(21.8 + (Math.random() * 0.2 - 0.1)).toFixed(1),
        radiation: +(1.4 + (Math.random() * 0.04 - 0.02)).toFixed(2),
        water: +(98.4 + (Math.random() * 0.1 - 0.05)).toFixed(1),
      }))
    }, 3000)
    return () => clearInterval(envTimer)
  }, [])

  // Ingest live telemetry from spacecraft via /api/wearable/live (NVIDIA QA Fix)
  useEffect(() => {
    let active = true
    const pollWearable = async () => {
      try {
        const res = await fetch('/api/wearable/live')
        if (!res.ok) return
        const data = await res.json()
        if (active && data) {
          if (data.isConnected && data.heartRate > 0) {
            setCrewData((prev) =>
              prev.map((astro) => {
                if (astro.id === 1) { // Elena Park is linked to the physical watch
                  const current = astro.currentMetrics || astro.baseline[missionPhase]
                  return {
                    ...astro,
                    wearableSource: `${data.deviceName || 'Oraimo Watch 2 Pro'} (LIVE GROUND LINK)`,
                    currentMetrics: {
                      ...current,
                      hr: data.heartRate,
                      steps: typeof data.steps === 'number' ? data.steps : current.steps,
                      o2: data.spO2 > 0 ? data.spO2 : current.o2,
                    },
                  }
                }
                return astro
              })
            )
          }
        }
      } catch {
        // Ignore network hiccups
      }
    }

    pollWearable()
    const interval = setInterval(pollWearable, 3000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [missionPhase])

  // Ingest deep-space comms messages from backend (NVIDIA QA Fix)
  useEffect(() => {
    let active = true
    const fetchComms = async () => {
      try {
        const res = await fetch('/api/comms/messages')
        if (res.ok) {
          const list = await res.json()
          if (active && Array.isArray(list)) {
            setSentMessages(list)
          }
        }
      } catch {
        // Ignore
      }
    }
    fetchComms()
    const interval = setInterval(fetchComms, 5000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  // REAL-TIME DYNAMIC TELEMETRY JITTER FOR ALL CREW MEMBERS
  useEffect(() => {
    const telemetryInterval = setInterval(() => {
      setCrewData((prev) =>
        prev.map((astro) => {
          const base = astro.baseline[missionPhase]
          const current = astro.currentMetrics || base

          let targetHr = base.hr
          let targetO2 = base.o2
          let targetResp = base.resp

          if (astro.id === selectedAstronautId) {
            if (activeScenario === 'tachycardia') {
              targetHr = 176
              targetResp = 22
            } else if (activeScenario === 'hypoxia') {
              targetO2 = 89
              targetResp = 28
              targetHr = 118
            } else if (activeScenario === 'immune') {
              targetHr = 96
            }
          }

          const hrJitter = Math.floor(Math.random() * 5) - 2
          const hrStep = current.hr < targetHr ? 2 : current.hr > targetHr ? -2 : 0
          const newHr = Math.max(50, Math.min(190, current.hr + hrStep + hrJitter))

          const o2Jitter = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0
          const o2Step = current.o2 < targetO2 ? 1 : current.o2 > targetO2 ? -1 : 0
          const newO2 = Math.max(85, Math.min(100, current.o2 + o2Step + o2Jitter))

          const respJitter = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0
          const respStep = current.resp < targetResp ? 1 : current.resp > targetResp ? -1 : 0
          const newResp = Math.max(12, Math.min(32, current.resp + respStep + respJitter))

          // Subtle BP drift
          const bpParts = (current.bp || base.bp).split('/')
          const sys = parseInt(bpParts[0], 10) || 120
          const dia = parseInt(bpParts[1], 10) || 80
          const newSys = sys + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0)
          const newDia = dia + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0)

          return {
            ...astro,
            currentMetrics: {
              ...current,
              hr: newHr,
              o2: newO2,
              resp: newResp,
              bp: `${newSys}/${newDia}`,
            },
          }
        })
      )
    }, 2500)

    return () => clearInterval(telemetryInterval)
  }, [missionPhase, activeScenario, selectedAstronautId])

  const handlePhaseChange = (phase) => {
    setMissionPhase(phase)
    setActiveScenario('nominal')
  }

  // Simulator controls
  const triggerScenario = (scenario) => {
    setActiveScenario(scenario)
    setCrewData((prev) =>
      prev.map((astro) => {
        if (astro.id === selectedAstronautId) {
          const current = astro.baseline[missionPhase]
          if (scenario === 'tachycardia') {
            return {
              ...astro,
              healthStatus: 'High Alert: Rapid Pulse',
              statusClass: 'danger',
              currentMetrics: {
                ...current,
                hr: 176,
                bp: '148/96',
                fatigue: 78,
              },
            }
          }
          if (scenario === 'hypoxia') {
            return {
              ...astro,
              healthStatus: 'High Alert: Low Oxygen',
              statusClass: 'danger',
              currentMetrics: {
                ...current,
                o2: 89,
                resp: 28,
                hr: 118,
              },
            }
          }
          if (scenario === 'immune') {
            return {
              ...astro,
              healthStatus: 'Warning: High Stress Level',
              statusClass: 'warning',
              currentMetrics: {
                ...current,
                immune: 82,
                fatigue: 68,
                temp: 38.1,
              },
            }
          }
          return {
            ...astro,
            healthStatus: astro.id === 2 ? 'Needs Attention' : 'Healthy & Normal',
            statusClass: astro.id === 2 ? 'warning' : 'good',
            currentMetrics: current,
          }
        }
        return astro
      })
    )
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!doctorNote.trim()) return

    const targetAstro = crewData.find((a) => a.id === selectedAstronautId)?.fullName || 'Crew'
    const newMsg = {
      id: `MSG-${Date.now()}`,
      to: targetAstro,
      from: 'Dr. Henderson (Houston Flight Surgeon)',
      text: doctorNote,
      timeSent: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
      eta: '12.7 minutes (Deep-Space Latency)',
    }

    setSentMessages((prev) => [newMsg, ...prev])
    setDoctorNote('')

    try {
      await fetch('/api/comms/uplink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg),
      })
    } catch {
      // Local state already updated
    }
  }

  const selectedAstro = crewData.find((a) => a.id === selectedAstronautId) || crewData[0]
  const metrics = selectedAstro.currentMetrics || selectedAstro.baseline[missionPhase]

  return (
    <div className="earth-console-shell">
      <TopBar
        brandIcon={Globe}
        brandTitle="NASA Houston Desk"
        brandSubtitle="Deep-Space Health Console"
        sideChipText="Ground Side"
        brandLink="/console"
        primaryAction={
          <Button
            variant="primary"
            onClick={() => navigate(`/astronaut/dashboard/${selectedAstronautId}`)}
          >
            <User size={15} strokeWidth={2} />
            <span>Open Astronaut Screen</span>
          </Button>
        }
        theme={theme}
        onToggleTheme={onToggleTheme}
        authAction={
          onLogout ? (
            <Button variant="outline" onClick={onLogout} aria-label="Log Out">
              <LogOut size={15} strokeWidth={2} />
              <span>Log Out</span>
            </Button>
          ) : (
            <Button variant="outline" to="/" aria-label="Sign In">
              <span>Sign In</span>
            </Button>
          )
        }
      />

      <SectionTabs
        tabs={CONSOLE_TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <StatusStrip
        radioStatus="Active"
        oneWayDelay="12m 44s"
        distance="142M miles"
        showSignal={true}
        utcClock={currentTime}
      />

      <div className="earth-viewport-container">
        <header className="earth-viewport-header">
          <div>
            <div className="earth-breadcrumb">
              <span>Earth Mission Control</span> &rsaquo;{' '}
              <strong className="active-view-tag">
                {activeTab === 'crew' && 'All Crew Members Overview'}
                {activeTab === 'telemetry' && `Clinical Deep-Dive: ${selectedAstro.fullName}`}
                {activeTab === 'environment' && 'Spaceship Cabin Air & Life Support'}
                {activeTab === 'comms' && 'Deep Space Communication & Doctor Advice'}
                {activeTab === 'simulator' && 'Flight Anomaly Simulation Lab'}
              </strong>
            </div>
            <h1>
              {activeTab === 'crew' && 'Active Crew Telemetry Matrix'}
              {activeTab === 'telemetry' && `${selectedAstro.fullName}'s Dynamic Clinical Inspection`}
              {activeTab === 'environment' && 'Spaceship Habitat Atmosphere & Systems'}
              {activeTab === 'comms' && 'Radio Incident Log & Houston Advisory'}
              {activeTab === 'simulator' && 'Emergency Decision Support Simulator'}
            </h1>
          </div>
        </header>

        {/* Body Viewport (Single-Screen Views) */}
        <div className="earth-viewport-body">
          {/* VIEW 1: CREW ROSTER MATRIX */}
          {activeTab === 'crew' && (() => {
            const warningCrewMember = crewData.find(
              (a) => a.statusClass === 'warning' || a.statusClass === 'danger' || a.statusClass === 'alert'
            )
            const crewFilterOptions = [
              { value: 'all', label: 'All crew', count: crewData.length },
              {
                value: 'good',
                label: 'Healthy',
                count: crewData.filter((a) => a.statusClass === 'good').length,
              },
              {
                value: 'attention',
                label: 'Needs attention',
                count: crewData.filter((a) => a.statusClass !== 'good').length,
              },
            ]

            const displayedCrew = crewData.filter((a) => {
              if (crewFilter === 'all') return true
              if (crewFilter === 'good') return a.statusClass === 'good'
              if (crewFilter === 'attention') return a.statusClass !== 'good'
              if (typeof crewFilter === 'number') return a.id === crewFilter
              return true
            })

            return (
              <div className="earth-view-pane crew-pane">
                <div className="hd-roster-filter-row">
                  <SegmentedControl
                    options={crewFilterOptions}
                    value={typeof crewFilter === 'number' ? '' : crewFilter}
                    onChange={(val) => setCrewFilter(val)}
                    ariaLabel="Filter crew members by health status"
                  />
                  {typeof crewFilter === 'number' && (
                    <Button variant="ghost" size="sm" onClick={() => setCrewFilter('all')}>
                      Clear crew member filter
                    </Button>
                  )}
                </div>

                {warningCrewMember && (
                  <Alert
                    variant="warning"
                    title={`Advisory on ${warningCrewMember.fullName}:`}
                    action={
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCrewFilter(
                            crewFilter === warningCrewMember.id ? 'all' : warningCrewMember.id
                          )
                        }
                      >
                        {crewFilter === warningCrewMember.id
                          ? 'Show all crew'
                          : `Filter to ${warningCrewMember.fullName}`}
                      </Button>
                    }
                    className="hd-roster-alert"
                  >
                    Watchlist condition detected ({warningCrewMember.healthStatus}). Real-time telemetry is actively streaming.
                  </Alert>
                )}

                <div className="hd-roster-grid">
                  {displayedCrew.map((astro) => {
                    const currentVitals = astro.currentMetrics || astro.baseline[missionPhase]
                    const isSelected = astro.id === selectedAstronautId
                    const systolic = currentVitals.bp
                      ? parseInt(currentVitals.bp.split('/')[0], 10)
                      : 120

                    return (
                      <div
                        key={astro.id}
                        className={`hd-roster-card ${isSelected ? 'hd-roster-card--selected' : ''}`}
                        onClick={() => setSelectedAstronautId(astro.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setSelectedAstronautId(astro.id)
                          }
                        }}
                      >
                        <div className="hd-roster-card__top">
                          <div className="hd-avatar-wrapper">
                            <div
                              className={`hd-avatar-ring hd-avatar-ring--${astro.statusClass}`}
                              aria-hidden="true"
                            />
                            <img
                              src={astro.avatarUrl}
                              alt={astro.fullName}
                              className="hd-avatar-img"
                            />
                          </div>
                          <div className="hd-roster-card__meta">
                            <div className="hd-roster-card__name-row">
                              <h3 className="hd-roster-card__name">{astro.fullName}</h3>
                              <StatusChip variant={astro.statusClass}>
                                {astro.healthStatus}
                              </StatusChip>
                            </div>
                            <p className="hd-roster-card__sub">
                              {astro.role} · {astro.astronautId}
                            </p>
                          </div>
                        </div>

                        <div className="hd-roster-hr-panel">
                          <div className="hd-roster-hr-readout">
                            <span className="hd-roster-hr-label">Heart Rate</span>
                            <span className="hd-roster-hr-num">
                              {currentVitals.hr} <small>bpm</small>
                            </span>
                          </div>
                          <EcgTrace heartRate={currentVitals.hr} variant={astro.statusClass} />
                        </div>

                        <div className="hd-roster-metrics-3col">
                          <MeterBar
                            label="Oxygen"
                            value={currentVitals.o2}
                            unit="%"
                            min={80}
                            max={100}
                            variant={currentVitals.o2 < 95 ? 'warning' : 'good'}
                          />
                          <MeterBar
                            label="Pressure"
                            value={systolic}
                            displayValue={currentVitals.bp}
                            min={90}
                            max={160}
                            variant={systolic > 135 ? 'warning' : 'good'}
                          />
                          <MeterBar
                            label="Tiredness"
                            value={currentVitals.fatigue}
                            unit="/100"
                            min={0}
                            max={100}
                            variant={currentVitals.fatigue > 50 ? 'warning' : 'good'}
                          />
                        </div>

                        <div className="hd-roster-source">
                          <Watch size={13} strokeWidth={2} aria-hidden="true" />
                          <span>{astro.wearableSource}</span>
                        </div>

                        <Button
                          variant="outline"
                          fullWidth
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedAstronautId(astro.id)
                            setActiveTab('telemetry')
                          }}
                        >
                          <span>Open Detailed Vitals</span>
                          <ArrowRight size={14} strokeWidth={2} />
                        </Button>
                      </div>
                    )
                  })}
                </div>

                <Accordion title="Telemetry Stream Status Notes" defaultOpen={false}>
                  <p>
                    Telemetry stream active across all 3 crew members. Click any card to inspect their live biometrics.
                  </p>
                </Accordion>
              </div>
            )
          })()}

          {/* VIEW 2: CLINICAL INSPECTION (8 GAUGES + STAGES) */}
          {activeTab === 'telemetry' && (
            <div className="earth-view-pane telemetry-pane">
              {/* Flight Phase Selector Bar */}
              <div className="hd-phase-selector-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span className="hd-phase-title">Flight Phase:</span>
                  <SegmentedControl
                    options={[
                      { value: 'preFlight', label: '1. Earth (1.0g)' },
                      { value: 'inSpace', label: '2. Transit Zero-G' },
                      { value: 'surface', label: '3. Mars (0.38g)' },
                    ]}
                    value={missionPhase}
                    onChange={(val) => handlePhaseChange(val)}
                    ariaLabel="Flight Phase Selection"
                  />
                </div>

                <div className="hd-astro-pill-group">
                  <span className="hd-phase-title">Astronaut:</span>
                  {crewData.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      className={`hd-astro-pill ${
                        a.id === selectedAstronautId ? 'hd-astro-pill--active' : ''
                      }`}
                      onClick={() => setSelectedAstronautId(a.id)}
                    >
                      <img src={a.avatarUrl} alt="" className="hd-astro-pill__img" />
                      <span>{a.fullName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 8 Gauges Grid */}
              <div className="hd-section-heading">
                <Activity size={16} strokeWidth={2} />
                <span>Primary Circulatory Vitals</span>
              </div>

              <div className="hd-gauges-grid">
                <div className="hd-gauge-card">
                  <div className="hd-gauge-card__header">
                    <span className="hd-gauge-card__title">Heart Rate</span>
                    <StatusChip variant={metrics.hr > 100 || metrics.hr < 55 ? 'warning' : 'good'}>
                      {metrics.hr > 100 ? 'Elevated' : 'Nominal'}
                    </StatusChip>
                  </div>
                  <div className="hd-gauge-card__value-line">
                    <span className="hd-gauge-card__value">{metrics.hr}</span>
                    <span className="hd-gauge-card__unit">bpm</span>
                  </div>
                  <MeterBar
                    value={metrics.hr}
                    min={40}
                    max={150}
                    variant={metrics.hr > 100 || metrics.hr < 55 ? 'warning' : 'good'}
                    showValue={false}
                  />
                  <p className="hd-gauge-card__desc">
                    Resting pulse sensor. Fluctuating dynamically with autonomic rhythm.
                  </p>
                </div>

                <div className="hd-gauge-card">
                  <div className="hd-gauge-card__header">
                    <span className="hd-gauge-card__title">Blood Oxygen</span>
                    <StatusChip variant={metrics.o2 < 95 ? 'warning' : 'good'}>
                      {metrics.o2 >= 95 ? 'Optimal' : 'Caution'}
                    </StatusChip>
                  </div>
                  <div className="hd-gauge-card__value-line">
                    <span className="hd-gauge-card__value">{metrics.o2}</span>
                    <span className="hd-gauge-card__unit">% SpO2</span>
                  </div>
                  <MeterBar
                    value={metrics.o2}
                    min={80}
                    max={100}
                    variant={metrics.o2 < 95 ? 'warning' : 'good'}
                    showValue={false}
                  />
                  <p className="hd-gauge-card__desc">
                    Oxygen saturation. Above 95% indicates nominal lung absorption.
                  </p>
                </div>

                <div className="hd-gauge-card">
                  <div className="hd-gauge-card__header">
                    <span className="hd-gauge-card__title">Blood Pressure</span>
                    <StatusChip
                      variant={
                        parseInt(String(metrics.bp).split('/')[0], 10) > 135
                          ? 'warning'
                          : 'good'
                      }
                    >
                      {parseInt(String(metrics.bp).split('/')[0], 10) > 135
                        ? 'High-Normal'
                        : 'Balanced'}
                    </StatusChip>
                  </div>
                  <div className="hd-gauge-card__value-line">
                    <span className="hd-gauge-card__value">{metrics.bp}</span>
                    <span className="hd-gauge-card__unit">mmHg</span>
                  </div>
                  <MeterBar
                    value={parseInt(String(metrics.bp).split('/')[0], 10) || 120}
                    min={90}
                    max={160}
                    variant={
                      parseInt(String(metrics.bp).split('/')[0], 10) > 135
                        ? 'warning'
                        : 'good'
                    }
                    showValue={false}
                  />
                  <p className="hd-gauge-card__desc">
                    Circulatory pressure required to supply the brain in microgravity.
                  </p>
                </div>

                <div className="hd-gauge-card">
                  <div className="hd-gauge-card__header">
                    <span className="hd-gauge-card__title">Body Temperature</span>
                    <StatusChip
                      variant={
                        metrics.temp > 37.5 || metrics.temp < 36.0 ? 'warning' : 'good'
                      }
                    >
                      Nominal
                    </StatusChip>
                  </div>
                  <div className="hd-gauge-card__value-line">
                    <span className="hd-gauge-card__value">
                      {Number(metrics.temp).toFixed(1)}°
                    </span>
                    <span className="hd-gauge-card__unit">C</span>
                  </div>
                  <MeterBar
                    value={metrics.temp}
                    min={35.0}
                    max={39.0}
                    variant={
                      metrics.temp > 37.5 || metrics.temp < 36.0 ? 'warning' : 'good'
                    }
                    showValue={false}
                  />
                  <p className="hd-gauge-card__desc">
                    Normal core body warmth. Circadian regulation is functioning well.
                  </p>
                </div>
              </div>

              <div className="hd-section-heading">
                <ShieldCheck size={16} strokeWidth={2} />
                <span>Respiration &amp; Physiological Biomarkers</span>
              </div>

              <div className="hd-gauges-grid">
                <div className="hd-gauge-card">
                  <div className="hd-gauge-card__header">
                    <span className="hd-gauge-card__title">Breathing Rate</span>
                    <StatusChip variant={metrics.resp > 22 ? 'warning' : 'good'}>
                      Steady
                    </StatusChip>
                  </div>
                  <div className="hd-gauge-card__value-line">
                    <span className="hd-gauge-card__value">{metrics.resp}</span>
                    <span className="hd-gauge-card__unit">rpm</span>
                  </div>
                  <MeterBar
                    value={metrics.resp}
                    min={8}
                    max={28}
                    variant={metrics.resp > 22 ? 'warning' : 'good'}
                    showValue={false}
                  />
                  <p className="hd-gauge-card__desc">
                    Thoracic bio-sensor. 12 to 20 breaths per minute is healthy.
                  </p>
                </div>

                <div className="hd-gauge-card">
                  <div className="hd-gauge-card__header">
                    <span className="hd-gauge-card__title">Sleep &amp; Rest</span>
                    <StatusChip variant={metrics.fatigue > 55 ? 'warning' : 'good'}>
                      {metrics.fatigue > 55 ? 'Fatigued' : 'Rested'}
                    </StatusChip>
                  </div>
                  <div className="hd-gauge-card__value-line">
                    <span className="hd-gauge-card__value">{metrics.fatigue}</span>
                    <span className="hd-gauge-card__unit">/100 score</span>
                  </div>
                  <MeterBar
                    value={metrics.fatigue}
                    min={0}
                    max={100}
                    variant={metrics.fatigue > 55 ? 'warning' : 'good'}
                    showValue={false}
                  />
                  <p className="hd-gauge-card__desc">
                    {Number(metrics.sleep).toFixed(1)} hours of rest. Cognitive alertness scores are sharp.
                  </p>
                </div>

                <div className="hd-gauge-card">
                  <div className="hd-gauge-card__header">
                    <span className="hd-gauge-card__title">Immune Defense</span>
                    <StatusChip variant={metrics.immune > 35 ? 'warning' : 'good'}>
                      {metrics.immune > 35 ? 'Stressed' : 'Robust'}
                    </StatusChip>
                  </div>
                  <div className="hd-gauge-card__value-line">
                    <span className="hd-gauge-card__value">{metrics.immune}</span>
                    <span className="hd-gauge-card__unit">% stress</span>
                  </div>
                  <MeterBar
                    value={metrics.immune}
                    min={0}
                    max={60}
                    variant={metrics.immune > 35 ? 'warning' : 'good'}
                    showValue={false}
                  />
                  <p className="hd-gauge-card__desc">
                    Salivary biomarker check. Low stress score indicates dormant viruses.
                  </p>
                </div>

                <div className="hd-gauge-card">
                  <div className="hd-gauge-card__header">
                    <span className="hd-gauge-card__title">Bone &amp; Muscle Strength</span>
                    <StatusChip variant="good">Preserved</StatusChip>
                  </div>
                  <div className="hd-gauge-card__value-line">
                    <span className="hd-gauge-card__value">96.4%</span>
                    <span className="hd-gauge-card__unit">BMD</span>
                  </div>
                  <MeterBar value={96.4} min={80} max={100} variant="good" showValue={false} />
                  <p className="hd-gauge-card__desc">
                    Daily resistive exercise countermeasure preserving bone density.
                  </p>
                </div>
              </div>

              <Accordion title="Flight Surgeon Clinical Notes" defaultOpen={false}>
                <p>
                  Resting pulse and circulatory pressure required to supply the brain in microgravity. Autonomic rhythm fluctuates dynamically.
                </p>
                <p>
                  Daily resistive exercise countermeasure preserving bone density (BMD).
                </p>
              </Accordion>
            </div>
          )}

          {/* VIEW 3: CABIN AIR & SYSTEMS */}
          {activeTab === 'environment' && (
            <div className="earth-view-pane environment-pane">
              <div className="hd-section-heading">
                <Wind size={16} strokeWidth={2} />
                <span>Atmosphere &amp; Pressure</span>
              </div>

              <div className="hd-sys-grid">
                <div className="hd-sys-card">
                  <div className="hd-sys-card__header">
                    <span className="hd-sys-card__label">Cabin Oxygen (O2)</span>
                    <StatusChip variant="good">Nominal</StatusChip>
                  </div>
                  <span className="hd-sys-card__val">{cabinEnv.oxygen}%</span>
                  <MeterBar value={cabinEnv.oxygen} min={15} max={25} variant="good" showValue={false} />
                  <p className="hd-sys-card__desc">
                    Nominal breathable air (Standard setpoint: 21.0%)
                  </p>
                </div>

                <div className="hd-sys-card">
                  <div className="hd-sys-card__header">
                    <span className="hd-sys-card__label">Carbon Dioxide (ppCO2)</span>
                    <StatusChip variant="good">Scrubbed</StatusChip>
                  </div>
                  <span className="hd-sys-card__val">{cabinEnv.co2}%</span>
                  <MeterBar value={cabinEnv.co2} min={0} max={1.0} variant="good" showValue={false} />
                  <p className="hd-sys-card__desc">
                    Scrubbers active. Safe limit is below 0.50%
                  </p>
                </div>

                <div className="hd-sys-card">
                  <div className="hd-sys-card__header">
                    <span className="hd-sys-card__label">Cabin Air Pressure</span>
                    <StatusChip variant="good">Sea-Level Eq</StatusChip>
                  </div>
                  <span className="hd-sys-card__val">{cabinEnv.pressure} kPa</span>
                  <MeterBar value={cabinEnv.pressure} min={80} max={120} variant="good" showValue={false} />
                  <p className="hd-sys-card__desc">
                    Standard sea-level atmospheric equivalent
                  </p>
                </div>
              </div>

              <div className="hd-section-heading">
                <Shield size={16} strokeWidth={2} />
                <span>Habitat Systems &amp; Environment</span>
              </div>

              <div className="hd-sys-grid">
                <div className="hd-sys-card">
                  <div className="hd-sys-card__header">
                    <span className="hd-sys-card__label">Room Temperature</span>
                    <StatusChip variant="good">Thermal Stn</StatusChip>
                  </div>
                  <span className="hd-sys-card__val">{cabinEnv.temp} °C</span>
                  <MeterBar value={cabinEnv.temp} min={15} max={30} variant="good" showValue={false} />
                  <p className="hd-sys-card__desc">
                    Comfortable living range automatically maintained
                  </p>
                </div>

                <div className="hd-sys-card">
                  <div className="hd-sys-card__header">
                    <span className="hd-sys-card__label">Space Radiation Level</span>
                    <StatusChip variant="good">Shielded</StatusChip>
                  </div>
                  <span className="hd-sys-card__val">{cabinEnv.radiation} mSv / day</span>
                  <MeterBar value={cabinEnv.radiation} min={0} max={5} variant="good" showValue={false} />
                  <p className="hd-sys-card__desc">
                    Ship storm shields are protecting the crew
                  </p>
                </div>

                <div className="hd-sys-card">
                  <div className="hd-sys-card__header">
                    <span className="hd-sys-card__label">Clean Recycled Water</span>
                    <StatusChip variant="good">Purified</StatusChip>
                  </div>
                  <span className="hd-sys-card__val">{cabinEnv.water}%</span>
                  <MeterBar value={cabinEnv.water} min={70} max={100} variant="good" showValue={false} />
                  <p className="hd-sys-card__desc">
                    Closed-loop water filters functioning at peak capacity
                  </p>
                </div>
              </div>

              <Accordion title="Environmental Life Support Diagnostics" defaultOpen={false}>
                <p>
                  Closed-loop water filters functioning at peak capacity. Safe CO2 limit is below 0.50%.
                </p>
              </Accordion>

              <Alert variant="good" title="Spacecraft Life Support Status:">
                ALL SYSTEMS NOMINAL (Dynamic Telemetry Link Active)
              </Alert>
            </div>
          )}

          {/* VIEW 4: RADIO COMMS & DOCTOR ADVICE */}
          {activeTab === 'comms' && (
            <div className="earth-view-pane comms-pane">
              <div className="hd-comms-split">
                {/* Left: Incident Feed */}
                <div className="hd-comms-col">
                  <h3>Recent Medical Events Received</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {INCIDENT_LOGS.slice(0, 1).map((inc) => (
                      <div key={inc.id} className="hd-incident-card">
                        <div className="hd-incident-card__header">
                          <strong className="hd-incident-card__title">{inc.title}</strong>
                          <StatusChip variant="good">Resolved</StatusChip>
                        </div>
                        <div className="hd-incident-card__meta">
                          <span className="hd-incident-card__meta-item">
                            <Clock size={12} strokeWidth={2} aria-hidden="true" />
                            {inc.timeOccurred}
                          </span>
                          <span className="hd-incident-card__meta-item">
                            <Radio size={12} strokeWidth={2} aria-hidden="true" />
                            {inc.delayNote}
                          </span>
                        </div>
                        <p className="hd-incident-quote">
                          <strong>Onboard Computer Action:</strong> {inc.whatShipDid}
                        </p>
                        <p className="hd-incident-quote hd-incident-quote--doc">
                          <strong>Houston Doctor Confirmation:</strong> {inc.doctorAdvice}
                        </p>
                      </div>
                    ))}

                    {INCIDENT_LOGS.length > 1 && (
                      <Accordion
                        title={`Earlier Incident Logs (${INCIDENT_LOGS.length - 1} earlier record)`}
                        defaultOpen={false}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                          {INCIDENT_LOGS.slice(1).map((inc) => (
                            <div key={inc.id} className="hd-incident-card">
                              <div className="hd-incident-card__header">
                                <strong className="hd-incident-card__title">{inc.title}</strong>
                                <StatusChip variant="good">Resolved</StatusChip>
                              </div>
                              <div className="hd-incident-card__meta">
                                <span className="hd-incident-card__meta-item">
                                  <Clock size={12} strokeWidth={2} aria-hidden="true" />
                                  {inc.timeOccurred}
                                </span>
                                <span className="hd-incident-card__meta-item">
                                  <Radio size={12} strokeWidth={2} aria-hidden="true" />
                                  {inc.delayNote}
                                </span>
                              </div>
                              <p className="hd-incident-quote">
                                <strong>Onboard Computer Action:</strong> {inc.whatShipDid}
                              </p>
                              <p className="hd-incident-quote hd-incident-quote--doc">
                                <strong>Houston Doctor Confirmation:</strong> {inc.doctorAdvice}
                              </p>
                            </div>
                          ))}
                        </div>
                      </Accordion>
                    )}
                  </div>
                </div>

                {/* Right: Message Dispatch */}
                <div className="hd-comms-col">
                  <h3>Dispatch Doctor's Advisory Note</h3>
                  <div className="hd-dispatch-card">
                    <form onSubmit={handleSendMessage} className="hd-dispatch-form">
                      <label htmlFor="advisory-text" className="hd-dispatch-label">
                        Message for {selectedAstro.fullName} ({selectedAstro.role}):
                      </label>
                      <textarea
                        id="advisory-text"
                        rows="4"
                        className="hd-dispatch-textarea"
                        placeholder="e.g. Please sit down, drink plenty of water with electrolytes, and rest for 30 minutes..."
                        value={doctorNote}
                        onChange={(e) => setDoctorNote(e.target.value)}
                      />
                      <Button type="submit" variant="primary">
                        <Send size={15} strokeWidth={2} />
                        <span>Send Radio Message to Spacecraft (~12m delay)</span>
                      </Button>
                    </form>

                    {sentMessages.length > 0 && (
                      <div className="hd-transit-list">
                        <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Messages Currently In Transit:
                        </h4>
                        {sentMessages.map((msg) => (
                          <div key={msg.id} className="hd-transit-item">
                            <div className="hd-transit-item__head">
                              <span>To: {msg.to}</span>
                              <span style={{ fontFamily: 'var(--font-mono)' }}>{msg.timeSent}</span>
                            </div>
                            <p className="hd-transit-item__text">"{msg.text}"</p>
                            <span className="hd-transit-item__eta">
                              Estimated arrival on spacecraft: ~{msg.eta}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 5: EMERGENCY SIMULATION LAB */}
          {activeTab === 'simulator' && (
            <div className="earth-view-pane simulator-pane">
              <div className="hd-sim-lab-card">
                <h3>Test How the Clinical Brain Responds to Emergencies</h3>

                <div className="hd-section-heading">
                  <FlaskConical size={16} strokeWidth={2} />
                  <span>Simulation Scenarios</span>
                </div>

                <div className="hd-sim-grid">
                  <button
                    type="button"
                    className={`hd-sim-btn ${
                      activeScenario === 'tachycardia' ? 'hd-sim-btn--active-danger' : ''
                    }`}
                    onClick={() => triggerScenario('tachycardia')}
                  >
                    <Zap size={22} strokeWidth={2} style={{ color: 'var(--hd-red)' }} />
                    <span className="hd-sim-btn__title">Acute Tachycardia Surge</span>
                    <span className="hd-sim-btn__desc">
                      Spikes heart rate to 176 bpm due to sudden zero-G fluid shift
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`hd-sim-btn ${
                      activeScenario === 'hypoxia' ? 'hd-sim-btn--active-danger' : ''
                    }`}
                    onClick={() => triggerScenario('hypoxia')}
                  >
                    <Wind size={22} strokeWidth={2} style={{ color: 'var(--hd-red)' }} />
                    <span className="hd-sim-btn__title">Cabin Hypoxia Drop</span>
                    <span className="hd-sim-btn__desc">
                      Drops SpO2 to 89% and elevates breathing rate
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`hd-sim-btn ${
                      activeScenario === 'immune' ? 'hd-sim-btn--active-warning' : ''
                    }`}
                    onClick={() => triggerScenario('immune')}
                  >
                    <ShieldAlert size={22} strokeWidth={2} style={{ color: 'var(--hd-amber)' }} />
                    <span className="hd-sim-btn__title">Immune Stress Flare</span>
                    <span className="hd-sim-btn__desc">
                      Elevates saliva stress biomarkers and body temperature
                    </span>
                  </button>

                  <button
                    type="button"
                    className="hd-sim-btn hd-sim-btn--reset"
                    onClick={() => triggerScenario('nominal')}
                  >
                    <RotateCcw size={22} strokeWidth={2} style={{ color: 'var(--text-secondary)' }} />
                    <span className="hd-sim-btn__title">Reset to Nominal Baseline</span>
                    <span className="hd-sim-btn__desc">
                      Restores healthy, steady resting metrics
                    </span>
                  </button>
                </div>

                <div className="hd-sim-status-banner">
                  <strong>Selected Astronaut for Test:</strong> {selectedAstro.fullName} ({selectedAstro.astronautId}) ·
                  <span>Current Health Status:</span>
                  <StatusChip variant={selectedAstro.statusClass}>
                    {selectedAstro.healthStatus}
                  </StatusChip>
                </div>

                <Accordion title="How This Simulation Operates" defaultOpen={false}>
                  <p>
                    Click any scenario above to inject a simulated physiological surge. Watch how the vital numbers adapt and how the system alerts the crew in real time.
                  </p>
                </Accordion>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
