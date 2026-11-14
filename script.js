const state = {
  heartRate: 72,
  oxygen: 98,
  fatigue: 38,
  immune: 19,
  alert: "stable",
  scenario: null,
};

const heartRateEl = document.getElementById("heartRate");
const oxygenEl = document.getElementById("oxygen");
const fatigueEl = document.getElementById("fatigue");
const immuneEl = document.getElementById("immune");
const statusBadgeEl = document.getElementById("statusBadge");
const alertBoxEl = document.getElementById("alertBox");
const guidanceEl = document.getElementById("guidance");
const checklistEl = document.getElementById("checklist");
const resetButtonEl = document.getElementById("resetButton");

const scenarioEffects = {
  tachycardia: {
    label: "Acute tachycardia detected",
    alertClass: "alert",
    guidance:
      "Crew member reports chest discomfort and racing pulse. Place them in a quiet environment, recheck vitals every 60 seconds, and prioritize oxygen support if symptoms worsen.",
    checklist: [
      "Confirm chest pain and dizziness.",
      "Reduce physical exertion immediately.",
      "Recheck heart rate and hydration status.",
      "Prepare emergency response and activate crew support." ,
    ],
    apply: () => {
      state.heartRate = Math.min(150, state.heartRate + 36);
      state.oxygen = Math.max(80, state.oxygen - 10);
      state.fatigue = Math.min(100, state.fatigue + 18);
      state.immune = Math.min(100, state.immune + 8);
    },
  },
  hypoxia: {
    label: "Cabin hypoxia alert",
    alertClass: "critical",
    guidance:
      "Oxygen saturation has fallen below safe mission limits. Stop exertion, isolate the crew from known contamination sources, and begin emergency breathing support protocols.",
    checklist: [
      "Check cabin air quality and pressure integrity.",
      "Move crew member to filtered breathable air.",
      "Monitor SpO2 continuously and record timing.",
      "Escalate to the onboard medical chain if oxygen stays low." ,
    ],
    apply: () => {
      state.oxygen = Math.max(68, state.oxygen - 24);
      state.fatigue = Math.min(100, state.fatigue + 22);
      state.heartRate = Math.min(160, state.heartRate + 20);
      state.immune = Math.min(100, state.immune + 6);
    },
  },
  immune: {
    label: "Immune flare risk",
    alertClass: "alert",
    guidance:
      "Immune system stress patterns suggest a viral reactivation or inflammatory response. Prioritize rest, hydration, and environmental hygiene while monitoring fever or respiratory changes.",
    checklist: [
      "Review recent stress, sleep, and exposure patterns.",
      "Prioritize hydration and rest.",
      "Watch for fever, cough, or breathing changes.",
      "Escalate if multiple crew members report similar symptoms." ,
    ],
    apply: () => {
      state.immune = Math.min(100, state.immune + 35);
      state.fatigue = Math.min(100, state.fatigue + 20);
      state.heartRate = Math.min(140, state.heartRate + 8);
      state.oxygen = Math.max(80, state.oxygen - 6);
    },
  },
  fatigue: {
    label: "Sleep debt saturation",
    alertClass: "alert",
    guidance:
      "Fatigue is trending beyond safe operational limits. Reduce cognitive load, enforce restorative sleep, and debrief for scheduling stress before returning to tasks.",
    checklist: [
      "Pause nonessential work and reduce mission load.",
      "Assess sleep quality and circadian disruption.",
      "Encourage hydration and recovery routines.",
      "Reassess before high-risk tasks or EVA operations." ,
    ],
    apply: () => {
      state.fatigue = Math.min(100, state.fatigue + 28);
      state.heartRate = Math.min(125, state.heartRate + 6);
      state.oxygen = Math.max(88, state.oxygen - 3);
    },
  },
};

function setBadge(status) {
  statusBadgeEl.classList.remove("stable", "alert", "critical");
  statusBadgeEl.classList.add(status);
  statusBadgeEl.textContent = status.toUpperCase();
}

