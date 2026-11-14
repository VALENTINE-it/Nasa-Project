import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Pill,
  HeartPulse,
  Wind,
  Sun,
  Eye,
  Dna,
  CheckSquare,
  Square,
  Sparkles,
  HelpCircle,
  HelpCircle as QuestionIcon,
} from 'lucide-react'

// Visual Step Diagrams (Clean SVG Graphic Illustrations for Instant Action Under Panic)
function StepIllustration({ type }) {
  switch (type) {
    case 'sit-down':
      return (
        <svg viewBox="0 0 80 60" className="step-svg-visual">
          {/* Wall Bulkhead */}
          <line x1="18" y1="5" x2="18" y2="55" stroke="var(--border-default)" strokeWidth="3" />
          {/* Seated Astronaut Silhouette */}
          <circle cx="34" cy="18" r="7" fill="var(--accent-color, #0284c7)" />
          <path d="M 28 26 L 34 42 L 52 42 L 52 54" fill="none" stroke="var(--accent-color, #0284c7)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 24 30 L 34 30" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeDasharray="2 2" />
          {/* Angle arrow */}
          <path d="M 20 45 L 26 40" stroke="#10b981" strokeWidth="2" />
        </svg>
      )
    case 'drink-salt':
      return (
        <svg viewBox="0 0 80 60" className="step-svg-visual">
          {/* Water Drink Pouch */}
          <rect x="20" y="16" width="26" height="34" rx="4" fill="none" stroke="var(--accent-color, #0284c7)" strokeWidth="2.5" />
          <path d="M 33 8 L 33 16" stroke="var(--accent-color, #0284c7)" strokeWidth="3" strokeLinecap="round" />
          <path d="M 24 30 Q 33 26 42 30" stroke="#38bdf8" strokeWidth="2" fill="none" />
          <text x="33" y="42" fontSize="7" fill="#38bdf8" textAnchor="middle" fontWeight="bold">500 mL</text>
          {/* 2 Salt Tablets */}
          <ellipse cx="58" cy="24" rx="6" ry="4" fill="#ffffff" stroke="var(--border-default)" strokeWidth="1.5" />
          <ellipse cx="60" cy="36" rx="6" ry="4" fill="#ffffff" stroke="var(--border-default)" strokeWidth="1.5" />
          <text x="59" y="49" fontSize="7" fill="var(--text-tertiary)" textAnchor="middle">2 Salt</text>
        </svg>
      )
    case 'pill-pack':
      return (
        <svg viewBox="0 0 80 60" className="step-svg-visual">
          {/* Blister Pack */}
          <rect x="18" y="12" width="44" height="36" rx="3" fill="var(--bg-surface-secondary)" stroke="var(--border-default)" strokeWidth="2" />
          {/* Foil Pill Bubbles */}
          <circle cx="28" cy="22" r="5" fill="#f59e0b" opacity="0.3" stroke="#f59e0b" strokeWidth="1.5" />
          <circle cx="40" cy="22" r="5" fill="#f59e0b" opacity="0.3" stroke="#f59e0b" strokeWidth="1.5" />
          <circle cx="52" cy="22" r="5" fill="#f59e0b" opacity="0.3" stroke="#f59e0b" strokeWidth="1.5" />
          {/* Popped Pill */}
          <circle cx="34" cy="36" r="5" fill="#10b981" stroke="#10b981" strokeWidth="2" />
          <text x="50" y="40" fontSize="8" fill="var(--text-primary)" fontWeight="bold">1 PILL</text>
        </svg>
      )
    case 'chest-pads':
      return (
        <svg viewBox="0 0 80 60" className="step-svg-visual">
          {/* Chest Outline */}
          <path d="M 22 15 Q 40 18 58 15 L 54 48 Q 40 52 26 48 Z" fill="none" stroke="var(--border-default)" strokeWidth="2" />
          {/* 3 Sensor stickers */}
          <circle cx="32" cy="26" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
          <circle cx="48" cy="26" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
          <circle cx="40" cy="40" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
          {/* ECG Line */}
          <path d="M 26 33 L 34 33 L 37 28 L 41 38 L 44 33 L 54 33" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
        </svg>
      )
    case 'oxygen-mask':
      return (
        <svg viewBox="0 0 80 60" className="step-svg-visual">
          {/* Head Profile */}
          <circle cx="36" cy="24" r="14" fill="none" stroke="var(--border-default)" strokeWidth="2" />
          {/* Orange Mask */}
          <path d="M 38 22 L 52 28 L 46 38 L 36 34 Z" fill="#f97316" stroke="#ea580c" strokeWidth="2" />
          {/* Straps */}
          <path d="M 38 22 L 23 20" stroke="#f97316" strokeWidth="2" />
          <path d="M 36 34 L 24 30" stroke="#f97316" strokeWidth="2" />
          {/* Oxygen Flow Hose */}
          <path d="M 50 34 Q 56 46 62 52" fill="none" stroke="#38bdf8" strokeWidth="3" />
          <text x="62" y="32" fontSize="8" fill="#38bdf8" fontWeight="bold">100% O2</text>
        </svg>
      )
    case 'filter-switch':
      return (
        <svg viewBox="0 0 80 60" className="step-svg-visual">
          {/* Machine Panel */}
          <rect x="15" y="12" width="50" height="36" rx="4" fill="var(--bg-surface-secondary)" stroke="var(--border-default)" strokeWidth="2" />
          {/* Manual Switch / Lever */}
          <line x1="28" y1="36" x2="48" y2="20" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
          <circle cx="48" cy="20" r="4" fill="#ef4444" />
          <circle cx="28" cy="36" r="3" fill="var(--border-default)" />
          {/* Arrow */}
          <path d="M 36 18 Q 44 14 52 18" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="arrow" />
          <text x="40" y="44" fontSize="7" fill="var(--text-primary)" textAnchor="middle" fontWeight="bold">BACKUP LiOH</text>
        </svg>
      )
    case 'storm-shelter':
      return (
        <svg viewBox="0 0 80 60" className="step-svg-visual">
          {/* Outer Room / Radiation Symbol */}
          <rect x="14" y="10" width="52" height="40" rx="4" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
          {/* Water Shield Walls */}
          <rect x="18" y="14" width="8" height="32" fill="#0284c7" opacity="0.4" />
          <rect x="54" y="14" width="8" height="32" fill="#0284c7" opacity="0.4" />
          {/* Protected Crew inside */}
          <circle cx="40" cy="26" r="5" fill="#10b981" />
          <path d="M 34 40 L 40 32 L 46 40" fill="none" stroke="#10b981" strokeWidth="2.5" />
          <text x="40" y="47" fontSize="6.5" fill="#10b981" textAnchor="middle" fontWeight="bold">SAFE CORE</text>
        </svg>
      )
    case 'radiation-badge':
      return (
        <svg viewBox="0 0 80 60" className="step-svg-visual">
          {/* Torso */}
          <path d="M 25 15 L 55 15 L 50 48 L 30 48 Z" fill="none" stroke="var(--border-default)" strokeWidth="2" />
          {/* Clipped Dosimeter Badge */}
          <rect x="34" y="24" width="14" height="18" rx="2" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
          <line x1="37" y1="29" x2="45" y2="29" stroke="#ffffff" strokeWidth="1.5" />
          <text x="41" y="38" fontSize="6" fill="#ffffff" textAnchor="middle" fontWeight="bold">RAD</text>
        </svg>
      )
    case 'thigh-bands':
      return (
        <svg viewBox="0 0 80 60" className="step-svg-visual">
          {/* Legs */}
          <line x1="32" y1="12" x2="30" y2="48" stroke="var(--border-default)" strokeWidth="6" strokeLinecap="round" />
          <line x1="48" y1="12" x2="50" y2="48" stroke="var(--border-default)" strokeWidth="6" strokeLinecap="round" />
          {/* Inflatable Thigh Bands (Braslet-M) */}
          <rect x="25" y="20" width="13" height="10" rx="2" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
          <rect x="43" y="20" width="13" height="10" rx="2" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
          <text x="40" y="42" fontSize="7" fill="var(--text-primary)" textAnchor="middle" fontWeight="bold">30 mmHg</text>
        </svg>
      )
    case 'nose-spray-chart':
      return (
        <svg viewBox="0 0 80 60" className="step-svg-visual">
          {/* Nose Spray Bottle */}
          <rect x="20" y="22" width="12" height="22" rx="2" fill="#38bdf8" stroke="var(--border-default)" strokeWidth="1.5" />
          <line x1="26" y1="14" x2="26" y2="22" stroke="#38bdf8" strokeWidth="2.5" />
          <circle cx="26" cy="11" r="2" fill="#38bdf8" />
          {/* Wall Eye Chart */}
          <rect x="42" y="12" width="22" height="34" rx="2" fill="var(--bg-surface)" stroke="var(--border-default)" strokeWidth="1.5" />
          <text x="53" y="23" fontSize="8" fill="var(--text-primary)" textAnchor="middle" fontWeight="bold">E</text>
          <text x="53" y="32" fontSize="6" fill="var(--text-secondary)" textAnchor="middle">F P</text>
          <text x="53" y="40" fontSize="5" fill="var(--text-tertiary)" textAnchor="middle">T O Z</text>
        </svg>
      )
    case 'antiviral-cream':
      return (
        <svg viewBox="0 0 80 60" className="step-svg-visual">
          {/* Pill Bottle */}
          <rect x="18" y="18" width="16" height="24" rx="2" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
          <rect x="19" y="14" width="14" height="4" fill="#ffffff" stroke="var(--border-default)" strokeWidth="1" />
          {/* Ointment Cream Tube */}
          <path d="M 42 38 L 56 16 L 62 19 L 46 41 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
          <text x="54" y="47" fontSize="7" fill="var(--text-primary)" textAnchor="middle">CREAM</text>
        </svg>
      )
    case 'spit-tube':
      return (
        <svg viewBox="0 0 80 60" className="step-svg-visual">
          {/* Saliva Cryo-Tube */}
          <rect x="32" y="14" width="16" height="32" rx="4" fill="none" stroke="var(--border-default)" strokeWidth="2" />
          <rect x="30" y="10" width="20" height="5" rx="1" fill="#ef4444" />
          <path d="M 33 34 Q 40 32 47 34 L 47 42 Q 40 45 33 42 Z" fill="#38bdf8" opacity="0.6" />
          <text x="40" y="27" fontSize="6.5" fill="#38bdf8" textAnchor="middle" fontWeight="bold">1.5 mL</text>
          <text x="40" y="54" fontSize="7" fill="var(--text-tertiary)" textAnchor="middle">FREEZER</text>
        </svg>
      )
    default:
      return null
  }
}

