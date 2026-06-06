const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  SUBJECTS,
  DEFAULT_STATE,
  buildStudyResponse,
  buildWeakTopics,
  upsertTopic,
  normalizeTopic,
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

function testMathFallbackTopic() {
  const state = { ...DEFAULT_STATE, activeMathLevel: "Calculus 3" };
  assert.equal(normalizeTopic("", "math", state), "Calculus 3");
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
  assert.match(app, /Open study mode/);
  assert.match(app, /scrollIntoView/);
  assert.match(app, /Study mode is open/);
}

[testSubjectLibrary, testStudyResponse, testMathFallbackTopic, testWeakTopicBoard, testStorageFallback, testStudyModeEntryScaffold].forEach(fn => fn());
console.log("All Kiwi Study Buddy tests passed.");
