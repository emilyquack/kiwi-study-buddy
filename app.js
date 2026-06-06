const KIWI_STORAGE_KEY = "kiwi-study-buddy-v1";

const SUBJECTS = {
  biology: {
    label: "General Biology",
    icon: "🧬",
    color: "#CDECCF",
    accessory: "🥽 Tiny lab goggles activated",
    line: "Cells, genetics, evolution, ecology, physiology, enzymes, and lab thinking.",
    topics: ["cell membranes", "genetics", "evolution", "enzymes", "ecology"],
    tools: ["Explain", "Quiz Me", "Flashcards", "Diagram Practice", "Study Guide", "Summarize Notes"],
    voice: "Biology mode. Tiny goggles activated."
  },
  chemistry: {
    label: "General Chemistry",
    icon: "⚗️",
    color: "#E5D4F5",
    accessory: "🥽 Safety goggles on; unit chaos off",
    line: "Atoms, bonding, stoichiometry, molarity, acids/bases, equilibrium, and kinetics.",
    topics: ["stoichiometry", "molarity", "periodic trends", "acids and bases", "equilibrium"],
    tools: ["Explain", "Practice Problem", "Unit Check", "Flashcards", "Study Guide", "Summarize Notes"],
    voice: "Chemistry mode. Before we do math crimes, we write the units."
  },
  physics: {
    label: "General Physics",
    icon: "🪐",
    color: "#D5E9FF",
    accessory: "➡️ Kiwi brought arrows",
    line: "Motion, forces, energy, momentum, waves, circuits, fluids, and thermodynamics.",
    topics: ["kinematics", "forces", "energy", "momentum", "circuits"],
    tools: ["Explain", "Formula Help", "Free-Body Checklist", "Practice Problem", "Quiz Me", "Study Guide"],
    voice: "Physics mode. Draw the forces first. Kiwi is watching."
  },
  math: {
    label: "Math",
    icon: "📐",
    color: "#FFF0B8",
    accessory: "📐 Calculator hat equipped",
    line: "A full pathway from Algebra 1 through Calculus 3.",
    topics: ["linear equations", "functions", "limits", "derivatives", "multiple integrals"],
    tools: ["Explain", "Step-by-Step", "Practice Problem", "Mistake Check", "Flashcards", "Study Guide"],
    voice: "Math mode. Numbers have formed a small rebellion.",
    levels: ["Algebra 1", "Geometry", "Algebra 2", "Precalculus", "Calculus 1", "Calculus 2", "Calculus 3"]
  },
  psychology: {
    label: "Psychology",
    icon: "🧠",
    color: "#FFDCCB",
    accessory: "🧠 Thought bubbles deployed",
    line: "Research methods, learning, memory, development, personality, disorders, and social psych.",
    topics: ["research methods", "memory", "learning", "development", "social psychology"],
    tools: ["Explain", "Quiz Me", "Compare Theories", "Flashcards", "Scenario Practice", "Study Guide"],
    voice: "Psychology mode. Let's analyze the behavior. Not yours. Probably."
  },
  writing: {
    label: "English / Writing",
    icon: "✍️",
    color: "#FFDCE8",
    accessory: "✍️ Comma goblin patrol begins",
    line: "Essay planning, thesis statements, paragraph structure, grammar, citations, and revision.",
    topics: ["thesis statements", "paragraph structure", "rhetorical analysis", "citations", "revision"],
    tools: ["Outline", "Thesis Help", "Revise Paragraph", "Quote Integration", "Grammar Check", "Study Guide"],
    voice: "Writing mode. This paragraph has feelings, but it needs a spine."
  },
  history: {
    label: "History",
    icon: "🏛️",
    color: "#EAD7B7",
    accessory: "🏛️ Timeline scarf wrapped",
    line: "Timelines, cause/effect, historical figures, primary sources, and essay prep.",
    topics: ["cause and effect", "primary sources", "timelines", "historical figures", "comparisons"],
    tools: ["Explain", "Timeline", "Cause/Effect", "Flashcards", "Essay Outline", "Study Guide"],
    voice: "History mode. Everyone made choices. Some were questionable."
  }
};

const DEFAULT_STATE = {
  activeSubject: "biology",
  activeMathLevel: "Algebra 1",
  savedTopics: []
};

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

function loadState(storage = globalThis.localStorage) {
  if (!storage) return cloneState(DEFAULT_STATE);
  try {
    const raw = storage.getItem(KIWI_STORAGE_KEY);
    return raw ? { ...cloneState(DEFAULT_STATE), ...JSON.parse(raw) } : cloneState(DEFAULT_STATE);
  } catch {
    return cloneState(DEFAULT_STATE);
  }
}