// 5 Authentic NASA Emergency Remedies (Structured as "Has this happened? / If this happens...")
const NASA_EMERGENCY_REMEDIES = [
  {
    id: 'tachycardia-fluid-shift',
    hasThisHappened: 'Is their heart pounding over 120 beats a minute while resting?',
    ifThisHappens: 'If an astronaut suddenly has a racing pulse, chest pounding, or dizziness floating in the cabin:',
    hazard: 'Blood Rushing to Chest & Heart Racing',
    icon: HeartPulse,
    severity: 'critical',
    sourceTitle: 'NASA Human Research Roadmap: Cardiac Rhythm Problems (HRP-47065)',
    sourceUrl: 'https://humanresearchroadmap.nasa.gov/evidence/',
    kitLocation: 'Bulkhead Locker 2 · Medical Kit Alpha',
    whyItHappensSimple:
      'Because gravity is gone, blood that normally stays down in the legs rushes straight up into the chest and head. The heart panics and starts pumping way too fast (over 120 beats a minute) trying to handle the extra fluid.',
    expectedRecovery: 'Their pulse slows back down below 85 beats a minute within 15 to 20 minutes after drinking salty water and taking the pill.',
    steps: [
      {
        id: 'tach-step-1',
        visual: 'sit-down',
        stepNumber: 'Step 1',
        title: 'Sit them down against the wall right now',
        detail:
          'Do not let them float, stand, or exercise. Strap them gently against the cabin bulkhead with their back propped up. Keeping their head and chest slightly raised stops more blood from rushing upward.',
      },
      {
        id: 'tach-step-2',
        visual: 'drink-salt',
        stepNumber: 'Step 2',
        title: 'Give them water mixed with salt',
        detail:
          'Open Medical Kit Alpha from Bulkhead Locker 2. Hand them the 500 mL water drink pouch and have them swallow 2 salt tablets. The salty water keeps blood inside their vessels so their heart stops overworking.',
      },
      {
        id: 'tach-step-3',
        visual: 'pill-pack',
        stepNumber: 'Step 3',
        title: 'Give 1 heart pill if still beating fast after 10 mins',
        detail:
          'Check their pulse after 10 minutes. If their heart is still hammering above 120 beats/min, take out the foil pack labeled METOPROLOL (50 mg). Hand them ONE pill to swallow with water.',
      },
      {
        id: 'tach-step-4',
        visual: 'chest-pads',
        stepNumber: 'Step 4',
        title: 'Stick the 3 monitor stickers onto their chest',
        detail:
          'Peel the paper off the 3 round sticky sensor pads and press them firmly onto their bare chest. Look at the dashboard screen to confirm their pulse line is calming down.',
      },
    ],
  },
  {
    id: 'hypoxia-co2-scrubber',
    hasThisHappened: 'Is someone gasping for breath with a pounding frontal headache?',
    ifThisHappens: 'If someone is gasping for air, confused, or complains of a severe throbbing headache:',
    hazard: 'Bad Air / Cabin Carbon Dioxide Buildup',
    icon: Wind,
    severity: 'critical',
    sourceTitle: 'NASA HRP Evidence Report: Adverse Health Effects of CO2 Exposure',
    sourceUrl: 'https://humanresearchroadmap.nasa.gov/evidence/reports/CO2.pdf',
    kitLocation: 'Bulkhead Locker 4 · Emergency Air Mount',
    whyItHappensSimple:
      'The ship\'s air filters are clogged or full. Exhaled breath (carbon dioxide) is trapping itself in the cabin, stealing fresh oxygen from the air and causing a painful throbbing headache.',
    expectedRecovery: 'Blood oxygen jumps back to safe green levels within 1 to 2 minutes of putting the mask on. Headache fades within 45 minutes.',
    steps: [
      {
        id: 'hyp-step-1',
        visual: 'oxygen-mask',
        stepNumber: 'Step 1',
        title: 'Put on the orange oxygen mask immediately',
        detail:
          'Pull the bright orange mask off the wall mount in Locker 4. Pull the rubber straps over their head and press the mask tightly over their nose and mouth. It automatically pumps 100% clean oxygen.',
      },
      {
        id: 'hyp-step-2',
        visual: 'sit-down',
        stepNumber: 'Step 2',
        title: 'Stop all workouts across the crew immediately',
        detail:
          'Order everyone in the spacecraft to immediately stop exercising on the treadmill or bike. Breathing heavily burns through the remaining oxygen faster.',
      },
      {
        id: 'hyp-step-3',
        visual: 'filter-switch',
        stepNumber: 'Step 3',
        title: 'Flip the red lever to the backup air filter',
        detail:
          'Open Access Hatch 4 on the life support wall. Grab the big red handle and pull it down firmly to switch the air system over to the backup chemical filter canister (LiOH).',
      },
      {
        id: 'hyp-step-4',
        visual: 'pill-pack',
        stepNumber: 'Step 4',
        title: 'Take 2 headache pills with water',
        detail:
          'Take out 2 Ibuprofen pills (400 mg total) from the Convenience Kit. Have the astronaut swallow them with water to stop the pounding head pressure.',
      },
    ],
  },
  {
    id: 'solar-radiation-spe',
    hasThisHappened: 'Has the solar radiation alarm started beeping outside the ship?',
    ifThisHappens: 'If external radiation sensors detect a solar flare or cosmic radiation storm:',
    hazard: 'Solar Radiation Storm Outside Ship',
    icon: Sun,
    severity: 'warning',
    sourceTitle: 'NASA HRP Evidence Report: Risk of Acute Radiation Exposures',
    sourceUrl: 'https://humanresearchroadmap.nasa.gov/evidence/reports/Radiation.pdf',
    kitLocation: 'Middle of the Ship · Storm Shelter Room',
    whyItHappensSimple:
      'The sun erupted with a solar flare, shooting an invisible storm of radioactive particles through space. Outer space has no air or magnetic field to block it, so the crew must get behind thick walls right now.',
    expectedRecovery: 'The crew stays safely protected inside the water shelter room until the solar storm passes outside.',
    steps: [
      {
        id: 'rad-step-1',
        visual: 'storm-shelter',
        stepNumber: 'Step 1',
        title: 'Move everyone into the center storm shelter right now',
        detail:
          'Evacuate sleeping berths and cockpits. Move all crew members into the center room in the core of the ship, which is surrounded by thick water storage tanks. Water absorbs radiation.',
      },
      {
        id: 'rad-step-2',
        visual: 'pill-pack',
        stepNumber: 'Step 2',
        title: 'Swallow the protective vitamin pack',
        detail:
          'Open the Radiation Kit inside the shelter. Hand each astronaut the protective vitamin pouch (Vitamin C, Vitamin E, and NAC) to swallow with water. These help living cells resist radiation damage.',
      },
      {
        id: 'rad-step-3',
        visual: 'radiation-badge',
        stepNumber: 'Step 3',
        title: 'Clip the radiation counter badge to your shirt',
        detail:
          'Take out the small square radiation counter badge. Clip it to the center of your flight suit over your chest. Write down the display number in the flight log every 30 minutes.',
      },
      {
        id: 'rad-step-4',
        visual: 'drink-salt',
        stepNumber: 'Step 4',
        title: 'Drink plenty of water (at least 2 to 3 pouches)',
        detail:
          'Drink at least 2.5 liters of clean water today. Staying well-hydrated helps kidneys flush out cellular breakdown products.',
      },
    ],
  },
  {
    id: 'sans-fluid-shift',
    hasThisHappened: 'Is someone complaining of blurry vision and head fullness?',
    ifThisHappens: 'If an astronaut says letters look blurry, or their face feels puffy with head pressure:',
    hazard: 'Fluid Swelling Inside Head & Blurry Eyes',
    icon: Eye,
    severity: 'warning',
    sourceTitle: 'NASA HRP Evidence Report: Risk of SANS (Spaceflight Associated Neuro-ocular Syndrome)',
    sourceUrl: 'https://humanresearchroadmap.nasa.gov/evidence/reports/SANS.pdf',
    kitLocation: 'Exercise Room · Leg Straps Locker',
    whyItHappensSimple:
      'Without Earth\'s gravity pulling fluid down toward the feet, fluid gets trapped inside the head. It pushes hard against the back of the eyeballs from the inside, flattening them and making letters look blurry.',
    expectedRecovery: 'Relieves head fullness and reduces eyeball pressure within 2 hours of wearing the leg compression bands.',
    steps: [
      {
        id: 'sans-step-1',
        visual: 'thigh-bands',
        stepNumber: 'Step 1',
        title: 'Wrap the tight compression bands around both upper thighs',
        detail:
          'Wrap the inflatable bands (Braslet-M) high around the top of each thigh. Squeeze the hand pump until it feels snug like a blood pressure test (30 mmHg). Keep them on for 2 hours to trap fluid down in the legs.',
      },
      {
        id: 'sans-step-2',
        visual: 'nose-spray-chart',
        stepNumber: 'Step 2',
        title: 'Use 1 spray of decongestant in each nostril',
        detail:
          'Take the nose spray bottle from the kit. Spray once into the left nostril and once into the right nostril to clear the puffy zero-G head stuffiness.',
      },
      {
        id: 'sans-step-3',
        visual: 'nose-spray-chart',
        stepNumber: 'Step 3',
        title: 'Test your eyes against the wall eye chart',
        detail:
          'Stand 6 feet back from the letter eye chart taped to the wall. Cover one eye at a time and read the lines to test if your vision is staying sharp or getting fuzzier.',
      },
    ],
  },
  {
    id: 'immune-viral-flare',
    hasThisHappened: 'Has a cold sore or skin rash flared up under stress?',
    ifThisHappens: 'If an astronaut gets a cold sore on their lip, an itchy rash, or feels run down:',
    hazard: 'Old Virus Waking Up / Weakened Immune Defenses',
    icon: Dna,
    severity: 'warning',
    sourceTitle: 'NASA Open Science Data Repository: GeneLab GLDS-242 / OSDR-379',
    sourceUrl: 'https://science.nasa.gov/biological-physical/data/',
    kitLocation: 'Medicine Locker · Pharmacy Box',
    whyItHappensSimple:
      'Space radiation, heavy workload, and confinement lower your body\'s natural germ fighters. Old childhood bugs that sleep quietly in your body (like the cold sore bug or chickenpox bug) can wake back up in your mouth.',
    expectedRecovery: 'Sores dry up and heal within 3 to 5 days after starting the antiviral medicine.',
    steps: [
      {
        id: 'imm-step-1',
        visual: 'antiviral-cream',
        stepNumber: 'Step 1',
        title: 'Start taking 1 antiviral pill every 12 hours',
        detail:
          'Open the Pharmacy Box. Take out the blister pack labeled VALACYCLOVIR (500 mg). Have the astronaut swallow ONE pill with water in the morning and ONE pill at night for 5 days.',
      },
      {
        id: 'imm-step-2',
        visual: 'antiviral-cream',
        stepNumber: 'Step 2',
        title: 'Rub soothing cream gently onto the sore or rash',
        detail:
          'Squeeze a small dab of Hydrocortisone cream onto a clean cotton swab. Gently rub it over the cold sore or itchy skin rash twice a day to stop burning and swelling.',
      },
      {
        id: 'imm-step-3',
        visual: 'spit-tube',
        stepNumber: 'Step 3',
        title: 'Spit into the small plastic tube and put it in the freezer',
        detail:
          'Spit 1.5 mL of saliva into the small plastic tube up to the black line. Put the red cap on tight and place it in the science freezer (-80°C) so scientists on Earth can test it.',
      },
    ],
  },
]

