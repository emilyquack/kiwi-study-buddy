const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  SUBJECTS,
  DEFAULT_STATE,
  buildStudyResponse,
  buildPracticeProblem,
  buildWeakTopics,
  upsertTopic,
  normalizeTopic,
  getTopicsForSubject,
  loadState
} = require("../app.js");

function testSubjectLibrary() {
  const expected = ["biology", "chemistry", "physics", "math", "psychology", "writing", "history"];
  assert.deepEqual(Object.keys(SUBJECTS), expected);
  assert.deepEqual(SUBJECTS.math.levels, ["Algebra 1", "Geometry", "Algebra 2", "Precalculus", "Calculus 1", "Calculus 2", "Calculus 3"]);
}

function testStudyResponse() {
  const response = buildStudyResponse({
    subjectKey: "chemistry",
    action: "Unit Check",
    topic: "stoichiometry",
    notes: "grams to moles",
    confidence: "low",
    state: DEFAULT_STATE
  });
  assert.match(response, /Chemistry mode/);
  assert.match(response, /stoichiometry/);
  assert.match(response, /units/i);
}

function testExplainGivesActualTopicTeaching() {
  const response = buildStudyResponse({
    subjectKey: "chemistry",
    action: "Explain",
    topic: "stoichiometry",
    notes: "grams to moles",
    confidence: "low",
    state: DEFAULT_STATE
  });
  assert.match(response, /Stoichiometry is/i);
  assert.match(response, /balanced chemical equation/i);
  assert.match(response, /mole ratio/i);
  assert.match(response, /grams → moles → mole ratio → moles → grams/i);
  assert.doesNotMatch(response, /Start with the main idea in one sentence/);
}

function testBlankTopicUsesBuiltInLesson() {
  const response = buildStudyResponse({
    subjectKey: "biology",
    action: "Explain",
    topic: "",
    notes: "",
    confidence: "low",
    state: DEFAULT_STATE
  });
  assert.match(response, /Cell membranes/i);
  assert.match(response, /phospholipid bilayer/i);
  assert.doesNotMatch(response, /Add a topic/i);
}

function testPracticeProblemIsGeneratedByKiwi() {
  const response = buildPracticeProblem({
    subjectKey: "chemistry",
    topic: "stoichiometry",
    state: DEFAULT_STATE
  });
  assert.match(response, /Kiwi-generated practice/i);
  assert.match(response, /2 H2 \+ O2 → 2 H2O/);
  assert.match(response, /How many grams of H2O/i);
  assert.match(response, /Answer key/i);
  assert.doesNotMatch(response, /Identify what is given/);
}

function testCustomCommonTopicGetsRealTeaching() {
  const response = buildStudyResponse({
    subjectKey: "biology",
    action: "Explain",
    topic: "photosynthesis",
    notes: "",
    confidence: "low",
    state: DEFAULT_STATE
  });
  assert.match(response, /Photosynthesis is/i);
  assert.match(response, /light energy/i);
  assert.match(response, /glucose/i);
  assert.doesNotMatch(response, /topic you can understand by asking/i);
}

function testUnknownCustomTopicIsHonest() {
  const response = buildStudyResponse({
    subjectKey: "chemistry",
    action: "Explain",
    topic: "banana orbital sparkles",
    notes: "",
    confidence: "low",
    state: DEFAULT_STATE
  });
  assert.match(response, /not in Kiwi's built-in lesson library yet/i);
  assert.match(response, /banana orbital sparkles/i);
  assert.doesNotMatch(response, /actual Kiwi explanation/i);
}

function testMathTopicsAreLevelSpecific() {
  const algebraTopics = getTopicsForSubject("math", { ...DEFAULT_STATE, activeMathLevel: "Algebra 1", activeTopic: "linear equations" });
  assert.deepEqual(algebraTopics, ["linear equations", "systems of equations", "inequalities", "functions", "exponents"]);
  assert(!algebraTopics.includes("limits"));
  assert(!algebraTopics.includes("derivatives"));
  assert(!algebraTopics.includes("multiple integrals"));

  const calculusOneTopics = getTopicsForSubject("math", { ...DEFAULT_STATE, activeMathLevel: "Calculus 1", activeTopic: "limits" });
  assert(calculusOneTopics.includes("limits"));
  assert(calculusOneTopics.includes("derivatives"));
  assert(!calculusOneTopics.includes("multiple integrals"));

  const calculusThreeTopics = getTopicsForSubject("math", { ...DEFAULT_STATE, activeMathLevel: "Calculus 3", activeTopic: "partial derivatives" });
  assert(calculusThreeTopics.includes("partial derivatives"));
  assert(calculusThreeTopics.includes("multiple integrals"));
}

function testMathFallbackTopic() {
  const algebraState = { ...DEFAULT_STATE, activeSubject: "math", activeMathLevel: "Algebra 1", activeTopic: "linear equations" };
  assert.equal(normalizeTopic("", "math", algebraState), "linear equations");
  const calcState = { ...DEFAULT_STATE, activeSubject: "math", activeMathLevel: "Calculus 3", activeTopic: "partial derivatives" };
  assert.equal(normalizeTopic("", "math", calcState), "partial derivatives");
}

function testWeakTopicBoard() {
  let state = { ...DEFAULT_STATE, savedTopics: [] };
  state = upsertTopic(state, { subjectKey: "biology", topic: "cell membranes", confidence: "low" });
  state = upsertTopic(state, { subjectKey: "history", topic: "primary sources", confidence: "strong" });
  const weak = buildWeakTopics(state.savedTopics);
  assert.equal(weak.length, 1);
  assert.equal(weak[0].topic, "cell membranes");
}

function testStorageFallback() {
  const loaded = loadState(null);
  assert.equal(loaded.activeSubject, "biology");
}

function testStudyModeEntryScaffold() {
  const projectRoot = path.resolve(__dirname, "..");
  const html = fs.readFileSync(path.join(projectRoot, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(projectRoot, "app.js"), "utf8");
  assert.match(html, /id="study-panel"/);
  assert.match(html, /tabindex="-1"/);
  assert.match(html, /id="topic-library"/);
  assert.match(html, /id="teach-topic"/);
  assert.match(html, /id="practice-topic"/);
  assert.match(app, /Open study mode/);
  assert.match(app, /scrollIntoView/);
  assert.match(app, /Study mode is open/);
  assert.match(app, /data-topic/);
}

[testSubjectLibrary, testStudyResponse, testExplainGivesActualTopicTeaching, testBlankTopicUsesBuiltInLesson, testPracticeProblemIsGeneratedByKiwi, testCustomCommonTopicGetsRealTeaching, testUnknownCustomTopicIsHonest, testMathTopicsAreLevelSpecific, testMathFallbackTopic, testWeakTopicBoard, testStorageFallback, testStudyModeEntryScaffold].forEach(fn => fn());
console.log("All Kiwi Study Buddy tests passed.");