function saveState(state, storage = globalThis.localStorage) {
  if (!storage) return;
  storage.setItem(KIWI_STORAGE_KEY, JSON.stringify(state));
}

function getSubject(subjectKey) {
  return SUBJECTS[subjectKey] || SUBJECTS.biology;
}

function normalizeTopic(topic, subjectKey, state = DEFAULT_STATE) {
  const subject = getSubject(subjectKey);
  const cleanTopic = (topic || "").trim();
  if (cleanTopic) return cleanTopic;
  if (subjectKey === "math") return state.activeMathLevel || "Algebra 1";
  return subject.topics[0];
}

function buildStudyResponse({ subjectKey, action, topic, notes, confidence, state = DEFAULT_STATE }) {
  const subject = getSubject(subjectKey);
  const cleanTopic = normalizeTopic(topic, subjectKey, state);
  const noteHint = notes && notes.trim().length > 0 ? "I used your notes as the study target." : "Add notes if you want me to get more specific later.";
  const level = subjectKey === "math" ? ` (${state.activeMathLevel})` : "";
  const confidenceLine = confidence === "strong" ? "You marked this strong, so Kiwi will challenge you." : confidence === "okay" ? "You marked this okay, so Kiwi will tighten the wobbly bits." : "You marked this tiny panic, so Kiwi will go step-by-step.";

  const templates = {
    "Explain": `Let's explain ${cleanTopic}${level} in ${subject.label}.\n\n1. Start with the main idea in one sentence.\n2. Name the key terms and units.\n3. Walk through one example.\n4. End by saying how you'd recognize this topic on a test.\n\n${confidenceLine}\n${noteHint}`,
    "Quiz Me": `Quick Kiwi quiz for ${cleanTopic}${level}:\n\nQ1. What is the core definition or rule?\nQ2. What is one common trap students make here?\nQ3. Apply it to a tiny example from your notes.\n\nAnswer out loud first. Kiwi does not accept telepathic studying.` ,
    "Flashcards": `Flashcard starter deck for ${cleanTopic}${level}:\n\n• Term → definition\n• Process/formula → when to use it\n• Common mistake → how to avoid it\n• Example → final answer or conclusion\n\nPaw stamp goal: make 4 cards now, not 40 cards never.` ,
    "Practice Problem": `Practice problem mode for ${cleanTopic}${level}:\n\n1. Identify what is given.\n2. Identify what is asked.\n3. Choose the rule/formula/concept.\n4. Solve or explain one step at a time.\n5. Check units, logic, or evidence.\n\nKiwi note: tiny steps prevent academic soup.` ,
    "Study Guide": `Mini study guide for ${cleanTopic}${level}:\n\n• Must-know ideas\n• Key vocabulary/formulas\n• One worked example\n• Two quiz questions\n• One common misconception\n• Confidence rating after review\n\nStart here, then mark your confidence again.` ,
    "Summarize Notes": `Summary plan for ${cleanTopic}${level}:\n\n• Big idea: write it in one sentence.\n• Details: keep only test-relevant facts.\n• Connections: link it to the previous topic.\n• Check: ask one question your teacher might ask.\n\n${noteHint}`,
    "Step-by-Step": `Step-by-step math rescue for ${cleanTopic}${level}:\n\n1. Rewrite the problem cleanly.\n2. Label the knowns and unknowns.\n3. Pick the operation/theorem.\n4. Do exactly one algebra/calculus move per line.\n5. Check by substitution, graph shape, or units when possible.` ,
    "Mistake Check": `Mistake check for ${cleanTopic}${level}:\n\nKiwi will look for sign errors, dropped units, skipped assumptions, unlabeled graphs, and suspicious leaps. Circle the step where your confidence drops first.` ,
    "Unit Check": `Unit check for ${cleanTopic}:\n\nWrite every number with units, convert before calculating, and make sure the final unit matches the question. Chemistry gremlins fear dimensional analysis.` ,
    "Formula Help": `Formula help for ${cleanTopic}:\n\nList variables, units, and what each formula assumes. Pick the formula that contains the unknown and the given values. Kiwi brought arrows, not chaos.` ,
    "Free-Body Checklist": `Free-body checklist for ${cleanTopic}:\n\nDraw object, choose axes, add gravity, normal, tension/friction/applied forces, split components, then write equations. Invisible arrows are not invited.` ,
    "Diagram Practice": `Diagram practice for ${cleanTopic}:\n\nDraw the structure/process, label every part, then explain what changes if one part is removed. Biology loves diagrams with consequences.` ,
    "Compare Theories": `Compare theories for ${cleanTopic}:\n\nMake columns for theorist, main claim, evidence/example, and limitation. Then write the one-sentence difference Kiwi can remember during a quiz.` ,
    "Scenario Practice": `Scenario practice for ${cleanTopic}:\n\nCreate a real-life example, identify the concept, explain why it fits, and explain why a nearby concept does not fit.` ,
    "Outline": `Writing outline for ${cleanTopic}:\n\nThesis → topic sentence 1 → evidence → analysis → topic sentence 2 → evidence → analysis → conclusion. Feelings are welcome; structure drives.` ,
    "Thesis Help": `Thesis helper for ${cleanTopic}:\n\nA strong thesis should be specific, arguable, and answer the prompt. Try: Although ___, ___ because ___.` ,
    "Revise Paragraph": `Paragraph revision for ${cleanTopic}:\n\nCheck topic sentence, evidence, analysis, transition, and relevance to thesis. If the paragraph wanders away, Kiwi gently herds it back.` ,
    "Quote Integration": `Quote integration for ${cleanTopic}:\n\nIntroduce context, quote only what you need, cite it, then explain how it proves your point. No quote confetti.` ,
    "Grammar Check": `Grammar patrol for ${cleanTopic}:\n\nCheck sentence boundaries, commas, subject-verb agreement, pronoun clarity, and tense consistency. Comma goblin patrol begins.` ,
    "Timeline": `Timeline builder for ${cleanTopic}:\n\nList events in order, add cause arrows, mark turning points, and write why each event mattered. Dates are useful; causes are the plot.` ,
    "Cause/Effect": `Cause/effect chain for ${cleanTopic}:\n\nCause → event → immediate effect → long-term effect → historical significance. Kiwi wants fewer random dates and more drama logic.` ,
    "Essay Outline": `History essay outline for ${cleanTopic}:\n\nClaim, historical context, evidence set 1, analysis, evidence set 2, analysis, complexity/counterpoint, conclusion.`
  };

  return `${subject.voice}\n\n${templates[action] || templates["Explain"]}`;
}

