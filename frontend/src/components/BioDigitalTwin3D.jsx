import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import {
  RotateCcw,
  Layers,
  Heart,
  Activity,
  Eye,
  Shield,
  Play,
  Pause,
  Info,
} from 'lucide-react'

// Anatomical region telemetry mapping
const REGION_DEFINITIONS = {
  heart: {
    name: 'Cardiovascular Core (Cor / Myocardium)',
    hazard: 'Altered Gravity & Microgravity Fluid Shift',
    metricLabel: 'Heart Rate & Rhythm',
    countermeasure: 'Aerobic ergometer cycle + electrolyte fluid replacement',
    cameraTarget: new THREE.Vector3(0, 1.35, 0),
    cameraPos: new THREE.Vector3(0, 1.45, 1.1),
    getTelemetry: (vitals) => ({
      value: `${vitals.heartRate || 75} BPM`,
      status: (vitals.heartRate > 100 || vitals.heartRate < 55) ? 'warning' : 'nominal',
      hrv: '62 ms (RMSSD)',
      bp: vitals.bloodPressure || '120/80 mmHg',
      cardiacOutput: '4.8 L/min',
    }),
    hrpNote:
      'In microgravity, elimination of hydrostatic pressure shifts ~1.5–2L of blood cephalad toward the chest, causing central blood volume expansion followed by hypovolemia.',
  },
  lungs: {
    name: 'Pulmonary System (Pulmones & Respiration)',
    hazard: 'Hostile Closed Cabin Atmosphere',
    metricLabel: 'Oxygen Saturation & Respiration',
    countermeasure: 'Cabin scrubber review, supplemental O2 flow verification',
    cameraTarget: new THREE.Vector3(0, 1.38, 0),
    cameraPos: new THREE.Vector3(0, 1.45, 1.2),
    getTelemetry: (vitals) => ({
      value: `${vitals.bloodOxygen || 98}% SpO2`,
      status: (vitals.bloodOxygen < 95) ? 'warning' : 'nominal',
      rate: `${vitals.respiratoryRate || 16} brpm`,
      co2Exposure: '0.28% (Nominal cabin)',
      lungVolume: '4.9 L Vital Capacity',
    }),
    hrpNote:
      'Uniform ventilation-perfusion matching in zero-G is altered; cabin CO2 levels must be closely monitored to prevent hypercapnic respiratory depression.',
  },
  brain: {
    name: 'Cranial & SANS Region (Encephalon & Optic Nerve)',
    hazard: 'Spaceflight Associated Neuro-ocular Syndrome (SANS)',
    metricLabel: 'Intracranial Fluid Pressure',
    countermeasure: 'Fundoscopy visual acuity check, lower body negative pressure (LBNP)',
    cameraTarget: new THREE.Vector3(0, 1.75, 0),
    cameraPos: new THREE.Vector3(0, 1.8, 0.9),
    getTelemetry: () => ({
      value: '14.2 mmHg (Estimated ICP)',
      status: 'nominal',
      opticSheath: '5.4 mm (Normal limit)',
      visualAcuity: '20/20 bilateral',
      fluidShiftIndex: '+12% Cephalic',
    }),
    hrpNote:
      'Chronic absence of gravitational venous drainage from the head increases choroidal engorgement and posterior globe flattening (SANS).',
  },
  muscles_legs: {
    name: 'Postural Musculature (Soleus, Gastrocnemius, Quads)',
    hazard: 'Microgravity Muscle Atrophy',
    metricLabel: 'Muscle Tone & Atrophy Index',
    countermeasure: '2.5 hrs daily Advanced Resistive Exercise Device (ARED)',
    cameraTarget: new THREE.Vector3(0, 0.5, 0),
    cameraPos: new THREE.Vector3(0, 0.65, 1.6),
    getTelemetry: (vitals) => ({
      value: '94% Tone Retention',
      status: 'nominal',
      dailyWorkload: `${vitals.physicalActivity || 6500} steps equiv.`,
      aredCompliance: '100% on schedule',
      atrophyRisk: 'Low (Active Countermeasure)',
    }),
    hrpNote:
      'Slow-twitch postural fibers (soleus) experience rapid cross-sectional area loss without daily axial load resistance protocols.',
  },
  thighs: {
    name: 'Venous Return & Thigh Region (Vena Femoralis)',
    hazard: 'Venous Thromboembolism & Orthostatic Intolerance',
    metricLabel: 'Venous Hemodynamics',
    countermeasure: 'In-flight compression garments (Thigh Cuffs) during shift work',
    cameraTarget: new THREE.Vector3(0, 0.85, 0),
    cameraPos: new THREE.Vector3(0, 0.95, 1.4),
    getTelemetry: () => ({
      value: 'Venous Velocity: Nominal',
      status: 'nominal',
      cuffPressure: '30 mmHg applied',
      jugularFlow: 'Antegrade (Normal)',
      poolingRisk: 'Mitigated',
    }),
    hrpNote:
      'NASA HRP Venous Hemostasis study monitors retrograde flow in internal jugular and femoral veins to eliminate clot formation risks in flight.',
  },
}

