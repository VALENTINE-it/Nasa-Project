import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Watch, Radio } from 'lucide-react'
import EarthWatchConsole from './EarthWatchConsole'
import PublicLoginPage from './components/PublicLoginPage'
import AstronautSidebar from './components/AstronautSidebar'
import DailyVitalsView from './components/DailyVitalsView'
import HealthTrendsView from './components/HealthTrendsView'
import MedicalAdviceView from './components/MedicalAdviceView'
import CheckupHistoryView from './components/CheckupHistoryView'
import MissionProfileView from './components/MissionProfileView'
import useWearableBluetooth from './hooks/useWearableBluetooth'
import './App.css'

function getFallbackDashboard(id) {
  const crewMap = {
    1: {
      profile: {
        astronautId: 'A-2041',
        fullName: 'Elena Park',
        role: 'Mission Commander',
        avatarUrl: '/avatars/astronaut-1.svg',
        mission: 'Artemis Mars Flight',
        personalOverview:
          'Commanding Officer for deep-space transit to Mars. Tracking circadian stability and cardio tolerance.',
      },
      latest: {
        heartRate: 78,
        bloodPressure: '124/80',
        bloodOxygen: 98,
        bodyTemperature: 36.8,
        respiratoryRate: 16,
        sleepDuration: 7.2,
        physicalActivity: 6840,
      },
      history: [
        {
          id: 1,
          recordedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
          heartRate: 70,
          bloodPressure: '118/76',
          bloodOxygen: 99,
          sleepDuration: 7.5,
        },
        {
          id: 2,
          recordedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          heartRate: 72,
          bloodPressure: '120/78',
          bloodOxygen: 99,
          sleepDuration: 7.0,
        },
        {
          id: 3,
          recordedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
          heartRate: 74,
          bloodPressure: '122/80',
          bloodOxygen: 98,
          sleepDuration: 6.8,
        },
        {
          id: 4,
          recordedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          heartRate: 76,
          bloodPressure: '124/80',
          bloodOxygen: 98,
          sleepDuration: 6.5,
        },
        {
          id: 5,
          recordedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          heartRate: 75,
          bloodPressure: '122/78',
          bloodOxygen: 99,
          sleepDuration: 7.1,
        },
        {
          id: 6,
          recordedAt: new Date(Date.now() - 86400000).toISOString(),
          heartRate: 78,
          bloodPressure: '124/80',
          bloodOxygen: 98,
          sleepDuration: 7.2,
        },
      ],
      alerts: [],
      summary: {
        avgHeartRate: 74,
        avgBloodOxygen: 98.5,
      },
    },
    2: {
      profile: {
        astronautId: 'A-2056',
        fullName: 'Daniel Ortiz',
        role: 'Medical & Systems Officer',
        avatarUrl: '/avatars/astronaut-2.svg',
        mission: 'Mars Flight Operations',
        personalOverview:
          'Medical systems specialist. Monitoring microgravity muscle atrophy countermeasures and sleep architecture.',
      },
      latest: {
        heartRate: 88,
        bloodPressure: '136/88',
        bloodOxygen: 97,
        bodyTemperature: 37.2,
        respiratoryRate: 18,
        sleepDuration: 5.2,
        physicalActivity: 4920,
      },
      history: [
        {
          id: 1,
          recordedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
          heartRate: 76,
          bloodPressure: '122/80',
          bloodOxygen: 99,
          sleepDuration: 7.0,
        },
        {
          id: 2,
          recordedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          heartRate: 80,
          bloodPressure: '126/82',
          bloodOxygen: 98,
          sleepDuration: 6.4,
        },
        {
          id: 3,
          recordedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
          heartRate: 84,
          bloodPressure: '130/84',
          bloodOxygen: 97,
          sleepDuration: 5.8,
        },
        {
          id: 4,
          recordedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          heartRate: 86,
          bloodPressure: '134/86',
          bloodOxygen: 97,
          sleepDuration: 5.5,
        },
        {
          id: 5,
          recordedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          heartRate: 87,
          bloodPressure: '135/86',
          bloodOxygen: 97,
          sleepDuration: 5.4,
        },
        {
          id: 6,
          recordedAt: new Date(Date.now() - 86400000).toISOString(),
          heartRate: 88,
          bloodPressure: '136/88',
          bloodOxygen: 97,
          sleepDuration: 5.2,
        },
      ],
      alerts: [
        {
          id: 1,
          metricName: 'Sleep Deficit & Reaction Time',
          severity: 'warning',
          description: 'Rest cycle below 6-hour minimum for consecutive flight shifts.',
          observedValue: '5.2 hrs',
          threshold: '7.0 – 8.0 hrs',
        },
      ],
      summary: {
        avgHeartRate: 83,
        avgBloodOxygen: 97.5,
      },
    },
    3: {
      profile: {
        astronautId: 'A-2089',
        fullName: 'Priya Shah',
        role: 'Science Specialist',
        avatarUrl: '/avatars/astronaut-3.svg',
        mission: 'Deep-Space Habitat Systems',
        personalOverview:
          'Science lead focusing on radiation biology, hydroponic atmosphere scrubbers, and bone mineral preservation.',
      },
      latest: {
        heartRate: 72,
        bloodPressure: '120/76',
        bloodOxygen: 98,
        bodyTemperature: 36.7,
        respiratoryRate: 15,
        sleepDuration: 6.8,
        physicalActivity: 7150,
      },
      history: [
        {
          id: 1,
          recordedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
          heartRate: 66,
          bloodPressure: '116/74',
          bloodOxygen: 99,
          sleepDuration: 7.8,
        },
        {
          id: 2,
          recordedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          heartRate: 68,
          bloodPressure: '118/74',
          bloodOxygen: 99,
          sleepDuration: 7.2,
        },
        {
          id: 3,
          recordedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
          heartRate: 70,
          bloodPressure: '120/76',
          bloodOxygen: 98,
          sleepDuration: 7.0,
        },
        {
          id: 4,
          recordedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          heartRate: 71,
          bloodPressure: '120/76',
          bloodOxygen: 98,
          sleepDuration: 6.9,
        },
        {
          id: 5,
          recordedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          heartRate: 72,
          bloodPressure: '120/76',
          bloodOxygen: 98,
          sleepDuration: 6.8,
        },
        {
          id: 6,
          recordedAt: new Date(Date.now() - 86400000).toISOString(),
          heartRate: 72,
          bloodPressure: '120/76',
          bloodOxygen: 98,
          sleepDuration: 6.8,
        },
      ],
      alerts: [],
      summary: {
        avgHeartRate: 69,
        avgBloodOxygen: 98.6,
      },
    },
  }
  return crewMap[id] || crewMap[1]
}

