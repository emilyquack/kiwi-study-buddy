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
  assert(SUBJECTS.chemistry.topics.includes("kinetics"), "General Chemistry should include kinetics as a built-in subtopic");
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
  assert.match(response, /Conceptual questions/i);
  assert.match(response, /Free response questions/i);
  assert.match(response, /2 H2 \+ O2 → 2 H2O/);
  assert.match(response, /How many grams of H2O/i);
  assert.match(response, /Answer key/i);
  assert.doesNotMatch(response, /Identify what is given/);
}

function testPracticeProblemIncludesConceptualAndFreeResponseForEveryBuiltInTopic() {
  Object.entries(SUBJECTS).forEach(([subjectKey, subject]) => {
    if (subjectKey === "math") {
      Object.entries(subject.topicsByLevel).forEach(([level, topics]) => {
        topics.forEach(topic => {
          const response = buildPracticeProblem({
            subjectKey,
            topic,
            state: { ...DEFAULT_STATE, activeSubject: "math", activeMathLevel: level, activeTopic: topic }
          });
          assert.match(response, /Conceptual questions/i, `${level} ${topic} needs conceptual practice`);
          assert.match(response, /Free response questions/i, `${level} ${topic} needs free-response practice`);
          assert.match(response, /Answer key/i, `${level} ${topic} needs an answer key`);
        });
      });
      return;
    }
    subject.topics.forEach(topic => {
      const response = buildPracticeProblem({
        subjectKey,
        topic,
        state: { ...DEFAULT_STATE, activeSubject: subjectKey, activeTopic: topic }
      });
      assert.match(response, /Conceptual questions/i, `${subject.label} ${topic} needs conceptual practice`);
      assert.match(response, /Free response questions/i, `${subject.label} ${topic} needs free-response practice`);
      assert.match(response, /Answer key/i, `${subject.label} ${topic} needs an answer key`);
    });
  });
}

function testStemFreeResponseIsMathBasedForEveryBuiltInTopic() {
  const stemKeys = new Set(["chemistry", "physics", "math"]);
  Object.entries(SUBJECTS).forEach(([subjectKey, subject]) => {
    if (!stemKeys.has(subjectKey)) return;
    const items = subjectKey === "math"
      ? Object.entries(subject.topicsByLevel).flatMap(([level, topics]) => topics.map(topic => ({ topic, label: `${level} ${topic}`, state: { ...DEFAULT_STATE, activeSubject: "math", activeMathLevel: level, activeTopic: topic } })))
      : subject.topics.map(topic => ({ topic, label: `${subject.label} ${topic}`, state: { ...DEFAULT_STATE, activeSubject: subjectKey, activeTopic: topic } }));

    items.forEach(({ topic, label, state }) => {
      const response = buildPracticeProblem({ subjectKey, topic, state });
      assert.match(response, /Math-based free response questions/i, `${label} needs math-based free response questions`);
      assert.match(response, /Show your work/i, `${label} should ask for shown calculations`);
      assert.match(response, /\d/, `${label} should include concrete numbers`);
      assert.match(response, /[=+−\-×÷/^]|√|π|mol|M|N|J|m\/s|Ω|%/, `${label} should include mathematical symbols, units, or formulas`);
      assert.doesNotMatch(response, /full-sentence response:|write a longer explanation/i, `${label} should not use generic written-response prompts for STEM`);
    });
  });
}

