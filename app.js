const KIWI_STORAGE_KEY = "kiwi-study-buddy-v1";

const SUBJECTS = {
  biology: {
    label: "General Biology",
    icon: "🧬",
    color: "#CDECCF",
    accessory: "🥽 Tiny lab goggles activated",
    line: "Cells, genetics, evolution, ecology, physiology, enzymes, and lab thinking.",
    topics: ["cell membranes", "genetics", "evolution", "enzymes", "ecology"],
    tools: ["Explain", "Quiz Me", "Flashcards", "Diagram Practice", "Study Guide", "Summarize Notes", "Find Sources"],
    voice: "Biology mode. Tiny goggles activated."
  },
  chemistry: {
    label: "General Chemistry",
    icon: "⚗️",
    color: "#E5D4F5",
    accessory: "🥽 Safety goggles on; unit chaos off",
    line: "Atoms, bonding, measurements, stoichiometry, molarity, acids/bases, equilibrium, and kinetics.",
    topics: ["stoichiometry", "molarity", "significant figures", "periodic trends", "acids and bases", "equilibrium", "kinetics"],
    tools: ["Explain", "Practice Problem", "Unit Check", "Flashcards", "Study Guide", "Summarize Notes", "Find Sources"],
    voice: "Chemistry mode. Before we do math crimes, we write the units."
  },
  physics: {
    label: "General Physics",
    icon: "🪐",
    color: "#D5E9FF",
    accessory: "➡️ Kiwi brought arrows",
    line: "Motion, forces, energy, momentum, waves, circuits, fluids, and thermodynamics.",
    topics: ["kinematics", "forces", "energy", "momentum", "circuits"],
    tools: ["Explain", "Formula Help", "Free-Body Checklist", "Practice Problem", "Quiz Me", "Study Guide", "Find Sources"],
    voice: "Physics mode. Draw the forces first. Kiwi is watching."
  },
  math: {
    label: "Math",
    icon: "📐",
    color: "#FFF0B8",
    accessory: "📐 Calculator hat equipped",
    line: "A full pathway from Algebra 1 through Calculus 3.",
    topics: ["linear equations", "systems of equations", "inequalities", "functions", "exponents"],
    topicsByLevel: {
      "Algebra 1": ["linear equations", "systems of equations", "inequalities", "functions", "exponents"],
      "Geometry": ["angles", "triangles", "congruence", "similarity", "circles", "area and volume"],
      "Algebra 2": ["quadratics", "polynomials", "rational expressions", "exponential functions", "logarithms", "complex numbers"],
      "Precalculus": ["trigonometric functions", "trig identities", "vectors", "sequences and series", "polar coordinates"],
      "Calculus 1": ["limits", "derivatives", "derivative applications", "intro integrals", "optimization"],
      "Calculus 2": ["integration techniques", "applications of integrals", "sequences and series", "parametric equations", "polar integrals"],
      "Calculus 3": ["vectors in space", "partial derivatives", "multiple integrals", "line integrals", "surface integrals"]
    },
    tools: ["Explain", "Step-by-Step", "Practice Problem", "Mistake Check", "Flashcards", "Study Guide", "Find Sources"],
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
    tools: ["Explain", "Quiz Me", "Compare Theories", "Flashcards", "Scenario Practice", "Study Guide", "Find Sources"],
    voice: "Psychology mode. Let's analyze the behavior. Not yours. Probably."
  },
  writing: {
    label: "English / Writing",
    icon: "✍️",
    color: "#FFDCE8",
    accessory: "✍️ Comma goblin patrol begins",
    line: "Essay planning, thesis statements, paragraph structure, grammar, citations, and revision.",
    topics: ["thesis statements", "paragraph structure", "rhetorical analysis", "citations", "revision"],
    tools: ["Outline", "Thesis Help", "Revise Paragraph", "Quote Integration", "Grammar Check", "Study Guide", "Find Sources"],
    voice: "Writing mode. This paragraph has feelings, but it needs a spine."
  },
  history: {
    label: "History",
    icon: "🏛️",
    color: "#EAD7B7",
    accessory: "🏛️ Timeline scarf wrapped",
    line: "Timelines, cause/effect, historical figures, primary sources, and essay prep.",
    topics: ["cause and effect", "primary sources", "timelines", "historical figures", "comparisons"],
    tools: ["Explain", "Timeline", "Cause/Effect", "Flashcards", "Essay Outline", "Study Guide", "Find Sources"],
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

function getTopicsForSubject(subjectKey, state = DEFAULT_STATE) {
  const subject = getSubject(subjectKey);
  if (subjectKey === "math" && subject.topicsByLevel) {
    return subject.topicsByLevel[state.activeMathLevel] || subject.topicsByLevel[subject.levels[0]];
  }
  return subject.topics;
}

function normalizeTopic(topic, subjectKey, state = DEFAULT_STATE) {
  const cleanTopic = (topic || "").trim();
  if (cleanTopic) return cleanTopic;
  const topics = getTopicsForSubject(subjectKey, state);
  if (state.activeTopic && topics.includes(state.activeTopic)) return state.activeTopic;
  return topics[0];
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
      aliases: ["photosynthesis", "chloroplasts", "light reactions", "calvin cycle"],
      title: "Photosynthesis",
      overview: "Photosynthesis is the process plants, algae, and some bacteria use to turn light energy into chemical energy stored in glucose. It mostly happens in chloroplasts: the light reactions capture energy, and the Calvin cycle uses that energy to build sugar from carbon dioxide.",
      keyIdeas: ["The overall inputs are carbon dioxide, water, and light; the outputs are glucose and oxygen.", "Light reactions happen in the thylakoid membranes and produce ATP, NADPH, and oxygen.", "The Calvin cycle happens in the stroma and uses CO2, ATP, and NADPH to build sugar."],
      example: "A plant leaf takes in CO2 through stomata, absorbs light with chlorophyll, splits water during the light reactions, releases O2, then uses the captured energy to make glucose.",
      mistake: "Do not say photosynthesis is just plants 'breathing.' It is energy conversion and sugar-building; cellular respiration is the process that breaks sugar down for usable ATP.",
      testCue: "Look for chloroplasts, chlorophyll, light reactions, Calvin cycle, CO2, H2O, O2, glucose, ATP, or NADPH."
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
      aliases: ["significant figures", "significant figure", "sig figs", "sig fig", "sigfigs", "significant digits", "significiant figures", "significiant figure", "signficant figures", "measurement precision", "rounding measured values"],
      title: "Significant figures",
      overview: "Significant figures are the measured digits in a number: all the digits you know for sure plus one final estimated digit. They show the precision of a measurement, so chemistry answers should not pretend to be more precise than the lab tools or starting data.",
      keyIdeas: ["Nonzero digits are significant, zeros between nonzero digits are significant, and leading zeros are not significant because they only place the decimal.", "Trailing zeros are significant when a decimal point shows they were measured, such as 2.300 having four significant figures.", "For addition and subtraction, round the final answer to the least number of decimal places; for multiplication and division, round to the fewest significant figures."],
      example: "0.00450 has 3 significant figures: the 4, the 5, and the final 0 after 5 because it is written as measured precision. For 12.40 + 0.3, the answer is 12.7 because 0.3 only has one decimal place. For 4.20 × 3.1, the answer is 13 because 3.1 has two significant figures.",
      mistake: "Do not use the multiplication/division sig-fig rule on addition/subtraction. Addition/subtraction cares about decimal places, not total sig figs.",
      testCue: "Look for measured numbers, rounding directions, lab data, decimal places, trailing zeros, scientific notation, or instructions asking for the correct number of significant figures."
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
    },
    {
      aliases: ["kinetics", "chemical kinetics", "reaction rates", "reaction rate", "rate law", "rate laws", "activation energy", "arrhenius equation", "reaction mechanisms"],
      title: "Kinetics",
      overview: "Kinetics studies reaction rates: how fast reactants turn into products and what factors make that speed change. It connects concentration, temperature, catalysts, activation energy, and reaction mechanisms to measurable rate data.",
      keyIdeas: ["Reaction rate measures how concentration changes over time, such as −Δ[A]/Δt or Δ[product]/Δt.", "A rate law links rate to reactant concentrations, often in the form rate = k[A]^m[B]^n; the exponents come from experimental data, not from balanced-equation coefficients unless the step is elementary.", "Higher temperature or a catalyst can increase rate by helping more particles overcome activation energy; catalysts speed up both forward and reverse reactions without changing equilibrium."],
      example: "If a reaction has rate = k[A]^2 and [A] doubles, the rate becomes 2^2 = 4 times faster. If [A] is halved, the rate becomes (1/2)^2 = 1/4 as fast.",
      mistake: "Do not assume coefficients in the overall balanced equation are the rate-law exponents. For most mechanisms, rate laws must come from experimental initial-rate data or an elementary rate-determining step.",
      testCue: "Look for initial rates, rate laws, reaction orders, k, concentration-versus-time data, half-life, activation energy, catalysts, mechanisms, or slow-step language."
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
      aliases: ["systems of equations", "systems", "substitution", "elimination"],
      title: "Systems of equations",
      overview: "A system of equations is a set of equations that must be true at the same time. The solution is the value or ordered pair where the equations agree.",
      keyIdeas: ["On a graph, the solution is where the lines or curves intersect.", "Substitution replaces one variable expression with an equal expression from another equation.", "Elimination adds or subtracts equations to cancel a variable."],
      example: "For x + y = 7 and x - y = 1, adding the equations gives 2x = 8, so x = 4 and y = 3.",
      mistake: "Do not solve each equation separately and forget the answer must satisfy both equations.",
      testCue: "Look for two equations, intersection, substitution, elimination, or ordered-pair solution."
    },
    {
      aliases: ["inequalities", "inequality", "linear inequalities", "compound inequalities"],
      title: "Inequalities",
      overview: "Inequalities compare quantities using symbols like <, >, ≤, and ≥. The answer is usually a range of values rather than one number.",
      keyIdeas: ["Solve inequalities with balance moves just like equations.", "Flip the inequality sign when multiplying or dividing both sides by a negative number.", "Graph solutions with open circles for strict inequalities and closed circles for inclusive ones."],
      example: "If -2x < 6, divide by -2 and flip the sign: x > -3.",
      mistake: "The classic trap is forgetting to flip the inequality when dividing by a negative. Kiwi hisses at that sign flip.",
      testCue: "Look for range answers, number lines, at least/at most, greater than, or less than."
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
      aliases: ["exponents", "exponent rules", "powers", "scientific notation"],
      title: "Exponents",
      overview: "Exponents show repeated multiplication. They help write very large, very small, or repeatedly multiplied quantities compactly.",
      keyIdeas: ["Multiplying same bases means add exponents: a^m · a^n = a^(m+n).", "Dividing same bases means subtract exponents: a^m / a^n = a^(m-n).", "A negative exponent means reciprocal, not a negative number."],
      example: "x^3 · x^4 = x^7 because there are seven x factors total.",
      mistake: "Do not add exponents when the bases are different, like 2^3 · 3^2.",
      testCue: "Look for powers, same base, scientific notation, negative exponents, or simplify."
    },
    {
      aliases: ["angles", "angle relationships", "parallel lines", "transversals"],
      title: "Angles",
      overview: "Angles measure rotation between rays. Geometry uses angle relationships to find missing measures without measuring directly.",
      keyIdeas: ["Vertical angles are congruent.", "Supplementary angles add to 180°, and complementary angles add to 90°.", "Parallel lines cut by a transversal create corresponding, alternate interior, and same-side interior relationships."],
      example: "If two vertical angles are formed and one is 58°, the opposite angle is also 58°.",
      mistake: "Do not assume angles are equal just because a diagram looks symmetrical; use a named relationship.",
      testCue: "Look for parallel marks, transversals, vertical angles, supplementary pairs, or missing angle measures."
    },
    {
      aliases: ["triangles", "triangle", "pythagorean theorem", "triangle sum"],
      title: "Triangles",
      overview: "Triangles are three-sided polygons whose angle and side relationships power a lot of geometry. Every triangle's interior angles add to 180°.",
      keyIdeas: ["The Pythagorean theorem a² + b² = c² works for right triangles.", "Triangle inequality says any two sides must add to more than the third side.", "Special triangle types have useful side or angle patterns."],
      example: "In a right triangle with legs 3 and 4, the hypotenuse is 5 because 3² + 4² = 5².",
      mistake: "Do not use the Pythagorean theorem unless the triangle is right or you have proven it is right.",
      testCue: "Look for 180°, right-angle marks, side lengths, congruent sides, or triangle inequality."
    },
    {
      aliases: ["congruence", "congruent triangles", "sss", "sas", "asa", "aas", "hl"],
      title: "Congruence",
      overview: "Congruent figures have the same shape and size. Congruence proofs show that matching parts are equal because the whole figures match exactly.",
      keyIdeas: ["Triangle congruence shortcuts include SSS, SAS, ASA, AAS, and HL for right triangles.", "CPCTC means corresponding parts of congruent triangles are congruent.", "The order of letters tells which vertices correspond."],
      example: "If two triangles have two matching sides and the included angle equal, SAS proves the triangles congruent.",
      mistake: "Do not use SSA as a congruence shortcut; it can create ambiguous cases.",
      testCue: "Look for proof tables, corresponding marks, SSS/SAS/ASA/AAS/HL, or CPCTC."
    },
    {
      aliases: ["similarity", "similar triangles", "scale factor", "proportions"],
      title: "Similarity",
      overview: "Similar figures have the same shape but not necessarily the same size. Their corresponding angles match and side lengths are proportional.",
      keyIdeas: ["Scale factor multiplies lengths from one figure to another.", "Similar triangles can be proven with AA, SAS similarity, or SSS similarity.", "Perimeters scale by the scale factor; areas scale by the square of it."],
      example: "If two similar triangles have scale factor 3, a side of length 5 corresponds to a side of length 15.",
      mistake: "Do not mix up corresponding sides when writing proportions.",
      testCue: "Look for scale drawings, proportional sides, dilation, AA similarity, or missing side lengths."
    },
    {
      aliases: ["circles", "circle theorems", "arc length", "sector area"],
      title: "Circles",
      overview: "Circles are sets of points the same distance from a center. Circle problems connect radius, diameter, circumference, arcs, sectors, chords, and angles.",
      keyIdeas: ["Diameter is twice the radius.", "Circumference is 2πr and area is πr².", "Central angles measure arcs directly; inscribed angles measure half their intercepted arc."],
      example: "A circle with radius 4 has circumference 8π and area 16π.",
      mistake: "Do not confuse circumference, which is distance around, with area, which covers the inside.",
      testCue: "Look for radius, diameter, chord, tangent, secant, arc, sector, or inscribed angle."
    },
    {
      aliases: ["area and volume", "area", "volume", "surface area"],
      title: "Area and volume",
      overview: "Area measures two-dimensional space and volume measures three-dimensional space. Formulas depend on the shape and the units tell you whether the answer is squared or cubed.",
      keyIdeas: ["Area uses square units, like cm².", "Volume uses cubic units, like cm³.", "Composite figures can be split into simpler shapes, then added or subtracted."],
      example: "A rectangular prism with length 5, width 2, and height 3 has volume 5 · 2 · 3 = 30 cubic units.",
      mistake: "Do not give volume in square units or area in cubic units. Unit paws matter.",
      testCue: "Look for cover, fill, surface area, prism, cylinder, cone, sphere, or composite shape."
    },
    {
      aliases: ["quadratics", "quadratic equations", "parabolas", "factoring quadratics"],
      title: "Quadratics",
      overview: "Quadratics are degree-2 expressions or functions, usually written ax² + bx + c. Their graphs are parabolas.",
      keyIdeas: ["The zeros are x-values where the graph crosses the x-axis.", "Factoring, completing the square, and the quadratic formula are solving methods.", "The vertex gives the maximum or minimum point of the parabola."],
      example: "x² - 5x + 6 factors as (x - 2)(x - 3), so the zeros are 2 and 3.",
      mistake: "Do not stop after factoring; set each factor equal to zero to solve.",
      testCue: "Look for parabola, vertex, zeros, roots, discriminant, or ax² + bx + c."
    },
    {
      aliases: ["polynomials", "polynomial operations", "factoring polynomials"],
      title: "Polynomials",
      overview: "Polynomials are sums of terms with variables raised to whole-number powers. They can be added, multiplied, factored, and analyzed by degree and leading coefficient.",
      keyIdeas: ["Like terms have the same variable powers and can be combined.", "Degree is the highest exponent in a one-variable polynomial.", "Factoring rewrites a polynomial as multiplied pieces."],
      example: "(x + 2)(x + 3) = x² + 5x + 6 by distribution.",
      mistake: "Do not combine unlike terms, such as x² and x, just because both contain x.",
      testCue: "Look for degree, leading coefficient, factor, expand, zeros, or end behavior."
    },
    {
      aliases: ["rational expressions", "rational equations", "fractions with variables"],
      title: "Rational expressions",
      overview: "Rational expressions are fractions with polynomials. They follow fraction rules, but variable restrictions matter because denominators cannot be zero.",
      keyIdeas: ["Factor before canceling; only common factors can cancel.", "State excluded values from denominators.", "Use common denominators to add or subtract rational expressions."],
      example: "(x² - 9)/(x - 3) simplifies to x + 3, but x cannot equal 3.",
      mistake: "Do not cancel terms across addition or subtraction; cancel common factors only.",
      testCue: "Look for variable denominators, excluded values, simplify, complex fractions, or rational equations."
    },
    {
      aliases: ["exponential functions", "exponential growth", "exponential decay"],
      title: "Exponential functions",
      overview: "Exponential functions have the variable in the exponent. They model repeated multiplication such as growth, decay, doubling, or halving.",
      keyIdeas: ["A basic model is y = a · b^x, where a is the initial value and b is the growth or decay factor.", "If b > 1, the function grows; if 0 < b < 1, it decays.", "Equal x-steps multiply y by the same factor."],
      example: "If a population doubles each hour from 100, the model is P = 100 · 2^t.",
      mistake: "Do not treat exponential growth as adding the same amount each time; it multiplies.",
      testCue: "Look for doubles, halves, percent growth/decay, compound interest, or y = a · b^x."
    },
    {
      aliases: ["logarithms", "logs", "log rules", "inverse of exponential"],
      title: "Logarithms",
      overview: "A logarithm answers the question: what exponent do I need? Logs are inverses of exponential functions.",
      keyIdeas: ["log_b(x) = y means b^y = x.", "Log rules come from exponent rules.", "The log input must be positive."],
      example: "log_2(8) = 3 because 2^3 = 8.",
      mistake: "Do not take the log of zero or a negative number in real-number algebra.",
      testCue: "Look for solve for an exponent, log notation, exponential equations, pH, or decibels."
    },
    {
      aliases: ["complex numbers", "imaginary numbers", "i", "complex plane"],
      title: "Complex numbers",
      overview: "Complex numbers have a real part and an imaginary part, written a + bi. The imaginary unit i satisfies i² = -1.",
      keyIdeas: ["Add and subtract complex numbers by combining real parts and imaginary parts.", "Multiplying uses distribution plus i² = -1.", "Complex conjugates help divide complex numbers."],
      example: "(3 + 2i) + (1 - 5i) = 4 - 3i.",
      mistake: "Do not treat i² as positive 1; i² equals -1.",
      testCue: "Look for square roots of negatives, a + bi form, conjugates, or the complex plane."
    },
    {
      aliases: ["trigonometric functions", "trig functions", "sine", "cosine", "tangent"],
      title: "Trigonometric functions",
      overview: "Trigonometric functions connect angles to ratios and circular motion. Sine, cosine, and tangent can describe right triangles and points on the unit circle.",
      keyIdeas: ["In right triangles, SOH-CAH-TOA links sine, cosine, and tangent to side ratios.", "On the unit circle, cosine is the x-coordinate and sine is the y-coordinate.", "Trig functions are periodic, meaning their values repeat."],
      example: "sin(30°) = 1/2 because in a 30-60-90 triangle the opposite side is half the hypotenuse.",
      mistake: "Do not forget whether your calculator is in degrees or radians.",
      testCue: "Look for unit circle, radians, right triangles, periodic graphs, sine, cosine, or tangent."
    },
    {
      aliases: ["trig identities", "trigonometric identities", "pythagorean identity"],
      title: "Trig identities",
      overview: "Trig identities are equations involving trig functions that are true for allowed angle values. They help simplify expressions and solve trig equations.",
      keyIdeas: ["The Pythagorean identity sin²θ + cos²θ = 1 is a core tool.", "Rewrite tanθ as sinθ/cosθ when useful.", "Proving identities means transforming one side until it matches the other."],
      example: "1 - sin²θ can be rewritten as cos²θ using sin²θ + cos²θ = 1.",
      mistake: "Do not move terms across an identity proof like solving an equation unless your teacher allows equivalent transformations; show a clear chain.",
      testCue: "Look for simplify, verify, prove, exact trig values, or trig equations."
    },
    {
      aliases: ["vectors", "vector", "magnitude", "components"],
      title: "Vectors",
      overview: "Vectors have magnitude and direction. They can represent displacement, velocity, force, or any quantity where direction matters.",
      keyIdeas: ["Components split a vector into horizontal and vertical parts.", "Magnitude in 2D uses the Pythagorean theorem.", "Vector addition combines corresponding components."],
      example: "A vector <3, 4> has magnitude 5 because √(3² + 4²) = 5.",
      mistake: "Do not add magnitudes only when directions differ; use components.",
      testCue: "Look for arrows, components, magnitude, direction, dot product, or projection."
    },
    {
      aliases: ["sequences and series", "sequences", "series", "arithmetic sequence", "geometric series"],
      title: "Sequences and series",
      overview: "A sequence is an ordered list of numbers, while a series is a sum of sequence terms. Patterns can be arithmetic, geometric, or more complex.",
      keyIdeas: ["Arithmetic sequences add a common difference.", "Geometric sequences multiply by a common ratio.", "A finite series has a set number of terms; infinite series need convergence checks."],
      example: "2, 6, 18, 54 is geometric with common ratio 3.",
      mistake: "Do not use an arithmetic formula on a geometric pattern just because the numbers are increasing.",
      testCue: "Look for nth term, common difference, common ratio, summation notation, or convergence."
    },
    {
      aliases: ["polar coordinates", "polar", "r theta", "polar graphs"],
      title: "Polar coordinates",
      overview: "Polar coordinates locate points by distance from the origin and angle from a reference direction. A point is written as (r, θ).",
      keyIdeas: ["r tells how far from the pole; θ tells the angle.", "Convert with x = r cosθ and y = r sinθ.", "The same point can have multiple polar names because angles repeat."],
      example: "The polar point (2, π/2) is two units up from the origin, so it corresponds to (0, 2).",
      mistake: "Do not assume polar coordinates are unique; adding 2π to the angle can describe the same point.",
      testCue: "Look for r, θ, polar graph, convert to rectangular, or rose/limacon/cardioid curves."
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
      aliases: ["derivative applications", "applications of derivatives", "related rates", "curve sketching"],
      title: "Derivative applications",
      overview: "Derivative applications use rates of change to answer real questions about motion, graph behavior, approximation, and optimization.",
      keyIdeas: ["First derivatives identify increasing/decreasing intervals and critical points.", "Second derivatives describe concavity and can support max/min tests.", "Related rates connect changing quantities using an equation and implicit differentiation."],
      example: "If revenue R(x) has derivative R′(x), then R′(100) estimates the extra revenue from selling one more item near 100 items.",
      mistake: "Do not find a derivative and stop; interpret it in the units and context of the problem.",
      testCue: "Look for maximize, minimize, velocity, acceleration, related rates, marginal, or graph shape."
    },
    {
      aliases: ["intro integrals", "integrals", "antiderivatives", "definite integrals"],
      title: "Intro integrals",
      overview: "Integrals accumulate quantities. An indefinite integral finds a family of antiderivatives; a definite integral gives signed accumulation over an interval.",
      keyIdeas: ["Antiderivatives reverse differentiation.", "A definite integral can represent area under a curve or total change.", "The Fundamental Theorem of Calculus connects derivatives and integrals."],
      example: "∫ 2x dx = x² + C because the derivative of x² is 2x.",
      mistake: "Do not forget + C on indefinite integrals.",
      testCue: "Look for area under curve, total change, antiderivative, ∫ notation, or accumulation."
    },
    {
      aliases: ["optimization", "max min", "maximize", "minimize"],
      title: "Optimization",
      overview: "Optimization uses derivatives to find the maximum or minimum value of a quantity under given constraints.",
      keyIdeas: ["Define the quantity to optimize before differentiating.", "Use constraints to rewrite the quantity in one variable when possible.", "Critical points and endpoints are candidates for absolute maxima or minima."],
      example: "To maximize area with fixed perimeter, write area in terms of one side length, differentiate, set the derivative to zero, then check candidates.",
      mistake: "Do not ignore endpoints or domain restrictions; the best answer must be allowed by the problem.",
      testCue: "Look for greatest, least, maximize, minimize, optimal, cost, area, volume, or constraints."
    },
    {
      aliases: ["integration techniques", "u substitution", "integration by parts", "partial fractions"],
      title: "Integration techniques",
      overview: "Integration techniques are strategies for finding antiderivatives when basic reverse power rules are not enough.",
      keyIdeas: ["u-substitution reverses the chain rule.", "Integration by parts reverses the product rule.", "Partial fractions break rational functions into simpler pieces."],
      example: "For ∫ 2x cos(x²) dx, let u = x² so du = 2x dx, giving ∫ cos(u) du.",
      mistake: "Do not choose a method mechanically; look for the derivative of an inside function, products, or rational factors.",
      testCue: "Look for substitution patterns, products, rational functions, trig powers, or tables of methods."
    },
    {
      aliases: ["applications of integrals", "integral applications", "area between curves", "volume by shells", "volume by washers"],
      title: "Applications of integrals",
      overview: "Applications of integrals use accumulation to compute area, volume, average value, work, and other totals.",
      keyIdeas: ["Area between curves uses top minus bottom or right minus left.", "Washer and shell methods compute volumes of solids of revolution.", "Units help identify what the integral is accumulating."],
      example: "The area between y = x and y = x² from 0 to 1 is ∫₀¹ (x - x²) dx.",
      mistake: "Do not integrate bottom minus top for area unless you want a negative warning from Kiwi.",
      testCue: "Look for area between curves, volume, work, average value, density, or total amount."
    },
    {
      aliases: ["parametric equations", "parametric curves", "x t y t"],
      title: "Parametric equations",
      overview: "Parametric equations describe x and y separately as functions of a parameter, often time. They are useful for motion and curves that are not simple functions y = f(x).",
      keyIdeas: ["The parameter links x(t) and y(t).", "Velocity components come from dx/dt and dy/dt.", "You can sometimes eliminate the parameter to get a rectangular equation."],
      example: "x = t and y = t² traces the parabola y = x² as t changes.",
      mistake: "Do not treat t like x unless you have converted correctly; it controls both coordinates.",
      testCue: "Look for x(t), y(t), dy/dx from derivatives, motion, orientation, or eliminating t."
    },
    {
      aliases: ["polar integrals", "polar area", "area in polar"],
      title: "Polar integrals",
      overview: "Polar integrals accumulate area or length for curves described by r as a function of θ. The polar area formula includes 1/2 r².",
      keyIdeas: ["Polar area uses A = 1/2 ∫ r² dθ.", "Bounds are angle values, not x-values.", "Graphing the polar curve helps avoid integrating the wrong loop."],
      example: "The area swept by r = 2 from θ = 0 to π/2 is 1/2 ∫₀^(π/2) 4 dθ = π.",
      mistake: "Do not use rectangular area formulas without converting; polar slices are sectors.",
      testCue: "Look for r(θ), rose curves, loops, cardioids, sector area, or polar bounds."
    },
    {
      aliases: ["vectors in space", "3d vectors", "space vectors", "planes and lines"],
      title: "Vectors in space",
      overview: "Vectors in space extend vector ideas to three dimensions. They describe points, directions, lines, planes, motion, and geometry in 3D.",
      keyIdeas: ["A 3D vector has components like <a, b, c>.", "Dot products measure alignment; cross products produce a perpendicular vector.", "Lines and planes can be written with points and direction or normal vectors."],
      example: "The vector <1, 2, 2> has magnitude √(1² + 2² + 2²) = 3.",
      mistake: "Do not use 2D formulas and forget the z-component.",
      testCue: "Look for 3D coordinates, dot product, cross product, normal vector, line, plane, or distance."
    },
    {
      aliases: ["partial derivatives", "partials", "multivariable derivatives"],
      title: "Partial derivatives",
      overview: "Partial derivatives measure how a multivariable function changes with respect to one variable while holding the others constant.",
      keyIdeas: ["For f_x, treat y and other variables as constants.", "Partial derivatives help describe slopes, tangent planes, and gradients.", "The gradient points in the direction of steepest increase."],
      example: "If f(x, y) = x²y + y³, then f_x = 2xy and f_y = x² + 3y².",
      mistake: "Do not differentiate every variable at once; each partial has a chosen variable.",
      testCue: "Look for f_x, f_y, tangent planes, gradient, level curves, or multivariable rates."
    },
    {
      aliases: ["multiple integrals", "double integrals", "triple integrals"],
      title: "Multiple integrals",
      overview: "Multiple integrals add up a quantity over a two-dimensional region or three-dimensional solid. A double integral accumulates over area; a triple integral accumulates over volume.",
      keyIdeas: ["The bounds describe the region, so sketching the region matters.", "Order of integration tells which variable is accumulated first.", "The integrand describes what you are adding: area density, mass density, volume slices, or another quantity."],
      example: "A double integral of 1 over a region gives the region's area; a double integral of density over a plate gives mass.",
      mistake: "Do not choose bounds before understanding the shape. Sketch first, integrate second. Kiwi insists.",
      testCue: "Look for region R, bounds, dA/dV, changing order, volume, mass, or density."
    },
    {
      aliases: ["line integrals", "line integral", "vector fields", "work integral"],
      title: "Line integrals",
      overview: "Line integrals accumulate a scalar or vector-field quantity along a curve. They can measure work, circulation, mass along a wire, or flow along a path.",
      keyIdeas: ["Parameterize the curve before integrating.", "Scalar line integrals use arc length; vector line integrals use the field dotted with the motion direction.", "Orientation matters for vector line integrals."],
      example: "Work done by force field F along path C is ∫_C F · dr.",
      mistake: "Do not ignore direction when integrating a vector field; reversing the path can change the sign.",
      testCue: "Look for path C, vector field F, work, circulation, parameterization, or ∫_C notation."
    },
    {
      aliases: ["surface integrals", "surface integral", "flux", "surface area integrals"],
      title: "Surface integrals",
      overview: "Surface integrals accumulate quantities over curved surfaces. For vector fields, they often measure flux passing through a surface.",
      keyIdeas: ["Describe or parameterize the surface before integrating.", "Flux depends on the field, the surface, and the chosen normal direction.", "Surface area integrals add tiny surface patches dS."],
      example: "Flux through a surface measures how much of a vector field passes through it, like fluid through a net.",
      mistake: "Do not forget orientation for flux problems; inward and outward normals can change the sign.",
      testCue: "Look for surface S, flux, normal vector, dS, parameterized surfaces, or divergence/Stokes connections."
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

const SOURCE_LIBRARY = {
  chemistry: [
    {
      aliases: ["significant figures", "significant figure", "sig figs", "sig fig", "sigfigs", "significant digits", "significiant figures", "significiant figure", "signficant figures", "measurement precision", "rounding measured values"],
      title: "Significant figures",
      sources: [
        {
          label: "OpenStax Chemistry 2e — Measurement Uncertainty, Accuracy, and Precision",
          url: "https://openstax.org/books/chemistry-2e/pages/1-5-measurement-uncertainty-accuracy-and-precision",
          note: "Textbook section on uncertainty, precision, and reporting measured values."
        },
        {
          label: "Khan Academy — Significant figures review",
          url: "https://www.khanacademy.org/math/arithmetic-home/arith-review-decimals/arithmetic-significant-figures-tutorial/a/significant-figures-review",
          note: "Student-friendly rules for identifying and calculating with significant figures."
        },
        {
          label: "Wikipedia — Significant figures",
          url: "https://en.wikipedia.org/wiki/Significant_figures",
          note: "Quick reference for terminology and examples; cross-check with your class/textbook rules."
        }
      ]
    },
    {
      aliases: ["kinetics", "chemical kinetics", "reaction rates", "reaction rate", "rate law", "rate laws", "activation energy", "arrhenius equation", "reaction mechanisms"],
      title: "Kinetics",
      sources: [
        {
          label: "OpenStax Chemistry 2e — Chemical Reaction Rates",
          url: "https://openstax.org/books/chemistry-2e/pages/12-1-chemical-reaction-rates",
          note: "Textbook section defining reaction rates and concentration-over-time rate calculations."
        },
        {
          label: "OpenStax Chemistry 2e — Rate Laws",
          url: "https://openstax.org/books/chemistry-2e/pages/12-3-rate-laws",
          note: "Textbook section on rate laws, reaction order, and rate constants."
        },
        {
          label: "Khan Academy — Kinetics",
          url: "https://www.khanacademy.org/science/chemistry/chem-kinetics",
          note: "Student-friendly lessons and worked examples for rates, rate laws, and mechanisms."
        },
        {
          label: "Wikipedia — Chemical kinetics",
          url: "https://en.wikipedia.org/wiki/Chemical_kinetics",
          note: "Quick orientation source for vocabulary and scope; verify details with class materials."
        }
      ]
    }
  ]
};

function findSourceEntry(subjectKey, cleanTopic) {
  const normalizedTopic = normalizeForLookup(cleanTopic);
  const entries = SOURCE_LIBRARY[subjectKey] || [];
  return entries.find(entry => entry.aliases.some(alias => {
    const normalizedAlias = normalizeForLookup(alias);
    return normalizedTopic === normalizedAlias || normalizedTopic.includes(normalizedAlias) || normalizedAlias.includes(normalizedTopic);
  }));
}

function formatSources(sources) {
  return sources.map((source, index) => `${index + 1}. ${source.label}\n   ${source.url}\n   Why Kiwi picked it: ${source.note}`).join("\n");
}

function buildSourceSearches(subjectKey, cleanTopic) {
  const subject = getSubject(subjectKey);
  const query = `${cleanTopic} ${subject.label}`.trim();
  const encodedTopic = encodeURIComponent(cleanTopic);
  const encodedQuery = encodeURIComponent(query);
  return [
    {
      label: "OpenStax search",
      url: `https://openstax.org/search?q=${encodedQuery}`,
      note: "Good first stop for free textbook chapters and review sections."
    },
    {
      label: "Khan Academy search",
      url: `https://www.khanacademy.org/search?page_search_query=${encodedTopic}`,
      note: "Useful for student-friendly explanations and worked examples."
    },
    {
      label: "Google Scholar search",
      url: `https://scholar.google.com/scholar?q=${encodedQuery}`,
      note: "Use this when you need more academic or primary-source material."
    },
    {
      label: "Wikipedia search",
      url: `https://en.wikipedia.org/w/index.php?search=${encodedQuery}`,
      note: "Fast orientation source; verify details with textbook or class materials."
    }
  ];
}

function buildInlineSourceBlock(subjectKey, cleanTopic) {
  const sourceEntry = findSourceEntry(subjectKey, cleanTopic);
  if (sourceEntry) {
    const topSources = sourceEntry.sources.slice(0, 2);
    return `\n\nSource check:\n${formatSources(topSources)}`;
  }
  const searchSources = buildSourceSearches(subjectKey, cleanTopic).slice(0, 3);
  return `\n\nSource check:\nKiwi does not have a curated source card for this custom topic yet, so verify it with these search links before memorizing:\n${formatSources(searchSources)}`;
}

function buildSourceResponse({ subjectKey, cleanTopic }) {
  const sourceEntry = findSourceEntry(subjectKey, cleanTopic);
  if (sourceEntry) {
    return `Source starter pack: ${sourceEntry.title}\n\nCurated sources Kiwi can point you to:\n${formatSources(sourceEntry.sources)}\n\nUse these to verify rules/examples before trusting any generated explanation. Tiny citation paws deployed.`;
  }

  const searchSources = buildSourceSearches(subjectKey, cleanTopic);
  return `Source starter pack: ${cleanTopic}\n\nI do not have a curated source card for this custom topic yet, so Kiwi built reliable search links instead:\n${formatSources(searchSources)}\n\nBest workflow: open 2 sources, paste the class definition or example into the notes box, then ask Kiwi to teach/practice from that source-backed note.`;
}

function buildFallbackExplanation({ subject, subjectKey, cleanTopic, level, notes }) {
  const sourceBlock = buildInlineSourceBlock(subjectKey, cleanTopic);
  const hasNotes = Boolean(notes && notes.trim());
  const noteFocus = hasNotes ? notes.trim().slice(0, 260) + (notes.trim().length > 260 ? "…" : "") : "";

  if (!hasNotes) {
    return `Custom topic needs a source-backed anchor: ${cleanTopic}${level}\n\nI do not have a verified built-in lesson for “${cleanTopic}” yet, so Kiwi will not invent a definition or facts.\n\nTo get correct custom-topic help:\n1. Paste your class definition, textbook excerpt, or teacher example into the notes box.\n2. Use Find Sources to open a reliable source if you do not have notes yet.\n3. Ask for Explain, Practice Problem, Flashcards, or Study Guide again; Kiwi will build from that source-backed anchor.\n\nWhat Kiwi can safely do now:\n• Keep the exact custom topic: ${cleanTopic}.\n• Give source links for ${subject.label}.\n• Avoid making up details just because the topic sounds like it belongs to a subject.${sourceBlock}`;
  }

  return `Custom Kiwi lesson: ${cleanTopic}${level}\n\nWorking definition from your notes:\n${noteFocus}\n\nWhat Kiwi can safely say:\n• This custom-topic output is based on your pasted prompt/notes, not an invented built-in lesson.\n• Use the note wording above as the definition or starting claim until you replace it with your teacher/textbook wording.\n• The safest example is the one already present in your prompt or notes.\n\nExample from your prompt/notes:\n${noteFocus}\n\nCommon mistake:\nDo not let Kiwi guess extra facts for ${cleanTopic}. If your class uses a specific definition, formula, diagram, source, or exception, paste it into the notes box so the output stays tied to that evidence.\n\nHow to recognize it on a test:\nLook for the exact keywords from your notes, related data/diagrams, or a prompt asking you to explain, calculate, compare, or apply ${cleanTopic}.${sourceBlock}`;
}

function buildTopicExplanation({ subjectKey, cleanTopic, notes, confidenceLine, noteHint, state = DEFAULT_STATE }) {
  const subject = getSubject(subjectKey);
  const level = subjectKey === "math" ? ` (${state.activeMathLevel})` : "";
  const explanation = findExplanation(subjectKey, cleanTopic);
  if (!explanation) {
    return `${buildFallbackExplanation({ subject, subjectKey, cleanTopic, level, notes })}\n\n${confidenceLine}\n${noteHint}`;
  }
  const noteFocus = notes && notes.trim() ? `\n\nYour note/question focus: “${notes.trim().slice(0, 180)}${notes.trim().length > 180 ? "…" : ""}”` : "";
  const sourceBlock = buildInlineSourceBlock(subjectKey, cleanTopic);
  return `${explanation.title}${level}: actual Kiwi explanation\n\n${explanation.overview}\n\nKey ideas:\n${explanation.keyIdeas.map(item => `• ${item}`).join("\n")}\n\nExample:\n${explanation.example}\n\nCommon mistake:\n${explanation.mistake}\n\nHow to recognize it on a test:\n${explanation.testCue}${noteFocus}${sourceBlock}\n\n${confidenceLine}\n${noteHint}`;
}

const PRACTICE_LIBRARY = {
  stoichiometry: `Kiwi-generated practice: Stoichiometry\n\nConceptual questions\n1. Why must a stoichiometry problem start with a balanced chemical equation?\n2. What is the difference between a coefficient and a subscript?\n\nMath-based free response questions\n1. Balanced equation: 2 H2 + O2 → 2 H2O\nIf you start with 4.00 g of H2 and excess O2, how many grams of H2O can form? Show your work with the full grams → moles → mole ratio → grams path.\n2. Balanced equation: N2 + 3 H2 → 2 NH3\nIf 6.0 mol H2 reacts with excess N2, how many mol NH3 can form? Show your work and identify the mole ratio.\n\nTry first, then check below. Tiny paws over the answer key until you attempt it.\n\nAnswer key\nConceptual 1. The balanced equation gives the mole ratios; without it, the recipe is wrong.\nConceptual 2. Coefficients compare amounts of substances in a reaction; subscripts count atoms inside one formula.\nFree response 1. 4.00 g H2 × (1 mol H2 / 2.016 g) × (2 mol H2O / 2 mol H2) × (18.016 g H2O / 1 mol) ≈ 35.7 g H2O.\nFree response 2. 6.0 mol H2 × (2 mol NH3 / 3 mol H2) = 4.0 mol NH3.\n\nKiwi check: the balanced equation gives the mole ratio, not the subscripts.`,
  molarity: `Kiwi-generated practice: Molarity\n\nConceptual questions\n1. What does molarity measure in a solution?\n2. Why does volume usually need to be converted from mL to L before calculating molarity?\n\nMath-based free response questions\n1. You dissolve 0.75 mol NaCl to make 3.0 L of solution. What is the molarity? Show your work.\n2. How many moles of glucose are in 250 mL of a 0.400 M glucose solution? Show your work with the liter conversion.\n\nAnswer key\nConceptual 1. Molarity is moles of solute per liter of solution.\nConceptual 2. Molarity's unit is mol/L, so mL must become L to match the formula.\nFree response 1. M = 0.75 mol ÷ 3.0 L = 0.25 M.\nFree response 2. 250 mL = 0.250 L, so moles = 0.400 M × 0.250 L = 0.100 mol.\n\nKiwi check: milliliters must become liters before the math goblins touch it.`,
  "kinetics chemical kinetics reaction rates reaction rate rate law rate laws activation energy arrhenius equation reaction mechanisms": `Kiwi-generated practice: Kinetics\n\nConceptual questions\n1. What does a reaction rate measure, and why is it usually written as a concentration change over time?\n2. Why can a catalyst change the rate without changing the final equilibrium position?\n\nMath-based free response questions\n1. A reaction has rate = k[A]^2. If [A] changes from 0.20 M to 0.40 M, by what factor does the rate change? Show your work.\n2. Initial-rate data for A → products: Trial 1 has [A] = 0.10 M and rate = 0.020 M/s. Trial 2 has [A] = 0.20 M and rate = 0.080 M/s. Determine the order in A and calculate k using Trial 1. Show your work with units.\n\nAnswer key\nConceptual 1. Rate measures how fast reactant or product concentration changes, such as −Δ[A]/Δt or Δ[P]/Δt.\nConceptual 2. A catalyst lowers activation energy or provides an alternate pathway, so more collisions succeed per second; it does not change ΔG or K, so equilibrium composition stays the same.\nFree response 1. [A] doubles, and the reaction is second order in A, so the rate changes by 2^2 = 4. The rate is 4 times faster.\nFree response 2. Doubling [A] makes rate quadruple, so 2^n = 4 and n = 2. For rate = k[A]^2, k = rate/[A]^2 = 0.020/(0.10)^2 = 2.0 M^-1 s^-1.\n\nKiwi check: rate-law exponents come from data unless the step is elementary; do not steal them from the overall balanced equation.`,
  "significant figures significant figure sig figs sig fig sigfigs significant digits significiant figures significiant figure signficant figures": `Kiwi-generated practice: Significant figures\n\nConceptual questions\n1. Why do significant figures matter when reporting lab measurements?\n2. Is the zero in 0.00450 significant? Explain which zeros count and which zeros only place the decimal.\n\nMath-based free response questions\n1. Count significant figures: 0.00450 has how many significant figures? Then round 0.00450 to 2 significant figures. Show your work.\n2. Apply the operation rules: calculate 12.40 + 0.3 and 4.20 × 3.1. Round each final answer correctly and explain whether you used decimal places or fewest significant figures. Show your work.\n\nAnswer key\nConceptual 1. Significant figures show measurement precision, so the final answer should not claim more precision than the measured data supports.\nConceptual 2. Leading zeros are not significant; captive zeros and decimal trailing zeros after a measured nonzero digit are significant. In 0.00450, the two zeros before 4 are placeholders, while the final zero after 5 is significant.\nFree response 1. 0.00450 has 3 significant figures: 4, 5, and the final 0. Rounded to 2 significant figures, 0.00450 becomes 0.0045.\nFree response 2. Addition/subtraction uses decimal places: 12.40 + 0.3 = 12.7 because the least precise term has 1 decimal place. Multiplication/division uses fewest significant figures: 4.20 × 3.1 = 13 because 13.02 rounds to 2 significant figures.\n\nKiwi check: addition/subtraction = decimal places; multiplication/division = fewest significant figures. Tiny measurement paws, no fake precision.`,
  "cell membranes": `Kiwi-generated practice: Cell membranes\n\nConceptual questions\n1. What does selectively permeable mean?\n2. Why do ions usually need transport proteins to cross a membrane?\n\nFree response questions\n1. A cell is placed in a very salty solution. Predict the direction water moves and explain why.\n2. Compare oxygen crossing the phospholipid bilayer with sodium ions crossing it. Use membrane structure in your answer.\n\nAnswer key\nConceptual 1. Some substances cross easily, while others are blocked or need help.\nConceptual 2. Ions are charged, so the hydrophobic membrane interior repels them unless a protein channel or pump helps.\nFree response 1. Water moves out of the cell by osmosis because the outside has higher solute concentration.\nFree response 2. Oxygen is small and nonpolar, so it can pass through the hydrophobic bilayer; sodium is charged and needs a protein channel.`,
  derivatives: `Kiwi-generated practice: Derivatives\n\nConceptual questions\n1. What does a derivative measure at one point?\n2. How is a derivative different from an average rate of change?\n\nMath-based free response questions\n1. Find f′(x) if f(x) = 4x^3 - 5x + 2. Show your work with the power rule.\n2. If s(t) = t^2 + 3t, what is the velocity at t = 4? Show your work and explain why velocity is a derivative.\n\nAnswer key\nConceptual 1. A derivative measures instantaneous rate of change, or tangent slope.\nConceptual 2. Average rate uses an interval; a derivative describes the rate at a single instant.\nFree response 1. f′(x) = 12x^2 - 5.\nFree response 2. v(t) = s′(t) = 2t + 3, so v(4) = 11.\n\nKiwi check: derivative means instantaneous rate of change, not the whole-trip average.`
};

const STEM_MATH_FREE_RESPONSE_LIBRARY = {
  "periodic trends": {
    "q1": "Rank Li, Na, and K from smallest to largest atomic radius using their group positions (periods 2, 3, 4).",
    "q2": "Which has the higher first ionization energy, Mg (period 3, group 2) or Al (period 3, group 13)? Use effective nuclear charge to justify your choice.",
    "a1": "Li < Na < K because radius increases down a group as more electron shells are added.",
    "a2": "Mg is slightly higher than Al in the common intro trend exception because Al's first removed electron is in a higher-energy 3p orbital; the key calculation-style comparison is same period + shielding/orbital reasoning."
  },
  "acids and bases": {
    "q1": "Calculate the pH of a solution with [H+] = 1.0 × 10^-3 M.",
    "q2": "A 25.0 mL sample of 0.100 M HCl is neutralized by 0.100 M NaOH. What volume of NaOH is needed?",
    "a1": "pH = -log(1.0 × 10^-3) = 3.00.",
    "a2": "M1V1 = M2V2 for 1:1 neutralization, so V2 = (0.100 M × 25.0 mL)/(0.100 M) = 25.0 mL NaOH."
  },
  "equilibrium": {
    "q1": "For N2O4(g) ⇌ 2 NO2(g), write Kc if [NO2] = 0.20 M and [N2O4] = 0.50 M, then calculate it.",
    "q2": "For A ⇌ B with K = 4.0 and Q = 1.0, which direction will the system shift? Use the Q vs. K comparison.",
    "a1": "Kc = [NO2]^2/[N2O4] = (0.20)^2/0.50 = 0.080.",
    "a2": "Since Q < K, the reaction shifts right toward products until Q increases to K."
  },
  "kinematics": {
    "q1": "A cart starts from rest and accelerates at 2.0 m/s^2 for 5.0 s. Find its final velocity.",
    "q2": "A runner moves from x = 3 m to x = 15 m in 4 s. Calculate displacement and average velocity.",
    "a1": "v = v0 + at = 0 + (2.0)(5.0) = 10 m/s.",
    "a2": "Δx = 15 - 3 = 12 m; average velocity = Δx/t = 12/4 = 3 m/s."
  },
  "forces": {
    "q1": "A 4.0 kg box has a net force of 20 N to the right. Calculate its acceleration.",
    "q2": "A 10 kg object rests on a level table. Calculate its weight using g = 9.8 m/s^2 and name the normal force if it is not accelerating vertically.",
    "a1": "a = Fnet/m = 20 N / 4.0 kg = 5.0 m/s^2 to the right.",
    "a2": "Weight = mg = 10 × 9.8 = 98 N downward; normal force = 98 N upward."
  },
  "energy": {
    "q1": "Calculate the kinetic energy of a 3.0 kg object moving at 4.0 m/s.",
    "q2": "A 2.0 kg book is lifted 1.5 m. Calculate its gain in gravitational potential energy using g = 9.8 m/s^2.",
    "a1": "KE = 1/2 mv^2 = 0.5(3.0)(4.0^2) = 24 J.",
    "a2": "ΔPE = mgh = (2.0)(9.8)(1.5) = 29.4 J."
  },
  "momentum": {
    "q1": "Calculate the momentum of a 2.0 kg cart moving at 3.0 m/s east.",
    "q2": "A 1.0 kg cart moving at 4.0 m/s sticks to a 3.0 kg cart at rest. Find their final speed.",
    "a1": "p = mv = (2.0)(3.0) = 6.0 kg·m/s east.",
    "a2": "Conserve momentum: (1.0)(4.0) + (3.0)(0) = (4.0 kg)v, so v = 1.0 m/s."
  },
  "circuits": {
    "q1": "A 9.0 V battery is connected to a 3.0 Ω resistor. Calculate the current.",
    "q2": "Two resistors, 2.0 Ω and 4.0 Ω, are in series. Find equivalent resistance and current with a 12 V battery.",
    "a1": "I = V/R = 9.0/3.0 = 3.0 A.",
    "a2": "R_eq = 2.0 + 4.0 = 6.0 Ω; I = V/R = 12/6.0 = 2.0 A."
  },
  "linear equations": {
    "q1": "Solve 3x + 5 = 20.",
    "q2": "Find the slope and y-intercept of y = -2x + 7.",
    "a1": "3x = 15, so x = 5.",
    "a2": "Slope m = -2 and y-intercept b = 7."
  },
  "systems of equations": {
    "q1": "Solve the system x + y = 9 and x - y = 3.",
    "q2": "Use substitution to solve y = 2x + 1 and y = x + 5.",
    "a1": "Add equations: 2x = 12, so x = 6; then y = 3.",
    "a2": "2x + 1 = x + 5, so x = 4 and y = 9."
  },
  "inequalities": {
    "q1": "Solve -2x + 3 < 11.",
    "q2": "Graph-style answer: solve 4x - 1 ≥ 7 and state whether the endpoint is open or closed.",
    "a1": "-2x < 8; divide by -2 and flip the sign: x > -4.",
    "a2": "4x ≥ 8, so x ≥ 2 with a closed circle at 2."
  },
  "functions": {
    "q1": "If f(x) = x^2 - 3x, calculate f(5).",
    "q2": "For g(x) = 2x + 7, solve g(x) = 15.",
    "a1": "f(5) = 25 - 15 = 10.",
    "a2": "2x + 7 = 15, so 2x = 8 and x = 4."
  },
  "exponents": {
    "q1": "Simplify x^3 · x^5.",
    "q2": "Rewrite 2^-3 as a fraction and calculate its value.",
    "a1": "Same base multiplication adds exponents: x^(3+5) = x^8.",
    "a2": "2^-3 = 1/2^3 = 1/8."
  },
  "angles": {
    "q1": "Two supplementary angles have measures 3x and 2x + 30. Find x and both angles.",
    "q2": "If one vertical angle is 68°, what is the measure of the opposite angle and an adjacent supplementary angle?",
    "a1": "3x + 2x + 30 = 180, so 5x = 150 and x = 30; angles are 90° and 90°.",
    "a2": "Opposite vertical angle = 68°; adjacent supplementary angle = 180 - 68 = 112°."
  },
  "triangles": {
    "q1": "A right triangle has legs 6 and 8. Find the hypotenuse.",
    "q2": "A triangle has angles 45° and 65°. Find the third angle.",
    "a1": "c = √(6^2 + 8^2) = √100 = 10.",
    "a2": "Third angle = 180° - 45° - 65° = 70°."
  },
  "congruence": {
    "q1": "Two triangles have sides 5, 7, 9 and 5, 7, 9. Name the congruence shortcut.",
    "q2": "If triangle ABC ≅ triangle DEF and AB = 8, what corresponding side equals 8?",
    "a1": "SSS congruence because all 3 corresponding sides match.",
    "a2": "AB corresponds to DE, so DE = 8."
  },
  "similarity": {
    "q1": "Two similar triangles have scale factor 3 from small to large. If a small side is 4, find the matching large side.",
    "q2": "A 5 cm side corresponds to a 20 cm side. Find the scale factor and the matching length for a 7 cm side.",
    "a1": "Large side = 4 × 3 = 12.",
    "a2": "Scale factor = 20/5 = 4; matching side = 7 × 4 = 28 cm."
  },
  "circles": {
    "q1": "Find the circumference of a circle with radius 6. Leave your answer in terms of π.",
    "q2": "Find the area of a circle with diameter 10.",
    "a1": "C = 2πr = 2π(6) = 12π.",
    "a2": "Radius = 5, so A = πr^2 = 25π."
  },
  "area and volume": {
    "q1": "Find the area of a rectangle with length 8 and width 5.",
    "q2": "Find the volume of a cylinder with radius 3 and height 10. Leave in terms of π.",
    "a1": "A = lw = 8 × 5 = 40 square units.",
    "a2": "V = πr^2h = π(3^2)(10) = 90π cubic units."
  },
  "quadratics": {
    "q1": "Solve x^2 - 5x + 6 = 0 by factoring.",
    "q2": "Find the vertex x-value of y = x^2 - 4x + 7 using x = -b/(2a).",
    "a1": "(x - 2)(x - 3) = 0, so x = 2 or x = 3.",
    "a2": "x = -(-4)/(2·1) = 2."
  },
  "polynomials": {
    "q1": "Expand (x + 4)(x - 2).",
    "q2": "Combine like terms: 3x^2 + 4x - 2x^2 + 7x.",
    "a1": "x^2 - 2x + 4x - 8 = x^2 + 2x - 8.",
    "a2": "(3x^2 - 2x^2) + (4x + 7x) = x^2 + 11x."
  },
  "rational expressions": {
    "q1": "Simplify (x^2 - 9)/(x - 3) and state the excluded value.",
    "q2": "Add 1/x + 2/x.",
    "a1": "Factor: (x - 3)(x + 3)/(x - 3) = x + 3, with x ≠ 3.",
    "a2": "Same denominator, so 1/x + 2/x = 3/x."
  },
  "exponential functions": {
    "q1": "A population starts at 200 and doubles every hour. Write P(t) and find P(3).",
    "q2": "A value starts at 80 and decays by 25% each step. Write the multiplier and find the value after 2 steps.",
    "a1": "P(t) = 200·2^t; P(3) = 200·8 = 1600.",
    "a2": "Multiplier = 0.75; value = 80(0.75)^2 = 45."
  },
  "logarithms": {
    "q1": "Evaluate log_2(32).",
    "q2": "Solve log_10(x) = 3.",
    "a1": "log_2(32) = 5 because 2^5 = 32.",
    "a2": "x = 10^3 = 1000."
  },
  "complex numbers": {
    "q1": "Add (3 + 2i) + (5 - 7i).",
    "q2": "Multiply (2 + i)(3 - 4i).",
    "a1": "Real parts: 3 + 5 = 8; imaginary parts: 2i - 7i = -5i, so 8 - 5i.",
    "a2": "6 - 8i + 3i - 4i^2 = 6 - 5i + 4 = 10 - 5i."
  },
  "trigonometric functions": {
    "q1": "In a right triangle, opposite = 3 and hypotenuse = 5. Find sin(θ).",
    "q2": "If cos(θ) = 12/13 in a right triangle, find the adjacent side when hypotenuse = 26.",
    "a1": "sin(θ) = opposite/hypotenuse = 3/5.",
    "a2": "12/13 = adjacent/26, so adjacent = 24."
  },
  "trig identities": {
    "q1": "Use sin^2θ + cos^2θ = 1. If sinθ = 3/5 and θ is acute, find cosθ.",
    "q2": "Simplify 1 - sin^2θ.",
    "a1": "cos^2θ = 1 - 9/25 = 16/25, so cosθ = 4/5 for acute θ.",
    "a2": "1 - sin^2θ = cos^2θ."
  },
  "vectors": {
    "q1": "Find the magnitude of vector <6, 8>.",
    "q2": "Add vectors <2, -1> and <5, 4>.",
    "a1": "|v| = √(6^2 + 8^2) = √100 = 10.",
    "a2": "Add components: <2 + 5, -1 + 4> = <7, 3>."
  },
  "sequences and series": {
    "q1": "Find the 8th term of the arithmetic sequence 5, 9, 13, ...",
    "q2": "Find the sum of the first 4 terms of the geometric sequence 3, 6, 12, ...",
    "a1": "a_n = 5 + (n - 1)4, so a_8 = 5 + 28 = 33.",
    "a2": "First 4 terms are 3 + 6 + 12 + 24 = 45."
  },
  "polar coordinates": {
    "q1": "Convert the polar point (4, π/2) to rectangular coordinates.",
    "q2": "For r = 3 and θ = 0, find x and y.",
    "a1": "x = r cosθ = 4·0 = 0; y = r sinθ = 4·1 = 4, so (0, 4).",
    "a2": "x = 3 cos0 = 3; y = 3 sin0 = 0, so (3, 0)."
  },
  "limits": {
    "q1": "Evaluate lim x→2 of (x^2 - 4)/(x - 2).",
    "q2": "From the function f(x) = 3x + 1, find lim x→4 f(x).",
    "a1": "Factor (x - 2)(x + 2)/(x - 2), then limit = 2 + 2 = 4.",
    "a2": "Direct substitution works: 3(4) + 1 = 13."
  },
  "derivative applications": {
    "q1": "For f(x) = x^2 - 6x + 5, find the critical point and say whether it is a minimum or maximum.",
    "q2": "If s(t) = t^3, find velocity and acceleration at t = 2.",
    "a1": "f′(x) = 2x - 6; set 0 to get x = 3. Since f″(x) = 2 > 0, it is a minimum.",
    "a2": "v(t) = 3t^2, so v(2) = 12; a(t) = 6t, so a(2) = 12."
  },
  "intro integrals": {
    "q1": "Find ∫ 6x^2 dx.",
    "q2": "Evaluate ∫ from 0 to 2 of 3x dx.",
    "a1": "∫ 6x^2 dx = 2x^3 + C.",
    "a2": "Antiderivative is (3/2)x^2; from 0 to 2 gives (3/2)(4) = 6."
  },
  "optimization": {
    "q1": "A rectangle has perimeter 20, so y = 10 - x. Maximize A = x(10 - x). Find x and y.",
    "q2": "For C(x) = x^2 - 8x + 20, find the x-value that minimizes cost.",
    "a1": "A = 10x - x^2; A′ = 10 - 2x = 0 gives x = 5, y = 5.",
    "a2": "C′(x) = 2x - 8 = 0, so x = 4; C″ = 2 > 0 confirms minimum."
  },
  "integration techniques": {
    "q1": "Use u-substitution to evaluate ∫ 2x(x^2 + 1)^3 dx.",
    "q2": "Use integration by parts setup for ∫ x e^x dx; choose u and dv.",
    "a1": "Let u = x^2 + 1, du = 2x dx. Integral becomes ∫ u^3 du = u^4/4 + C = (x^2 + 1)^4/4 + C.",
    "a2": "Choose u = x and dv = e^x dx, so du = dx and v = e^x; result is x e^x - e^x + C."
  },
  "applications of integrals": {
    "q1": "Find the area between y = x and y = x^2 from x = 0 to x = 1.",
    "q2": "Find the average value of f(x) = 2x on [0, 4].",
    "a1": "Area = ∫_0^1 (x - x^2) dx = [x^2/2 - x^3/3]_0^1 = 1/2 - 1/3 = 1/6.",
    "a2": "Average value = (1/(4 - 0))∫_0^4 2x dx = (1/4)[x^2]_0^4 = 4."
  },
  "parametric equations": {
    "q1": "For x(t) = t + 1 and y(t) = t^2, find the point when t = 3.",
    "q2": "For x(t) = 2t and y(t) = t^2, find dy/dx at t = 2.",
    "a1": "x = 3 + 1 = 4 and y = 3^2 = 9, so (4, 9).",
    "a2": "dy/dx = (dy/dt)/(dx/dt) = (2t)/2 = t, so at t = 2, dy/dx = 2."
  },
  "polar integrals": {
    "q1": "Find the polar area for r = 2 from θ = 0 to θ = π/2.",
    "q2": "Set up the area integral for r = 3 from θ = 0 to θ = π.",
    "a1": "A = 1/2∫_0^(π/2) r^2 dθ = 1/2∫_0^(π/2)4 dθ = π.",
    "a2": "A = 1/2∫_0^π 9 dθ = 9π/2."
  },
  "vectors in space": {
    "q1": "Find the magnitude of <1, 2, 2>.",
    "q2": "Compute the dot product <1, 3, -2> · <4, 0, 5>.",
    "a1": "|v| = √(1^2 + 2^2 + 2^2) = √9 = 3.",
    "a2": "Dot product = 1·4 + 3·0 + (-2)·5 = 4 + 0 - 10 = -6."
  },
  "partial derivatives": {
    "q1": "For f(x, y) = x^2y + 3y, find f_x.",
    "q2": "For f(x, y) = x^2y + 3y, find f_y at (2, 1).",
    "a1": "Treat y as constant: f_x = 2xy.",
    "a2": "f_y = x^2 + 3; at (2, 1), f_y = 4 + 3 = 7."
  },
  "multiple integrals": {
    "q1": "Evaluate ∫_0^2 ∫_0^3 1 dy dx.",
    "q2": "Evaluate ∫_0^1 ∫_0^2 x dy dx.",
    "a1": "Inner integral gives 3; outer ∫_0^2 3 dx = 6.",
    "a2": "Inner integral with respect to y gives 2x; ∫_0^1 2x dx = 1."
  },
  "line integrals": {
    "q1": "For F = <2, 0> along a straight path from (0, 0) to (3, 0), compute work ∫ F · dr.",
    "q2": "Parameterize the line from (0, 0) to (2, 2) as r(t) for 0 ≤ t ≤ 1.",
    "a1": "Force and displacement align: work = 2 × 3 = 6 J.",
    "a2": "r(t) = <2t, 2t>, 0 ≤ t ≤ 1."
  },
  "surface integrals": {
    "q1": "For a flat square surface of area 6 with constant field F = <0, 0, 2> and upward normal, compute flux.",
    "q2": "A rectangular plate has length 3 and width 4. Set up ∫∫_S 5 dS for constant density 5.",
    "a1": "Flux = F · n × area = 2 × 6 = 12.",
    "a2": "∫∫_S 5 dS = 5(area) = 5(3 × 4) = 60."
  }
};

const STEM_SUBJECT_KEYS = new Set(["chemistry", "physics", "math"]);

function findPracticeEntry(library, cleanTopic) {
  const normalizedTopic = normalizeForLookup(cleanTopic);
  const entries = Object.entries(library).sort((a, b) => normalizeForLookup(b[0]).length - normalizeForLookup(a[0]).length);
  return entries.find(([key]) => {
    const normalizedKey = normalizeForLookup(key);
    return normalizedTopic === normalizedKey || normalizedTopic.includes(normalizedKey) || normalizedKey.includes(normalizedTopic);
  });
}

function buildStemMathFreeResponse(cleanTopic, notes = "") {
  const direct = findPracticeEntry(STEM_MATH_FREE_RESPONSE_LIBRARY, cleanTopic)?.[1];
  if (direct) return direct;
  const noteFocus = notes && notes.trim() ? notes.trim().slice(0, 140) + (notes.trim().length > 140 ? "…" : "") : `the rule, formula, or quantity your class uses for ${cleanTopic}`;
  return {
    q1: `Use this custom-topic anchor — ${noteFocus} — to set up one equation or calculation for ${cleanTopic} with numbers 12 and 3.`,
    q2: `Create a second calculation for ${cleanTopic} using 4 and 8, then solve it step by step with units or labels.`,
    a1: `A strong answer writes a formula/equation from the note anchor, substitutes 12 and 3, calculates a result, and labels what the result means.`,
    a2: `A strong answer includes a concrete equation with 4 and 8, the calculation, units/labels, and a final interpreted result.`
  };
}

function buildPracticeProblem({ subjectKey, topic, notes = "", state = DEFAULT_STATE }) {
  const subject = getSubject(subjectKey);
  const cleanTopic = normalizeTopic(topic || state.activeTopic, subjectKey, state);
  const directPractice = findPracticeEntry(PRACTICE_LIBRARY, cleanTopic);
  const sourceBlock = buildInlineSourceBlock(subjectKey, cleanTopic);
  if (directPractice) return `${directPractice[1]}${sourceBlock}`;

  const explanation = findExplanation(subjectKey, cleanTopic);
  const anchor = explanation?.title || cleanTopic;
  const hasNotes = Boolean(notes && notes.trim());

  if (!explanation && !hasNotes) {
    return `Custom practice needs a source-backed anchor: ${cleanTopic}\n\nI do not have a verified built-in practice set for “${cleanTopic}” yet, so Kiwi will not invent questions, formulas, examples, or solved answers.\n\nPaste your class definition, formula, data table, or example into the notes box. Then Kiwi can generate practice that stays tied to your topic instead of guessing.\n\nSafe practice starter for now:\n1. Find or paste one reliable definition for ${cleanTopic}.\n2. Underline the exact words, variables, dates, evidence, or diagram labels your class uses.\n3. Turn that source-backed information into one conceptual question and one free-response question.${sourceBlock}`;
  }

  const customNote = hasNotes ? notes.trim().slice(0, 180) + (notes.trim().length > 180 ? "…" : "") : "Add your class notes to make this custom practice more specific.";
  const keyIdea = explanation?.keyIdeas?.[0] || `Use this source-backed note as the core idea: ${customNote}`;
  const example = explanation?.example || `Use this notes/class prompt as evidence: ${customNote}`;

  if (STEM_SUBJECT_KEYS.has(subjectKey)) {
    const freeResponse = buildStemMathFreeResponse(cleanTopic, notes);
    return `Kiwi-generated practice: ${anchor}\n\nConceptual questions\n1. Explain ${anchor} in your own words, using the notes anchor below as evidence.\n2. Concept check: ${keyIdea}\n\nMath-based free response questions\n1. ${freeResponse.q1} Show your work.\n2. ${freeResponse.q2} Show your work.\n\nAnswer key\nConceptual 1. Strong answer uses the note anchor or built-in lesson instead of guessing extra facts.\nConceptual 2. Strong answer includes this core idea: ${keyIdea}\nFree response 1. ${freeResponse.a1}\nFree response 2. ${freeResponse.a2}\n\nCustom notes anchor:\n${customNote}\n\nKiwi check: this ${subject.label} practice set stays tied to built-in content or your pasted custom-topic anchor.${sourceBlock}`;
  }

  return `Kiwi-generated practice: ${anchor}\n\nConceptual questions\n1. Explain ${anchor} in your own words, using the notes anchor below as evidence.\n2. Concept check: ${keyIdea}\n\nFree response questions\n1. Apply this topic to a full-sentence response: ${example}\n2. Common mistake hunt: write one wrong answer someone might give for ${anchor}, then correct it using only the built-in lesson or your notes anchor.\n\nAnswer key\nConceptual 1. Strong answer defines the topic with evidence from the built-in lesson or notes anchor.\nConceptual 2. Strong answer includes this core idea: ${keyIdea}\nFree response 1. Strong answer connects the example back to the source-backed topic anchor and explains the reasoning.\nFree response 2. Strong answer identifies the misconception and fixes it with evidence.\n\nCustom notes anchor:\n${customNote}\n\nKiwi check: this ${subject.label} practice set has both conceptual and free-response questions, but custom topics stay anchored to your notes instead of invented facts.${sourceBlock}`;
}

function compactNoteAnchor(notes, fallback) {
  const cleanNotes = notes && notes.trim();
  if (!cleanNotes) return fallback;
  return cleanNotes.slice(0, 180) + (cleanNotes.length > 180 ? "…" : "");
}

function buildStudyContentAnchor({ subjectKey, cleanTopic, notes = "" }) {
  const subject = getSubject(subjectKey);
  const explanation = findExplanation(subjectKey, cleanTopic);
  const customNote = compactNoteAnchor(notes, `Add class notes to make Kiwi's custom ${subject.label} content more specific.`);

  if (explanation) {
    return {
      title: explanation.title,
      overview: explanation.overview,
      keyIdeas: explanation.keyIdeas,
      example: explanation.example,
      mistake: explanation.mistake,
      testCue: explanation.testCue,
      isCustom: false,
      customNote
    };
  }

  return {
    title: cleanTopic,
    overview: `Custom topic anchor: ${customNote}`,
    keyIdeas: [
      `Define ${cleanTopic} using the exact rule, process, claim, or structure from your class materials.`,
      `Connect the topic to one example so it is not just vocabulary floating in space.`,
      `Name the clue that tells you a question is testing ${cleanTopic}.`
    ],
    example: `Use this notes anchor as Kiwi's starting example: ${customNote}`,
    mistake: `Do not memorize ${cleanTopic} as isolated words. Tie each detail to the class note, formula, evidence, or example that makes it true.`,
    testCue: `Look for your teacher's keywords, given data, scenario clues, or prompt language that point back to ${cleanTopic}.`,
    isCustom: true,
    customNote
  };
}

function buildKiwiFlashcards({ subjectKey, cleanTopic, notes = "", state = DEFAULT_STATE }) {
  const anchor = buildStudyContentAnchor({ subjectKey, cleanTopic, notes });
  const level = subjectKey === "math" ? ` (${state.activeMathLevel})` : "";
  const ideaOne = anchor.keyIdeas[0];
  const ideaTwo = anchor.keyIdeas[1] || anchor.keyIdeas[0];
  const ideaThree = anchor.keyIdeas[2] || anchor.keyIdeas[0];
  const sourceBlock = buildInlineSourceBlock(subjectKey, cleanTopic);
  const customLine = anchor.isCustom ? `\nCustom topic anchor:\n${anchor.customNote}\n` : "";

  return `Kiwi-generated flashcards: ${anchor.title}${level}\nTopic/subtopic: ${cleanTopic}\n\nCard 1\nFront: What is ${anchor.title}?\nBack: ${anchor.overview}\n\nCard 2\nFront: What is one must-know idea for ${anchor.title}?\nBack: ${ideaOne}\n\nCard 3\nFront: What second clue or rule should you remember?\nBack: ${ideaTwo}\n\nCard 4\nFront: How can ${anchor.title} show up in an example?\nBack: ${anchor.example}\n\nCard 5\nFront: What common mistake should you avoid?\nBack: ${anchor.mistake}\n\nCard 6\nFront: How will Kiwi recognize this on a quiz or test?\nBack: ${anchor.testCue}\n\nBonus paw card\nFront: What is the tiny one-sentence summary?\nBack: ${ideaThree}\n${customLine}\nKiwi check: this deck is already generated for the topic; you can copy it straight into cards and edit wording if your class uses a special definition.${sourceBlock}`;
}

function buildKiwiStudyGuide({ subjectKey, cleanTopic, notes = "", state = DEFAULT_STATE }) {
  const subject = getSubject(subjectKey);
  const anchor = buildStudyContentAnchor({ subjectKey, cleanTopic, notes });
  const level = subjectKey === "math" ? ` (${state.activeMathLevel})` : "";
  const sourceBlock = buildInlineSourceBlock(subjectKey, cleanTopic);
  const mustKnow = anchor.keyIdeas.map((idea, index) => `${index + 1}. ${idea}`).join("\n");
  const customSection = anchor.isCustom ? `\n\nCustom topic anchor\n${anchor.customNote}` : "";
  const stemCheck = STEM_SUBJECT_KEYS.has(subjectKey)
    ? `Set up one calculation, formula, graph, unit conversion, or data-based step connected to ${anchor.title}. Show your work and label units when possible.`
    : `Explain ${anchor.title} in a few sentences, then support it with one example, piece of evidence, or scenario clue.`;

  return `Kiwi-generated study guide: ${anchor.title}${level}\nTopic/subtopic: ${cleanTopic}\n\nSubject focus: ${subject.label}\n\nBig idea\n${anchor.overview}\n\nMust-know ideas\n${mustKnow}\n\nKey vocabulary / formulas / cues\n• Main term: ${anchor.title}\n• Recognition cue: ${anchor.testCue}\n• Class-note cue: ${anchor.customNote}\n\nWorked example\n${anchor.example}\n\nCommon mistake\n${anchor.mistake}\n\nQuick check\n1. Define ${anchor.title} without looking.\n2. ${stemCheck}\n3. Explain the common mistake and how to fix it.\n\n7-minute review plan\n1. Read the big idea once.\n2. Cover the Must-know ideas and recite them.\n3. Redo the worked example or make a parallel example.\n4. Answer the Quick check.\n5. Mark confidence: low, okay, or strong.${customSection}\n\nKiwi check: this is a filled-in study guide for ${anchor.title}, not a blank template for you to generate alone.${sourceBlock}`;
}

function buildKiwiQuiz({ subjectKey, cleanTopic, notes = "", state = DEFAULT_STATE }) {
  const anchor = buildStudyContentAnchor({ subjectKey, cleanTopic, notes });
  const level = subjectKey === "math" ? ` (${state.activeMathLevel})` : "";
  const sourceBlock = anchor.isCustom ? buildInlineSourceBlock(subjectKey, cleanTopic) : "";

  if (anchor.isCustom && !(notes && notes.trim())) {
    return `Quick Kiwi quiz needs a source-backed anchor: ${cleanTopic}${level}\n\nI do not have a verified built-in lesson for this custom topic yet, so Kiwi will not quiz you on made-up facts. Paste your class definition, prompt, or example into the notes box first.${sourceBlock}`;
  }

  return `Quick Kiwi quiz for ${anchor.title}${level}\nTopic/subtopic: ${cleanTopic}\n\nNotes/topic anchor:\n${anchor.customNote}\n\nQ1. Using the anchor above, what is the safest definition or central claim for ${anchor.title}?\nQ2. What detail, formula, evidence, or example from the anchor proves this is about ${anchor.title}?\nQ3. What is one mistake someone could make if they guessed beyond the provided anchor?\n\nAnswer check\n1. Your answer should reuse the built-in lesson or pasted notes, not invented facts.\n2. Your evidence should point to exact wording, data, a formula, or a scenario clue.\n3. The corrected mistake should stay inside the source-backed information Kiwi has.${sourceBlock}`;
}

function buildKiwiSummary({ subjectKey, cleanTopic, notes = "", state = DEFAULT_STATE }) {
  const anchor = buildStudyContentAnchor({ subjectKey, cleanTopic, notes });
  const level = subjectKey === "math" ? ` (${state.activeMathLevel})` : "";
  const sourceBlock = anchor.isCustom ? buildInlineSourceBlock(subjectKey, cleanTopic) : "";

  if (anchor.isCustom && !(notes && notes.trim())) {
    return `Summary needs a source-backed anchor: ${cleanTopic}${level}\n\nI do not have a verified built-in lesson for this custom topic yet. Paste your class definition, textbook line, teacher prompt, or example into the notes box, and Kiwi will summarize that exact information instead of guessing.${sourceBlock}`;
  }

  return `Kiwi summary for ${anchor.title}${level}\nTopic/subtopic: ${cleanTopic}\n\nSource-backed anchor:\n${anchor.customNote}\n\nBig idea:\n${anchor.overview}\n\nTest-relevant details:\n${anchor.keyIdeas.map(item => `• ${item}`).join("\n")}\n\nExample or evidence:\n${anchor.example}\n\nWatch-out:\n${anchor.mistake}\n\nOne-sentence review:\n${anchor.title} is the topic, and the safest summary is the built-in lesson or pasted note anchor above.${sourceBlock}`;
}

function buildStudyResponse({ subjectKey, action, topic, notes, confidence, state = DEFAULT_STATE }) {
  const subject = getSubject(subjectKey);
  const cleanTopic = normalizeTopic(topic, subjectKey, state);
  const noteHint = notes && notes.trim().length > 0 ? "I used your notes as the study target." : "Add notes if you want me to get more specific later.";
  const level = subjectKey === "math" ? ` (${state.activeMathLevel})` : "";
  const confidenceLine = confidence === "strong" ? "You marked this strong, so Kiwi will challenge you." : confidence === "okay" ? "You marked this okay, so Kiwi will tighten the wobbly bits." : "You marked this tiny panic, so Kiwi will go step-by-step.";

  const templates = {
    "Explain": buildTopicExplanation({ subjectKey, cleanTopic, notes, confidenceLine, noteHint, state }),
    "Quiz Me": buildKiwiQuiz({ subjectKey, cleanTopic, notes, state }),
    "Flashcards": buildKiwiFlashcards({ subjectKey, cleanTopic, notes, state }),
    "Practice Problem": buildPracticeProblem({ subjectKey, topic: cleanTopic, notes, state }),
    "Study Guide": buildKiwiStudyGuide({ subjectKey, cleanTopic, notes, state }),
    "Summarize Notes": buildKiwiSummary({ subjectKey, cleanTopic, notes, state }),
    "Find Sources": buildSourceResponse({ subjectKey, cleanTopic }),
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

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderOutput(value) {
    const escaped = escapeHtml(value);
    els.output.innerHTML = escaped.replace(/https?:\/\/[^\s]+/g, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
  }

  function getConfidence() {
    return document.querySelector('input[name="confidence"]:checked')?.value || "low";
  }

  function ensureActiveTopic() {
    const topics = getTopicsForSubject(state.activeSubject, state);
    if (!state.activeTopic || !topics.includes(state.activeTopic)) {
      state.activeTopic = topics[0];
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
    renderOutput(response);
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
    const topics = getTopicsForSubject(state.activeSubject, state);
    ensureActiveTopic();
    els.topicLibrary.innerHTML = topics.map(topic => `
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
    renderOutput(`${subject.voice}\n\nStudy mode is open. Pick a built-in topic and press “Teach this topic,” “Give me practice problems,” or “Find Sources.” Practice includes conceptual questions plus math-based free-response questions for math, chemistry, and physics. No prompt required — Kiwi brought the lesson plan.`);
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
    state.activeTopic = getTopicsForSubject(state.activeSubject, state)[0];
    els.topic.value = "";
    saveState(state);
    openStudyMode(true);
  });

  els.mathLevels.addEventListener("click", event => {
    const button = event.target.closest("[data-level]");
    if (!button) return;
    state.activeMathLevel = button.dataset.level;
    state.activeTopic = getTopicsForSubject("math", state)[0];
    els.topic.value = "";
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
    renderOutput(buildStudyResponse({
      subjectKey: state.activeSubject,
      action: "Explain",
      topic: state.activeTopic,
      notes: els.notes.value,
      confidence: getConfidence(),
      state
    }));
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
    renderOutput(response);
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
    renderOutput(buildStudyResponse({ subjectKey: weak.subjectKey, action: "Explain", topic: weak.topic, notes: "", confidence: "low", state }));
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
  module.exports = { SUBJECTS, DEFAULT_STATE, buildStudyResponse, buildPracticeProblem, buildWeakTopics, upsertTopic, normalizeTopic, getTopicsForSubject, loadState };
}
