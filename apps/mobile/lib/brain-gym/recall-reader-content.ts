import type { Difficulty } from "./types";
import { seededRandom } from "./utils/shuffle";

export const RECALL_READER_READING_MS = 15_000;
export const RECALL_READER_ROUNDS = 5;
export const RECALL_READER_MAX_LIVES = 3;
export const RECALL_READER_RECENT_ID_LIMIT = 50;

type QuestionField =
  | "subject"
  | "action"
  | "place"
  | "time"
  | "quantity"
  | "reason"
  | "outcome";

type ThemePack = {
  theme: string;
  subjects: string[];
  actions: string[];
  places: string[];
  times: string[];
  quantities: string[];
  reasons: string[];
  outcomes: string[];
};

export type RecallReaderItem = {
  id: string;
  paragraph: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type RecallReaderValidation = {
  ok: boolean;
  reason?: string;
};

type ScenarioParts = {
  theme: ThemePack;
  subject: string;
  action: string;
  place: string;
  time: string;
  quantity: string;
  reason: string;
  outcome: string;
  templateIndex: number;
  questionField: QuestionField;
};

const THEMES: ThemePack[] = [
  {
    theme: "science",
    subjects: ["Maya's science club", "the lab partners", "Nikhil's class", "the junior researchers"],
    actions: ["tested paper bridges", "measured seed growth", "sorted mineral samples", "observed a water filter"],
    places: ["physics lab", "school courtyard", "activity room", "science corner"],
    times: ["morning activity", "second period", "Friday workshop", "after-lunch session"],
    quantities: ["four samples", "six small cups", "three clear jars", "eight data cards"],
    reasons: ["they wanted fair results", "the teacher asked for careful evidence", "the class needed a simple comparison", "the group was checking one clear change"],
    outcomes: ["the folded design held the most weight", "the tallest sprout was recorded first", "the quartz sample was labelled correctly", "the cleanest water passed through last"],
  },
  {
    theme: "space",
    subjects: ["Aarav's astronomy group", "the planet club", "the space quiz team", "the observatory visitors"],
    actions: ["mapped moon phases", "compared planet sizes", "tracked a model satellite", "arranged constellation cards"],
    places: ["school terrace", "planetarium hall", "library display", "open field"],
    times: ["clear evening", "Saturday visit", "club hour", "winter sky watch"],
    quantities: ["five moon cards", "seven planet models", "three orbit charts", "nine star labels"],
    reasons: ["the sky was easy to see", "the guide wanted everyone to notice patterns", "the team was preparing for a quiz", "the class needed a neat sequence"],
    outcomes: ["the crescent phase was placed first", "Jupiter became the largest model", "the satellite path circled Earth", "Orion was found near the centre"],
  },
  {
    theme: "nature",
    subjects: ["the nature walkers", "Riya's eco club", "the garden monitors", "the field study team"],
    actions: ["counted fallen leaves", "checked soil moisture", "noted flower colours", "compared tree shade"],
    places: ["botanical garden", "school garden", "river path", "green park"],
    times: ["cool morning", "monsoon break", "spring visit", "weekly survey"],
    quantities: ["twelve leaves", "five soil patches", "four flower beds", "six shade spots"],
    reasons: ["they were studying seasonal change", "the plants needed regular care", "the notebook required exact observations", "the team wanted a fair comparison"],
    outcomes: ["the neem tree gave the widest shade", "the red flowers opened earliest", "the damp soil patch stayed coolest", "the smallest leaves came from the hedge"],
  },
  {
    theme: "animals",
    subjects: ["the animal care team", "Kabir's biology group", "the zoo volunteers", "the bird watchers"],
    actions: ["recorded feeding times", "compared bird calls", "checked habitat signs", "counted paw prints"],
    places: ["zoo learning centre", "wetland trail", "farm shelter", "forest edge"],
    times: ["early morning", "keeper's round", "weekend visit", "quiet afternoon"],
    quantities: ["three feeding bowls", "eight bird calls", "five habitat cards", "six paw prints"],
    reasons: ["they wanted calm observations", "the guide asked them to avoid guessing", "the animals were easiest to notice then", "the chart needed direct details"],
    outcomes: ["the parakeet call was heard most often", "the deer sign matched the card", "the brown bowl was filled first", "the smallest print led toward water"],
  },
  {
    theme: "inventions",
    subjects: ["the invention club", "Isha's design team", "the workshop students", "the young makers"],
    actions: ["built a lever model", "tested a wind-up car", "improved a pencil holder", "assembled a simple pulley"],
    places: ["maker room", "craft lab", "technology corner", "school workshop"],
    times: ["innovation period", "Tuesday practice", "demo hour", "after-school build"],
    quantities: ["two wooden sticks", "four rubber bands", "six cardboard pieces", "three small wheels"],
    reasons: ["they needed a low-cost design", "the model had to be easy to explain", "the team wanted fewer loose parts", "the challenge rewarded practical ideas"],
    outcomes: ["the pulley lifted the cup smoothly", "the car rolled past the chalk line", "the holder stood without support", "the lever moved the block easily"],
  },
  {
    theme: "sports",
    subjects: ["the sports squad", "Meera's relay team", "the cricket trainees", "the fitness group"],
    actions: ["planned relay turns", "timed short sprints", "practised catching drills", "compared jump distances"],
    places: ["school ground", "indoor court", "practice pitch", "running track"],
    times: ["games period", "warm-up round", "evening practice", "sports camp"],
    quantities: ["four baton passes", "six sprint trials", "ten catches", "five jump marks"],
    reasons: ["the coach wanted steady teamwork", "the team needed better timing", "the players were building accuracy", "the group was checking progress"],
    outcomes: ["the final pass was the smoothest", "the third sprint was fastest", "the blue cone marked the longest jump", "the keeper caught every high ball"],
  },
  {
    theme: "Indian history",
    subjects: ["the history circle", "Anaya's project group", "the museum learners", "the heritage club"],
    actions: ["arranged freedom movement cards", "studied an old coin display", "matched monument clues", "read a timeline poster"],
    places: ["heritage gallery", "school library", "museum room", "history corner"],
    times: ["Republic Day week", "project period", "museum visit", "morning assembly"],
    quantities: ["five timeline cards", "three coin sketches", "four monument clues", "six poster notes"],
    reasons: ["they were checking dates in order", "the teacher wanted evidence from the display", "the group needed facts for a chart", "the activity focused on careful reading"],
    outcomes: ["the Dandi March card came before Quit India", "the Ashoka coin sketch matched the label", "the Red Fort clue was solved first", "the earliest date went at the top"],
  },
  {
    theme: "geography",
    subjects: ["the map readers", "Vihaan's geography team", "the atlas club", "the field map group"],
    actions: ["marked river routes", "compared state outlines", "located mountain ranges", "checked rainfall symbols"],
    places: ["map room", "geography lab", "class display board", "atlas table"],
    times: ["map practice", "rainy afternoon", "revision hour", "group task"],
    quantities: ["four river labels", "seven state cards", "three mountain strips", "six rainfall symbols"],
    reasons: ["the class was learning location clues", "the teacher wanted neat map work", "the team needed accurate labels", "the exercise tested observation"],
    outcomes: ["the Ganga label reached the correct plain", "the Gujarat outline was matched first", "the Himalaya strip went along the north", "the heaviest rainfall symbol was circled"],
  },
  {
    theme: "health",
    subjects: ["the health monitors", "Sara's wellness group", "the first-aid learners", "the nutrition club"],
    actions: ["sorted balanced meal cards", "checked handwashing steps", "planned a hydration chart", "matched first-aid items"],
    places: ["wellness room", "school clinic", "dining hall board", "class notice area"],
    times: ["health week", "lunch break", "morning check", "activity period"],
    quantities: ["four food groups", "six handwashing steps", "three water reminders", "five first-aid cards"],
    reasons: ["the class wanted safer daily habits", "the nurse asked for clear instructions", "the chart needed easy reminders", "the activity focused on prevention"],
    outcomes: ["the fruit card completed the meal", "the soap step was placed second", "the noon reminder stayed on the chart", "the bandage card matched the small cut"],
  },
  {
    theme: "environment",
    subjects: ["the environment squad", "Neha's clean-up team", "the recycling club", "the water savers"],
    actions: ["sorted waste bins", "tracked tap use", "planted native shrubs", "checked classroom lights"],
    places: ["recycling corner", "school corridor", "community garden", "assembly area"],
    times: ["Earth Day drive", "last period", "Saturday clean-up", "green audit"],
    quantities: ["three labelled bins", "five tap checks", "six young shrubs", "eight light switches"],
    reasons: ["they wanted to reduce waste", "the school was saving water", "the garden needed local plants", "the audit looked for avoidable energy use"],
    outcomes: ["paper went into the blue bin", "the leaking tap was reported first", "the shrubs were watered before noon", "two unused lights were switched off"],
  },
  {
    theme: "art",
    subjects: ["the art studio group", "Tara's sketch team", "the mural club", "the craft learners"],
    actions: ["mixed poster colours", "planned a wall mural", "compared paper textures", "arranged clay shapes"],
    places: ["art room", "craft table", "mural wall", "display corner"],
    times: ["creative hour", "festival practice", "Friday studio time", "after-lunch workshop"],
    quantities: ["three paint shades", "four sketch panels", "six texture strips", "five clay shapes"],
    reasons: ["the design needed balance", "the display had limited space", "the teacher asked for clear contrast", "the group wanted a neat pattern"],
    outcomes: ["the green shade became the background", "the centre panel showed the river", "the rough paper held colour best", "the clay star went at the top"],
  },
  {
    theme: "everyday problem solving",
    subjects: ["the class helpers", "Dev's planning group", "the notice board team", "the library monitors"],
    actions: ["organized lost notebooks", "planned a seating chart", "sorted event tokens", "made a queue plan"],
    places: ["classroom desk", "library counter", "auditorium entrance", "notice board"],
    times: ["before assembly", "free period", "club meeting", "rainy dismissal"],
    quantities: ["seven notebooks", "four seat rows", "nine event tokens", "three queue lines"],
    reasons: ["students needed to find items quickly", "the room had to stay orderly", "the event required smooth entry", "the teacher wanted less confusion"],
    outcomes: ["the blue notebook was returned first", "the front row stayed empty for guests", "the green tokens went to volunteers", "the shortest line moved fastest"],
  },
  {
    theme: "music",
    subjects: ["the music club", "Arjun's rhythm group", "the choir learners", "the instrument team"],
    actions: ["practised a rhythm pattern", "sorted instrument cards", "timed chorus entries", "matched sound clips"],
    places: ["music room", "assembly stage", "practice hall", "audio corner"],
    times: ["rehearsal hour", "morning practice", "cultural week", "after-school session"],
    quantities: ["four drum beats", "six instrument cards", "three chorus entries", "five sound clips"],
    reasons: ["the song needed steady timing", "the teacher wanted careful listening", "the group was preparing for assembly", "the performance required clear starts"],
    outcomes: ["the tabla card matched the rhythm", "the second entry sounded clearest", "the flute clip was identified first", "the final beat ended together"],
  },
  {
    theme: "reading",
    subjects: ["the book club", "Pooja's reading group", "the library circle", "the story team"],
    actions: ["sequenced story events", "compared character notes", "sorted book summaries", "checked glossary words"],
    places: ["reading corner", "school library", "quiet classroom", "book display"],
    times: ["library period", "silent reading hour", "Monday session", "story workshop"],
    quantities: ["five event cards", "four character notes", "six summaries", "three glossary words"],
    reasons: ["the plot needed a clear order", "the group wanted exact text clues", "the librarian asked for neat labels", "the task tested careful reading"],
    outcomes: ["the rescue event came last", "the brave character note matched Leela", "the adventure summary was placed first", "the word 'harvest' meant crop gathering"],
  },
];

const QUESTION_FIELDS: Record<Difficulty, QuestionField[]> = {
  easy: ["subject", "action", "place", "outcome"],
  medium: ["time", "quantity", "reason", "outcome"],
  hard: ["reason", "quantity", "time", "outcome"],
};

const TEMPLATE_COUNT = 4;
const MAX_GENERATION_ATTEMPTS = 80;

function pickIndex(rand: () => number, length: number): number {
  return Math.floor(rand() * length);
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function normalizeOption(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function sentenceCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function makeParagraph(parts: ScenarioParts): string {
  const { subject, action, place, time, quantity, reason, outcome, templateIndex } = parts;
  const templates = [
    `${subject} ${action} at the ${place} during the ${time}. They worked with ${quantity} because ${reason}. After the task, ${outcome}.`,
    `During the ${time}, ${subject} ${action} at the ${place}. The group used ${quantity} because ${reason}, and ${outcome} before everyone packed up.`,
    `At the ${place}, ${subject} ${action} during the ${time}. With ${quantity} ready, they chose that plan because ${reason}. Soon, ${outcome}.`,
    `For a short class challenge, ${subject} ${action} at the ${place}. During the ${time}, ${quantity} helped them because ${reason}. The result was that ${outcome}.`,
  ];
  return templates[templateIndex]!;
}

function answerForField(parts: ScenarioParts, field: QuestionField): string {
  return parts[field];
}

function questionForField(field: QuestionField): string {
  switch (field) {
    case "subject":
      return "Who did the activity?";
    case "action":
      return "What activity did the group do?";
    case "place":
      return "Where did the activity happen?";
    case "time":
      return "When did the activity happen?";
    case "quantity":
      return "How many or how much did the group use?";
    case "reason":
      return "Why did the group choose that plan?";
    case "outcome":
      return "What happened by the end?";
  }
}

function valuesForField(field: QuestionField): string[] {
  return THEMES.flatMap((theme) => {
    switch (field) {
      case "subject":
        return theme.subjects;
      case "action":
        return theme.actions;
      case "place":
        return theme.places;
      case "time":
        return theme.times;
      case "quantity":
        return theme.quantities;
      case "reason":
        return theme.reasons;
      case "outcome":
        return theme.outcomes;
    }
  });
}

function hardDistractor(parts: ScenarioParts, field: QuestionField): string {
  if (field === "reason") return parts.outcome;
  if (field === "outcome") return parts.reason;
  if (field === "quantity") return parts.time;
  return parts.quantity;
}

function makeOptions(parts: ScenarioParts, difficulty: Difficulty, rand: () => number): string[] {
  const answer = answerForField(parts, parts.questionField);
  const optionSet = new Set<string>([answer]);
  if (difficulty === "hard") {
    optionSet.add(hardDistractor(parts, parts.questionField));
  }

  const pool = valuesForField(parts.questionField);
  let guard = 0;
  while (optionSet.size < 4 && guard < 200) {
    optionSet.add(pool[pickIndex(rand, pool.length)]!);
    guard++;
  }

  return Array.from(optionSet).slice(0, 4);
}

function shuffleWithSeed<T>(items: T[], rand: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = pickIndex(rand, i + 1);
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

function makeScenario(seed: number, difficulty: Difficulty, attempt: number): ScenarioParts {
  const rand = seededRandom(seed + attempt * 2_654_435_761);
  const theme = THEMES[pickIndex(rand, THEMES.length)]!;
  const questionFields = QUESTION_FIELDS[difficulty];
  return {
    theme,
    subject: theme.subjects[pickIndex(rand, theme.subjects.length)]!,
    action: theme.actions[pickIndex(rand, theme.actions.length)]!,
    place: theme.places[pickIndex(rand, theme.places.length)]!,
    time: theme.times[pickIndex(rand, theme.times.length)]!,
    quantity: theme.quantities[pickIndex(rand, theme.quantities.length)]!,
    reason: theme.reasons[pickIndex(rand, theme.reasons.length)]!,
    outcome: theme.outcomes[pickIndex(rand, theme.outcomes.length)]!,
    templateIndex:
      difficulty === "hard"
        ? 2 + pickIndex(rand, 2)
        : pickIndex(rand, TEMPLATE_COUNT),
    questionField: questionFields[pickIndex(rand, questionFields.length)]!,
  };
}

function makeId(parts: ScenarioParts): string {
  const themeIndex = THEMES.indexOf(parts.theme);
  return [
    "recall-reader",
    themeIndex,
    parts.theme.subjects.indexOf(parts.subject),
    parts.theme.actions.indexOf(parts.action),
    parts.theme.places.indexOf(parts.place),
    parts.theme.times.indexOf(parts.time),
    parts.theme.quantities.indexOf(parts.quantity),
    parts.theme.reasons.indexOf(parts.reason),
    parts.theme.outcomes.indexOf(parts.outcome),
    parts.templateIndex,
    parts.questionField,
  ].join("-");
}

function makeExplanation(parts: ScenarioParts): string {
  const answer = answerForField(parts, parts.questionField);
  return `The paragraph directly states ${sentenceCase(parts.questionField)}: ${answer}.`;
}

export function validateRecallReaderItem(item: RecallReaderItem): RecallReaderValidation {
  if (!item.id.trim()) return { ok: false, reason: "Missing id" };
  if (!item.paragraph.trim()) return { ok: false, reason: "Missing paragraph" };
  const words = wordCount(item.paragraph);
  if (words < 25 || words > 35) {
    return { ok: false, reason: `Paragraph has ${words} words` };
  }
  if (!item.question.trim()) return { ok: false, reason: "Missing question" };
  if (item.options.length !== 4) return { ok: false, reason: "Expected four options" };
  if (!item.options.every((option) => option.trim().length > 0)) {
    return { ok: false, reason: "Empty option" };
  }
  const normalized = item.options.map(normalizeOption);
  if (new Set(normalized).size !== 4) {
    return { ok: false, reason: "Duplicate options" };
  }
  if (!Number.isInteger(item.correctIndex) || item.correctIndex < 0 || item.correctIndex > 3) {
    return { ok: false, reason: "Invalid correct index" };
  }
  const correct = normalized[item.correctIndex]!;
  const overlaps = normalized.filter(
    (option, index) =>
      index !== item.correctIndex &&
      (option.includes(correct) || correct.includes(option)),
  );
  if (overlaps.length > 0) return { ok: false, reason: "Ambiguous answer choices" };
  if (!item.explanation.trim()) return { ok: false, reason: "Missing explanation" };
  return { ok: true };
}

export function generateRecallReaderItem(
  seed: number,
  difficulty: Difficulty,
  recentIds: readonly string[] = [],
): RecallReaderItem {
  const recent = new Set(recentIds.slice(-RECALL_READER_RECENT_ID_LIMIT));

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const parts = makeScenario(seed, difficulty, attempt);
    const id = makeId(parts);
    if (recent.has(id)) continue;

    const rand = seededRandom(seed ^ (attempt + 1) ^ 0x9e3779b9);
    const answer = answerForField(parts, parts.questionField);
    const options = shuffleWithSeed(makeOptions(parts, difficulty, rand), rand);
    const item: RecallReaderItem = {
      id,
      paragraph: makeParagraph(parts),
      question: questionForField(parts.questionField),
      options,
      correctIndex: options.indexOf(answer),
      explanation: makeExplanation(parts),
    };

    if (validateRecallReaderItem(item).ok) return item;
  }

  throw new Error("Unable to generate a valid Recall Reader item");
}

export function createRecallReaderSession(
  seed: number,
  difficulty: Difficulty,
  rounds = RECALL_READER_ROUNDS,
): RecallReaderItem[] {
  const items: RecallReaderItem[] = [];
  const recentIds: string[] = [];

  for (let round = 0; round < rounds; round++) {
    const item = generateRecallReaderItem(seed + round * 9973, difficulty, recentIds);
    items.push(item);
    recentIds.push(item.id);
    if (recentIds.length > RECALL_READER_RECENT_ID_LIMIT) recentIds.shift();
  }

  return items;
}

export function scoreRecallReaderAnswer(
  difficulty: Difficulty,
  round: number,
  answerTimeMs: number,
  multiplier: number,
): number {
  const base = Math.round(70 * multiplier);
  const speedWindowMs = difficulty === "hard" ? 10_000 : 8_000;
  const speedRatio = Math.max(0, 1 - answerTimeMs / speedWindowMs);
  const speedBonus = Math.round(25 * multiplier * speedRatio);
  return base + speedBonus + round * 5;
}

export const RECALL_READER_SCENARIO_SPACE = THEMES.reduce((total, theme) => {
  return (
    total +
    theme.subjects.length *
      theme.actions.length *
      theme.places.length *
      theme.times.length *
      theme.quantities.length *
      theme.reasons.length *
      theme.outcomes.length *
      TEMPLATE_COUNT *
      7
  );
}, 0);