export function BioDigitalTwin3D({ latest = {} }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const controlsRef = useRef(null)
  const animFrameRef = useRef(null)

  // Dynamic mesh references
  const heartMeshRef = useRef(null)
  const leftLungRef = useRef(null)
  const rightLungRef = useRef(null)
  const modelRootRef = useRef(null)
  const originalMaterialsMapRef = useRef(new Map())

  // State
  const [activeLayer, setActiveLayer] = useState('muscular') // 'muscular' | 'xray' | 'heatmap'
  const [selectedRegion, setSelectedRegion] = useState('heart')
  const [customInspectedMuscle, setCustomInspectedMuscle] = useState(null)
  const [autoRotate, setAutoRotate] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  // Always keep fresh references for animation loop without recreating scene
  const latestRef = useRef(latest)
  useEffect(() => {
    latestRef.current = latest
  }, [latest])

  const autoRotateRef = useRef(autoRotate)
  useEffect(() => {
    autoRotateRef.current = autoRotate
  }, [autoRotate])

  // 1. Initialize Three.js Scene and Load Sculpted 3D GLB Model
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight || 580

    // SCENE
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // CAMERA
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50)
    camera.position.set(0, 1.25, 2.7)
    cameraRef.current = camera

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.innerHTML = ''
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.target.set(0, 1.05, 0)
    controls.minDistance = 0.8
    controls.maxDistance = 4.5
    controls.maxPolarAngle = Math.PI * 0.95
    controls.minPolarAngle = Math.PI * 0.05
    controlsRef.current = controls

    // STUDIO MEDICAL LIGHTING (Accentuates sculpted muscle curves and organic striations)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xfff5eb, 1.6)
    keyLight.position.set(3, 4, 3)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 1.1)
    fillLight.position.set(-3, 2.5, 2)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.4) // Cyan medical rim light
    rimLight.position.set(0, 3, -3)
    scene.add(rimLight)

    const bottomBounce = new THREE.DirectionalLight(0xffffff, 0.4)
    bottomBounce.position.set(0, -2, 1)
    scene.add(bottomBounce)

    // Holographic Circular Platform
    const platformGroup = new THREE.Group()
    const discGeo = new THREE.RingGeometry(0.35, 0.75, 32)
    discGeo.rotateX(-Math.PI / 2)
    const discMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    })
    const discMesh = new THREE.Mesh(discGeo, discMat)
    discMesh.position.y = -0.01
    platformGroup.add(discMesh)

    const innerDiscGeo = new THREE.CircleGeometry(0.3, 32)
    innerDiscGeo.rotateX(-Math.PI / 2)
    const innerDiscMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    })
    const innerDiscMesh = new THREE.Mesh(innerDiscGeo, innerDiscMat)
    platformGroup.add(innerDiscMesh)
    scene.add(platformGroup)

    // 2. INTERNAL ORGANS (Cardiac Heart & Pulmonary Lungs)
    const organsGroup = new THREE.Group()

    // 3D Heart Mesh (Left Mediastinum)
    const heartGeo = new THREE.SphereGeometry(0.052, 20, 20)
    heartGeo.scale(1, 1.35, 0.9)
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.3,
      metalness: 0.1,
      emissive: 0x059669,
      emissiveIntensity: 0.35,
    })
    const heartMesh = new THREE.Mesh(heartGeo, heartMat)
    heartMesh.name = 'heart'
    heartMesh.position.set(-0.04, 1.36, 0.04)
    heartMesh.rotation.z = -0.2

    const aortaGeo = new THREE.TorusGeometry(0.02, 0.008, 12, 24, Math.PI)
    const aortaMesh = new THREE.Mesh(
      aortaGeo,
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 })
    )
    aortaMesh.position.set(-0.04, 1.42, 0.04)
    aortaMesh.rotation.x = Math.PI / 2
    organsGroup.add(aortaMesh)
    organsGroup.add(heartMesh)
    heartMeshRef.current = heartMesh

    // 3D Bilateral Lungs
    const lungGeo = new THREE.SphereGeometry(0.058, 16, 16)
    lungGeo.scale(0.85, 1.6, 0.95)
    const lungMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.4,
      metalness: 0.05,
      transparent: true,
      opacity: 0.85,
      emissive: 0x0284c7,
      emissiveIntensity: 0.2,
    })

    const leftLung = new THREE.Mesh(lungGeo, lungMat)
    leftLung.name = 'lungs'
    leftLung.position.set(-0.105, 1.35, 0.02)
    organsGroup.add(leftLung)
    leftLungRef.current = leftLung

    const rightLung = new THREE.Mesh(lungGeo, lungMat)
    rightLung.name = 'lungs'
    rightLung.position.set(0.105, 1.35, 0.02)
    organsGroup.add(rightLung)
    rightLungRef.current = rightLung

    scene.add(organsGroup)

    // 3. LOAD SCULPTED ANATOMICAL GLB MODEL (177 Individually Sculpted Muscles & Tendons)
    const loader = new GLTFLoader()
    loader.load(
      '/models/muscles.glb',
      (gltf) => {
        const model = gltf.scene
        modelRootRef.current = model

        // Calculate model bounding box and normalize height to 2.05m
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        const targetHeight = 2.05
        const scale = targetHeight / size.y
        model.scale.setScalar(scale)

        // Center on X and Z, align feet with ground (y = 0)
        model.position.x = -center.x * scale
        model.position.y = -box.min.y * scale
        model.position.z = -center.z * scale

        // Enhance material aesthetics (PBR metallic/roughness tuning for organic muscle look)
        model.traverse((child) => {
          if (child.isMesh && child.material) {
            // Save original material
            originalMaterialsMapRef.current.set(child, child.material.clone())

            child.material.roughness = 0.55
            child.material.metalness = 0.05
            child.castShadow = false
            child.receiveShadow = false
          }
        })

        scene.add(model)
        setIsLoaded(true)
      },
      (xhr) => {
        if (xhr.total > 0) {
          setLoadingProgress(Math.round((xhr.loaded / xhr.total) * 100))
        }
      },
      (error) => {
        console.error('Error loading sculpted anatomical GLB model:', error)
      }
    )

    // RAYCASTING FOR CLICK-TO-INSPECT ANY SCULPTED MUSCLE OR ORGAN
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const onPointerDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const targets = []
      if (modelRootRef.current) targets.push(modelRootRef.current)
      targets.push(organsGroup)

      const intersects = raycaster.intersectObjects(targets, true)

      if (intersects.length > 0) {
        const hit = intersects[0].object
        const rawName = hit.name || hit.parent?.name || ''

        // Organ check
        if (rawName.includes('heart')) {
          setSelectedRegion('heart')
          setCustomInspectedMuscle(null)
          return
        }
        if (rawName.includes('lung')) {
          setSelectedRegion('lungs')
          setCustomInspectedMuscle(null)
          return
        }

        // Muscular classification
        if (rawName) {
          const formatted = rawName
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')

          setCustomInspectedMuscle(formatted)

          if (rawName.includes('soleus') || rawName.includes('gastrocnemius') || rawName.includes('quad') || rawName.includes('femoris')) {
            setSelectedRegion('muscles_legs')
          } else if (rawName.includes('frontalis') || rawName.includes('tempor') || rawName.includes('occipital')) {
            setSelectedRegion('brain')
          } else if (rawName.includes('gluteus') || rawName.includes('iliac') || rawName.includes('pectineus')) {
            setSelectedRegion('thighs')
          } else {
            setSelectedRegion('heart')
          }
        }
      }
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown)

    // RESIZE LISTENER
    const handleResize = () => {
      if (!container || !renderer || !camera) return
      const w = container.clientWidth
      const h = container.clientHeight || 580
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    // 4. ANIMATION RENDER LOOP (60 FPS Dynamic Engine)
    let clock = new THREE.Clock()
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Dynamic Heartbeat Animation linked to current BPM
      if (heartMeshRef.current) {
        const currentHr = latestRef.current.heartRate || 75
        const beatsPerSecond = currentHr / 60
        const pulsePhase = (elapsedTime * beatsPerSecond * Math.PI * 2) % (Math.PI * 2)
        const scaleVal = 1 + Math.pow(Math.sin(pulsePhase), 4) * 0.16
        heartMeshRef.current.scale.set(scaleVal, scaleVal * 1.35, scaleVal * 0.9)

        if (currentHr > 115) {
          heartMat.color.setHex(0xdc2626) // Critical Crimson
          heartMat.emissive.setHex(0xb91c1c)
        } else if (currentHr > 90) {
          heartMat.color.setHex(0xf59e0b) // Amber Alert
          heartMat.emissive.setHex(0xd97706)
        } else {
          heartMat.color.setHex(0x10b981) // Emerald Nominal
          heartMat.emissive.setHex(0x059669)
        }
      }

      // Dynamic Pulmonary Respiration Animation linked to Respiratory Rate
      if (leftLungRef.current && rightLungRef.current) {
        const respRate = latestRef.current.respiratoryRate || 16
        const respCyclesPerSec = respRate / 60
        const respPhase = Math.sin(elapsedTime * respCyclesPerSec * Math.PI * 2)
        const lungScale = 1 + respPhase * 0.08
        leftLungRef.current.scale.set(0.85 * lungScale, 1.6 * lungScale, 0.95 * lungScale)
        rightLungRef.current.scale.set(0.85 * lungScale, 1.6 * lungScale, 0.95 * lungScale)

        const o2 = latestRef.current.bloodOxygen || 98
        if (o2 < 93) {
          lungMat.color.setHex(0xa855f7) // Purple hypoxia
          lungMat.emissive.setHex(0x9333ea)
        } else {
          lungMat.color.setHex(0x38bdf8) // Cyan nominal
          lungMat.emissive.setHex(0x0284c7)
        }
      }

      // Auto-Rotation
      if (autoRotateRef.current) {
        if (modelRootRef.current) modelRootRef.current.rotation.y += 0.005
        organsGroup.rotation.y += 0.005
      }

      // Platform subtle holographic pulse
      platformGroup.rotation.y -= 0.002

      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    // CLEANUP
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', handleResize)
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('pointerdown', onPointerDown)
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  // Update Materials based on Active Layer Mode
  useEffect(() => {
    if (!modelRootRef.current) return

    modelRootRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        const originalMat = originalMaterialsMapRef.current.get(child)

        if (activeLayer === 'xray') {
          // X-Ray Mode: muscles become translucent holographic shell
          child.material = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.22,
            roughness: 0.2,
            metalness: 0.1,
            wireframe: false,
          })
        } else if (activeLayer === 'heatmap') {
          // Risk Heatmap Mode: cyan wireframe highlighting microgravity risk zones
          child.material = new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            wireframe: true,
            roughness: 0.5,
          })
        } else {
          // Default Ecorché Muscular mode: Restore original sculpted biological materials
          if (originalMat) {
            child.material = originalMat.clone()
            child.material.roughness = 0.55
            child.material.metalness = 0.05
          }
        }
      }
    })
  }, [activeLayer])

  // Camera Quick-Jump Presets
  const jumpToRegion = (regionKey) => {
    const def = REGION_DEFINITIONS[regionKey]
    if (!def || !cameraRef.current || !controlsRef.current) return

    setSelectedRegion(regionKey)
    setCustomInspectedMuscle(null)

    const targetPos = def.cameraPos
    const lookAtTarget = def.cameraTarget

    cameraRef.current.position.copy(targetPos)
    controlsRef.current.target.copy(lookAtTarget)
    controlsRef.current.update()
  }

  const resetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return
    if (modelRootRef.current) modelRootRef.current.rotation.set(0, 0, 0)
    cameraRef.current.position.set(0, 1.25, 2.7)
    controlsRef.current.target.set(0, 1.05, 0)
    controlsRef.current.update()
    setCustomInspectedMuscle(null)
  }

  const activeDef = REGION_DEFINITIONS[selectedRegion] || REGION_DEFINITIONS.heart
  const activeTele = activeDef.getTelemetry(latest)

  return (
    <div className="bio-digital-twin-wrapper">
      {/* 3D WebGL Canvas Viewport */}
      <div className="twin-canvas-container" ref={containerRef}>
        {/* Loading Indicator */}
        {!isLoaded && (
          <div className="twin-loading-overlay">
            <div className="clean-spinner" />
            <p>Loading Sculpted Anatomical Mesh ({loadingProgress}%)...</p>
          </div>
        )}

        {/* Floating Top Controls Overlay */}
        <div className="twin-viewport-hud-top">
          <div className="hud-badge-group">
            <span className="hud-pill live">
              <span className="hud-pulsing-dot" />
              <span>3D SCULPTED ECORCHÉ TWIN</span>
            </span>
            <span className="hud-pill mode">
              <Layers size={13} strokeWidth={2} />
              <span>{activeLayer.toUpperCase()} VIEW</span>
            </span>
          </div>

          <div className="hud-actions-group">
            <button
              type="button"
              className={`hud-btn ${autoRotate ? 'active' : ''}`}
              onClick={() => setAutoRotate(!autoRotate)}
              title="Toggle Auto-Orbit"
            >
              {autoRotate ? <Pause size={14} /> : <Play size={14} />}
              <span>{autoRotate ? 'Pause Orbit' : 'Auto Orbit'}</span>
            </button>
            <button type="button" className="hud-btn" onClick={resetCamera} title="Reset Camera">
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Floating Bottom Left: Layer Controls */}
        <div className="twin-viewport-hud-bottom">
          <div className="layer-selector-dock">
            <span className="layer-dock-label">Layer Mode:</span>
            <button
              type="button"
              className={`layer-toggle-btn ${activeLayer === 'muscular' ? 'active' : ''}`}
              onClick={() => setActiveLayer('muscular')}
            >
              <Activity size={13} />
              <span>Sculpted Muscular</span>
            </button>
            <button
              type="button"
              className={`layer-toggle-btn ${activeLayer === 'xray' ? 'active' : ''}`}
              onClick={() => setActiveLayer('xray')}
            >
              <Eye size={13} />
              <span>X-Ray Organs</span>
            </button>
            <button
              type="button"
              className={`layer-toggle-btn ${activeLayer === 'heatmap' ? 'active' : ''}`}
              onClick={() => setActiveLayer('heatmap')}
            >
              <Shield size={13} />
              <span>Risk Heatmap</span>
            </button>
          </div>
        </div>

        {/* 3D Orbit Helper Hint */}
        <div className="twin-canvas-instructions">
          <small>Left-drag to rotate 360° · Scroll to zoom · Click any sculpted muscle to inspect</small>
        </div>
      </div>

      {/* Right Side: Interactive Anatomical Telemetry Inspector */}
      <div className="twin-inspector-sidebar">
        <div className="inspector-card">
          <div className="inspector-card-header">
            <div className="inspector-title-area">
              <span className="inspector-tag">TARGETED ORGAN &amp; MUSCLE INSPECTION</span>
              <h3>
                {customInspectedMuscle
                  ? `${customInspectedMuscle} (Musculus)`
                  : activeDef.name}
              </h3>
            </div>
            <span className={`inspector-status-badge ${activeTele.status}`}>
              {activeTele.status === 'nominal' ? 'NOMINAL' : 'ALERT'}
            </span>
          </div>

          {/* Quick Region Selector Pills */}
          <div className="region-quick-dock">
            {Object.keys(REGION_DEFINITIONS).map((key) => {
              const def = REGION_DEFINITIONS[key]
              const isSelected = selectedRegion === key && !customInspectedMuscle
              return (
                <button
                  key={key}
                  type="button"
                  className={`region-pill-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => jumpToRegion(key)}
                >
                  {key === 'heart' && <Heart size={12} />}
                  {key === 'lungs' && <Activity size={12} />}
                  {key === 'brain' && <Eye size={12} />}
                  {key === 'muscles_legs' && <Shield size={12} />}
                  {key === 'thighs' && <Layers size={12} />}
                  <span>{def.name.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>

          {/* Live Telemetry Display */}
          <div className="inspector-metrics-grid">
            <div className="telemetry-block highlight">
              <span className="telemetry-block-label">{activeDef.metricLabel}</span>
              <div className="telemetry-block-value">{activeTele.value}</div>
              <small className="telemetry-block-sub">
                {selectedRegion === 'heart' && `HRV: ${activeTele.hrv}`}
                {selectedRegion === 'lungs' && `Respiration: ${activeTele.rate}`}
                {selectedRegion === 'brain' && `Optic Sheath: ${activeTele.opticSheath}`}
                {selectedRegion === 'muscles_legs' && `Compliance: ${activeTele.aredCompliance}`}
                {selectedRegion === 'thighs' && `Pressure: ${activeTele.cuffPressure}`}
              </small>
            </div>

            {selectedRegion === 'heart' && (
              <>
                <div className="telemetry-block">
                  <span className="telemetry-block-label">Arterial Pressure</span>
                  <div className="telemetry-block-value">{activeTele.bp}</div>
                </div>
                <div className="telemetry-block">
                  <span className="telemetry-block-label">Cardiac Output</span>
                  <div className="telemetry-block-value">{activeTele.cardiacOutput}</div>
                </div>
              </>
            )}

            {selectedRegion === 'lungs' && (
              <>
                <div className="telemetry-block">
                  <span className="telemetry-block-label">Cabin CO2 Expose</span>
                  <div className="telemetry-block-value">{activeTele.co2Exposure}</div>
                </div>
                <div className="telemetry-block">
                  <span className="telemetry-block-label">Vital Capacity</span>
                  <div className="telemetry-block-value">{activeTele.lungVolume}</div>
                </div>
              </>
            )}

            {selectedRegion === 'brain' && (
              <>
                <div className="telemetry-block">
                  <span className="telemetry-block-label">Visual Acuity</span>
                  <div className="telemetry-block-value">{activeTele.visualAcuity}</div>
                </div>
                <div className="telemetry-block">
                  <span className="telemetry-block-label">Cephalic Shift</span>
                  <div className="telemetry-block-value">{activeTele.fluidShiftIndex}</div>
                </div>
              </>
            )}

            {selectedRegion === 'muscles_legs' && (
              <>
                <div className="telemetry-block">
                  <span className="telemetry-block-label">Equiv. Activity</span>
                  <div className="telemetry-block-value">{activeTele.dailyWorkload}</div>
                </div>
                <div className="telemetry-block">
                  <span className="telemetry-block-label">Atrophy Risk</span>
                  <div className="telemetry-block-value">{activeTele.atrophyRisk}</div>
                </div>
              </>
            )}

            {selectedRegion === 'thighs' && (
              <>
                <div className="telemetry-block">
                  <span className="telemetry-block-label">Jugular Flow</span>
                  <div className="telemetry-block-value">{activeTele.jugularFlow}</div>
                </div>
                <div className="telemetry-block">
                  <span className="telemetry-block-label">Thrombosis Risk</span>
                  <div className="telemetry-block-value">{activeTele.poolingRisk}</div>
                </div>
              </>
            )}
          </div>

          {/* NASA HRP Hazard Context */}
          <div className="inspector-hrp-box">
            <div className="hrp-box-header">
              <Info size={14} />
              <strong>NASA Human Research Program (HRP) Evidence</strong>
            </div>
            <p className="hrp-box-body">{activeDef.hrpNote}</p>
          </div>

          {/* Actionable Countermeasure Protocol */}
          <div className="inspector-protocol-box">
            <span className="protocol-label">STANDARDIZED MITIGATION COUNTERMEASURE</span>
            <p className="protocol-text">{activeDef.countermeasure}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BioDigitalTwin3D
