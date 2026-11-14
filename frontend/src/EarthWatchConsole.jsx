import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Clock,
  Compass,
  Cpu,
  FlaskConical,
  Globe,
  LogOut,
  Moon,
  Radio,
  RefreshCw,
  RotateCcw,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sun,
  User,
  Users,
  Watch,
  Wind,
  Zap,
} from 'lucide-react'
import useWearableBluetooth from './hooks/useWearableBluetooth'
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

export default function EarthWatchConsole({ onLogout, theme, onToggleTheme }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('crew')
  const [missionPhase, setMissionPhase] = useState('inSpace')
  const [selectedAstronautId, setSelectedAstronautId] = useState(1)
  const [crewData, setCrewData] = useState(CREW_PROFILES)
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

  // Live Watch Synchronization State (Elena Park - Crew #1)
  const [liveWearable, setLiveWearable] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_med_live_wearable')
      if (saved) return JSON.parse(saved)
    } catch {}
    return {
      isConnected: false,
      deviceName: 'Oraimo Watch 2 Pro',
      heartRate: 0,
      steps: 0,
      spO2: 0,
      lastSeen: '',
    }
  })

  // Optional direct Web Bluetooth pairing from Earth Mission Control console
  const {
    connectionStatus: bleStatus,
    deviceName: bleDeviceName,
    connectDevice: connectBleWatch,
    disconnectDevice: disconnectBleWatch,
    isConnected: isBleConnected,
    triggerOraimoSync,
    isSyncing: isBleSyncing,
  } = useWearableBluetooth({
    onHeartRateUpdate: ({ heartRate, steps, bloodOxygen }) => {
      const liveData = {
        astronautId: 1,
        isConnected: true,
        deviceName: bleDeviceName || 'Oraimo Watch 2 Pro',
        heartRate: heartRate || 0,
        steps: typeof steps === 'number' ? steps : 0,
        bloodOxygen: bloodOxygen || 98,
        timestamp: Date.now(),
      }

      setLiveWearable(liveData)

      // Uplink to Go backend
      fetch('/api/wearable/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device: bleDeviceName || 'Oraimo Watch 2 Pro',
          heartRate: heartRate || 0,
          steps: typeof steps === 'number' ? steps : 0,
          spO2: bloodOxygen || 98,
          rawText: `Earth Console Direct Web Bluetooth · HR ${heartRate} bpm · Steps ${steps || 0}`,
        }),
      }).catch(() => {})

      // Broadcast to other tabs (e.g. Astronaut Dashboard)
      try {
        const bc = new BroadcastChannel('aura_med_telemetry')
        bc.postMessage({
          type: 'WEARABLE_UPDATE',
          ...liveData,
        })
        bc.close()
      } catch {}

      try {
        localStorage.setItem('aura_med_live_wearable', JSON.stringify(liveData))
      } catch {}

      setCrewData((prev) =>
        prev.map((astro) => {
          if (astro.id === 1) {
            const current = astro.currentMetrics || astro.baseline[missionPhase]
            return {
              ...astro,
              isLiveWatchConnected: true,
              wearableSource: `${bleDeviceName || 'Oraimo Watch 2 Pro'} (DIRECT GROUND LINK)`,
              currentMetrics: {
                ...current,
                hr: heartRate || current.hr,
                steps: typeof steps === 'number' && steps > 0 ? steps : current.steps,
                o2: bloodOxygen || current.o2,
              },
            }
          }
          return astro
        })
      )
    },
    onDisconnect: () => {
      setLiveWearable((prev) => ({ ...prev, isConnected: false }))
      try {
        localStorage.removeItem('aura_med_live_wearable')
      } catch {}
    },
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

  // 0ms instant synchronizer with Astronaut Dashboard via BroadcastChannel & LocalStorage
  useEffect(() => {
    let channel
    try {
      channel = new BroadcastChannel('aura_med_telemetry')
      channel.onmessage = (event) => {
        if (event.data?.type === 'WEARABLE_UPDATE') {
          const data = event.data
          setLiveWearable(data)

          setCrewData((prev) =>
            prev.map((astro) => {
              if (astro.id === 1) {
                const current = astro.currentMetrics || astro.baseline[missionPhase]
                return {
                  ...astro,
                  isLiveWatchConnected: data.isConnected,
                  wearableSource: `${data.deviceName || 'Oraimo Watch 2 Pro'} (LIVE GROUND LINK)`,
                  currentMetrics: {
                    ...current,
                    hr: data.heartRate || current.hr,
                    steps: typeof data.steps === 'number' && data.steps > 0 ? data.steps : current.steps,
                    o2: data.bloodOxygen || current.o2,
                  },
                }
              }
              return astro
            })
          )
        } else if (event.data?.type === 'WEARABLE_DISCONNECT') {
          setLiveWearable((prev) => ({ ...prev, isConnected: false }))
        }
      }
    } catch {}

    const handleStorage = (e) => {
      if (e.key === 'aura_med_live_wearable' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue)
          setLiveWearable(data)
          if (data.isConnected && data.heartRate > 0) {
            setCrewData((prev) =>
              prev.map((astro) => {
                if (astro.id === 1) {
                  const current = astro.currentMetrics || astro.baseline[missionPhase]
                  return {
                    ...astro,
                    isLiveWatchConnected: true,
                    wearableSource: `${data.deviceName || 'Oraimo Watch 2 Pro'} (LIVE GROUND LINK)`,
                    currentMetrics: {
                      ...current,
                      hr: data.heartRate,
                      steps: typeof data.steps === 'number' && data.steps > 0 ? data.steps : current.steps,
                      o2: data.bloodOxygen || current.o2,
                    },
                  }
                }
                return astro
              })
            )
          }
        } catch {}
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => {
      channel?.close()
      window.removeEventListener('storage', handleStorage)
    }
  }, [missionPhase])

  // Fast poll Go backend /api/wearable/live (every 1.5s) for multi-device network sync
  useEffect(() => {
    let active = true
    const pollWearable = async () => {
      try {
        const res = await fetch('/api/wearable/live')
        if (!res.ok) return
        const data = await res.json()
        if (active && data) {
          if (data.isConnected && data.heartRate > 0) {
            setLiveWearable(data)
            setCrewData((prev) =>
              prev.map((astro) => {
                if (astro.id === 1) {
                  const current = astro.currentMetrics || astro.baseline[missionPhase]
                  return {
                    ...astro,
                    isLiveWatchConnected: true,
                    wearableSource: `${data.deviceName || 'Oraimo Watch 2 Pro'} (LIVE GROUND LINK)`,
                    currentMetrics: {
                      ...current,
                      hr: data.heartRate,
                      steps: typeof data.steps === 'number' && data.steps > 0 ? data.steps : current.steps,
                      o2: data.spO2 > 0 ? data.spO2 : current.o2,
                    },
                  }
                }
                return astro
              })
            )
          } else if (!data.isConnected && !isBleConnected) {
            setLiveWearable((prev) => ({ ...prev, isConnected: false }))
          }
        }
      } catch {
        // Ignore network hiccups
      }
    }

    pollWearable()
    const interval = setInterval(pollWearable, 1500)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [missionPhase, isBleConnected])

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
          // If Elena Park (astro.id === 1) has an active live watch connection,
          // DO NOT pull her to synthetic base.hr (78 bpm)!
          const isElenaLive = astro.id === 1 && (liveWearable.isConnected || isBleConnected || astro.isLiveWatchConnected)
          if (isElenaLive && activeScenario === 'nominal') {
            const current = astro.currentMetrics || astro.baseline[missionPhase]
            // Subtle biological sinus variability (+/- 1 bpm) without overwriting watch reading
            const organicDelta = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0
            const boundedHr = Math.max(50, Math.min(190, (liveWearable.heartRate || current.hr) + organicDelta))
            return {
              ...astro,
              currentMetrics: {
                ...current,
                hr: boundedHr,
              },
            }
          }

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
  }, [missionPhase, activeScenario, selectedAstronautId, liveWearable.isConnected, isBleConnected])

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

    // Broadcast instant comms notification to open Astronaut Dashboard tabs
    try {
      const bc = new BroadcastChannel('aura_med_comms')
      bc.postMessage({ type: 'NEW_ADVISORY', message: newMsg })
      bc.close()
    } catch {}
  }

  const selectedAstro = crewData.find((a) => a.id === selectedAstronautId) || crewData[0]
  const metrics = selectedAstro.currentMetrics || selectedAstro.baseline[missionPhase]

  return (
    <div className="earth-workstation-layout">
      {/* =========================================================
          LEFT NAVIGATION BAR (SIDEBAR FOR MISSION CONTROL)
          ========================================================= */}
      <aside className="earth-sidebar-nav">
        <div className="earth-sidebar-header">
          <Globe className="earth-sidebar-icon" size={24} strokeWidth={2} />
          <div>
            <strong>NASA Houston Desk</strong>
            <small>Deep-Space Health Console</small>
          </div>
          <span className="dashboard-location-badge">Ground Side</span>
        </div>

        {/* Radio Link Status Box in Sidebar */}
        <div className="sidebar-radio-card">
          <div className="radio-line">
            <Radio size={14} strokeWidth={2} className="radio-icon" />
            <strong>Radio Link Active</strong>
          </div>
          <span className="radio-delay-text">One-way delay: 12m 44s</span>
          <small className="radio-range-text">Distance: 142M miles</small>
        </div>

        {/* Navigation Buttons Grouped by Relationship */}
        <nav className="earth-nav-list">
          <span className="earth-group-title">Crew Monitoring</span>

          <button
            type="button"
            className={`earth-nav-item ${activeTab === 'crew' ? 'active' : ''}`}
            onClick={() => setActiveTab('crew')}
          >
            <Users className="earth-nav-ico" size={18} strokeWidth={2} />
            <div className="earth-nav-lbl">
              <strong>Crew Roster Matrix</strong>
              <small>All 3 Astronauts Live</small>
            </div>
          </button>

          <button
            type="button"
            className={`earth-nav-item ${activeTab === 'telemetry' ? 'active' : ''}`}
            onClick={() => setActiveTab('telemetry')}
          >
            <Activity className="earth-nav-ico" size={18} strokeWidth={2} />
            <div className="earth-nav-lbl">
              <strong>Clinical Inspection</strong>
              <small>8 Gauges &amp; Flight Phases</small>
            </div>
          </button>

          <span className="earth-group-title" style={{ marginTop: '12px' }}>Habitat &amp; Comms</span>

          <button
            type="button"
            className={`earth-nav-item ${activeTab === 'environment' ? 'active' : ''}`}
            onClick={() => setActiveTab('environment')}
          >
            <Shield className="earth-nav-ico" size={18} strokeWidth={2} />
            <div className="earth-nav-lbl">
              <strong>Cabin Air &amp; Systems</strong>
              <small>Oxygen, Pressure, Radiation</small>
            </div>
          </button>

          <button
            type="button"
            className={`earth-nav-item ${activeTab === 'comms' ? 'active' : ''}`}
            onClick={() => setActiveTab('comms')}
          >
            <Radio className="earth-nav-ico" size={18} strokeWidth={2} />
            <div className="earth-nav-lbl">
              <strong>Radio &amp; Doctor Advice</strong>
              <small>Incident Log &amp; Uplink</small>
            </div>
          </button>

          <span className="earth-group-title" style={{ marginTop: '12px' }}>Simulation</span>

          <button
            type="button"
            className={`earth-nav-item ${activeTab === 'simulator' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulator')}
          >
            <FlaskConical className="earth-nav-ico" size={18} strokeWidth={2} />
            <div className="earth-nav-lbl">
              <strong>Emergency Simulation</strong>
              <small>Test Anomaly Injections</small>
            </div>
          </button>
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="earth-sidebar-footer">
          <button
            type="button"
            className="switch-astronaut-screen-btn"
            onClick={() => navigate(`/astronaut/dashboard/${selectedAstronautId}`)}
          >
            <User size={15} strokeWidth={2} />
            <strong>Open Astronaut Screen</strong>
          </button>

          <div className="footer-button-row">
            {onToggleTheme && (
              <button type="button" className="footer-action-btn" onClick={onToggleTheme}>
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
            )}
            <Link to="/" className="footer-action-btn">
              Sign In
            </Link>
            {onLogout && (
              <button type="button" className="footer-action-btn" onClick={onLogout}>
                <LogOut size={13} strokeWidth={2} />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* =========================================================
          RIGHT MAIN VIEWPORT (FITS ENTIRELY ON SCREEN WITHOUT SCROLLING)
          ========================================================= */}
      <div className="earth-viewport-container">
        {/* Top Viewport Header Bar */}
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

          <div className="earth-header-meta">
            {/* Live Watch Telemetry Link Pill */}
            <div className={`earth-stream-sync-pill ${liveWearable.isConnected || isBleConnected ? 'live' : 'sim'}`}>
              <span className={`pulse-dot ${liveWearable.isConnected || isBleConnected ? 'live' : ''}`} />
              <span>
                {liveWearable.isConnected || isBleConnected ? (
                  <>
                    <strong>Elena Park (Oraimo Live):</strong> {selectedAstro.id === 1 ? metrics.hr : (liveWearable.heartRate || 78)} bpm ·{' '}
                    {(liveWearable.steps || (selectedAstro.id === 1 ? metrics.steps : 6420) || 6420).toLocaleString()} steps
                  </>
                ) : (
                  <>Elena Telemetry: Spacecraft Relay (Nominal Stream)</>
                )}
              </span>
            </div>

            {/* Direct Watch Connection / Sync Button */}
            <button
              type="button"
              className={`ground-watch-pair-btn ${isBleConnected || liveWearable.isConnected ? 'connected' : ''}`}
              onClick={isBleConnected ? triggerOraimoSync : connectBleWatch}
              title={isBleConnected ? 'Trigger immediate SEWear sensor sync' : 'Pair Elena Park Oraimo Watch via Chrome Web Bluetooth'}
            >
              <Watch size={13} strokeWidth={2} />
              <span>
                {isBleConnected
                  ? isBleSyncing ? 'Syncing...' : 'Sync Watch'
                  : liveWearable.isConnected
                  ? 'Watch Live'
                  : 'Pair Watch'}
              </span>
            </button>

            <span className="side-confirmation-tag earth">Earth Mission Control (Ground Side)</span>
            <span className="earth-clock-pill">UTC Ground: {currentTime}</span>
            <div className="delay-chip">
              <Clock size={13} strokeWidth={2} />
              <span>Delay: 12m 44s</span>
            </div>
          </div>
        </header>

        {/* Body Viewport (Single-Screen Views) */}
        <div className="earth-viewport-body">
          {/* VIEW 1: CREW ROSTER MATRIX */}
          {activeTab === 'crew' && (
            <div className="earth-view-pane crew-pane">
              <div className="vitals-group-heading">
                <Users size={14} strokeWidth={2} />
                <span>Crew Roster Matrix</span>
              </div>

              <div className="crew-matrix-grid">
                {crewData.map((astro) => {
                  const currentVitals = astro.currentMetrics || astro.baseline[missionPhase]
                  const isSelected = astro.id === selectedAstronautId
                  const isAstroDanger = currentVitals.hr > 140 || currentVitals.o2 < 90 || astro.statusClass === 'danger'
                  const isAstroSpiking =
                    currentVitals.hr > 90 ||
                    currentVitals.o2 < 95 ||
                    currentVitals.fatigue > 55 ||
                    astro.statusClass === 'warning' ||
                    isAstroDanger

                  const cardSpikeClass = isAstroDanger ? 'danger' : isAstroSpiking ? 'warning' : 'good'

                  return (
                    <div
                      key={astro.id}
                      className={`crew-profile-card ${isSelected ? 'selected' : ''} ${cardSpikeClass}`}
                      onClick={() => setSelectedAstronautId(astro.id)}
                    >
                      <div className="card-person-row">
                        <img src={astro.avatarUrl} alt={astro.fullName} className="card-avatar-img" />
                        <div className="card-person-info">
                          <div className="person-name-line">
                            <h3>{astro.fullName}</h3>
                            <span className={`status-pill ${isAstroDanger ? 'danger' : isAstroSpiking ? 'warning' : 'good'}`}>
                              {isAstroSpiking ? (
                                <AlertTriangle size={13} strokeWidth={2.5} />
                              ) : (
                                <ShieldCheck size={13} strokeWidth={2.5} />
                              )}
                              <span>{isAstroDanger ? 'CRITICAL ALERT' : isAstroSpiking ? 'SPIKE DETECTED' : astro.healthStatus}</span>
                            </span>
                          </div>
                          <p className="person-role">{astro.role} · {astro.astronautId}</p>
                        </div>
                      </div>

                      <div className="card-vitals-row">
                        <div className={`v-card-cell ${currentVitals.hr > 140 ? 'cell-danger' : currentVitals.hr > 90 ? 'cell-spike' : ''}`}>
                          <span className="v-cell-lbl">Heart Rate</span>
                          <strong>{currentVitals.hr} <small>bpm</small></strong>
                        </div>
                        <div className={`v-card-cell ${currentVitals.o2 < 90 ? 'cell-danger' : currentVitals.o2 < 95 ? 'cell-spike' : ''}`}>
                          <span className="v-cell-lbl">Oxygen</span>
                          <strong>{currentVitals.o2} <small>%</small></strong>
                        </div>
                        <div className={`v-card-cell ${(parseInt(currentVitals.bp) > 135 || parseInt((currentVitals.bp || '').split('/')[1]) > 88) ? 'cell-spike' : ''}`}>
                          <span className="v-cell-lbl">Pressure</span>
                          <strong>{currentVitals.bp}</strong>
                        </div>
                        <div className={`v-card-cell ${currentVitals.fatigue > 60 ? 'cell-danger' : currentVitals.fatigue > 45 ? 'cell-spike' : ''}`}>
                          <span className="v-cell-lbl">Tiredness</span>
                          <strong>{currentVitals.fatigue} <small>/100</small></strong>
                        </div>
                      </div>

                      <div className="card-actions-bar">
                        <span className="card-hardware-lbl">
                          <Watch size={13} strokeWidth={2} />
                          <span>{astro.wearableSource}</span>
                          {astro.id === 1 && (liveWearable.isConnected || isBleConnected || astro.isLiveWatchConnected) && (
                            <span className="card-live-lock-badge">LIVE LOCK</span>
                          )}
                        </span>
                        <button
                          type="button"
                          className="inspect-card-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedAstronautId(astro.id)
                            setActiveTab('telemetry')
                          }}
                        >
                          <span>Open Detailed Vitals</span>
                          <ArrowRight size={13} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <details className="view-accordion">
                <summary>Telemetry Stream Status Notes</summary>
                <div className="accordion-body">
                  <p>Telemetry stream active across all 3 crew members. Click any card to inspect their live biometrics.</p>
                </div>
              </details>
            </div>
          )}

          {/* VIEW 2: CLINICAL INSPECTION (8 GAUGES + STAGES) */}
          {activeTab === 'telemetry' && (
            <div className="earth-view-pane telemetry-pane">
              {/* Flight Phase Selector Bar */}
              <div className="stage-selector-strip">
                <span className="strip-title">Select Flight Environment:</span>
                <div className="stage-pill-buttons">
                  <button
                    type="button"
                    className={`stage-pill-btn ${missionPhase === 'preFlight' ? 'active' : ''}`}
                    onClick={() => handlePhaseChange('preFlight')}
                  >
                    <Globe size={14} strokeWidth={2} />
                    <span>1. Before Launch (Earth 1.0g)</span>
                  </button>
                  <button
                    type="button"
                    className={`stage-pill-btn ${missionPhase === 'inSpace' ? 'active' : ''}`}
                    onClick={() => handlePhaseChange('inSpace')}
                  >
                    <Compass size={14} strokeWidth={2} />
                    <span>2. Flying in Space (Zero-G Fluid Shift)</span>
                  </button>
                  <button
                    type="button"
                    className={`stage-pill-btn ${missionPhase === 'surface' ? 'active' : ''}`}
                    onClick={() => handlePhaseChange('surface')}
                  >
                    <Cpu size={14} strokeWidth={2} />
                    <span>3. Walking on Mars (0.38g Gravity)</span>
                  </button>
                </div>
              </div>

              {/* Live Telemetry Banner if Elena Park is selected and live watch is connected */}
              {selectedAstro.id === 1 && (liveWearable.isConnected || isBleConnected || selectedAstro.isLiveWatchConnected) && (
                <div className="ground-live-telemetry-banner">
                  <div className="banner-left">
                    <Watch size={16} className="text-emerald-400" />
                    <div>
                      <strong>Direct Wearable Telemetry Active:</strong> Ingesting real-time optical pulse &amp; accelerometer feed from {liveWearable.deviceName || 'Oraimo Watch 2 Pro'} for Elena Park.
                    </div>
                  </div>
                  <div className="banner-right">
                    <span className="live-bpm-badge">{metrics.hr} BPM LIVE</span>
                    <button
                      type="button"
                      className="banner-sync-btn"
                      onClick={isBleConnected ? triggerOraimoSync : () => alert('Telemetric link active. Data streaming from spacecraft relay.')}
                      title="Sync live sensors"
                    >
                      <RefreshCw size={11} className={isBleSyncing ? 'animate-spin' : ''} />
                      <span>{isBleSyncing ? 'Syncing...' : 'Sync'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 8 Gauges Grid */}
              <div className="vitals-group-heading">
                <Activity size={14} strokeWidth={2} />
                <span>Primary Circulatory Vitals</span>
              </div>

              <div className="eight-gauges-grid">
                <article className="clinical-gauge-box">
                  <div className="g-title-row">
                    <span className="g-title">Heart Rate</span>
                    {selectedAstro.id === 1 && (liveWearable.isConnected || isBleConnected || selectedAstro.isLiveWatchConnected) && (
                      <span className="gauge-live-badge">LIVE ORAIMO SENSOR</span>
                    )}
                  </div>
                  <div className="g-val-line">
                    <strong>{metrics.hr}</strong>
                    <span className="g-unit">bpm</span>
                  </div>
                  <p className="g-desc">
                    {selectedAstro.id === 1 && (liveWearable.isConnected || isBleConnected)
                      ? 'Live optical photoplethysmography telemetry from wrist sensor.'
                      : 'Resting pulse sensor. Fluctuating dynamically with autonomic rhythm.'}
                  </p>
                </article>

                <article className="clinical-gauge-box">
                  <span className="g-title">Blood Oxygen</span>
                  <div className="g-val-line">
                    <strong>{metrics.o2}</strong>
                    <span className="g-unit">% SpO2</span>
                  </div>
                  <p className="g-desc">Oxygen saturation. Above 95% indicates nominal lung absorption.</p>
                </article>

                <article className="clinical-gauge-box">
                  <span className="g-title">Blood Pressure</span>
                  <div className="g-val-line">
                    <strong>{metrics.bp}</strong>
                    <span className="g-unit">mmHg</span>
                  </div>
                  <p className="g-desc">Circulatory pressure required to supply the brain in microgravity.</p>
                </article>

                <article className="clinical-gauge-box">
                  <span className="g-title">Body Temperature</span>
                  <div className="g-val-line">
                    <strong>{Number(metrics.temp).toFixed(1)}°</strong>
                    <span className="g-unit">C</span>
                  </div>
                  <p className="g-desc">Normal core body warmth. Circadian regulation is functioning well.</p>
                </article>
              </div>

              <div className="vitals-group-heading">
                <ShieldCheck size={14} strokeWidth={2} />
                <span>Respiration &amp; Physiological Biomarkers</span>
              </div>

              <div className="eight-gauges-grid">
                <article className="clinical-gauge-box">
                  <span className="g-title">Breathing Rate</span>
                  <div className="g-val-line">
                    <strong>{metrics.resp}</strong>
                    <span className="g-unit">rpm</span>
                  </div>
                  <p className="g-desc">Thoracic bio-sensor. 12 to 20 breaths per minute is healthy.</p>
                </article>

                <article className="clinical-gauge-box">
                  <span className="g-title">Sleep &amp; Rest</span>
                  <div className="g-val-line">
                    <strong>{metrics.fatigue}</strong>
                    <span className="g-unit">/100 score</span>
                  </div>
                  <p className="g-desc">{Number(metrics.sleep).toFixed(1)} hours of rest. Cognitive alertness scores are sharp.</p>
                </article>

                <article className="clinical-gauge-box">
                  <span className="g-title">Immune Defense</span>
                  <div className="g-val-line">
                    <strong>{metrics.immune}</strong>
                    <span className="g-unit">% stress</span>
                  </div>
                  <p className="g-desc">Salivary biomarker check. Low stress score indicates dormant viruses.</p>
                </article>

                <article className="clinical-gauge-box">
                  <span className="g-title">Bone &amp; Muscle Strength</span>
                  <div className="g-val-line">
                    <strong>{selectedAstro.id === 1 && (liveWearable.steps || metrics.steps) ? `${(liveWearable.steps || metrics.steps).toLocaleString()} steps` : '96.4%'}</strong>
                    <span className="g-unit">{selectedAstro.id === 1 && (liveWearable.steps || metrics.steps) ? 'BMD Loading' : 'BMD'}</span>
                  </div>
                  <p className="g-desc">
                    {selectedAstro.id === 1 && (liveWearable.steps || metrics.steps)
                      ? 'Daily mechanical stride loading via T2 treadmill & Oraimo tri-axial accelerometer.'
                      : 'Daily resistive exercise countermeasure preserving bone density.'}
                  </p>
                </article>
              </div>

              <details className="view-accordion">
                <summary>Flight Surgeon Clinical Notes</summary>
                <div className="accordion-body">
                  <p>Resting pulse and circulatory pressure required to supply the brain in microgravity. Autonomic rhythm fluctuates dynamically.</p>
                  <p>Daily resistive exercise countermeasure preserving bone density (BMD).</p>
                </div>
              </details>
            </div>
          )}

          {/* VIEW 3: CABIN AIR & SYSTEMS */}
          {activeTab === 'environment' && (
            <div className="earth-view-pane environment-pane">
              <div className="vitals-group-heading">
                <Wind size={14} strokeWidth={2} />
                <span>Atmosphere &amp; Pressure</span>
              </div>

              <div className="cabin-systems-grid">
                <div className="system-metric-card">
                  <span className="sys-label">Cabin Oxygen (O2)</span>
                  <strong>{cabinEnv.oxygen}%</strong>
                  <small>Nominal breathable air (Standard setpoint: 21.0%)</small>
                </div>

                <div className="system-metric-card">
                  <span className="sys-label">Carbon Dioxide (ppCO2)</span>
                  <strong>{cabinEnv.co2}%</strong>
                  <small>Scrubbers active. Safe limit is below 0.50%</small>
                </div>

                <div className="system-metric-card">
                  <span className="sys-label">Cabin Air Pressure</span>
                  <strong>{cabinEnv.pressure} kPa</strong>
                  <small>Standard sea-level atmospheric equivalent</small>
                </div>
              </div>

              <div className="vitals-group-heading">
                <Shield size={14} strokeWidth={2} />
                <span>Habitat Systems &amp; Environment</span>
              </div>

              <div className="cabin-systems-grid">
                <div className="system-metric-card">
                  <span className="sys-label">Room Temperature</span>
                  <strong>{cabinEnv.temp} °C</strong>
                  <small>Comfortable living range automatically maintained</small>
                </div>

                <div className="system-metric-card">
                  <span className="sys-label">Space Radiation Level</span>
                  <strong>{cabinEnv.radiation} mSv / day</strong>
                  <small>Ship storm shields are protecting the crew</small>
                </div>

                <div className="system-metric-card">
                  <span className="sys-label">Clean Recycled Water</span>
                  <strong>{cabinEnv.water}%</strong>
                  <small>Closed-loop water filters functioning at peak capacity</small>
                </div>
              </div>

              <details className="view-accordion">
                <summary>Environmental Life Support Diagnostics</summary>
                <div className="accordion-body">
                  <p>Closed-loop water filters functioning at peak capacity. Safe CO2 limit is below 0.50%.</p>
                </div>
              </details>

              <div className="systems-summary-banner">
                <ShieldCheck size={18} strokeWidth={2} />
                <strong>Spacecraft Life Support Status: ALL SYSTEMS NOMINAL (Dynamic Telemetry Link Active)</strong>
              </div>
            </div>
          )}

          {/* VIEW 4: RADIO COMMS & DOCTOR ADVICE */}
          {activeTab === 'comms' && (
            <div className="earth-view-pane comms-pane">
              <div className="comms-split-layout">
                {/* Left: Incident Feed */}
                <div className="comms-feed-column">
                  <h3>Recent Medical Events Received</h3>
                  <div className="incident-card-feed">
                    {INCIDENT_LOGS.slice(0, 1).map((inc) => (
                      <div key={inc.id} className="feed-incident-box">
                        <div className="incident-box-header">
                          <strong>{inc.title}</strong>
                          <span className="status-pill good">
                            <ShieldCheck size={13} strokeWidth={2.5} />
                            <span>Resolved</span>
                          </span>
                        </div>
                        <div className="incident-time-stamp">
                          <span><Clock size={12} strokeWidth={2} /> {inc.timeOccurred}</span>
                          <span><Radio size={12} strokeWidth={2} /> {inc.delayNote}</span>
                        </div>
                        <p className="incident-quote">
                          <strong>Onboard Computer Action:</strong> {inc.whatShipDid}
                        </p>
                        <p className="incident-quote doc">
                          <strong>Houston Doctor Confirmation:</strong> {inc.doctorAdvice}
                        </p>
                      </div>
                    ))}

                    {INCIDENT_LOGS.length > 1 && (
                      <details className="view-accordion">
                        <summary>Earlier Incident Logs ({INCIDENT_LOGS.length - 1} earlier record)</summary>
                        <div className="accordion-body">
                          {INCIDENT_LOGS.slice(1).map((inc) => (
                            <div key={inc.id} className="feed-incident-box" style={{ marginTop: '8px' }}>
                              <div className="incident-box-header">
                                <strong>{inc.title}</strong>
                                <span className="status-pill good">
                                  <ShieldCheck size={13} strokeWidth={2.5} />
                                  <span>Resolved</span>
                                </span>
                              </div>
                              <div className="incident-time-stamp">
                                <span><Clock size={12} strokeWidth={2} /> {inc.timeOccurred}</span>
                                <span><Radio size={12} strokeWidth={2} /> {inc.delayNote}</span>
                              </div>
                              <p className="incident-quote">
                                <strong>Onboard Computer Action:</strong> {inc.whatShipDid}
                              </p>
                              <p className="incident-quote doc">
                                <strong>Houston Doctor Confirmation:</strong> {inc.doctorAdvice}
                              </p>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>

                {/* Right: Message Dispatch */}
                <div className="comms-dispatch-column">
                  <h3>Dispatch Doctor's Advisory Note</h3>
                  <form onSubmit={handleSendMessage} className="advice-send-form">
                    <label htmlFor="advisory-text">
                      Message for {selectedAstro.fullName} ({selectedAstro.role}):
                    </label>
                    <textarea
                      id="advisory-text"
                      rows="4"
                      placeholder="e.g. Please sit down, drink plenty of water with electrolytes, and rest for 30 minutes..."
                      value={doctorNote}
                      onChange={(e) => setDoctorNote(e.target.value)}
                    />
                    <button type="submit" className="send-uplink-btn">
                      <Send size={15} strokeWidth={2} />
                      <span>Send Radio Message to Spacecraft (~12m delay)</span>
                    </button>
                  </form>

                  {sentMessages.length > 0 && (
                    <div className="sent-queue-block">
                      <h4>Messages Currently In Transit:</h4>
                      {sentMessages.map((msg) => (
                        <div key={msg.id} className="transit-msg-item">
                          <div className="transit-header">
                            <strong>To: {msg.to}</strong>
                            <span>{msg.timeSent}</span>
                          </div>
                          <p>"{msg.text}"</p>
                          <small>Estimated arrival on spacecraft: ~{msg.eta}</small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 5: EMERGENCY SIMULATION LAB */}
          {activeTab === 'simulator' && (
            <div className="earth-view-pane simulator-pane">
              <div className="sim-lab-card">
                <h3>Test How the Clinical Brain Responds to Emergencies</h3>

                <div className="vitals-group-heading">
                  <FlaskConical size={14} strokeWidth={2} />
                  <span>Simulation Scenarios</span>
                </div>

                <div className="scenario-buttons-grid">
                  <button
                    type="button"
                    className={`scenario-box-btn ${activeScenario === 'tachycardia' ? 'active danger' : ''}`}
                    onClick={() => triggerScenario('tachycardia')}
                  >
                    <Zap className="scenario-btn-icon" size={22} strokeWidth={2} />
                    <strong>Acute Tachycardia Surge</strong>
                    <small>Spikes heart rate to 176 bpm due to sudden zero-G fluid shift</small>
                  </button>

                  <button
                    type="button"
                    className={`scenario-box-btn ${activeScenario === 'hypoxia' ? 'active danger' : ''}`}
                    onClick={() => triggerScenario('hypoxia')}
                  >
                    <Wind className="scenario-btn-icon" size={22} strokeWidth={2} />
                    <strong>Cabin Hypoxia Drop</strong>
                    <small>Drops SpO2 to 89% and elevates breathing rate</small>
                  </button>

                  <button
                    type="button"
                    className={`scenario-box-btn ${activeScenario === 'immune' ? 'active warning' : ''}`}
                    onClick={() => triggerScenario('immune')}
                  >
                    <ShieldAlert className="scenario-btn-icon" size={22} strokeWidth={2} />
                    <strong>Immune Stress Flare</strong>
                    <small>Elevates saliva stress biomarkers and body temperature</small>
                  </button>

                  <button
                    type="button"
                    className="scenario-box-btn reset"
                    onClick={() => triggerScenario('nominal')}
                  >
                    <RotateCcw className="scenario-btn-icon" size={22} strokeWidth={2} />
                    <strong>Reset to Nominal Baseline</strong>
                    <small>Restores healthy, steady resting metrics</small>
                  </button>
                </div>

                <div className="sim-current-status-box">
                  <strong>Selected Astronaut for Test:</strong> {selectedAstro.fullName} ({selectedAstro.astronautId}) · Current Health Status: <span className="status-highlight">{selectedAstro.healthStatus}</span>
                </div>

                <details className="view-accordion">
                  <summary>How This Simulation Operates</summary>
                  <div className="accordion-body">
                    <p>Click any scenario above to inject a simulated physiological surge. Watch how the vital numbers adapt and how the system alerts the crew in real time.</p>
                  </div>
                </details>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
