import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
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

  // Meshes that animate dynamically with telemetry
  const heartMeshRef = useRef(null)
  const leftLungRef = useRef(null)
  const rightLungRef = useRef(null)
  const muscularGroupRef = useRef(null)
  const raycastObjectsRef = useRef([])

  // State
  const [activeLayer, setActiveLayer] = useState('muscular') // 'muscular' | 'xray' | 'heatmap'
  const [selectedRegion, setSelectedRegion] = useState('heart')
  const [autoRotate, setAutoRotate] = useState(false)

  // Always keep fresh references for animation loop without recreating scene
  const latestRef = useRef(latest)
  useEffect(() => {
    latestRef.current = latest
  }, [latest])

  const autoRotateRef = useRef(autoRotate)
  useEffect(() => {
    autoRotateRef.current = autoRotate
  }, [autoRotate])

  // 1. Initialize Three.js Scene
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
    camera.position.set(0, 1.25, 2.8)
    cameraRef.current = camera

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.shadowMap.enabled = false
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    container.innerHTML = ''
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.target.set(0, 1.1, 0)
    controls.minDistance = 0.8
    controls.maxDistance = 4.5
    controls.maxPolarAngle = Math.PI * 0.95
    controls.minPolarAngle = Math.PI * 0.05
    controlsRef.current = controls

    // LIGHTING (Studio Medical Lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xfff6ed, 1.4)
    keyLight.position.set(2.5, 3.5, 2.5)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.9)
    fillLight.position.set(-2.5, 2.0, 2.0)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2) // Holographic Cyan Rim
    rimLight.position.set(0, 2.5, -2.5)
    scene.add(rimLight)

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

    // PROCEDURAL TEXTURES (Muscle Striations & Fibrous Tendons)
    const muscleTexture = createMuscleStriationTexture()
    const tendonTexture = createTendonTexture()

    // 2. BUILD ANATOMICAL MUSCULAR BODY (Matching the User's Ecorché Reference Image)
    const bodyGroup = new THREE.Group()
    const clickableList = []

    // Materials
    const muscleMaterial = new THREE.MeshStandardMaterial({
      color: 0xb9493a, // Terracotta/crimson muscle tissue
      roughness: 0.45,
      metalness: 0.08,
      map: muscleTexture,
      bumpMap: muscleTexture,
      bumpScale: 0.025,
    })

    const tendonMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8e1d5, // Ivory fibrous tendon / aponeurosis
      roughness: 0.35,
      metalness: 0.05,
      map: tendonTexture,
    })

    const organMaterial = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Beating Heart
      roughness: 0.3,
      metalness: 0.1,
      emissive: 0xef4444,
      emissiveIntensity: 0.35,
    })

    const lungMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8, // Lungs (SpO2 Cyan)
      roughness: 0.4,
      metalness: 0.05,
      transparent: true,
      opacity: 0.85,
      emissive: 0x0284c7,
      emissiveIntensity: 0.2,
    })

    // --- HEAD & CRANIAL REGION ---
    const headGroup = new THREE.Group()
    headGroup.name = 'brain'
    clickableList.push(headGroup)

    const craniumGeo = new THREE.SphereGeometry(0.13, 24, 20)
    craniumGeo.scale(1, 1.25, 1.08)
    const craniumMesh = new THREE.Mesh(craniumGeo, muscleMaterial)
    craniumMesh.position.set(0, 1.82, 0)
    headGroup.add(craniumMesh)

    // Facial muscles / Jaw
    const jawGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.1, 16)
    const jawMesh = new THREE.Mesh(jawGeo, muscleMaterial)
    jawMesh.position.set(0, 1.71, 0.02)
    headGroup.add(jawMesh)

    // Neck (Sternocleidomastoid & Trapezius)
    const neckGeo = new THREE.CylinderGeometry(0.065, 0.085, 0.12, 16)
    const neckMesh = new THREE.Mesh(neckGeo, muscleMaterial)
    neckMesh.position.set(0, 1.62, 0)
    headGroup.add(neckMesh)
    bodyGroup.add(headGroup)

    // --- TORSO / PECTORALS & ABDOMINALS ---
    const torsoGroup = new THREE.Group()
    torsoGroup.name = 'torso'

    // Pectoralis Major (Left & Right)
    const pecGeo = new THREE.BoxGeometry(0.16, 0.14, 0.09)
    const leftPec = new THREE.Mesh(pecGeo, muscleMaterial)
    leftPec.position.set(-0.09, 1.45, 0.06)
    leftPec.rotation.set(0.05, 0.1, -0.08)
    torsoGroup.add(leftPec)

    const rightPec = new THREE.Mesh(pecGeo, muscleMaterial)
    rightPec.position.set(0.09, 1.45, 0.06)
    rightPec.rotation.set(0.05, -0.1, 0.08)
    torsoGroup.add(rightPec)

    // Sternal Tendon & Linea Alba
    const sternumGeo = new THREE.BoxGeometry(0.03, 0.16, 0.095)
    const sternumMesh = new THREE.Mesh(sternumGeo, tendonMaterial)
    sternumMesh.position.set(0, 1.45, 0.062)
    torsoGroup.add(sternumMesh)

    // Rectus Abdominis (Six-Pack Segments matching reference image)
    const absGroup = new THREE.Group()
    for (let row = 0; row < 3; row++) {
      const yPos = 1.32 - row * 0.08
      const abLeft = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.065, 0.08), muscleMaterial)
      abLeft.position.set(-0.045, yPos, 0.05)
      absGroup.add(abLeft)

      const abRight = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.065, 0.08), muscleMaterial)
      abRight.position.set(0.045, yPos, 0.05)
      absGroup.add(abRight)

      // Tendinous intersection
      const tendSep = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.012, 0.082), tendonMaterial)
      tendSep.position.set(0, yPos - 0.035, 0.051)
      absGroup.add(tendSep)
    }
    torsoGroup.add(absGroup)

    // Linea Alba (Vertical tendon down the abdomen)
    const lineaAlba = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.28, 0.085), tendonMaterial)
    lineaAlba.position.set(0, 1.24, 0.052)
    torsoGroup.add(lineaAlba)

    // External Obliques & Serratus
    const obliqueGeo = new THREE.CylinderGeometry(0.17, 0.15, 0.32, 16)
    const obliqueMesh = new THREE.Mesh(obliqueGeo, muscleMaterial)
    obliqueMesh.position.set(0, 1.25, 0)
    torsoGroup.add(obliqueMesh)

    // Latissimus Dorsi & Back Spine
    const backGeo = new THREE.BoxGeometry(0.32, 0.36, 0.1)
    const backMesh = new THREE.Mesh(backGeo, muscleMaterial)
    backMesh.position.set(0, 1.38, -0.06)
    torsoGroup.add(backMesh)

    bodyGroup.add(torsoGroup)

    // --- INTERNAL ORGANS (Heart & Lungs inside Mediastinum) ---
    // 3D Heart
    const heartGroup = new THREE.Group()
    heartGroup.name = 'heart'
    clickableList.push(heartGroup)

    const heartGeo = new THREE.SphereGeometry(0.055, 18, 18)
    heartGeo.scale(1, 1.35, 0.9)
    const heartMesh = new THREE.Mesh(heartGeo, organMaterial)
    heartMesh.position.set(-0.04, 1.43, 0.03)
    heartMesh.rotation.z = -0.2

    // Aortic Arch
    const aortaGeo = new THREE.TorusGeometry(0.022, 0.009, 12, 24, Math.PI)
    const aortaMesh = new THREE.Mesh(
      aortaGeo,
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 })
    )
    aortaMesh.position.set(-0.04, 1.49, 0.03)
    aortaMesh.rotation.x = Math.PI / 2
    heartGroup.add(aortaMesh)
    heartGroup.add(heartMesh)
    heartMeshRef.current = heartMesh
    bodyGroup.add(heartGroup)

    // 3D Lungs (Bilateral)
    const lungsGroup = new THREE.Group()
    lungsGroup.name = 'lungs'
    clickableList.push(lungsGroup)

    const lungGeo = new THREE.SphereGeometry(0.06, 16, 16)
    lungGeo.scale(0.85, 1.7, 0.95)

    const leftLung = new THREE.Mesh(lungGeo, lungMaterial)
    leftLung.position.set(-0.11, 1.42, 0.01)
    lungsGroup.add(leftLung)
    leftLungRef.current = leftLung

    const rightLung = new THREE.Mesh(lungGeo, lungMaterial)
    rightLung.position.set(0.11, 1.42, 0.01)
    lungsGroup.add(rightLung)
    rightLungRef.current = rightLung

    bodyGroup.add(lungsGroup)

    // --- ARMS & SHOULDERS ---
    const buildArm = (isLeft) => {
      const armGroup = new THREE.Group()
      const sign = isLeft ? -1 : 1

      // Deltoid
      const deltoid = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), muscleMaterial)
      deltoid.position.set(sign * 0.23, 1.51, 0)
      armGroup.add(deltoid)

      // Biceps / Triceps
      const bicepGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.22, 16)
      const bicep = new THREE.Mesh(bicepGeo, muscleMaterial)
      bicep.position.set(sign * 0.27, 1.34, 0)
      bicep.rotation.z = sign * -0.22
      armGroup.add(bicep)

      // Elbow Tendon
      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 12), tendonMaterial)
      elbow.position.set(sign * 0.31, 1.21, 0)
      armGroup.add(elbow)

      // Forearm flexors & extensors
      const forearmGeo = new THREE.CylinderGeometry(0.04, 0.03, 0.22, 16)
      const forearm = new THREE.Mesh(forearmGeo, muscleMaterial)
      forearm.position.set(sign * 0.37, 1.07, 0.02)
      forearm.rotation.z = sign * -0.32
      armGroup.add(forearm)

      // Hand & wrist tendons
      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.09, 0.02), tendonMaterial)
      hand.position.set(sign * 0.44, 0.94, 0.02)
      hand.rotation.z = sign * -0.32
      armGroup.add(hand)

      return armGroup
    }
    bodyGroup.add(buildArm(true))
    bodyGroup.add(buildArm(false))

    // --- PELVIS & LEGS (Quads, Calves, Tendons matching reference image) ---
    const pelvisGroup = new THREE.Group()
    pelvisGroup.name = 'thighs'
    clickableList.push(pelvisGroup)

    const pelvisMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.16, 16), muscleMaterial)
    pelvisMesh.position.set(0, 1.02, 0)
    pelvisGroup.add(pelvisMesh)
    bodyGroup.add(pelvisGroup)

    const legsGroup = new THREE.Group()
    legsGroup.name = 'muscles_legs'
    clickableList.push(legsGroup)

    const buildLeg = (isLeft) => {
      const legGroup = new THREE.Group()
      const sign = isLeft ? -1 : 1

      // Quadriceps (Rectus femoris & vastus lateralis)
      const quadGeo = new THREE.CylinderGeometry(0.075, 0.055, 0.38, 16)
      const quad = new THREE.Mesh(quadGeo, muscleMaterial)
      quad.position.set(sign * 0.095, 0.76, 0.01)
      legGroup.add(quad)

      // Vastus Medialis (Teardrop muscle above knee)
      const vmGeo = new THREE.SphereGeometry(0.045, 12, 12)
      vmGeo.scale(0.8, 1.2, 0.8)
      const vm = new THREE.Mesh(vmGeo, muscleMaterial)
      vm.position.set(sign * 0.065, 0.62, 0.04)
      legGroup.add(vm)

      // Patellar Tendon / Knee
      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 14), tendonMaterial)
      knee.position.set(sign * 0.095, 0.54, 0.02)
      legGroup.add(knee)

      // Tibialis anterior & Gastrocnemius (Calf bellies)
      const calfGeo = new THREE.CylinderGeometry(0.055, 0.035, 0.4, 16)
      const calf = new THREE.Mesh(calfGeo, muscleMaterial)
      calf.position.set(sign * 0.095, 0.31, -0.01)
      legGroup.add(calf)

      // Achilles Tendon & Ankle
      const achilles = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.14, 12), tendonMaterial)
      achilles.position.set(sign * 0.095, 0.12, -0.015)
      legGroup.add(achilles)

      // Foot
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.15), tendonMaterial)
      foot.position.set(sign * 0.095, 0.025, 0.04)
      legGroup.add(foot)

      return legGroup
    }

    legsGroup.add(buildLeg(true))
    legsGroup.add(buildLeg(false))
    bodyGroup.add(legsGroup)

    muscularGroupRef.current = bodyGroup
    raycastObjectsRef.current = clickableList
    scene.add(bodyGroup)

    // RAYCASTING FOR CLICK-TO-INSPECT
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const onPointerDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(bodyGroup.children, true)

      if (intersects.length > 0) {
        let hitObj = intersects[0].object
        while (hitObj && hitObj.parent && hitObj.parent !== bodyGroup && !hitObj.name) {
          hitObj = hitObj.parent
        }
        const regionKey = hitObj?.name || 'heart'
        if (REGION_DEFINITIONS[regionKey]) {
          setSelectedRegion(regionKey)
          setIsInspecting(true)
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

    // 3. ANIMATION RENDER LOOP (60 FPS Dynamic WebGL Engine)
    let clock = new THREE.Clock()
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Dynamic Heartbeat Animation linked to BPM
      if (heartMeshRef.current) {
        const currentHr = latestRef.current.heartRate || 75
        const beatsPerSecond = currentHr / 60
        // Cardiac systolic contraction curve
        const pulsePhase = (elapsedTime * beatsPerSecond * Math.PI * 2) % (Math.PI * 2)
        const scaleVal = 1 + Math.pow(Math.sin(pulsePhase), 4) * 0.16
        heartMeshRef.current.scale.set(scaleVal, scaleVal * 1.35, scaleVal * 0.9)

        // Color modulation based on heart rate
        if (currentHr > 115) {
          organMaterial.color.setHex(0xdc2626) // Critical Crimson
          organMaterial.emissive.setHex(0xb91c1c)
        } else if (currentHr > 90) {
          organMaterial.color.setHex(0xf59e0b) // Amber Alert
          organMaterial.emissive.setHex(0xd97706)
        } else {
          organMaterial.color.setHex(0x10b981) // Emerald Nominal
          organMaterial.emissive.setHex(0x059669)
        }
      }

      // Dynamic Pulmonary Respiration Animation linked to Respiratory Rate
      if (leftLungRef.current && rightLungRef.current) {
        const respRate = latestRef.current.respiratoryRate || 16
        const respCyclesPerSec = respRate / 60
        const respPhase = Math.sin(elapsedTime * respCyclesPerSec * Math.PI * 2)
        const lungScale = 1 + respPhase * 0.08
        leftLungRef.current.scale.set(0.85 * lungScale, 1.7 * lungScale, 0.95 * lungScale)
        rightLungRef.current.scale.set(0.85 * lungScale, 1.7 * lungScale, 0.95 * lungScale)

        // SpO2 lung color modulation
        const o2 = latestRef.current.bloodOxygen || 98
        if (o2 < 93) {
          lungMaterial.color.setHex(0xa855f7) // Purple hypoxia
          lungMaterial.emissive.setHex(0x9333ea)
        } else {
          lungMaterial.color.setHex(0x38bdf8) // Cyan nominal
          lungMaterial.emissive.setHex(0x0284c7)
        }
      }

      // Auto-Rotation
      if (autoRotateRef.current && bodyGroup) {
        bodyGroup.rotation.y += 0.005
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
  }, []) // Initialize Three.js scene once on mount

  // Update Materials based on Active Layer
  useEffect(() => {
    if (!muscularGroupRef.current) return

    muscularGroupRef.current.traverse((child) => {
      if (child.isMesh && child.name !== 'heart' && child.name !== 'lungs') {
        if (activeLayer === 'xray') {
          // X-Ray Mode: muscle becomes semi-translucent glass, revealing organs
          child.material.transparent = true
          child.material.opacity = 0.22
          child.material.color.setHex(0x38bdf8)
          child.material.wireframe = false
        } else if (activeLayer === 'heatmap') {
          // Heatmap Mode: highlights spaceflight risk zones
          child.material.transparent = false
          child.material.opacity = 1.0
          child.material.color.setHex(0x0284c7)
          child.material.wireframe = true
        } else {
          // Default Ecorché Muscular mode (matching reference image)
          child.material.transparent = false
          child.material.opacity = 1.0
          child.material.wireframe = false
          if (child.material.name === 'tendon') {
            child.material.color.setHex(0xe8e1d5)
          } else {
            child.material.color.setHex(0xb9493a) // Terracotta muscle
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
    setIsInspecting(true)

    const targetPos = def.cameraPos
    const lookAtTarget = def.cameraTarget

    // Smooth camera reposition
    cameraRef.current.position.copy(targetPos)
    controlsRef.current.target.copy(lookAtTarget)
    controlsRef.current.update()
  }

  const resetCamera = () => {
    if (!cameraRef.current || !controlsRef.current || !muscularGroupRef.current) return
    muscularGroupRef.current.rotation.set(0, 0, 0)
    cameraRef.current.position.set(0, 1.25, 2.8)
    controlsRef.current.target.set(0, 1.1, 0)
    controlsRef.current.update()
    setIsInspecting(false)
  }

  const activeDef = REGION_DEFINITIONS[selectedRegion] || REGION_DEFINITIONS.heart
  const activeTele = activeDef.getTelemetry(latest)

  return (
    <div className="bio-digital-twin-wrapper">
      {/* 3D WebGL Canvas Viewport */}
      <div className="twin-canvas-container" ref={containerRef}>
        {/* Floating Top Controls Overlay */}
        <div className="twin-viewport-hud-top">
          <div className="hud-badge-group">
            <span className="hud-pill live">
              <span className="hud-pulsing-dot" />
              <span>3D BIO-SCAN: ACTIVE TWIN</span>
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
              <span>Muscular (Ecorché)</span>
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
          <small>Left-drag to rotate 360° · Scroll to zoom · Click body part to inspect</small>
        </div>
      </div>

      {/* Right Side: Interactive Anatomical Telemetry Inspector */}
      <div className="twin-inspector-sidebar">
        <div className="inspector-card">
          <div className="inspector-card-header">
            <div className="inspector-title-area">
              <span className="inspector-tag">TARGETED ORGAN INSPECTION</span>
              <h3>{activeDef.name}</h3>
            </div>
            <span className={`inspector-status-badge ${activeTele.status}`}>
              {activeTele.status === 'nominal' ? 'NOMINAL' : 'ALERT'}
            </span>
          </div>

          {/* Quick Region Selector Pills */}
          <div className="region-quick-dock">
            {Object.keys(REGION_DEFINITIONS).map((key) => {
              const def = REGION_DEFINITIONS[key]
              const isSelected = selectedRegion === key
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

// Procedural Canvas Texture Generators for Authentic Anatomical Look
function createMuscleStriationTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  // Terracotta muscle base
  ctx.fillStyle = '#b9493a'
  ctx.fillRect(0, 0, 256, 256)

  // Longitudinal fiber striations
  ctx.fillStyle = '#9e3a2d'
  for (let i = 0; i < 256; i += 4) {
    const alpha = 0.15 + Math.random() * 0.25
    ctx.globalAlpha = alpha
    ctx.fillRect(i, 0, 2, 256)
  }

  // Cross fascial streaks
  ctx.fillStyle = '#e8e1d5'
  ctx.globalAlpha = 0.12
  for (let y = 0; y < 256; y += 18) {
    ctx.fillRect(0, y, 256, 1)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 4)
  return texture
}

function createTendonTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')

  // Ivory fibrous tendon base
  ctx.fillStyle = '#e8e1d5'
  ctx.fillRect(0, 0, 128, 128)

  // Soft pearl sheen lines
  ctx.fillStyle = '#d6cbbe'
  for (let y = 0; y < 128; y += 3) {
    ctx.globalAlpha = 0.18
    ctx.fillRect(0, y, 128, 1.5)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1, 2)
  return texture
}

export default BioDigitalTwin3D
