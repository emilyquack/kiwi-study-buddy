const assert = require("node:assert/strict");
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

[testSubjectLibrary, testStudyResponse, testMathFallbackTopic, testWeakTopicBoard, testStorageFallback].forEach(fn => fn());
console.log("All Kiwi Study Buddy tests passed.");