function App() {
  const [sessionUser, setSessionUser] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('auramed_theme') || 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('auramed_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  useEffect(() => {
    let isSubscribed = true
    async function loadSession() {
      try {
        const response = await fetch('/api/auth/session', { credentials: 'include' })
        if (!response.ok) {
          if (isSubscribed) setSessionUser(null)
          return
        }
        const data = await response.json()
        if (isSubscribed) setSessionUser(data.authenticated ? data.user : null)
      } catch {
        if (isSubscribed) setSessionUser(null)
      } finally {
        if (isSubscribed) setSessionLoading(false)
      }
    }
    loadSession()
    return () => {
      isSubscribed = false
    }
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // silent
    }
    setSessionUser(null)
  }

  if (sessionLoading) {
    return (
      <div className="full-viewport-loading">
        <div className="clean-spinner" />
        <p>Connecting to spacecraft telemetry network...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            sessionUser ? (
              <Navigate to={`/astronaut/dashboard/${sessionUser.astronautId}`} replace />
            ) : (
              <PublicLoginPage
                onAuthenticated={setSessionUser}
                theme={theme}
                onToggleTheme={toggleTheme}
              />
            )
          }
        />

        <Route
          path="/astronaut/dashboard/:id"
          element={
            <ProtectedDashboard
              session={sessionUser}
              onLogout={handleLogout}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        />

        {/* Earth Mission Control Console */}
        <Route
          path="/console"
          element={
            <EarthWatchConsole
              onLogout={handleLogout}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function ProtectedDashboard({ session, onLogout, theme, onToggleTheme }) {
  const { id } = useParams()
  const astronautId = Number(id) || 1
  const [dashboardData, setDashboardData] = useState(() => getFallbackDashboard(astronautId))
  const [activeTab, setActiveTab] = useState('vitals')
  const [timeframe, setTimeframe] = useState('week')
  const [scenarioMode, setScenarioMode] = useState('nominal') // 'nominal' | 'tachycardia' | 'hypoxia' | 'radiation'
  const [environmentMode, setEnvironmentMode] = useState('spacecraft') // 'spacecraft' | 'lunar_base' | 'mars_eva'

  // Scheduled measurement reminder protocol (content.md line 12)
  const [upcomingReminder, setUpcomingReminder] = useState({
    id: 'rem-1',
    title: 'Mid-Shift Salivary Biomarker & Blood Pressure Check',
    dueIn: '25 mins',
    protocol: 'Passive drool collection into cryo-vial; seated BP reading.',
    taken: false,
  })

  const baseProfile = dashboardData || getFallbackDashboard(astronautId)
  const [liveVitals, setLiveVitals] = useState(() => ({ ...baseProfile.latest }))
  const [liveHistory, setLiveHistory] = useState(() => {
    const raw = baseProfile.history || []
    if (raw.length >= 16) return [...raw]
    const baseHr = baseProfile.latest?.heartRate || 74
    const baseO2 = baseProfile.latest?.bloodOxygen || 98
    const baseBp = baseProfile.latest?.bloodPressure || '120/78'
    const now = Date.now()
    const expanded = []
    for (let i = 16; i >= 1; i--) {
      expanded.push({
        id: `init-${i}`,
        recordedAt: new Date(now - i * 3000).toISOString(),
        heartRate: baseHr + (i % 2 === 0 ? 1 : -1),
        bloodPressure: baseBp,
        bloodOxygen: baseO2,
        sleepDuration: baseProfile.latest?.sleepDuration || 7.0,
      })
    }
    return expanded
  })
  const [activityMode, setActivityMode] = useState('nominal') // 'nominal' | 'exercise' | 'stress'
  const [isStreaming, setIsStreaming] = useState(true)

  // Web Bluetooth integration for live Oraimo Smartwatch telemetry
  const {
    connectionStatus: bleStatus,
    deviceName: bleDeviceName,
    connectDevice: connectBleWatch,
    disconnectDevice: disconnectBleWatch,
    isConnected: isBleConnected,
  } = useWearableBluetooth({
    onHeartRateUpdate: ({ heartRate }) => {
      setLiveVitals((prev) => (prev ? { ...prev, heartRate } : prev))
    },
  })

  // Live Wearable Relay Bridge (MacroDroid / Direct Device HTTP push)
  const [wearableBridge, setWearableBridge] = useState({
    isConnected: false,
    deviceName: 'oraimo watch 2 pro_4ED7',
    heartRate: 0,
    steps: 0,
    spO2: 0,
    lastSeen: '',
  })

  useEffect(() => {
    let active = true
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/wearable/live')
        if (!res.ok) return
        const data = await res.json()
        if (active && data) {
          setWearableBridge(data)
          if (data.isConnected && data.heartRate > 0) {
            setLiveVitals((prev) => ({
              ...prev,
              heartRate: data.heartRate,
              ...(typeof data.steps === 'number' ? { physicalActivity: data.steps } : {}),
              ...(data.spO2 ? { bloodOxygen: data.spO2 } : {}),
            }))
          }
        }
      } catch {
        // Fallback gracefully
      }
    }, 2000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  // Ingest deep-space radio advisory notes from Houston ground station (NVIDIA QA Fix)
  const [houstonMessages, setHoustonMessages] = useState([])
  const [dismissedMessages, setDismissedMessages] = useState([])

  useEffect(() => {
    let active = true
    const fetchComms = async () => {
      try {
        const res = await fetch('/api/comms/messages')
        if (res.ok) {
          const list = await res.json()
          if (active && Array.isArray(list)) {
            setHoustonMessages(list)
          }
        }
      } catch {
        // Fallback gracefully
      }
    }
    fetchComms()
    const interval = setInterval(fetchComms, 4000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        const [dashRes, summaryRes] = await Promise.all([
          fetch(`/api/astronauts/${astronautId}/dashboard`, { credentials: 'include' }),
          fetch(`/api/astronauts/${astronautId}/analytics/summary`, { credentials: 'include' }),
        ])

        if (dashRes.ok) {
          const dashJson = await dashRes.json()
          const summaryJson = summaryRes.ok ? await summaryRes.json() : {}

          if (active) {
            setDashboardData({
              ...dashJson,
              summary: summaryJson,
            })
            if (dashJson.latest) {
              setLiveVitals({ ...dashJson.latest })
            }
            if (dashJson.history) {
              setLiveHistory([...dashJson.history])
            }
          }
        }
      } catch {
        // Fallback data initialized above
      }
    }

    loadData()
    return () => {
      active = false
    }
  }, [astronautId])

  // REAL-TIME DYNAMIC VITALS ENGINE (Calibrated against NASA HRP & OSDR spaceflight baselines)
  useEffect(() => {
    if (!isStreaming) return

    const interval = setInterval(() => {
      setLiveVitals((prev) => {
        if (!prev) return prev

        let targetHr = 75
        let targetO2 = 98
        let targetResp = 16
        let targetSystolic = 122
        let targetDiastolic = 80
        let baseTemp = 36.8

        // Environmental Physics Calibration (Microgravity 0g vs Lunar 0.16g vs Mars EVA 0.38g)
        if (environmentMode === 'lunar_base') {
          targetHr = 72
          targetSystolic = 118
          targetDiastolic = 76
        } else if (environmentMode === 'mars_eva') {
          targetHr = 84
          targetResp = 18
          targetSystolic = 128
          targetDiastolic = 82
        }

        // Activity mode adjustments
        if (activityMode === 'exercise') {
          targetHr = 138
          targetO2 = 96
          targetResp = 26
          targetSystolic = 148
          targetDiastolic = 88
          baseTemp = 37.4
        } else if (activityMode === 'stress') {
          targetHr = 112
          targetO2 = 97
          targetResp = 22
          targetSystolic = 138
          targetDiastolic = 86
          baseTemp = 37.1
        }

        // Scenario mode overrides (Emergency anomaly injections)
        if (scenarioMode === 'tachycardia') {
          targetHr = 162
          targetSystolic = 154
          targetDiastolic = 94
          targetResp = 22
          baseTemp = 37.1
        } else if (scenarioMode === 'hypoxia') {
          targetO2 = 89
          targetResp = 28
          targetHr = 106
          targetSystolic = 136
        } else if (scenarioMode === 'radiation') {
          baseTemp = 38.0
          targetHr = 94
          targetResp = 18
        }

        // If Oraimo BLE watch or Mobile Relay bridge is connected, live pulse tracks watch with organic sinus arrhythmia
        const isWatchActive = isBleConnected || wearableBridge.isConnected
        const hrStep = isWatchActive ? 0 : Math.round((targetHr - prev.heartRate) * 0.15)
        const hrJitter = isWatchActive
          ? (Math.random() > 0.65 ? (Math.random() > 0.5 ? 1 : -1) : 0)
          : Math.floor(Math.random() * 5) - 2
        const newHr = Math.max(55, Math.min(185, prev.heartRate + hrStep + hrJitter))

        const o2Step = Math.round((targetO2 - prev.bloodOxygen) * 0.2)
        const o2Jitter = Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0
        const newO2 = Math.max(86, Math.min(100, prev.bloodOxygen + o2Step + o2Jitter))

        const respStep = Math.round((targetResp - prev.respiratoryRate) * 0.2)
        const respJitter = Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0
        const newResp = Math.max(12, Math.min(32, prev.respiratoryRate + respStep + respJitter))

        const bpParts = (prev.bloodPressure || '120/80').split('/')
        const curSys = parseInt(bpParts[0], 10) || 120
        const curDia = parseInt(bpParts[1], 10) || 80
        const sysStep = Math.round((targetSystolic - curSys) * 0.15)
        const diaStep = Math.round((targetDiastolic - curDia) * 0.15)
        const newSys = curSys + sysStep + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0)
        const newDia = curDia + diaStep + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0)

        const tempJitter = +(Math.random() * 0.04 - 0.02).toFixed(2)
        const newTemp = +(baseTemp + tempJitter).toFixed(1)

        const stepIncrement =
          activityMode === 'exercise'
            ? Math.floor(Math.random() * 8) + 12
            : Math.floor(Math.random() * 2)

        return {
          ...prev,
          heartRate: newHr,
          bloodOxygen: newO2,
          respiratoryRate: newResp,
          bloodPressure: `${newSys}/${newDia}`,
          bodyTemperature: newTemp,
          physicalActivity: (prev.physicalActivity || 6500) + stepIncrement,
        }
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [activityMode, scenarioMode, environmentMode, isStreaming, isBleConnected, wearableBridge.isConnected])

  // Stable ref for latest vitals so history timer is never prematurely reset by 2s vitals updates
  const liveVitalsRef = useRef(liveVitals)
  useEffect(() => {
    liveVitalsRef.current = liveVitals
  }, [liveVitals])

  // Periodically append live readings to dynamic history so graphs advance in real time
  useEffect(() => {
    if (!isStreaming) return

    const historyInterval = setInterval(() => {
      const current = liveVitalsRef.current
      if (!current) return

      setLiveHistory((prev) => {
        const safePrev = prev && prev.length ? prev : []
        const newRecord = {
          id: Date.now(),
          recordedAt: new Date().toISOString(),
          heartRate: current.heartRate,
          bloodPressure: current.bloodPressure,
          bloodOxygen: current.bloodOxygen,
          sleepDuration: current.sleepDuration,
        }
        // Keep a rolling buffer of 24 points so the waveform scrolls smoothly across the screen
        return [...safePrev.slice(-23), newRecord]
      })
    }, 2500)

    return () => clearInterval(historyInterval)
  }, [isStreaming])

  const { profile, alerts } = baseProfile
  const latest = liveVitals || baseProfile.latest
  const isPulseElevated = latest && (latest.heartRate > 95 || scenarioMode !== 'nominal')
  const statusClass = isPulseElevated ? 'warning' : 'good'
  const statusLabel = scenarioMode === 'tachycardia'
    ? 'Heart Racing (>120 bpm)'
    : scenarioMode === 'hypoxia'
    ? 'Air Warning (Low O2)'
    : scenarioMode === 'radiation'
    ? 'Radiation Alert'
    : isPulseElevated
    ? 'Attention Needed'
    : 'Healthy & Steady'

  // Dynamic notices based on live vitals & scenarios (Plain human English triggers)
  const dynamicAlerts = [...(alerts || [])]

  if (scenarioMode === 'tachycardia' || latest.heartRate > 120) {
    dynamicAlerts.unshift({
      id: 'live-alert-tachycardia',
      metricName: 'Blood Rushing to Chest: Pulse Hammering Fast',
      severity: 'warning',
      questionTrigger: "Has the astronaut's heart started racing over 120 beats a minute?",
      description: `Their heart is pounding at ${latest.heartRate} beats per minute because blood has pooled into their chest with no gravity.`,
      observedValue: `${latest.heartRate} bpm`,
      threshold: '60 – 100 bpm (Calm)',
      countermeasure: 'Sit them down against the wall right now, hand them a 500 mL water drink pouch with 2 salt pills from Bulkhead Locker 2, and check pulse in 10 minutes.',
    })
  }

  if (scenarioMode === 'hypoxia' || latest.bloodOxygen < 93) {
    dynamicAlerts.unshift({
      id: 'live-alert-hypoxia',
      metricName: 'Bad Cabin Air: Low Oxygen & Trapped Breath',
      severity: 'warning',
      questionTrigger: 'Is someone gasping for breath or suffering a throbbing headache?',
      description: `Blood oxygen dropped to ${latest.bloodOxygen}%. Old exhaled carbon dioxide breath is building up in the cabin because filters are full.`,
      observedValue: `${latest.bloodOxygen}% Oxygen`,
      threshold: '95 – 100% (Healthy)',
      countermeasure: 'Pull the orange emergency oxygen mask from Bulkhead Locker 4 and strap it on immediately, then switch the air scrubber lever to BACKUP LiOH.',
    })
  }

  if (scenarioMode === 'radiation') {
    dynamicAlerts.unshift({
      id: 'live-alert-radiation',
      metricName: 'Space Radiation Storm: Solar Flare Warning',
      severity: 'warning',
      questionTrigger: 'Has the loud radiation siren or strobe light turned on?',
      description: 'The Sun launched a solar storm outside the ship. Outside radiation meters are clicking fast at 1.42 mSv/hr.',
      observedValue: '1.42 mSv/hr (High Flare)',
      threshold: '< 0.05 mSv/hr (Safe Normal)',
      countermeasure: 'Move all crew into the center sleep storm bunker behind the water walls right away and clip on dosimeter badges.',
    })
  }

  // Microgravity Musculoskeletal & Bone Loss Warning (Directly tied to Oraimo Watch steps)
  if ((latest?.physicalActivity ?? 6000) < 3000 && environmentMode === 'spacecraft') {
    dynamicAlerts.push({
      id: 'live-alert-musculoskeletal',
      metricName: 'Microgravity Bone & Muscle Loss: Under Exercise Target',
      severity: 'warning',
      questionTrigger: 'Has the astronaut logged fewer than 3,000 steps during this shift?',
      description: `Only ${(latest?.physicalActivity ?? 0).toLocaleString()} steps detected by Oraimo wrist sensor. In zero-G, lack of impact forces causes 1.0–1.5% bone mineral loss per month into the kidneys (kidney stone risk).`,
      observedValue: `${(latest?.physicalActivity ?? 0).toLocaleString()} steps`,
      threshold: '6,000+ steps (NASA T2 Exercise Target)',
      countermeasure: 'Strap into the T2 treadmill bungee harness or CEVIS cycle ergometer in the service module for a 45-minute mechanical loading session to protect bone mineral density.',
    })
  }

  const records = [...(liveHistory || [])].reverse()
  // Maintain a rich 16-20 point sample window so polyline waveform is smooth and continuous
  const chartSeries = liveHistory.length > 0 ? liveHistory.slice(-20) : []

  const heartPoints = buildChartPoints(
    chartSeries.map((r) => r.heartRate),
    { defaultMin: 50, defaultMax: 140, minSpan: 30 }
  )
  const oxygenPoints = buildChartPoints(
    chartSeries.map((r) => r.bloodOxygen),
    { defaultMin: 88, defaultMax: 100, minSpan: 12 }
  )

  // Find incoming Houston flight surgeon advisory for this astronaut (NVIDIA QA Fix)
  const activeHoustonMsg = houstonMessages.find((m) => {
    if (dismissedMessages.includes(m.id)) return false
    const astroName = (profile?.fullName || '').toLowerCase()
    const target = (m.to || '').toLowerCase()
    return target.includes('crew') || target.includes('commander') || target.includes('officer') || (astroName && target.includes(astroName.split(' ')[0]))
  })

  return (
    <div className="workstation-app-layout">
      {/* Left Navigation Bar (Sidebar) */}
      <AstronautSidebar
        profile={profile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dynamicAlertsCount={dynamicAlerts.length}
        theme={theme}
        onToggleTheme={onToggleTheme}
        session={session}
        onLogout={onLogout}
      />

      {/* Right Main Viewport */}
      <div className="main-viewport-content">
        <header className="viewport-top-header">
          <div>
            <div className="breadcrumb-line">
              <span>{profile.fullName}</span> &rsaquo;{' '}
              <strong className="active-view-name">
                {activeTab === 'vitals' && 'Daily Vitals Overview'}
                {activeTab === 'trends' && 'Health Trends & Comparison Charts'}
                {activeTab === 'notices' && 'Medical Notices & Automated Advice'}
                {activeTab === 'history' && 'Checkup History & Recent Logs'}
                {activeTab === 'profile' && 'Astronaut & Mission Flight Profile'}
              </strong>
            </div>
            <h1>
              {activeTab === 'vitals' && `${profile.fullName}'s Dynamic Health Telemetry`}
              {activeTab === 'trends' && 'Vital Sign Changes Over Time'}
              {activeTab === 'notices' && 'Onboard Medical Recommendations'}
              {activeTab === 'history' && 'Chronological Medical Check History'}
              {activeTab === 'profile' && 'Spacecraft Environment & Profile'}
            </h1>
          </div>

          <div className="top-header-stats">
            <span className="side-confirmation-tag astronaut">Astronaut Workstation (Crew Side)</span>

            {/* Environmental Mission Context Switcher (content.md line 14) */}
            <div className="scenario-selector-pill">
              <span className="scenario-label">Environment:</span>
              <select
                className="scenario-select"
                value={environmentMode}
                onChange={(e) => setEnvironmentMode(e.target.value)}
                title="Adapt telemetry to different space environments"
              >
                <option value="spacecraft">Transit Spacecraft (0.00g)</option>
                <option value="lunar_base">Lunar Outpost (0.16g)</option>
                <option value="mars_eva">Mars Surface EVA (0.38g)</option>
              </select>
            </div>

            {/* Scenario Anomaly Simulation Switcher */}
            <div className="scenario-selector-pill">
              <span className="scenario-label">Scenario:</span>
              <select
                className="scenario-select"
                value={scenarioMode}
                onChange={(e) => setScenarioMode(e.target.value)}
                title="Simulate realistic spaceflight physiological scenarios"
              >
                <option value="nominal">Normal Flight (All Green &amp; Healthy)</option>
                <option value="tachycardia">If Heart Races: Chest Pounding (&gt;120 bpm)</option>
                <option value="hypoxia">If Air Goes Bad: Gasping &amp; Headache</option>
                <option value="radiation">If Radiation Alarm Sounds: Solar Storm Outside</option>
              </select>
            </div>

            <div className={`status-pill ${statusClass}`}>
              {isPulseElevated ? (
                <AlertTriangle size={14} strokeWidth={2.5} />
              ) : (
                <CheckCircle2 size={14} strokeWidth={2.5} />
              )}
              <strong>{statusLabel}</strong>
            </div>

            {/* Interactive Wearable Bluetooth / Mobile Relay Status */}
            {wearableBridge.isConnected ? (
              <div
                className="wearable-connect-btn connected"
                style={{ cursor: 'pointer' }}
                title="Live hardware telemetry streaming from Oraimo Watch via Mobile Relay. Click to view bridge details."
                onClick={() => alert(`Oraimo Watch Live Relay:\nDevice: ${wearableBridge.deviceName}\nHeart Rate: ${wearableBridge.heartRate} bpm\nSteps: ${wearableBridge.steps}\nLast Ping: ${wearableBridge.lastSeen}`)}
              >
                <Watch size={14} strokeWidth={2} />
                <span>
                  {wearableBridge.deviceName} ({wearableBridge.heartRate} bpm LIVE)
                </span>
              </div>
            ) : (
              <button
                type="button"
                className={`wearable-connect-btn ${isBleConnected ? 'connected' : ''}`}
                onClick={isBleConnected ? disconnectBleWatch : connectBleWatch}
                title={
                  isBleConnected
                    ? 'Click to disconnect Oraimo Watch'
                    : 'Pair via Web Bluetooth or stream live via phone MacroDroid'
                }
              >
                <Watch size={14} strokeWidth={2} />
                <span>
                  {isBleConnected
                    ? `${bleDeviceName || 'Oraimo Watch'} (Live BLE)`
                    : bleStatus === 'connecting'
                    ? 'Pairing BLE...'
                    : 'Pair Oraimo Watch'}
                </span>
              </button>
            )}
          </div>
        </header>

        {/* Incoming Houston Flight Surgeon Advisory Banner (Closed-Loop Telemedicine) */}
        {activeHoustonMsg && (
          <div className="houston-uplink-banner">
            <div className="uplink-badge">
              <Radio size={14} strokeWidth={2.5} />
              <span>Houston Ground Advisory · 12m 44s Light Delay</span>
            </div>
            <div className="uplink-body">
              <strong>{activeHoustonMsg.from}:</strong> "{activeHoustonMsg.text}"
              <span className="uplink-meta">Sent {activeHoustonMsg.timeSent} · Target: {activeHoustonMsg.to}</span>
            </div>
            <button
              type="button"
              className="uplink-ack-btn"
              onClick={() => setDismissedMessages((prev) => [...prev, activeHoustonMsg.id])}
              title="Acknowledge reception and log into flight records"
            >
              Acknowledge &amp; Log
            </button>
          </div>
        )}

        {/* Viewport Screen Body - Modularized Views */}
        <div className="viewport-screen-body">
          {activeTab === 'vitals' && (
            <DailyVitalsView
              latest={latest}
              isStreaming={isStreaming}
              setIsStreaming={setIsStreaming}
              activityMode={activityMode}
              setActivityMode={setActivityMode}
              environmentMode={environmentMode}
              scenarioMode={scenarioMode}
              upcomingReminder={upcomingReminder}
              onCompleteReminder={() => setUpcomingReminder((prev) => ({ ...prev, taken: true }))}
              onJumpToTrends={() => setActiveTab('trends')}
            />
          )}

          {activeTab === 'trends' && (
            <HealthTrendsView
              latest={latest}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              heartPoints={heartPoints}
              oxygenPoints={oxygenPoints}
            />
          )}

          {activeTab === 'notices' && (
            <MedicalAdviceView
              dynamicAlerts={dynamicAlerts}
              onResolveAlert={() => setScenarioMode('nominal')}
            />
          )}

          {activeTab === 'history' && <CheckupHistoryView records={records} />}

          {activeTab === 'profile' && (
            <MissionProfileView
              profile={profile}
              environmentMode={environmentMode}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function buildChartPoints(values, options = {}) {
  const {
    defaultMin = 50,
    defaultMax = 140,
    minSpan = 30,
    width = 320,
    height = 120,
    paddingTop = 16,
    paddingBottom = 16,
  } = options

  if (!values || !values.length) return '0,60 320,60'

  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)

  // Physiological anchor bounds prevent 0-range collapse or 1-bpm vertical blowout
  let min = Math.min(rawMin, defaultMin)
  let max = Math.max(rawMax, defaultMax)

  if (max - min < minSpan) {
    const mid = (max + min) / 2
    min = Math.floor(mid - minSpan / 2)
    max = Math.ceil(mid + minSpan / 2)
  }

  const range = max - min || 1
  const usableHeight = height - paddingTop - paddingBottom

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width
      const normalized = (value - min) / range
      const clamped = Math.max(0, Math.min(1, normalized))
      const y = height - paddingBottom - clamped * usableHeight
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

export default App