function testEveryBuiltInTopicHasActualLessonLibraryEntry() {
  Object.entries(SUBJECTS).forEach(([subjectKey, subject]) => {
    if (subjectKey === "math") {
      Object.entries(subject.topicsByLevel).forEach(([level, topics]) => {
        topics.forEach(topic => {
          const response = buildStudyResponse({
            subjectKey,
            action: "Explain",
            topic,
            notes: "",
            confidence: "low",
            state: { ...DEFAULT_STATE, activeSubject: "math", activeMathLevel: level, activeTopic: topic }
          });
          assert.match(response, /actual Kiwi explanation/i, `${level} ${topic} needs a real lesson entry`);
          assert.doesNotMatch(response, /not in Kiwi's built-in lesson library yet/i, `${level} ${topic} should not fall back`);
        });
      });
      return;
    }
    subject.topics.forEach(topic => {
      const response = buildStudyResponse({
        subjectKey,
        action: "Explain",
        topic,
        notes: "",
        confidence: "low",
        state: { ...DEFAULT_STATE, activeSubject: subjectKey, activeTopic: topic }
      });
      assert.match(response, /actual Kiwi explanation/i, `${subject.label} ${topic} needs a real lesson entry`);
      assert.doesNotMatch(response, /not in Kiwi's built-in lesson library yet/i, `${subject.label} ${topic} should not fall back`);
    });
  });
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

function testUnknownCustomTopicUsesNotesWithoutInventingFacts() {
  const response = buildStudyResponse({
    subjectKey: "chemistry",
    action: "Explain",
    topic: "banana orbital sparkles",
    notes: "orbital energy changes when electrons absorb light",
    confidence: "low",
    state: DEFAULT_STATE
  });
  assert.match(response, /Custom Kiwi lesson/i);
  assert.match(response, /banana orbital sparkles/i);
  assert.match(response, /Working definition from your notes/i);
  assert.match(response, /What Kiwi can safely say/i);
  assert.match(response, /orbital energy changes when electrons absorb light/i);
  assert.match(response, /Source check/i);
  assert.doesNotMatch(response, /treat banana orbital sparkles as/i);
  assert.doesNotMatch(response, /a chemistry idea involving particles, energy, bonding, reactions, structure, or measurable evidence/i);
  assert.doesNotMatch(response, /not in Kiwi's built-in lesson library yet/i);
}

function testUnknownCustomTopicWithoutNotesDoesNotInventTeaching() {
  const response = buildStudyResponse({
    subjectKey: "chemistry",
    action: "Explain",
    topic: "banana orbital sparkles",
    notes: "",
    confidence: "low",
    state: DEFAULT_STATE
  });
  assert.match(response, /Custom topic needs a source-backed anchor/i);
  assert.match(response, /banana orbital sparkles/i);
  assert.match(response, /I do not have a verified built-in lesson/i);
  assert.match(response, /Paste your class definition, textbook excerpt, or teacher example/i);
  assert.match(response, /Source check/i);
  assert.doesNotMatch(response, /Working definition:/i);
  assert.doesNotMatch(response, /treat banana orbital sparkles as/i);
  assert.doesNotMatch(response, /a chemistry idea involving particles, energy, bonding, reactions, structure, or measurable evidence/i);
}

function testCustomStemTopicGetsMathBasedPractice() {
  const response = buildStudyResponse({
    subjectKey: "physics",
    action: "Practice Problem",
    topic: "rocket thrust",
    notes: "force equals mass times acceleration",
    confidence: "low",
    state: { ...DEFAULT_STATE, activeSubject: "physics", activeTopic: "rocket thrust" }
  });
  assert.match(response, /rocket thrust/i);
  assert.match(response, /Conceptual questions/i);
  assert.match(response, /Math-based free response questions/i);
  assert.match(response, /Show your work/i);
  assert.match(response, /force equals mass times acceleration/i);
  assert.doesNotMatch(response, /not in Kiwi's built-in lesson library yet/i);
}

function testSignificantFiguresCustomPromptGetsCorrectChemistryTeaching() {
  const response = buildStudyResponse({
    subjectKey: "chemistry",
    action: "Explain",
    topic: "significant figures",
    notes: "",
    confidence: "low",
    state: DEFAULT_STATE
  });
  assert.match(response, /Significant figures/i);
  assert.match(response, /measured digits/i);
  assert.match(response, /leading zeros are not significant/i);
  assert.match(response, /addition and subtraction/i);
  assert.match(response, /decimal places/i);
  assert.match(response, /multiplication and division/i);
  assert.match(response, /fewest significant figures/i);
  assert.doesNotMatch(response, /particles, energy, bonding, reactions, structure/i);
}

function testSignificantFiguresCustomPromptGetsCorrectPractice() {
  const response = buildStudyResponse({
    subjectKey: "chemistry",
    action: "Practice Problem",
    topic: "sig figs",
    notes: "",
    confidence: "low",
    state: DEFAULT_STATE
  });
  assert.match(response, /Kiwi-generated practice: Significant figures/i);
  assert.match(response, /Conceptual questions/i);
  assert.match(response, /Math-based free response questions/i);
  assert.match(response, /0\.00450 has 3 significant figures/i);
  assert.match(response, /12\.40 \+ 0\.3 = 12\.7/i);
  assert.match(response, /4\.20 × 3\.1 = 13/i);
  assert.match(response, /Source check/i);
  assert.match(response, /OpenStax Chemistry 2e/i);
  assert.match(response, /Answer key/i);
  assert.doesNotMatch(response, /the rule, formula, or quantity your class uses/i);
}

function testMisspelledSignificantFiguresStillGetsCorrectChemistryTeaching() {
  const response = buildStudyResponse({
    subjectKey: "chemistry",
    action: "Explain",
    topic: "significiant figures",
    notes: "",
    confidence: "low",
    state: DEFAULT_STATE
  });
  assert.match(response, /Significant figures: actual Kiwi explanation/i);
  assert.match(response, /measured digits/i);
  assert.match(response, /fewest significant figures/i);
  assert.match(response, /OpenStax Chemistry 2e/i);
  assert.match(response, /Khan Academy/i);
  assert.doesNotMatch(response, /Custom Kiwi lesson: significiant figures/i);
  assert.doesNotMatch(response, /particles, energy, bonding, reactions, structure/i);

  const practice = buildStudyResponse({
    subjectKey: "chemistry",
    action: "Practice Problem",
    topic: "significiant figures",
    notes: "",
    confidence: "low",
    state: DEFAULT_STATE
  });
  assert.match(practice, /Kiwi-generated practice: Significant figures/i);
  assert.match(practice, /0\.00450 has 3 significant figures/i);
  assert.match(practice, /12\.40 \+ 0\.3 = 12\.7/i);
  assert.match(practice, /4\.20 × 3\.1 = 13/i);
  assert.match(practice, /OpenStax Chemistry 2e/i);
  assert.doesNotMatch(practice, /the rule, formula, or quantity your class uses for significiant figures/i);
}

function testFindSourcesForKnownAndCustomTopics() {
  const known = buildStudyResponse({
    subjectKey: "chemistry",
    action: "Find Sources",
    topic: "sig figs",
    notes: "",
    confidence: "low",
    state: DEFAULT_STATE
  });
  assert.match(known, /Source starter pack: Significant figures/i);
  assert.match(known, /OpenStax Chemistry 2e/i);
  assert.match(known, /Measurement Uncertainty, Accuracy, and Precision/i);
  assert.match(known, /Khan Academy/i);
  assert.match(known, /https:\/\/openstax\.org\/books\/chemistry-2e\/pages\/1-5-measurement-uncertainty-accuracy-and-precision/i);

  const custom = buildStudyResponse({
    subjectKey: "chemistry",
    action: "Find Sources",
    topic: "banana orbital sparkles",
    notes: "",
    confidence: "low",
    state: DEFAULT_STATE
  });
  assert.match(custom, /Source starter pack: banana orbital sparkles/i);
  assert.match(custom, /OpenStax search/i);
  assert.match(custom, /Khan Academy search/i);
  assert.match(custom, /Google Scholar search/i);
  assert.match(custom, /banana%20orbital%20sparkles/i);
  assert.doesNotMatch(custom, /not in Kiwi's built-in lesson library yet/i);

  const customLesson = buildStudyResponse({
    subjectKey: "chemistry",
    action: "Explain",
    topic: "banana orbital sparkles",
    notes: "orbital energy changes when electrons absorb light",
    confidence: "low",
    state: DEFAULT_STATE
  });
  assert.match(customLesson, /Custom Kiwi lesson: banana orbital sparkles/i);
  assert.match(customLesson, /Working definition from your notes/i);
  assert.match(customLesson, /Source check/i);
  assert.match(customLesson, /OpenStax search/i);
  assert.match(customLesson, /Google Scholar search/i);

  const customPractice = buildStudyResponse({
    subjectKey: "chemistry",
    action: "Practice Problem",
    topic: "banana orbital sparkles",
    notes: "orbital energy changes when electrons absorb light",
    confidence: "low",
    state: DEFAULT_STATE
  });
  assert.match(customPractice, /Kiwi-generated practice: banana orbital sparkles/i);
  assert.match(customPractice, /Math-based free response questions/i);
  assert.match(customPractice, /orbital energy changes when electrons absorb light/i);
  assert.match(customPractice, /Source check/i);
  assert.match(customPractice, /OpenStax search/i);
}

function testCustomPracticeWithoutNotesDoesNotInventAnswerKey() {
  const response = buildStudyResponse({
    subjectKey: "chemistry",
    action: "Practice Problem",
    topic: "banana orbital sparkles",
    notes: "",
    confidence: "low",
    state: DEFAULT_STATE
  });
  assert.match(response, /Custom practice needs a source-backed anchor/i);
  assert.match(response, /banana orbital sparkles/i);
  assert.match(response, /Paste your class definition, formula, data table, or example/i);
  assert.match(response, /Source check/i);
  assert.doesNotMatch(response, /Answer key/i);
  assert.doesNotMatch(response, /numbers 12 and 3/i);
  assert.doesNotMatch(response, /the rule, formula, or quantity your class uses/i);
}

function testCustomPromptUsesNotesAcrossStudyTools() {
  const state = { ...DEFAULT_STATE, activeSubject: "biology", activeTopic: "banana receptor dance" };
  ["Flashcards", "Study Guide", "Quiz Me", "Summarize Notes"].forEach(action => {
    const response = buildStudyResponse({
      subjectKey: "biology",
      action,
      topic: "banana receptor dance",
      notes: "receptor changes shape after ligand binding",
      confidence: "low",
      state
    });
    assert.match(response, /banana receptor dance/i, `${action} should keep the custom topic`);
    assert.match(response, /receptor changes shape after ligand binding/i, `${action} should use the custom prompt/notes`);
    assert.doesNotMatch(response, /core definition or rule\?|tiny example from your notes|Big idea: write it in one sentence/i, `${action} should not use a generic prompt-only scaffold`);
  });
}

function testChemistryKineticsIsBuiltInSubtopic() {
  const state = { ...DEFAULT_STATE, activeSubject: "chemistry", activeTopic: "kinetics" };
  const lesson = buildStudyResponse({
    subjectKey: "chemistry",
    action: "Explain",
    topic: "kinetics",
    notes: "",
    confidence: "low",
    state
  });
  assert.match(lesson, /Kinetics: actual Kiwi explanation/i);
  assert.match(lesson, /reaction rates/i);
  assert.match(lesson, /rate law/i);
  assert.match(lesson, /activation energy/i);
  assert.match(lesson, /OpenStax Chemistry 2e/i);
  assert.doesNotMatch(lesson, /Custom Kiwi lesson/i);

  const practice = buildStudyResponse({
    subjectKey: "chemistry",
    action: "Practice Problem",
    topic: "reaction rates",
    notes: "",
    confidence: "low",
    state
  });
  assert.match(practice, /Kiwi-generated practice: Kinetics/i);
  assert.match(practice, /Conceptual questions/i);
  assert.match(practice, /Math-based free response questions/i);
  assert.match(practice, /rate = k\[A\]\^2/i);
  assert.match(practice, /Show your work/i);
  assert.match(practice, /Answer key/i);
  assert.match(practice, /Source check/i);
  assert.match(practice, /OpenStax Chemistry 2e/i);
  assert.doesNotMatch(practice, /the rule, formula, or quantity your class uses/i);

  const sources = buildStudyResponse({
    subjectKey: "chemistry",
    action: "Find Sources",
    topic: "chemical kinetics",
    notes: "",
    confidence: "low",
    state
  });
  assert.match(sources, /Source starter pack: Kinetics/i);
  assert.match(sources, /OpenStax Chemistry 2e/i);
  assert.match(sources, /Khan Academy/i);
}

function getBuiltInTopicCases() {
  return Object.entries(SUBJECTS).flatMap(([subjectKey, subject]) => {
    if (subjectKey === "math") {
      return Object.entries(subject.topicsByLevel).flatMap(([level, topics]) =>
        topics.map(topic => ({ subjectKey, topic, label: `${level} ${topic}`, state: { ...DEFAULT_STATE, activeSubject: "math", activeMathLevel: level, activeTopic: topic } }))
      );
    }
    return subject.topics.map(topic => ({ subjectKey, topic, label: `${subject.label} ${topic}`, state: { ...DEFAULT_STATE, activeSubject: subjectKey, activeTopic: topic } }));
  });
}

function testFlashcardsAreGeneratedByKiwiForEveryBuiltInTopic() {
  getBuiltInTopicCases().forEach(({ subjectKey, topic, label, state }) => {
    const response = buildStudyResponse({
      subjectKey,
      action: "Flashcards",
      topic,
      notes: "",
      confidence: "low",
      state
    });
    assert.match(response, /Kiwi-generated flashcards/i, `${label} needs Kiwi-generated flashcards`);
    assert.match(response, /Card 1/i, `${label} needs numbered cards`);
    assert.match(response, /Front:/i, `${label} needs flashcard fronts`);
    assert.match(response, /Back:/i, `${label} needs flashcard backs`);
    assert.match(response, new RegExp(topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), `${label} should mention the topic`);
    assert.doesNotMatch(response, /Term → definition/i, `${label} should not use the old flashcard placeholder`);
    assert.doesNotMatch(response, /make 4 cards now, not 40 cards never/i, `${label} should not ask the learner to generate the deck alone`);
  });
}

function testStudyGuidesAreGeneratedByKiwiForEveryBuiltInTopic() {
  getBuiltInTopicCases().forEach(({ subjectKey, topic, label, state }) => {
    const response = buildStudyResponse({
      subjectKey,
      action: "Study Guide",
      topic,
      notes: "",
      confidence: "low",
      state
    });
    assert.match(response, /Kiwi-generated study guide/i, `${label} needs a Kiwi-generated study guide`);
    assert.match(response, /Big idea/i, `${label} needs a big idea section`);
    assert.match(response, /Must-know ideas/i, `${label} needs must-know ideas`);
    assert.match(response, /Worked example/i, `${label} needs a worked example`);
    assert.match(response, /Common mistake/i, `${label} needs misconception help`);
    assert.match(response, /Quick check/i, `${label} needs a quick check`);
    assert.match(response, new RegExp(topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), `${label} should mention the topic`);
    assert.doesNotMatch(response, /Must-know ideas\n• Key vocabulary\/formulas\n• One worked example/i, `${label} should not use the old study-guide placeholder`);
    assert.doesNotMatch(response, /Start here, then mark your confidence again/i, `${label} should not be a blank scaffold`);
  });
}

function testFlashcardsAndStudyGuidesWorkForCustomTopics() {
  const state = { ...DEFAULT_STATE, activeSubject: "chemistry", activeTopic: "banana orbital sparkles" };
  const flashcards = buildStudyResponse({
    subjectKey: "chemistry",
    action: "Flashcards",
    topic: "banana orbital sparkles",
    notes: "orbital energy changes when electrons absorb light",
    confidence: "low",
    state
  });
  assert.match(flashcards, /Kiwi-generated flashcards: banana orbital sparkles/i);
  assert.match(flashcards, /orbital energy changes when electrons absorb light/i);
  assert.match(flashcards, /Card 1/i);
  assert.match(flashcards, /Front:/i);
  assert.match(flashcards, /Back:/i);
  assert.doesNotMatch(flashcards, /Term → definition/i);

  const studyGuide = buildStudyResponse({
    subjectKey: "chemistry",
    action: "Study Guide",
    topic: "banana orbital sparkles",
    notes: "orbital energy changes when electrons absorb light",
    confidence: "low",
    state
  });
  assert.match(studyGuide, /Kiwi-generated study guide: banana orbital sparkles/i);
  assert.match(studyGuide, /Custom topic anchor/i);
  assert.match(studyGuide, /orbital energy changes when electrons absorb light/i);
  assert.match(studyGuide, /Big idea/i);
  assert.match(studyGuide, /Quick check/i);
  assert.doesNotMatch(studyGuide, /Mini study guide/i);
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
  assert.match(app, /Find Sources/);
  assert.match(app, /target="_blank"/);
  assert.match(app, /rel="noopener noreferrer"/);
}

[testSubjectLibrary, testStudyResponse, testExplainGivesActualTopicTeaching, testBlankTopicUsesBuiltInLesson, testPracticeProblemIsGeneratedByKiwi, testPracticeProblemIncludesConceptualAndFreeResponseForEveryBuiltInTopic, testStemFreeResponseIsMathBasedForEveryBuiltInTopic, testEveryBuiltInTopicHasActualLessonLibraryEntry, testCustomCommonTopicGetsRealTeaching, testUnknownCustomTopicUsesNotesWithoutInventingFacts, testUnknownCustomTopicWithoutNotesDoesNotInventTeaching, testCustomStemTopicGetsMathBasedPractice, testSignificantFiguresCustomPromptGetsCorrectChemistryTeaching, testSignificantFiguresCustomPromptGetsCorrectPractice, testMisspelledSignificantFiguresStillGetsCorrectChemistryTeaching, testFindSourcesForKnownAndCustomTopics, testCustomPracticeWithoutNotesDoesNotInventAnswerKey, testCustomPromptUsesNotesAcrossStudyTools, testChemistryKineticsIsBuiltInSubtopic, testFlashcardsAreGeneratedByKiwiForEveryBuiltInTopic, testStudyGuidesAreGeneratedByKiwiForEveryBuiltInTopic, testFlashcardsAndStudyGuidesWorkForCustomTopics, testMathTopicsAreLevelSpecific, testMathFallbackTopic, testWeakTopicBoard, testStorageFallback, testStudyModeEntryScaffold].forEach(fn => fn());
console.log("All Kiwi Study Buddy tests passed.");
