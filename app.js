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
  activeTopic: "cell membranes",
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

const EXPLANATION_LIBRARY = {
  biology: [
    {
      aliases: ["cell membranes", "membrane", "plasma membrane", "phospholipid bilayer"],
      title: "Cell membranes",
      overview: "Cell membranes are flexible boundaries that control what enters and leaves a cell. The membrane is mostly a phospholipid bilayer: water-loving heads face outward, water-fearing tails hide inside, and proteins act like doors, pumps, ID tags, and signal receivers.",
      keyIdeas: ["Selective permeability means some substances cross easily while others need help.", "Small nonpolar molecules can diffuse through the bilayer, but ions and large polar molecules usually need transport proteins.", "Passive transport moves with the concentration gradient; active transport uses energy to move against it."],
      example: "If a cell is placed in salty water, water may leave the cell by osmosis because the outside has more dissolved particles.",
      mistake: "Do not say the membrane is a solid wall. It is fluid, moving, and protein-studded — more like a tiny security gate than a brick fence.",
      testCue: "Look for words like selectively permeable, diffusion, osmosis, channels, pumps, or concentration gradient."
    },
    {
      aliases: ["genetics", "genes", "inheritance", "punnett squares"],
      title: "Genetics",
      overview: "Genetics explains how traits are passed from parents to offspring through genes, which are DNA instructions for making functional products like proteins. Different versions of a gene are called alleles.",
      keyIdeas: ["Genotype is the allele combination; phenotype is the observable trait.", "Dominant alleles show with one copy, while recessive alleles usually need two copies.", "Punnett squares predict probabilities, not guarantees for each child."],
      example: "If T is dominant and t is recessive, a Tt × Tt cross gives TT, Tt, Tt, tt: a 3:1 phenotype ratio if the trait follows simple dominance.",
      mistake: "A 25% chance does not mean exactly one out of four children must show the trait. Each offspring is a new probability event.",
      testCue: "Watch for genotype, phenotype, dominant, recessive, homozygous, heterozygous, and ratio questions."
    },
    {
      aliases: ["evolution", "natural selection"],
      title: "Evolution",
      overview: "Evolution is change in inherited traits in a population over generations. Natural selection happens when individuals with helpful heritable traits survive or reproduce more, making those traits more common.",
      keyIdeas: ["Individuals do not evolve during their lifetime; populations evolve over generations.", "Variation must already exist before selection can act on it.", "Fitness means reproductive success in a specific environment, not physical strength."],
      example: "If darker beetles are harder for birds to see on dark bark, more dark beetles survive and the dark-color allele can become more common.",
      mistake: "Do not write that organisms evolve because they 'need to.' Selection acts on existing variation; it does not plan ahead.",
      testCue: "Look for variation, heritability, selection pressure, fitness, adaptation, and population change."
    },
    {
      aliases: ["enzymes", "enzyme", "activation energy"],
      title: "Enzymes",
      overview: "Enzymes are biological catalysts, usually proteins, that speed up chemical reactions by lowering activation energy. They help reactions happen faster without being consumed.",
      keyIdeas: ["The active site binds specific substrates.", "Temperature and pH can change enzyme shape and activity.", "Enzymes do not change the reaction's final equilibrium; they change how fast it gets there."],
      example: "Lactase breaks lactose into simpler sugars by helping the lactose molecule reach the reaction's transition state more easily.",
      mistake: "Do not say enzymes add energy to a reaction. They lower the energy barrier.",
      testCue: "Expect graphs of reaction energy, enzyme activity vs. temperature/pH, or substrate-active-site matching."
    },
    {
      aliases: ["ecology", "ecosystems", "food webs"],
      title: "Ecology",
      overview: "Ecology studies how organisms interact with each other and with their environment. It connects populations, communities, ecosystems, energy flow, and nutrient cycling.",
      keyIdeas: ["Energy flows through food chains and is lost as heat at each trophic level.", "Matter cycles through systems, such as carbon and nitrogen cycles.", "Population size changes with birth, death, immigration, emigration, resources, and predation."],
      example: "If a predator disappears, prey may increase, plants may decrease, and the whole food web can shift.",
      mistake: "Do not treat food webs as one-way simple ladders; real ecosystems have many connected paths.",
      testCue: "Look for trophic levels, carrying capacity, limiting factors, symbiosis, and energy pyramids."
    }
  ],
  chemistry: [
    {
      aliases: ["stoichiometry", "grams to moles", "mole ratio", "limiting reactant"],
      title: "Stoichiometry",
      overview: "Stoichiometry is the chemistry math that uses a balanced chemical equation to connect amounts of reactants and products. The coefficients in the equation are mole ratios, so they tell you how many moles of one substance relate to moles of another.",
      keyIdeas: ["Start with a balanced equation because the coefficients are the recipe.", "Convert the given amount into moles before using the mole ratio.", "Use the coefficient ratio to switch from the known substance to the wanted substance."],
      example: "For a mass-to-mass problem, the path is grams → moles → mole ratio → moles → grams. Example: grams of reactant become moles of reactant, the balanced equation converts to moles of product, then molar mass converts to grams of product.",
      mistake: "Do not use subscripts as mole ratios. Subscripts describe atoms inside one compound; coefficients describe reaction amounts.",
      testCue: "If the question gives one chemical amount and asks for another chemical amount, Kiwi smells stoichiometry."
    },
    {
      aliases: ["molarity", "concentration", "dilution", "m1v1"],
      title: "Molarity",
      overview: "Molarity measures solution concentration: moles of solute per liter of solution. It tells you how packed the dissolved particles are in a liquid solution.",
      keyIdeas: ["Formula: M = moles ÷ liters.", "Volume must be in liters, not milliliters.", "Dilution keeps moles of solute the same while volume and concentration change."],
      example: "If 0.50 mol NaCl is dissolved to make 2.0 L solution, M = 0.50 ÷ 2.0 = 0.25 M.",
      mistake: "Do not divide by mL unless you convert to L first. Unit gremlins love that trap.",
      testCue: "Look for words like solution, concentration, mol/L, dilution, or M1V1 = M2V2."
    },
    {
      aliases: ["periodic trends", "atomic radius", "ionization energy", "electronegativity"],
      title: "Periodic trends",
      overview: "Periodic trends are repeating patterns in element properties caused by electron shells, nuclear charge, and shielding. They help predict how atoms behave without memorizing every element.",
      keyIdeas: ["Atomic radius generally decreases left to right and increases down a group.", "Ionization energy and electronegativity generally increase left to right and decrease down a group.", "Shielding from inner electrons weakens the pull on outer electrons."],
      example: "Fluorine is small and very electronegative because its nucleus strongly attracts nearby valence electrons with little shielding.",
      mistake: "Do not memorize arrows only; explain them with attraction, distance, and shielding.",
      testCue: "Expect compare questions like 'Which atom is larger?' or 'Which has higher ionization energy?'"
    },
    {
      aliases: ["acids and bases", "acid", "base", "ph", "neutralization"],
      title: "Acids and bases",
      overview: "Acids and bases describe proton or electron-pair behavior in reactions. In introductory chemistry, acids increase H+ or donate protons, while bases increase OH− or accept protons.",
      keyIdeas: ["Lower pH means more acidic; higher pH means more basic.", "Strong acids/bases dissociate almost completely in water.", "Neutralization combines acid and base to form water and a salt."],
      example: "HCl + NaOH → NaCl + H2O is neutralization: H+ and OH− form water.",
      mistake: "Strong and concentrated are not the same. Strong means dissociation; concentrated means amount per volume.",
      testCue: "Look for pH, H+, OH−, proton donor/acceptor, titration, or neutralization."
    },
    {
      aliases: ["equilibrium", "le chatelier", "reaction quotient"],
      title: "Equilibrium",
      overview: "Chemical equilibrium happens when the forward and reverse reactions continue at equal rates, so concentrations stay constant even though molecules are still reacting.",
      keyIdeas: ["Equilibrium is dynamic, not stopped.", "K compares products to reactants at equilibrium.", "Le Châtelier's principle predicts how a system shifts after stress."],
      example: "If extra reactant is added, the system often shifts toward products to use some of that added reactant.",
      mistake: "Equal rates do not mean equal concentrations. Products and reactants can have different amounts at equilibrium.",
      testCue: "Watch for K, Q, shift left/right, stress, concentration, pressure, and temperature changes."
    }
  ],
  physics: [
    {
      aliases: ["kinematics", "motion", "velocity", "acceleration"],
      title: "Kinematics",
      overview: "Kinematics describes motion without focusing on what caused it. It connects position, displacement, velocity, acceleration, and time.",
      keyIdeas: ["Velocity tells how fast position changes; acceleration tells how fast velocity changes.", "Choose a positive direction before assigning signs.", "Constant-acceleration equations only work when acceleration is constant."],
      example: "If a car speeds up from rest at constant acceleration, velocity increases linearly while position curves upward over time.",
      mistake: "Do not confuse velocity and acceleration. An object can move fast while acceleration is zero.",
      testCue: "Look for displacement, initial/final velocity, acceleration, time, or motion graphs."
    },
    {
      aliases: ["forces", "newton's laws", "force", "net force"],
      title: "Forces",
      overview: "A force is a push or pull, and the net force determines acceleration. Newton's second law says net force equals mass times acceleration: ΣF = ma.",
      keyIdeas: ["Draw a free-body diagram before solving.", "Balanced forces mean zero acceleration, not necessarily zero velocity.", "Forces are vectors, so direction matters."],
      example: "If a 2 kg box has a net 6 N force to the right, its acceleration is 3 m/s² to the right.",
      mistake: "Do not include forces the object applies to other things on its own free-body diagram.",
      testCue: "Expect words like normal force, tension, friction, weight, net force, or acceleration."
    },
    {
      aliases: ["energy", "work", "kinetic energy", "potential energy"],
      title: "Energy",
      overview: "Energy is the ability to cause change or do work. In mechanics, kinetic energy is energy of motion and potential energy is stored energy due to position or configuration.",
      keyIdeas: ["Work transfers energy: W = Fd cosθ.", "Mechanical energy can transform between kinetic and potential energy.", "Nonconservative forces like friction convert mechanical energy into thermal energy."],
      example: "A roller coaster at the top has high gravitational potential energy; as it falls, that becomes kinetic energy.",
      mistake: "Do not assume energy disappears. It transfers or transforms.",
      testCue: "Look for work, height, speed, springs, conservation of energy, or friction."
    },
    {
      aliases: ["momentum", "impulse", "collisions"],
      title: "Momentum",
      overview: "Momentum measures motion mass: p = mv. In a closed system, total momentum stays constant even during collisions.",
      keyIdeas: ["Momentum is a vector, so direction matters.", "Impulse changes momentum: J = Δp.", "Elastic collisions conserve kinetic energy; inelastic collisions do not."],
      example: "If two carts collide on a nearly frictionless track, their total momentum before equals total momentum after.",
      mistake: "Do not conserve each object's momentum separately; conserve the system's total momentum.",
      testCue: "Watch for collision, explosion, recoil, impulse, or before/after velocity."
    },
    {
      aliases: ["circuits", "electric circuits", "ohm's law"],
      title: "Circuits",
      overview: "Circuits are closed paths where electric charge moves. Voltage pushes charge, current is charge flow, and resistance opposes that flow.",
      keyIdeas: ["Ohm's law: V = IR.", "Series components share current; parallel components share voltage.", "A complete loop is required for steady current."],
      example: "If a 9 V battery is connected to a 3 Ω resistor, current is I = V/R = 3 A.",
      mistake: "Do not say current gets used up. Energy is transferred, but charge keeps moving through the loop.",
      testCue: "Look for voltage, current, resistance, series, parallel, or equivalent resistance."
    }
  ],
  math: [
    {
      aliases: ["linear equations", "slope", "y=mx+b"],
      title: "Linear equations",
      overview: "Linear equations describe relationships with a constant rate of change. Their graphs are straight lines because every equal step in x changes y by the same amount.",
      keyIdeas: ["Slope is rise over run: change in y divided by change in x.", "Slope-intercept form is y = mx + b, where m is slope and b is the y-intercept.", "Solving a linear equation means isolating the variable while keeping both sides balanced."],
      example: "For y = 2x + 3, the line starts at 3 on the y-axis and rises 2 for every 1 step right.",
      mistake: "Do not forget that whatever you do to one side of an equation, you must do to the other side.",
      testCue: "Look for constant rate, slope, intercept, graphing a line, or solve for x."
    },
    {
      aliases: ["functions", "function notation", "domain", "range"],
      title: "Functions",
      overview: "A function is a rule where each input has exactly one output. Function notation like f(x) means the output of function f when the input is x.",
      keyIdeas: ["Domain is the set of allowed inputs; range is the set of possible outputs.", "The vertical line test checks whether a graph represents a function.", "Evaluating a function means substituting a value for the input."],
      example: "If f(x) = x² + 1, then f(3) = 3² + 1 = 10.",
      mistake: "f(x) is not f times x; it means the function's output for input x.",
      testCue: "Expect evaluate, compose, inverse, domain, range, or vertical line test questions."
    },
    {
      aliases: ["limits", "limit", "continuity"],
      title: "Limits",
      overview: "A limit describes what value a function approaches as x gets close to a number. It focuses on nearby behavior, not always the exact value at the point.",
      keyIdeas: ["Left-hand and right-hand limits must match for the two-sided limit to exist.", "A hole can still have a limit if both sides approach the same y-value.", "Limits are the foundation for derivatives and integrals."],
      example: "A graph may have a hole at x = 2, but if both sides approach y = 5, the limit is 5.",
      mistake: "Do not automatically plug in if it creates 0/0; simplify, factor, rationalize, or inspect the graph.",
      testCue: "Look for approaches, one-sided limits, holes, asymptotes, or continuity."
    },
    {
      aliases: ["derivatives", "derivative", "differentiation", "rate of change"],
      title: "Derivatives",
      overview: "A derivative measures instantaneous rate of change. Geometrically, it is the slope of the tangent line to a curve at a point.",
      keyIdeas: ["If position is s(t), then s′(t) is velocity.", "Power rule: d/dx[x^n] = nx^(n−1).", "Derivative signs describe increasing/decreasing behavior."],
      example: "If f(x) = x², then f′(x) = 2x, so at x = 3 the tangent slope is 6.",
      mistake: "Do not treat the derivative as an average slope over a whole interval; it is the slope at an instant.",
      testCue: "Expect tangent lines, velocity, rates, increasing/decreasing intervals, and optimization."
    },
    {
      aliases: ["multiple integrals", "double integrals", "triple integrals"],
      title: "Multiple integrals",
      overview: "Multiple integrals add up a quantity over a two-dimensional region or three-dimensional solid. A double integral accumulates over area; a triple integral accumulates over volume.",
      keyIdeas: ["The bounds describe the region, so sketching the region matters.", "Order of integration tells which variable is accumulated first.", "The integrand describes what you are adding: area density, mass density, volume slices, or another quantity."],
      example: "A double integral of 1 over a region gives the region's area; a double integral of density over a plate gives mass.",
      mistake: "Do not choose bounds before understanding the shape. Sketch first, integrate second. Kiwi insists.",
      testCue: "Look for region R, bounds, dA/dV, changing order, volume, mass, or density."
    }
  ],
  psychology: [
    {
      aliases: ["research methods", "experiment", "correlation", "variables"],
      title: "Research methods",
      overview: "Research methods are the tools psychologists use to ask questions and gather evidence about behavior and mental processes. Good methods help separate real patterns from guesses.",
      keyIdeas: ["Experiments can show cause and effect when variables are controlled and participants are assigned to conditions.", "Correlation shows a relationship but does not prove causation.", "Operational definitions describe exactly how a variable is measured."],
      example: "If researchers randomly assign one group to sleep 8 hours and another to sleep 4, then test memory, sleep is the independent variable and memory score is the dependent variable.",
      mistake: "Do not write that correlation proves one variable caused the other. Sneaky third variables may exist.",
      testCue: "Look for independent variable, dependent variable, control group, random assignment, correlation, and validity."
    },
    {
      aliases: ["memory", "encoding", "storage", "retrieval"],
      title: "Memory",
      overview: "Memory is the process of encoding information, storing it over time, and retrieving it later. It is reconstructive, meaning recall can be influenced by context, emotion, and later information.",
      keyIdeas: ["Encoding puts information into the memory system.", "Storage maintains information over time.", "Retrieval brings stored information back into awareness."],
      example: "Using retrieval practice, like self-quizzing, strengthens memory better than rereading because it practices pulling information out.",
      mistake: "Do not assume memory works like a perfect video recording. It can be distorted.",
      testCue: "Expect terms like working memory, long-term memory, retrieval cues, interference, and rehearsal."
    },
    {
      aliases: ["learning", "conditioning", "classical conditioning", "operant conditioning"],
      title: "Learning",
      overview: "Learning is a lasting change in behavior or knowledge based on experience. Psychology often studies learning through classical conditioning, operant conditioning, and observational learning.",
      keyIdeas: ["Classical conditioning pairs stimuli so one predicts another.", "Operant conditioning changes behavior through consequences.", "Reinforcement increases behavior; punishment decreases behavior."],
      example: "If a dog sits and gets a treat, sitting may increase because the treat reinforces the behavior.",
      mistake: "Negative reinforcement is not punishment; it increases behavior by removing something unpleasant.",
      testCue: "Look for stimulus, response, reinforcement, punishment, shaping, and modeling."
    },
    {
      aliases: ["development", "developmental psychology", "piaget", "erikson"],
      title: "Development",
      overview: "Developmental psychology studies how people change physically, cognitively, socially, and emotionally across the lifespan.",
      keyIdeas: ["Development includes both nature and nurture influences.", "Stage theories describe common sequences of change.", "Different domains can develop at different rates."],
      example: "Piaget focused on changes in children's thinking, such as moving from concrete reasoning toward abstract reasoning.",
      mistake: "Do not assume stage ages are exact for every person; they are general patterns.",
      testCue: "Expect nature/nurture, attachment, cognitive stages, adolescence, adulthood, or lifespan questions."
    },
    {
      aliases: ["social psychology", "conformity", "obedience", "attribution"],
      title: "Social psychology",
      overview: "Social psychology studies how people's thoughts, feelings, and behaviors are influenced by others and by social situations.",
      keyIdeas: ["Conformity means changing behavior to match a group.", "Obedience means following an authority figure's command.", "Attribution explains how people interpret causes of behavior."],
      example: "If someone assumes a late classmate is lazy instead of considering traffic, that may be the fundamental attribution error.",
      mistake: "Do not ignore the situation. Social psych loves showing how context changes behavior.",
      testCue: "Watch for conformity, obedience, groupthink, bystander effect, prejudice, and attribution."
    }
  ],
  writing: [
    {
      aliases: ["thesis statements", "thesis", "claim"],
      title: "Thesis statements",
      overview: "A thesis statement is the main arguable claim of an essay. It tells the reader what you will prove and gives your paper a clear spine.",
      keyIdeas: ["A strong thesis is specific, arguable, and answers the prompt.", "It should not be just a fact or a vague topic.", "The body paragraphs should connect back to the thesis."],
      example: "Weak: 'Social media is important.' Stronger: 'Social media reshapes teen friendships by increasing constant contact, public comparison, and pressure to perform identity online.'",
      mistake: "Do not make the thesis so broad that the essay has no direction. Kiwi cannot herd fog.",
      testCue: "Look for prompts asking you to argue, analyze, evaluate, or take a position."
    },
    {
      aliases: ["paragraph structure", "body paragraph", "topic sentence"],
      title: "Paragraph structure",
      overview: "A strong paragraph develops one main idea that supports the thesis. It usually needs a topic sentence, evidence, analysis, and a transition.",
      keyIdeas: ["The topic sentence states the paragraph's main point.", "Evidence shows the reader what you are using to prove it.", "Analysis explains why the evidence matters."],
      example: "Claim → quote/data → explanation → link back to thesis is a clean paragraph skeleton.",
      mistake: "Do not drop evidence and run away. Explain it after you quote it.",
      testCue: "Look for revision questions asking where a sentence belongs or how evidence supports a claim."
    },
    {
      aliases: ["rhetorical analysis", "rhetoric", "ethos", "pathos", "logos"],
      title: "Rhetorical analysis",
      overview: "Rhetorical analysis explains how an author persuades an audience. Instead of only summarizing what the author says, you analyze the choices they make and why those choices work.",
      keyIdeas: ["Ethos builds credibility.", "Pathos appeals to emotion.", "Logos appeals to logic, evidence, and reasoning."],
      example: "If a speaker uses expert credentials before giving statistics, they may combine ethos and logos to build trust.",
      mistake: "Do not just label ethos/pathos/logos. Explain the effect on the audience.",
      testCue: "Look for author, audience, purpose, tone, diction, evidence, and persuasive strategies."
    },
    {
      aliases: ["citations", "mla", "apa", "works cited"],
      title: "Citations",
      overview: "Citations give credit to sources and help readers find the original information. They also protect your argument by showing where evidence comes from.",
      keyIdeas: ["In-text citations point to a full source entry.", "Different classes may require MLA, APA, or another format.", "Quote, paraphrase, and summarize all need citations when the idea comes from a source."],
      example: "In MLA, a quote might end with the author's last name and page number: (Nguyen 42).",
      mistake: "Do not cite only direct quotes. Paraphrased ideas need credit too.",
      testCue: "Expect source integration, plagiarism, bibliography, Works Cited, or reference list questions."
    },
    {
      aliases: ["revision", "revise", "editing"],
      title: "Revision",
      overview: "Revision means improving ideas, organization, clarity, and evidence. Editing fixes sentence-level issues, but revision can reshape the whole paper.",
      keyIdeas: ["Check whether each paragraph supports the thesis.", "Strengthen weak evidence and explain analysis more clearly.", "Move, combine, or delete sentences that do not serve the argument."],
      example: "If a paragraph has a good quote but no explanation, revise by adding analysis that connects the quote to the claim.",
      mistake: "Do not treat revision as only grammar cleanup. Big-picture structure matters first.",
      testCue: "Look for questions about adding, deleting, moving, or clarifying sentences."
    }
  ],
  history: [
    {
      aliases: ["cause and effect", "causation", "effects", "causes"],
      title: "Cause and effect",
      overview: "Cause and effect in history explains why events happened and what changed because of them. Strong historical thinking separates immediate triggers from deeper long-term causes.",
      keyIdeas: ["Long-term causes build pressure over time.", "Short-term causes or triggers set events in motion.", "Effects can be immediate, long-term, intended, or unintended."],
      example: "A tax protest might be the immediate event, while economic inequality and political conflict are deeper causes.",
      mistake: "Do not list events without explaining the connection between them. History wants the logic chain.",
      testCue: "Look for why, led to, resulted in, consequence, impact, or turning point."
    },
    {
      aliases: ["primary sources", "primary source", "source analysis"],
      title: "Primary sources",
      overview: "Primary sources are materials created during the time being studied or by people directly connected to the event. Historians use them as evidence, but they must analyze perspective and reliability.",
      keyIdeas: ["Author, audience, purpose, and context shape what a source says.", "Bias does not make a source useless; it tells you how to read it.", "Corroboration means comparing sources to see what lines up or conflicts."],
      example: "A soldier's diary is a primary source for wartime experience, but it reflects that soldier's limited viewpoint.",
      mistake: "Do not assume primary means perfectly true. It means close to the event.",
      testCue: "Watch for sourcing, context, audience, purpose, bias, reliability, and corroboration."
    },
    {
      aliases: ["timelines", "timeline", "chronology"],
      title: "Timelines",
      overview: "Timelines organize events in chronological order so you can see sequence, change over time, and turning points.",
      keyIdeas: ["Chronology helps explain causation because earlier events can influence later ones.", "Turning points mark moments when direction or power changed.", "Periods group events by shared patterns."],
      example: "A revolution timeline might show economic crisis, protest, government response, radicalization, and regime change.",
      mistake: "Do not memorize dates without meaning. Ask why each date matters.",
      testCue: "Look for before/after, sequence, periodization, continuity, change, and turning point."
    },
    {
      aliases: ["historical figures", "leaders", "people in history"],
      title: "Historical figures",
      overview: "Studying historical figures means understanding their choices, constraints, beliefs, and impact within their time period. People matter, but context shapes what choices were available.",
      keyIdeas: ["Consider motives, goals, allies, opponents, and limitations.", "Separate what the figure intended from what actually happened.", "Use evidence instead of personality-only explanations."],
      example: "A leader may push reform because of personal beliefs, public pressure, economic crisis, and political opportunity all at once.",
      mistake: "Do not explain history as one person magically causing everything. Context has paws on the steering wheel too.",
      testCue: "Look for role, significance, motive, impact, legacy, or context."
    },
    {
      aliases: ["comparisons", "compare", "contrast"],
      title: "Historical comparisons",
      overview: "Comparison in history explains similarities and differences between societies, events, policies, or time periods. The goal is not just listing; it is explaining why the similarities and differences matter.",
      keyIdeas: ["Use the same categories for both sides, such as economy, politics, culture, or technology.", "Explain causes of similarities and differences.", "End with significance: what the comparison reveals."],
      example: "Comparing two revolutions might examine causes, leadership, social groups, violence, and outcomes.",
      mistake: "Do not write one paragraph about A and one about B with no direct comparison. Make them talk to each other.",
      testCue: "Look for compare, contrast, similarly, different from, or evaluate."
    }
  ]
};

