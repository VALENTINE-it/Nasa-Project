import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Watch } from 'lucide-react'
import EarthWatchConsole from './EarthWatchConsole'
import PublicLoginPage from './components/PublicLoginPage'
import AstronautSidebar from './components/AstronautSidebar'
import DailyVitalsView from './components/DailyVitalsView'
import HealthTrendsView from './components/HealthTrendsView'
import MedicalAdviceView from './components/MedicalAdviceView'
import CheckupHistoryView from './components/CheckupHistoryView'
import MissionProfileView from './components/MissionProfileView'
import BioDigitalTwin3D from './components/BioDigitalTwin3D'
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

  const baseProfile = dashboardData || getFallbackDashboard(astronautId)
  const [liveVitals, setLiveVitals] = useState(() => ({ ...baseProfile.latest }))
  const [liveHistory, setLiveHistory] = useState(() => [...baseProfile.history])
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

        // If Oraimo BLE watch is connected, live pulse overrides synthetic HR
        const hrStep = isBleConnected ? 0 : Math.round((targetHr - prev.heartRate) * 0.15)
        const hrJitter = isBleConnected ? 0 : Math.floor(Math.random() * 5) - 2
        const newHr = isBleConnected ? prev.heartRate : Math.max(55, Math.min(185, prev.heartRate + hrStep + hrJitter))

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
  }, [activityMode, scenarioMode, isStreaming, isBleConnected])

  // Periodically append live readings to dynamic history so graphs advance in real time
  useEffect(() => {
    if (!isStreaming) return

    const historyInterval = setInterval(() => {
      setLiveHistory((prev) => {
        if (!prev || !prev.length) return prev
        const newRecord = {
          id: Date.now(),
          recordedAt: new Date().toISOString(),
          heartRate: liveVitals.heartRate,
          bloodPressure: liveVitals.bloodPressure,
          bloodOxygen: liveVitals.bloodOxygen,
          sleepDuration: liveVitals.sleepDuration,
        }
        return [...prev.slice(-14), newRecord]
      })
    }, 6000)

    return () => clearInterval(historyInterval)
  }, [isStreaming, liveVitals])

  const { profile, alerts } = baseProfile
  const latest = liveVitals || baseProfile.latest
  const isPulseElevated = latest && (latest.heartRate > 95 || scenarioMode !== 'nominal')
  const statusClass = isPulseElevated ? 'warning' : 'good'
  const statusLabel = scenarioMode === 'tachycardia'
    ? 'Tachycardia Surge'
    : scenarioMode === 'hypoxia'
    ? 'Hypoxia Alert'
    : scenarioMode === 'radiation'
    ? 'Radiation Storm'
    : isPulseElevated
    ? 'Attention Needed'
    : 'Healthy & Steady'

  // Dynamic notices based on live vitals & scenarios
  const dynamicAlerts = [...(alerts || [])]

  if (scenarioMode === 'tachycardia' || latest.heartRate > 120) {
    dynamicAlerts.unshift({
      id: 'live-alert-tachycardia',
      metricName: 'Acute Microgravity Tachycardia & Fluid Surge',
      severity: 'warning',
      description: `Continuous telemetry reports elevated pulse (${latest.heartRate} bpm) driven by microgravity cephalic fluid redistribution.`,
      observedValue: `${latest.heartRate} bpm`,
      threshold: '60 – 100 bpm',
    })
  }

  if (scenarioMode === 'hypoxia' || latest.bloodOxygen < 93) {
    dynamicAlerts.unshift({
      id: 'live-alert-hypoxia',
      metricName: 'Cabin Hypoxia & Hypercapnia Risk',
      severity: 'warning',
      description: `Blood oxygen saturation dropped to ${latest.bloodOxygen}%. Spacecraft environmental scrubber efficiency degraded.`,
      observedValue: `${latest.bloodOxygen}% SpO2`,
      threshold: '95 – 100%',
    })
  }

  if (scenarioMode === 'radiation') {
    dynamicAlerts.unshift({
      id: 'live-alert-radiation',
      metricName: 'Solar Particle Event (SPE) Radiation Exposure',
      severity: 'warning',
      description: 'Habitat exterior dosimeters indicate elevated ionizing flux. Core body temperature trending upward.',
      observedValue: '1.42 mSv/hr',
      threshold: '< 0.05 mSv/hr',
    })
  }

  const records = [...(liveHistory || [])].reverse()
  const limit = timeframe === 'daily' ? 3 : timeframe === 'week' ? 7 : Math.min(records.length, 12)
  const chartSeries = liveHistory.slice(-limit)

  const heartPoints = buildChartPoints(chartSeries.map((r) => r.heartRate))
  const oxygenPoints = buildChartPoints(chartSeries.map((r) => r.bloodOxygen))

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
                {activeTab === 'bioscan' && '3D Bio-Scan Digital Twin'}
                {activeTab === 'trends' && 'Health Trends & Comparison Charts'}
                {activeTab === 'notices' && 'Medical Notices & Automated Advice'}
                {activeTab === 'history' && 'Checkup History & Recent Logs'}
                {activeTab === 'profile' && 'Astronaut & Mission Flight Profile'}
              </strong>
            </div>
            <h1>
              {activeTab === 'vitals' && `${profile.fullName}'s Dynamic Health Telemetry`}
              {activeTab === 'bioscan' && '3D Muscular Anatomy & Real-Time Bio-Scan'}
              {activeTab === 'trends' && 'Vital Sign Changes Over Time'}
              {activeTab === 'notices' && 'Onboard Medical Recommendations'}
              {activeTab === 'history' && 'Chronological Medical Check History'}
              {activeTab === 'profile' && 'Spacecraft Environment & Profile'}
            </h1>
          </div>

          <div className="top-header-stats">
            <span className="side-confirmation-tag astronaut">Astronaut Workstation (Crew Side)</span>

            {/* Scenario Anomaly Simulation Switcher */}
            <div className="scenario-selector-pill">
              <span className="scenario-label">Scenario:</span>
              <select
                className="scenario-select"
                value={scenarioMode}
                onChange={(e) => setScenarioMode(e.target.value)}
                title="Simulate realistic spaceflight physiological scenarios"
              >
                <option value="nominal">Nominal Flight (OSDR)</option>
                <option value="tachycardia">Tachycardia Surge</option>
                <option value="hypoxia">Cabin Hypoxia &amp; CO2</option>
                <option value="radiation">Solar Radiation Storm</option>
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

            {/* Interactive Wearable Bluetooth Pairing Button */}
            <button
              type="button"
              className={`wearable-connect-btn ${isBleConnected ? 'connected' : ''}`}
              onClick={isBleConnected ? disconnectBleWatch : connectBleWatch}
              title={
                isBleConnected
                  ? 'Click to disconnect Oraimo Watch'
                  : 'Click to pair Oraimo Watch via Web Bluetooth'
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
          </div>
        </header>

        {/* Viewport Screen Body - Modularized Views */}
        <div className="viewport-screen-body">
          {activeTab === 'vitals' && (
            <DailyVitalsView
              latest={latest}
              isStreaming={isStreaming}
              setIsStreaming={setIsStreaming}
              activityMode={activityMode}
              setActivityMode={setActivityMode}
              onJumpToTrends={() => setActiveTab('trends')}
            />
          )}

          {activeTab === 'bioscan' && (
            <BioDigitalTwin3D latest={latest} isStreaming={isStreaming} />
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

          {activeTab === 'profile' && <MissionProfileView profile={profile} />}
        </div>
      </div>
    </div>
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
      const y = height - ((value - min) / range) * (height - 30) - 15
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

export default App
