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
  loadState,
  buildSourceTaughtCustomResponse,
  buildMoodStudyResponse,
  buildBossBattleQuiz,
  createBossBattleGame,
  answerBossBattleQuestion,
  buildBossBattleGameHtml,
  buildResearchDetectiveMode,
  buildPanicRescue,
  awardAchievementBadges,
  FUN_FEATURES
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

function testUnknownCustomTopicWithoutNotesUsesSourceGuidedTeaching() {
  const response = buildStudyResponse({
    subjectKey: "chemistry",
    action: "Explain",
    topic: "banana orbital sparkles",
    notes: "",
    confidence: "low",
    state: DEFAULT_STATE
  });
  assert.match(response, /Source-guided custom lesson/i);
  assert.match(response, /banana orbital sparkles/i);
  assert.match(response, /Kiwi can teach this custom topic by checking multiple sources/i);
  assert.match(response, /Source check/i);
  assert.match(response, /OpenStax search/i);
  assert.match(response, /Khan Academy search/i);
  assert.match(response, /Google Scholar search/i);
  assert.match(response, /Wikipedia search/i);
  assert.doesNotMatch(response, /Custom topic needs a source-backed anchor/i);
  assert.doesNotMatch(response, /I do not have a verified built-in lesson/i);
  assert.doesNotMatch(response, /Paste your class definition/i);
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

function testCustomPracticeWithoutNotesUsesSourceGuidedQuestions() {
  const response = buildStudyResponse({
    subjectKey: "chemistry",
    action: "Practice Problem",
    topic: "banana orbital sparkles",
    notes: "",
    confidence: "low",
    state: DEFAULT_STATE
  });
  assert.match(response, /Source-guided custom practice/i);
  assert.match(response, /banana orbital sparkles/i);
  assert.match(response, /Conceptual questions/i);
  assert.match(response, /Source-check answer key/i);
  assert.match(response, /OpenStax search/i);
  assert.match(response, /Khan Academy search/i);
  assert.doesNotMatch(response, /Custom practice needs a source-backed anchor/i);
  assert.doesNotMatch(response, /Paste your class definition, formula, data table, or example/i);
  assert.doesNotMatch(response, /numbers 12 and 3/i);
  assert.doesNotMatch(response, /the rule, formula, or quantity your class uses/i);
}

function testSourceSummaryCanTeachCustomTopicWithoutNotes() {
  const response = buildSourceTaughtCustomResponse({
    subjectKey: "biology",
    action: "Explain",
    cleanTopic: "mitosis",
    source: {
      title: "Mitosis",
      url: "https://en.wikipedia.org/wiki/Mitosis",
      extract: "Mitosis is part of the cell cycle in which replicated chromosomes are separated into two new nuclei. Cell division by mitosis gives rise to genetically identical cells."
    },
    state: DEFAULT_STATE
  });
  assert.match(response, /Live source lesson: mitosis/i);
  assert.match(response, /Mitosis is part of the cell cycle/i);
  assert.match(response, /replicated chromosomes/i);
  assert.match(response, /Source used/i);
  assert.match(response, /https:\/\/en\.wikipedia\.org\/wiki\/Mitosis/i);
  assert.doesNotMatch(response, /Paste your class definition/i);
  assert.doesNotMatch(response, /needs a source-backed anchor/i);
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

function testFiveFunFeatureScaffold() {
  const projectRoot = path.resolve(__dirname, "..");
  const html = fs.readFileSync(path.join(projectRoot, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(projectRoot, "app.js"), "utf8");
  assert.deepEqual(FUN_FEATURES, ["moodModes", "bossBattle", "researchDetective", "achievementBadges", "panicButton"]);
  assert.match(html, /id="mood-mode"/);
  assert.match(html, /id="boss-battle"/);
  assert.match(html, /id="research-detective"/);
  assert.match(html, /id="panic-button"/);
  assert.match(html, /id="badge-shelf"/);
  assert.match(app, /Mood-Based Study Modes/);
  assert.match(app, /Boss Battle Quiz Mode/);
  assert.match(app, /Research Detective Mode/);
  assert.match(app, /Achievement Badges/);
  assert.match(app, /Panic Button/);
}

function testMoodModesModifyStudyOutput() {
  const base = buildStudyResponse({
    subjectKey: "chemistry",
    action: "Explain",
    topic: "stoichiometry",
    notes: "",
    confidence: "low",
    state: DEFAULT_STATE
  });
  const panic = buildMoodStudyResponse(base, "panic", "stoichiometry");
  const cram = buildMoodStudyResponse(base, "cram", "stoichiometry");
  assert.match(panic, /Mood mode: Tiny panic rescue/i);
  assert.match(panic, /Shrink the problem/i);
  assert.match(panic, /stoichiometry/i);
  assert.match(cram, /Mood mode: 10-minute cram/i);
  assert.match(cram, /read only the big idea/i);
  assert.notEqual(panic, base);
}

function testBossBattleQuizModeGeneratesGameQuiz() {
  const response = buildBossBattleQuiz({
    subjectKey: "chemistry",
    topic: "stoichiometry",
    notes: "",
    state: DEFAULT_STATE
  });
  assert.match(response, /Boss Battle Quiz Mode/i);
  assert.match(response, /Enemy:/i);
  assert.match(response, /HP:/i);
  assert.match(response, /Round 1/i);
  assert.match(response, /Stoichiometry/i);
  assert.match(response, /Victory loot/i);
  assert.match(response, /Kiwi hint/i);
}

function testResearchDetectiveModeUsesSourcesAndCrossChecks() {
  const response = buildResearchDetectiveMode({
    subjectKey: "biology",
    topic: "mitosis",
    notes: "",
    state: DEFAULT_STATE
  });
  assert.match(response, /Research Detective Mode/i);
  assert.match(response, /Searching the Library Forest/i);
  assert.match(response, /Wikipedia Nest/i);
  assert.match(response, /OpenStax Owl/i);
  assert.match(response, /Scholar Squirrel/i);
  assert.match(response, /Source check/i);
  assert.match(response, /mitosis/i);
}

function testPanicButtonCreatesTinyRescuePlan() {
  const response = buildPanicRescue({
    subjectKey: "physics",
    topic: "kinematics",
    notes: "",
    state: DEFAULT_STATE
  });
  assert.match(response, /Panic Button/i);
  assert.match(response, /We are shrinking the problem/i);
  assert.match(response, /One-sentence version/i);
  assert.match(response, /Three tiny steps/i);
  assert.match(response, /kinematics/i);
  assert.match(response, /tiny check/i);
}

function testAchievementBadgesAwardUniqueProgress() {
  const state = {
    ...DEFAULT_STATE,
    savedTopics: [
      { subjectKey: "biology", topic: "cell membranes", confidence: "low", updatedAt: 1 },
      { subjectKey: "chemistry", topic: "stoichiometry", confidence: "okay", updatedAt: 2 }
    ],
    badges: ["first-lesson-sprout"]
  };
  const next = awardAchievementBadges(state, { action: "Boss Battle", topic: "stoichiometry", usedSources: true, mood: "panic" });
  assert(next.badges.includes("first-lesson-sprout"));
  assert(next.badges.includes("practice-goblin-slayer"));
  assert(next.badges.includes("source-detective"));
  assert(next.badges.includes("boss-battle-bean"));
  assert(next.badges.includes("panic-button-hero"));
  assert.equal(new Set(next.badges).size, next.badges.length);
}

function testInteractiveBossBattleCreatesPlayableGameState() {
  const game = createBossBattleGame({
    subjectKey: "chemistry",
    topic: "kinetics",
    notes: "",
    state: DEFAULT_STATE
  });
  assert.equal(game.mode, "interactive-boss-battle");
  assert.equal(game.status, "active");
  assert.equal(game.enemyHp, 5);
  assert.equal(game.kiwiHp, 3);
  assert.equal(game.roundIndex, 0);
  assert.equal(game.score, 0);
  assert.equal(game.questions.length, 5);
  assert.match(game.enemy, /Kinetics/i);
  game.questions.forEach(question => {
    assert.match(question.prompt, /\?/);
    assert.equal(question.choices.length, 3);
    assert.equal(question.choices.filter(choice => choice.correct).length, 1);
    assert(question.hint.length > 20);
  });
}

function testBossBattleQuestionsAreDiverseAndTopicRelevant() {
  const game = createBossBattleGame({ subjectKey: "chemistry", topic: "kinetics", state: DEFAULT_STATE, battleNumber: 3 });
  const kinds = game.questions.map(question => question.kind);
  assert.equal(new Set(kinds).size, 5, "Boss battle should mix five different question kinds per battle");
  assert(kinds.some(kind => /definition|core-idea|compare/.test(kind)), "Battle should include a concept/definition round");
  assert(kinds.some(kind => /scenario|application|data/.test(kind)), "Battle should include an application/data round");
  assert(kinds.some(kind => /misconception|test-cue|source/.test(kind)), "Battle should include misconception/test cue/source checking");
  const prompts = game.questions.map(question => question.prompt).join("\n");
  assert.match(prompts, /scenario|student|lab|data|changes|evidence|calculation|formula/i);
  assert.match(prompts, /trap|mistake|wrong|misleading|source|clue/i);

  const oldGenericDistractors = /memorization label|only matters after the test|longest answer choice|most dramatic|Ignore vocabulary|Skip the setup/i;
  const topicWords = /rate|reaction|concentration|catalyst|activation|mechanism|coefficient|exponent|temperature|half-life|data|equilibrium|law/i;
  const wrongChoices = game.questions.flatMap(question => question.choices.filter(choice => !choice.correct).map(choice => choice.text));
  assert.equal(wrongChoices.length, 10);
  wrongChoices.forEach(choice => {
    assert.doesNotMatch(choice, oldGenericDistractors);
    assert.match(choice, topicWords, `Distractor should be a tricky kinetics-related answer: ${choice}`);
  });
}

function testBossBattleCreatesFreshQuestionSetEachStart() {
  const first = createBossBattleGame({ subjectKey: "chemistry", topic: "kinetics", state: DEFAULT_STATE, battleNumber: 1 });
  const second = createBossBattleGame({ subjectKey: "chemistry", topic: "kinetics", state: DEFAULT_STATE, battleNumber: 2 });
  const firstSignature = first.questions.map(question => `${question.kind}:${question.prompt}:${question.choices.map(choice => choice.text).join("|")}`).join("\n");
  const secondSignature = second.questions.map(question => `${question.kind}:${question.prompt}:${question.choices.map(choice => choice.text).join("|")}`).join("\n");
  assert.notEqual(secondSignature, firstSignature, "Starting boss battle twice should not reuse the same five prompts/answers");
  assert.notEqual(second.battleId, first.battleId, "Each boss battle should have a fresh battle id");
}

function testBossBattleDiversifiesEverySubject() {
  Object.keys(SUBJECTS).forEach((subjectKey, index) => {
    const state = subjectKey === "math" ? { ...DEFAULT_STATE, activeMathLevel: "Algebra 1" } : DEFAULT_STATE;
    const topic = getTopicsForSubject(subjectKey, state)[0];
    const game = createBossBattleGame({ subjectKey, topic, state, battleNumber: index + 5 });
    assert.equal(game.questions.length, 5, `${subjectKey} should get five boss rounds`);
    assert.equal(new Set(game.questions.map(question => question.kind)).size, 5, `${subjectKey} rounds should use different question kinds`);
    assert.equal(new Set(game.questions.map(question => question.prompt)).size, 5, `${subjectKey} prompts should not repeat`);
    game.questions.forEach(question => {
      assert.equal(question.choices.length, 3, `${subjectKey} question should have three choices`);
      assert.equal(question.choices.filter(choice => choice.correct).length, 1, `${subjectKey} question should have one correct answer`);
      assert.equal(new Set(question.choices.map(choice => choice.text)).size, 3, `${subjectKey} answer choices should be unique`);
      assert(question.hint.length > 20, `${subjectKey} hint should be useful`);
    });
  });
}

function testInteractiveBossBattleAnswersUpdateHpAndRounds() {
  const game = createBossBattleGame({ subjectKey: "biology", topic: "cell membranes", state: DEFAULT_STATE });
  const correctIndex = game.questions[0].choices.findIndex(choice => choice.correct);
  const first = answerBossBattleQuestion(game, correctIndex);
  assert.equal(first.game.enemyHp, 4);
  assert.equal(first.game.kiwiHp, 3);
  assert.equal(first.game.roundIndex, 1);
  assert.equal(first.game.score, 1);
  assert.match(first.feedback, /Correct/i);

  const wrongIndex = first.game.questions[1].choices.findIndex(choice => !choice.correct);
  const second = answerBossBattleQuestion(first.game, wrongIndex);
  assert.equal(second.game.enemyHp, 4);
  assert.equal(second.game.kiwiHp, 2);
  assert.equal(second.game.roundIndex, 2);
  assert.match(second.feedback, /Kiwi hint/i);
}

function testInteractiveBossBattleHtmlHasClickableChoices() {
  const game = createBossBattleGame({ subjectKey: "physics", topic: "forces", state: DEFAULT_STATE });
  const html = buildBossBattleGameHtml(game, "Choose your attack!");
  assert.match(html, /id="boss-battle-arena"/);
  assert.match(html, /data-boss-choice/);
  assert.match(html, /data-answer-index="0"/);
  assert.match(html, /Enemy HP/);
  assert.match(html, /Kiwi HP/);
  assert.match(html, /Choose your attack!/);
  assert.match(html, /aria-live="polite"/);
}

[testSubjectLibrary, testStudyResponse, testExplainGivesActualTopicTeaching, testBlankTopicUsesBuiltInLesson, testPracticeProblemIsGeneratedByKiwi, testPracticeProblemIncludesConceptualAndFreeResponseForEveryBuiltInTopic, testStemFreeResponseIsMathBasedForEveryBuiltInTopic, testEveryBuiltInTopicHasActualLessonLibraryEntry, testCustomCommonTopicGetsRealTeaching, testUnknownCustomTopicUsesNotesWithoutInventingFacts, testUnknownCustomTopicWithoutNotesUsesSourceGuidedTeaching, testCustomStemTopicGetsMathBasedPractice, testSignificantFiguresCustomPromptGetsCorrectChemistryTeaching, testSignificantFiguresCustomPromptGetsCorrectPractice, testMisspelledSignificantFiguresStillGetsCorrectChemistryTeaching, testFindSourcesForKnownAndCustomTopics, testCustomPracticeWithoutNotesUsesSourceGuidedQuestions, testSourceSummaryCanTeachCustomTopicWithoutNotes, testCustomPromptUsesNotesAcrossStudyTools, testChemistryKineticsIsBuiltInSubtopic, testFlashcardsAreGeneratedByKiwiForEveryBuiltInTopic, testStudyGuidesAreGeneratedByKiwiForEveryBuiltInTopic, testFlashcardsAndStudyGuidesWorkForCustomTopics, testMathTopicsAreLevelSpecific, testMathFallbackTopic, testWeakTopicBoard, testStorageFallback, testStudyModeEntryScaffold, testFiveFunFeatureScaffold, testMoodModesModifyStudyOutput, testBossBattleQuizModeGeneratesGameQuiz, testInteractiveBossBattleCreatesPlayableGameState, testBossBattleQuestionsAreDiverseAndTopicRelevant, testBossBattleCreatesFreshQuestionSetEachStart, testBossBattleDiversifiesEverySubject, testInteractiveBossBattleAnswersUpdateHpAndRounds, testInteractiveBossBattleHtmlHasClickableChoices, testResearchDetectiveModeUsesSourcesAndCrossChecks, testPanicButtonCreatesTinyRescuePlan, testAchievementBadgesAwardUniqueProgress].forEach(fn => fn());
console.log("All Kiwi Study Buddy tests passed.");