function normalizeForLookup(value) {
  return (value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function findExplanation(subjectKey, cleanTopic) {
  const normalizedTopic = normalizeForLookup(cleanTopic);
  const entries = EXPLANATION_LIBRARY[subjectKey] || [];
  return entries.find(entry => entry.aliases.some(alias => {
    const normalizedAlias = normalizeForLookup(alias);
    return normalizedTopic === normalizedAlias || normalizedTopic.includes(normalizedAlias) || normalizedAlias.includes(normalizedTopic);
  }));
}

function buildFallbackExplanation({ subject, subjectKey, cleanTopic, level, notes }) {
  const subjectFrames = {
    biology: ["what structure or process is involved", "how it helps living systems survive or function", "what changes when conditions change"],
    chemistry: ["what particles or substances are changing", "what quantities, units, or ratios connect them", "what evidence shows the reaction or property"],
    physics: ["what object or system you are analyzing", "which variables describe it", "what law, graph, or equation connects those variables"],
    math: ["what the problem is asking you to find", "which rule or definition applies", "how each step changes the expression without breaking equality"],
    psychology: ["what behavior or mental process is being described", "which theory or evidence explains it", "how to distinguish it from a similar concept"],
    writing: ["what claim or purpose the writing needs", "what evidence supports it", "how the explanation connects back to the prompt"],
    history: ["what happened", "why it happened in that context", "what changed afterward and why it mattered"]
  };
  const frame = subjectFrames[subjectKey] || subjectFrames.biology;
  const noteFocus = notes && notes.trim() ? `\n\nFrom your notes/question, focus especially on: “${notes.trim().slice(0, 180)}${notes.trim().length > 180 ? "…" : ""}”.` : "";
  return `Let's actually explain ${cleanTopic}${level} in ${subject.label}.\n\nCore idea: ${cleanTopic} is a ${subject.label.toLowerCase()} topic you can understand by asking: ${frame[0]}, ${frame[1]}, and ${frame[2]}.\n\nBreak it down:\n• First, define the main term in plain language.\n• Next, identify the moving parts: people, variables, evidence, structures, formulas, or causes.\n• Then connect those parts with a because statement: “${cleanTopic} matters because ___.”\n\nExample starter: If a problem or question mentions ${cleanTopic}, Kiwi would first label the key information, then explain how each part affects the next part instead of memorizing loose facts.\n\nCommon mistake: treating ${cleanTopic} like a vocabulary word only. For tests, you usually need to explain how it works, when it applies, and why it matters.${noteFocus}`;
}

function buildTopicExplanation({ subjectKey, cleanTopic, notes, confidenceLine, noteHint, state = DEFAULT_STATE }) {
  const subject = getSubject(subjectKey);
  const level = subjectKey === "math" ? ` (${state.activeMathLevel})` : "";
  const explanation = findExplanation(subjectKey, cleanTopic);
  if (!explanation) {
    return `${buildFallbackExplanation({ subject, subjectKey, cleanTopic, level, notes })}\n\n${confidenceLine}\n${noteHint}`;
  }
  const noteFocus = notes && notes.trim() ? `\n\nYour note/question focus: “${notes.trim().slice(0, 180)}${notes.trim().length > 180 ? "…" : ""}”` : "";
  return `${explanation.title}${level}: actual Kiwi explanation\n\n${explanation.overview}\n\nKey ideas:\n${explanation.keyIdeas.map(item => `• ${item}`).join("\n")}\n\nExample:\n${explanation.example}\n\nCommon mistake:\n${explanation.mistake}\n\nHow to recognize it on a test:\n${explanation.testCue}${noteFocus}\n\n${confidenceLine}\n${noteHint}`;
}

const PRACTICE_LIBRARY = {
  stoichiometry: `Kiwi-generated practice: Stoichiometry\n\nProblem 1\nBalanced equation: 2 H2 + O2 → 2 H2O\nIf you start with 4.00 g of H2 and excess O2, how many grams of H2O can form?\n\nProblem 2\nBalanced equation: N2 + 3 H2 → 2 NH3\nIf 6.0 mol H2 reacts with excess N2, how many mol NH3 can form?\n\nTry first, then check below. Tiny paws over the answer key until you attempt it.\n\nAnswer key\n1. 4.00 g H2 × (1 mol H2 / 2.016 g) × (2 mol H2O / 2 mol H2) × (18.016 g H2O / 1 mol) ≈ 35.7 g H2O.\n2. 6.0 mol H2 × (2 mol NH3 / 3 mol H2) = 4.0 mol NH3.\n\nKiwi check: the balanced equation gives the mole ratio, not the subscripts.`,
  molarity: `Kiwi-generated practice: Molarity\n\nProblem 1\nYou dissolve 0.75 mol NaCl to make 3.0 L of solution. What is the molarity?\n\nProblem 2\nHow many moles of glucose are in 250 mL of a 0.400 M glucose solution?\n\nAnswer key\n1. M = 0.75 mol ÷ 3.0 L = 0.25 M.\n2. 250 mL = 0.250 L, so moles = 0.400 M × 0.250 L = 0.100 mol.\n\nKiwi check: milliliters must become liters before the math goblins touch it.`,
  "cell membranes": `Kiwi-generated practice: Cell membranes\n\nProblem 1\nA cell is placed in a very salty solution. Predict the direction water moves and explain why.\n\nProblem 2\nWhy can oxygen cross the phospholipid bilayer more easily than sodium ions?\n\nAnswer key\n1. Water moves out of the cell by osmosis because the outside has higher solute concentration.\n2. Oxygen is small and nonpolar, so it can pass through the hydrophobic bilayer; sodium is charged and needs a protein channel.`,
  derivatives: `Kiwi-generated practice: Derivatives\n\nProblem 1\nFind f′(x) if f(x) = 4x^3 - 5x + 2.\n\nProblem 2\nIf s(t) = t^2 + 3t, what is the velocity at t = 4?\n\nAnswer key\n1. f′(x) = 12x^2 - 5.\n2. v(t) = s′(t) = 2t + 3, so v(4) = 11.\n\nKiwi check: derivative means instantaneous rate of change, not the whole-trip average.`
};

function buildPracticeProblem({ subjectKey, topic, state = DEFAULT_STATE }) {
  const subject = getSubject(subjectKey);
  const cleanTopic = normalizeTopic(topic || state.activeTopic, subjectKey, state);
  const normalizedTopic = normalizeForLookup(cleanTopic);
  const directPractice = Object.entries(PRACTICE_LIBRARY).find(([key]) => {
    const normalizedKey = normalizeForLookup(key);
    return normalizedTopic === normalizedKey || normalizedTopic.includes(normalizedKey) || normalizedKey.includes(normalizedTopic);
  });
  if (directPractice) return directPractice[1];

  const explanation = findExplanation(subjectKey, cleanTopic);
  const anchor = explanation?.title || cleanTopic;
  const keyIdea = explanation?.keyIdeas?.[0] || `Explain the most important rule, cause, structure, or pattern in ${cleanTopic}.`;
  const example = explanation?.example || `Create a small example where ${cleanTopic} changes the answer or interpretation.`;
  return `Kiwi-generated practice: ${anchor}\n\nProblem 1\nExplain ${anchor} in your own words, then name the one clue that tells you this topic is being tested.\n\nProblem 2\nApply this idea: ${example}\n\nProblem 3\nCommon mistake hunt: write one wrong answer someone might give for ${anchor}, then correct it.\n\nAnswer key\n1. Strong answer includes this core idea: ${keyIdea}\n2. Strong answer connects the example back to the rule or concept instead of only naming the topic.\n3. Strong answer identifies the misconception and fixes the reasoning.\n\nKiwi check: this is ${subject.label} practice generated for you — no prompt required.`;
}

function buildStudyResponse({ subjectKey, action, topic, notes, confidence, state = DEFAULT_STATE }) {
  const subject = getSubject(subjectKey);
  const cleanTopic = normalizeTopic(topic, subjectKey, state);
  const noteHint = notes && notes.trim().length > 0 ? "I used your notes as the study target." : "Add notes if you want me to get more specific later.";
  const level = subjectKey === "math" ? ` (${state.activeMathLevel})` : "";
  const confidenceLine = confidence === "strong" ? "You marked this strong, so Kiwi will challenge you." : confidence === "okay" ? "You marked this okay, so Kiwi will tighten the wobbly bits." : "You marked this tiny panic, so Kiwi will go step-by-step.";

  const templates = {
    "Explain": buildTopicExplanation({ subjectKey, cleanTopic, notes, confidenceLine, noteHint, state }),
    "Quiz Me": `Quick Kiwi quiz for ${cleanTopic}${level}:\n\nQ1. What is the core definition or rule?\nQ2. What is one common trap students make here?\nQ3. Apply it to a tiny example from your notes.\n\nAnswer out loud first. Kiwi does not accept telepathic studying.` ,
    "Flashcards": `Flashcard starter deck for ${cleanTopic}${level}:\n\n• Term → definition\n• Process/formula → when to use it\n• Common mistake → how to avoid it\n• Example → final answer or conclusion\n\nPaw stamp goal: make 4 cards now, not 40 cards never.` ,
    "Practice Problem": buildPracticeProblem({ subjectKey, topic: cleanTopic, state }),
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
    topicLibrary: document.querySelector("#topic-library"),
    teachTopic: document.querySelector("#teach-topic"),
    practiceTopic: document.querySelector("#practice-topic"),
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

  function ensureActiveTopic() {
    const subject = getSubject(state.activeSubject);
    if (!state.activeTopic || !subject.topics.includes(state.activeTopic)) {
      state.activeTopic = subject.topics[0];
    }
  }

  function getCurrentTopic() {
    const customTopic = els.topic.value.trim();
    if (customTopic) return customTopic;
    ensureActiveTopic();
    return state.activeTopic;
  }

  function runLesson(action) {
    const response = buildStudyResponse({
      subjectKey: state.activeSubject,
      action,
      topic: getCurrentTopic(),
      notes: els.notes.value,
      confidence: getConfidence(),
      state
    });
    els.output.textContent = response;
    els.bubble.textContent = action === "Practice Problem" ? "Practice set generated. Tiny pencil claws out." : "Teaching mode. Kiwi has seized the chalkboard.";
  }

  function renderSubjects() {
    els.subjectGrid.innerHTML = Object.entries(SUBJECTS).map(([key, subject]) => `
      <button type="button" class="subject-card ${key === state.activeSubject ? "active" : ""}" data-subject="${key}" style="--subject-color: ${subject.color}" aria-label="Open ${subject.label} study mode">
        <span class="subject-icon">${subject.icon}</span>
        <div class="subject-name">${subject.label}</div>
        <div class="subject-line">${subject.line}</div>
        <span class="subject-cta">Open study mode →</span>
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

  function renderTopicLibrary() {
    const subject = getSubject(state.activeSubject);
    ensureActiveTopic();
    els.topicLibrary.innerHTML = subject.topics.map(topic => `
      <button type="button" class="topic-chip ${topic === state.activeTopic ? "active" : ""}" data-topic="${topic}" aria-pressed="${topic === state.activeTopic}">
        ${topic}
      </button>
    `).join("");
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

  function moveIntoStudyMode() {
    const panel = document.querySelector("#study-panel");
    if (!panel) return;
    panel.classList.add("study-panel-pulse");
    panel.focus({ preventScroll: true });
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    panel.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    window.setTimeout(() => panel.classList.remove("study-panel-pulse"), 900);
  }

  function openStudyMode(shouldMove = true) {
    const subject = getSubject(state.activeSubject);
    renderActiveSubject();
    els.output.textContent = `${subject.voice}\n\nStudy mode is open. Pick a built-in topic and press “Teach this topic” or “Give me practice problems.” No prompt required — Kiwi brought the lesson plan.`;
    els.bubble.textContent = `${subject.label} study mode opened. Tiny paws deployed.`;
    if (shouldMove) moveIntoStudyMode();
  }

  function renderActiveSubject() {
    const subject = getSubject(state.activeSubject);
    ensureActiveTopic();
    els.title.textContent = subject.label;
    els.kicker.textContent = state.activeSubject === "math" ? `Current Subject · ${state.activeMathLevel}` : "Current Subject";
    els.accessory.textContent = subject.accessory;
    els.bubble.textContent = subject.voice;
    renderSubjects();
    renderMathLevels();
    renderTopicLibrary();
    renderActions();
    renderWeakBoard();
  }

  els.subjectGrid.addEventListener("click", event => {
    const card = event.target.closest("[data-subject]");
    if (!card) return;
    state.activeSubject = card.dataset.subject;
    state.activeTopic = getSubject(state.activeSubject).topics[0];
    els.topic.value = "";
    saveState(state);
    openStudyMode(true);
  });

  els.mathLevels.addEventListener("click", event => {
    const button = event.target.closest("[data-level]");
    if (!button) return;
    state.activeMathLevel = button.dataset.level;
    saveState(state);
    renderActiveSubject();
  });

  els.topicLibrary.addEventListener("click", event => {
    const button = event.target.closest("[data-topic]");
    if (!button) return;
    state.activeTopic = button.dataset.topic;
    els.topic.value = "";
    saveState(state);
    renderTopicLibrary();
    els.output.textContent = buildStudyResponse({
      subjectKey: state.activeSubject,
      action: "Explain",
      topic: state.activeTopic,
      notes: els.notes.value,
      confidence: getConfidence(),
      state
    });
    els.bubble.textContent = `${state.activeTopic} selected. Kiwi opened the mini lesson.`;
  });

  els.teachTopic.addEventListener("click", () => runLesson("Explain"));
  els.practiceTopic.addEventListener("click", () => runLesson("Practice Problem"));

  els.actions.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const response = buildStudyResponse({
      subjectKey: state.activeSubject,
      action: button.dataset.action,
      topic: getCurrentTopic(),
      notes: els.notes.value,
      confidence: getConfidence(),
      state
    });
    els.output.textContent = response;
    els.bubble.textContent = `${button.dataset.action} mode. Kiwi is academically suspicious.`;
  });

  els.saveTopic.addEventListener("click", () => {
    state = upsertTopic(state, { subjectKey: state.activeSubject, topic: getCurrentTopic(), confidence: getConfidence() });
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
    state.activeTopic = weak.topic;
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
  module.exports = { SUBJECTS, DEFAULT_STATE, buildStudyResponse, buildPracticeProblem, buildWeakTopics, upsertTopic, normalizeTopic, loadState };
}