function buildWeakTopics(savedTopics) {
  return savedTopics
    .filter(item => item.confidence === "low")
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

function upsertTopic(state, { subjectKey, topic, confidence }) {
  const cleanTopic = normalizeTopic(topic, subjectKey, state);
  const existingIndex = state.savedTopics.findIndex(item => item.subjectKey === subjectKey && item.topic.toLowerCase() === cleanTopic.toLowerCase());
  const next = { subjectKey, topic: cleanTopic, confidence, updatedAt: Date.now() };
  const nextState = cloneState(state);
  if (existingIndex >= 0) nextState.savedTopics[existingIndex] = next;
  else nextState.savedTopics.push(next);
  return nextState;
}

function setupApp() {
  const els = {
    subjectGrid: document.querySelector("#subject-grid"),
    title: document.querySelector("#study-title"),
    kicker: document.querySelector("#subject-kicker"),
    accessory: document.querySelector("#accessory-pill"),
    mathLevels: document.querySelector("#math-levels"),
    actions: document.querySelector("#study-actions"),
    output: document.querySelector("#study-output"),
    bubble: document.querySelector("#kiwi-bubble"),
    topic: document.querySelector("#topic-input"),
    notes: document.querySelector("#notes-input"),
    weakGrid: document.querySelector("#weak-grid"),
    saveTopic: document.querySelector("#save-topic"),
    reviewWeak: document.querySelector("#review-weak"),
    resetDemo: document.querySelector("#reset-demo"),
    kiwiButton: document.querySelector("#kiwi-button")
  };
  let state = loadState();

  function getConfidence() {
    return document.querySelector('input[name="confidence"]:checked')?.value || "low";
  }

  function renderSubjects() {
    els.subjectGrid.innerHTML = Object.entries(SUBJECTS).map(([key, subject]) => `
      <button type="button" class="subject-card ${key === state.activeSubject ? "active" : ""}" data-subject="${key}" style="--subject-color: ${subject.color}">
        <span class="subject-icon">${subject.icon}</span>
        <div class="subject-name">${subject.label}</div>
        <div class="subject-line">${subject.line}</div>
      </button>
    `).join("");
  }

  function renderMathLevels() {
    const subject = getSubject(state.activeSubject);
    if (!subject.levels) {
      els.mathLevels.classList.add("hidden");
      els.mathLevels.innerHTML = "";
      return;
    }
    els.mathLevels.classList.remove("hidden");
    els.mathLevels.innerHTML = subject.levels.map(level => `<button type="button" class="math-level ${level === state.activeMathLevel ? "active" : ""}" data-level="${level}">${level}</button>`).join("");
  }

  function renderActions() {
    const subject = getSubject(state.activeSubject);
    els.actions.innerHTML = subject.tools.map(tool => `<button type="button" class="action-button" style="background:${subject.color}" data-action="${tool}">${tool}</button>`).join("");
  }

  function renderWeakBoard() {
    const weak = buildWeakTopics(state.savedTopics);
    if (!weak.length) {
      els.weakGrid.innerHTML = `<div class="empty-note">No weak spots yet. Save a topic as “Tiny panic” and Kiwi will pin it here for review.</div>`;
      return;
    }
    const colors = ["#FFF0B8", "#FFDCE8", "#DDF6E7", "#D5E9FF", "#E5D4F5"];
    els.weakGrid.innerHTML = weak.map((item, index) => {
      const subject = getSubject(item.subjectKey);
      return `<article class="sticky-note" style="background:${colors[index % colors.length]}; --tilt:${index % 2 ? 1.1 : -1.1}deg">
        <strong>${subject.icon} ${item.topic}</strong>
        <p>${subject.label}<br/>Marked tiny panic. Review me before I develop lore.</p>
      </article>`;
    }).join("");
  }

  function renderActiveSubject() {
    const subject = getSubject(state.activeSubject);
    els.title.textContent = subject.label;
    els.kicker.textContent = state.activeSubject === "math" ? `Current Subject · ${state.activeMathLevel}` : "Current Subject";
    els.accessory.textContent = subject.accessory;
    els.bubble.textContent = subject.voice;
    renderSubjects();
    renderMathLevels();
    renderActions();
    renderWeakBoard();
  }

  els.subjectGrid.addEventListener("click", event => {
    const card = event.target.closest("[data-subject]");
    if (!card) return;
    state.activeSubject = card.dataset.subject;
    saveState(state);
    renderActiveSubject();
  });

  els.mathLevels.addEventListener("click", event => {
    const button = event.target.closest("[data-level]");
    if (!button) return;
    state.activeMathLevel = button.dataset.level;
    saveState(state);
    renderActiveSubject();
  });

  els.actions.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const response = buildStudyResponse({
      subjectKey: state.activeSubject,
      action: button.dataset.action,
      topic: els.topic.value,
      notes: els.notes.value,
      confidence: getConfidence(),
      state
    });
    els.output.textContent = response;
    els.bubble.textContent = `${button.dataset.action} mode. Kiwi is academically suspicious.`;
  });

  els.saveTopic.addEventListener("click", () => {
    state = upsertTopic(state, { subjectKey: state.activeSubject, topic: els.topic.value, confidence: getConfidence() });
    saveState(state);
    renderWeakBoard();
    els.bubble.textContent = "Topic saved. Paw stamp awarded.";
  });

  els.reviewWeak.addEventListener("click", () => {
    const weak = buildWeakTopics(state.savedTopics)[0];
    if (!weak) {
      els.bubble.textContent = "No weak spots yet. Suspiciously powerful of you.";
      return;
    }
    state.activeSubject = weak.subjectKey;
    els.topic.value = weak.topic;
    saveState(state);
    renderActiveSubject();
    els.output.textContent = buildStudyResponse({ subjectKey: weak.subjectKey, action: "Explain", topic: weak.topic, notes: "", confidence: "low", state });
  });

  els.resetDemo.addEventListener("click", () => {
    state = cloneState(DEFAULT_STATE);
    saveState(state);
    els.topic.value = "";
    els.notes.value = "";
    renderActiveSubject();
  });

  els.kiwiButton.addEventListener("click", () => {
    const lines = [
      "Hydration check. Kiwi suspects you are 63% coffee.",
      "Tiny break soon? Your neurons deserve snacks.",
      "Pick one topic. One. Kiwi does not endorse academic buffet panic.",
      "You are doing better than your browser tabs suggest.",
      "Welcome to Study Mode. I have paws and a plan."
    ];
    els.bubble.textContent = lines[Math.floor(Math.random() * lines.length)];
  });

  renderActiveSubject();
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", setupApp);
}

if (typeof module !== "undefined") {
  module.exports = { SUBJECTS, DEFAULT_STATE, buildStudyResponse, buildWeakTopics, upsertTopic, normalizeTopic, loadState };
}