function updateChecklist(items) {
  checklistEl.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

function updateUI() {
  heartRateEl.textContent = state.heartRate;
  oxygenEl.textContent = state.oxygen;
  fatigueEl.textContent = state.fatigue;
  immuneEl.textContent = state.immune;

  if (state.heartRate > 120 || state.oxygen < 86 || state.fatigue > 75 || state.immune > 80) {
    state.alert = "critical";
    setBadge("critical");
    alertBoxEl.textContent = state.scenario
      ? `${scenarioEffects[state.scenario].label}. Immediate medical escalation required.`
      : "Critical warning: vital signs exceed safe operational thresholds.";
    alertBoxEl.className = "alert-box critical";
    guidanceEl.textContent =
      "Immediate intervention required. Remove the crew member from physical workload, secure the environment, and begin emergency response procedures without delay.";
    updateChecklist([
      "Control the scene and isolate hazards.",
      "Escalate to the command medical lead.",
      "Continue live vitals and record the timeline.",
      "Prepare contingency transfer or resupply support.",
    ]);
    return;
  }

  if (state.heartRate > 95 || state.oxygen < 92 || state.fatigue > 60 || state.immune > 50) {
    state.alert = "alert";
    setBadge("alert");
    alertBoxEl.textContent = state.scenario
      ? `${scenarioEffects[state.scenario].label}. Crew needs closer monitoring.`
      : "Alert: vitals are elevated beyond nominal range. Follow monitoring protocols.";
    alertBoxEl.className = "alert-box alert";
    guidanceEl.textContent = state.scenario
      ? scenarioEffects[state.scenario].guidance
      : "Crew is under elevated stress. Confirm symptoms, reduce workload, and continue calibration checks for at least 10 minutes.";
    updateChecklist(state.scenario ? scenarioEffects[state.scenario].checklist : [
      "Reduce workload and check environment.",
      "Reassess heart rate and oxygenation.",
      "Log symptoms and trigger a follow-up cycle.",
      "Prioritize rest and hydration while monitoring." ,
    ]);
    return;
  }

  state.alert = "stable";
  setBadge("stable");
  alertBoxEl.textContent = "No active anomaly. Crew is in routine monitoring mode.";
  alertBoxEl.className = "alert-box info";
  guidanceEl.textContent =
    "Crew remains stable. Continue environmental monitoring and maintain routine exercise and sleep cycles.";
  updateChecklist([
    "Confirm symptoms and time of onset.",
    "Check heart rate, oxygenation, and fatigue.",
    "Assess environment and isolate hazards.",
    "Follow emergency response sequence.",
  ]);
}

function driftValues() {
  if (!state.scenario) {
    state.heartRate = Math.max(60, Math.min(90, state.heartRate + Math.round((Math.random() - 0.5) * 8)));
    state.oxygen = Math.max(92, Math.min(100, state.oxygen + Math.round((Math.random() - 0.5) * 3)));
    state.fatigue = Math.max(25, Math.min(60, state.fatigue + Math.round((Math.random() - 0.5) * 12)));
    state.immune = Math.max(10, Math.min(45, state.immune + Math.round((Math.random() - 0.5) * 9)));
    updateUI();
  }
}

function setScenario(name) {
  if (!scenarioEffects[name]) {
    return;
  }

  state.scenario = name;
  scenarioEffects[name].apply();
  updateUI();
}

resetButtonEl.addEventListener("click", () => {
  state.heartRate = 72;
  state.oxygen = 98;
  state.fatigue = 38;
  state.immune = 19;
  state.scenario = null;
  updateUI();
});

document.querySelectorAll(".scenario-button").forEach((button) => {
  button.addEventListener("click", () => setScenario(button.dataset.scenario));
});

setBadge("stable");
updateUI();
setInterval(driftValues, 2200);