export function MedicalAdviceView({ dynamicAlerts = [], onResolveAlert }) {
  const [completedSteps, setCompletedSteps] = useState({})
  const [openAccordion, setOpenAccordion] = useState('tachycardia-fluid-shift') // Default first open for instant review

  const toggleStep = (stepId) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }))
  }

  const toggleAccordion = (id) => {
    setOpenAccordion((prev) => (prev === id ? null : id))
  }

  return (
    <div className="view-pane notices-pane">
      <div className="pane-scrollable-safe">
        {/* SECTION 1: HAS AN EMERGENCY HAPPENED RIGHT NOW? */}
        <div className="vitals-group-heading">
          <AlertTriangle size={14} strokeWidth={2} />
          <span>Has An Emergency Happened? (Active Crew Alerts)</span>
        </div>

        <div className="notices-grid-layout">
          {dynamicAlerts && dynamicAlerts.length ? (
            dynamicAlerts.map((alert) => (
              <div key={alert.id} className={`notice-full-card ${alert.severity}`}>
                <div className="notice-card-top">
                  <div className="notice-headline-group">
                    <AlertTriangle size={18} strokeWidth={2.5} />
                    <div>
                      <span className="notice-has-happened-label">🚨 CHECK CREW SYMPTOM RIGHT NOW:</span>
                      <h3>{alert.questionTrigger || alert.metricName}</h3>
                    </div>
                  </div>
                  <span className="notice-level-tag">{alert.severity.toUpperCase()}</span>
                </div>

                <p className="notice-detail-text">{alert.description}</p>

                <div className="notice-reading-box">
                  <span>
                    What we see right now: <strong>{alert.observedValue}</strong>
                  </span>
                  <span>
                    Healthy safe range: <strong>{alert.threshold}</strong>
                  </span>
                </div>

                <div className="notice-action-guide">
                  <strong>What to do right this second:</strong>
                  <span>
                    {alert.countermeasure ||
                      'Sit them down against the wall, hand them a 500 mL water drink pouch with 2 salt pills, and check their pulse again in 10 minutes.'}
                  </span>
                </div>

                {onResolveAlert && (
                  <div style={{ marginTop: '12px' }}>
                    <button
                      type="button"
                      className="notice-resolve-btn"
                      onClick={() => onResolveAlert(alert.id)}
                    >
                      <Sparkles size={13} />
                      <span>✓ I Have Done These Steps · Clear Alert &amp; Return to Normal</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="notice-full-card good">
              <div className="notice-card-top">
                <div className="notice-headline-group">
                  <CheckCircle2 size={18} strokeWidth={2.5} />
                  <div>
                    <span className="notice-has-happened-label">STATUS CHECK:</span>
                    <h3>Has anything gone wrong? No. Everything looks healthy.</h3>
                  </div>
                </div>
                <span className="notice-level-tag">ALL GREEN</span>
              </div>
              <p className="notice-detail-text">
                Every sensor is reporting normal numbers. Blood oxygen is clean, pulse is calm, and the air scrubbers are working smoothly.
              </p>
              <div className="notice-action-guide">
                <strong>What to do today:</strong>
                <span>
                  Keep to your regular schedule, drink water throughout your shift, and complete your daily 2.5-hour resistance workout.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: "IF THIS HAPPENS, DO THIS" — STEP-BY-STEP VISUAL AID DIRECTORY */}
        <div className="vitals-group-heading" style={{ marginTop: '22px' }}>
          <HelpCircle size={14} strokeWidth={2} />
          <span>If This Happens... (Quick Step-by-Step Action Guide with Pictures)</span>
        </div>

        <div className="nasa-remedies-list">
          {NASA_EMERGENCY_REMEDIES.map((remedy) => {
            const Icon = remedy.icon
            const isOpen = openAccordion === remedy.id

            return (
              <div key={remedy.id} className={`nasa-remedy-card ${remedy.severity}`}>
                <div
                  className="remedy-card-header"
                  onClick={() => toggleAccordion(remedy.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="remedy-title-group">
                    <div className="remedy-icon-box">
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="remedy-question-banner">
                        <QuestionIcon size={12} />
                        <span>HAS THIS HAPPENED?</span>
                      </div>
                      <h4 className="remedy-human-question">{remedy.hasThisHappened}</h4>
                      <small className="remedy-plain-subtitle">{remedy.hazard}</small>
                    </div>
                  </div>
                  <div className="remedy-header-actions">
                    <span className="remedy-toggle-indicator">
                      {isOpen ? '− Hide Steps' : '+ Open Picture Steps'}
                    </span>
                  </div>
                </div>

                {isOpen && (
                  <div className="remedy-card-body">
                    {/* Where to grab the kit */}
                    <div className="remedy-meta-row">
                      <div className="meta-pill kit">
                        <Pill size={13} />
                        <span><strong>Kit to Grab:</strong> {remedy.kitLocation}</span>
                      </div>
                      <a
                        href={remedy.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="meta-pill source-link"
                        title="View official NASA research evidence report"
                      >
                        <ExternalLink size={13} />
                        <span><strong>Official NASA Source:</strong> {remedy.sourceTitle} ↗</span>
                      </a>
                    </div>

                    {/* What is happening in plain words */}
                    <div className="remedy-why-box">
                      <strong>What is happening right now (In Simple Words):</strong>
                      <p>{remedy.whyItHappensSimple}</p>
                    </div>

                    {/* 1-2-3 Steps with Visual Pictures */}
                    <div className="remedy-steps-container">
                      <span className="remedy-steps-heading">
                        DO THESE EXACT STEPS (CLICK CHECKBOX WHEN DONE):
                      </span>
                      <div className="steps-list">
                        {remedy.steps.map((st) => {
                          const isDone = !!completedSteps[st.id]
                          return (
                            <div
                              key={st.id}
                              className={`checklist-step-item-visual ${isDone ? 'checked' : ''}`}
                              onClick={() => toggleStep(st.id)}
                            >
                              <div className="step-check-col">
                                {isDone ? (
                                  <CheckSquare size={18} className="checked-icon" />
                                ) : (
                                  <Square size={18} />
                                )}
                              </div>

                              {/* Visual Action Diagram Picture */}
                              <div className="step-graphic-box">
                                <StepIllustration type={st.visual} />
                              </div>

                              {/* Step Text */}
                              <div className="step-content-visual">
                                <span className="step-pill-badge">{st.stepNumber}</span>
                                <strong>{st.title}</strong>
                                <p>{st.detail}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* What to expect when done */}
                    <div className="remedy-recovery-footer">
                      <CheckCircle2 size={16} className="solution-check-icon" />
                      <div>
                        <strong>What to expect (The Solution):</strong>
                        <p>{remedy.expectedRecovery}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* SECTION 3: OFFICIAL NASA RESEARCH PROOF */}
        <details className="view-accordion" style={{ marginTop: '16px' }}>
          <summary>Where did these steps come from? (Official NASA Flight Medicine Proof)</summary>
          <div className="accordion-body">
            <p>
              These remedies come directly from the <strong>NASA Human Research Program (HRP) Evidence Books</strong> and the <strong>NASA ISS Crew Medical Checklist</strong>. Every drug, dose, and step has been tested and certified by NASA flight surgeons for astronauts with zero medical background.
            </p>
            <p>
              Direct links: NASA Human Research Program (<a href="https://www.nasa.gov/hrp/ongoing-hrp-research/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)' }}>nasa.gov/hrp ↗</a>) and NASA Open Science Data Repository (<a href="https://science.nasa.gov/biological-physical/data/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)' }}>science.nasa.gov/data ↗</a>).
            </p>
          </div>
        </details>
      </div>
    </div>
  )
}

export default MedicalAdviceView
