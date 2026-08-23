import { HABIT_DEFINITIONS } from './habits';
import { createInitialState } from './state';
import type { DoseState, FunBrainState, GameState, HabitState } from './types';
import { todayKey } from './date';

function asBool(v: unknown, fallback = false): boolean {
  if (typeof v === 'boolean') return v;
  if (v === 'true') return true;
  if (v === 'false') return false;
  return fallback;
}

function asNum(v: unknown, fallback = 0): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function asStr(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function normalizeDoseDayLog(raw: unknown): GameState['doseDayLog'] {
  if (!raw || typeof raw !== 'object') return {};
  const out: GameState['doseDayLog'] = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') continue;
    const row = value as Record<string, unknown>;
    const total = Math.max(0, asNum(row.total, 0));
    const correct = Math.max(0, asNum(row.correct, 0));
    out[key] = {
      correct,
      total,
      pct: asNum(row.pct, total > 0 ? Math.round((100 * correct) / total) : 0),
      completed: asBool(row.completed),
      classLevel: row.classLevel === '12' ? '12' : '11',
      graded: asBool(row.graded, asBool(row.completed)),
    };
  }
  return out;
}

export function hydrateGameState(
  payload: Record<string, unknown> | null | undefined,
  rewardMap?: Record<string, { amount?: number }>,
): GameState {
  const base = createInitialState(rewardMap);
  if (!payload || typeof payload !== 'object') return base;

  const habitsFromPayload = Array.isArray(payload.habits)
    ? (payload.habits as Array<Record<string, unknown>>)
    : [];
  const doneIds = new Set(
    habitsFromPayload.filter((h) => asBool(h.done)).map((h) => asStr(h.id)),
  );
  // Legacy mobile key
  if (typeof payload.habitsChecked === 'number') {
    HABIT_DEFINITIONS.slice(0, asNum(payload.habitsChecked)).forEach((h) =>
      doneIds.add(h.id),
    );
  }

  const habits: HabitState[] = HABIT_DEFINITIONS.map((def) => {
    const prev = habitsFromPayload.find((h) => asStr(h.id) === def.id);
    return {
      id: def.id,
      icon: def.icon,
      bg: def.bg,
      name: def.name,
      sub: def.sub,
      desc: def.desc,
      benefits: def.benefits,
      rdm: rewardMap?.[def.rdmKey]?.amount ?? asNum(prev?.rdm, def.defaultRdm),
      done: doneIds.has(def.id),
    };
  });

  const doseRaw = (payload.dose || {}) as Record<string, unknown>;
  const dose: DoseState = {
    ...base.dose,
    index: asNum(doseRaw.index, 0),
    locked: asBool(doseRaw.locked),
    correct: asNum(doseRaw.correct, 0),
    completed: asBool(doseRaw.completed),
    running: false,
    timeLeft: asNum(doseRaw.timeLeft, base.dose.timeLeft),
    index11: asNum(doseRaw.index11, 0),
    locked11: asBool(doseRaw.locked11),
    correct11: asNum(doseRaw.correct11, 0),
    completed11: asBool(doseRaw.completed11),
    index12: asNum(doseRaw.index12, 0),
    locked12: asBool(doseRaw.locked12),
    correct12: asNum(doseRaw.correct12, 0),
    completed12: asBool(doseRaw.completed12),
    currentClass: doseRaw.currentClass === '12' ? '12' : '11',
    classChosen: asBool(doseRaw.classChosen),
    answers11: Array.isArray(doseRaw.answers11)
      ? (doseRaw.answers11 as number[])
      : [],
    answers12: Array.isArray(doseRaw.answers12)
      ? (doseRaw.answers12 as number[])
      : [],
    answerCorrect: Array.isArray(doseRaw.answerCorrect)
      ? (doseRaw.answerCorrect as boolean[]).map(Boolean)
      : [],
  };

  const fbRaw = (payload.funbrain || {}) as Record<string, unknown>;
  const funbrain: FunBrainState = {
    ...base.funbrain,
    score: asNum(fbRaw.score, 0),
    combo: asNum(fbRaw.combo, 0),
    highScore: asNum(fbRaw.highScore, 0),
    currentQuestionIndex: asNum(fbRaw.currentQuestionIndex, 0),
    answers: Array.isArray(fbRaw.answers)
      ? (fbRaw.answers as (number | null)[])
      : [],
    finished: asBool(fbRaw.finished),
    completed: asBool(fbRaw.completed),
    running: false,
    timeLeft: asNum(fbRaw.timeLeft, base.funbrain.timeLeft),
    answerCorrect: Array.isArray(fbRaw.answerCorrect)
      ? (fbRaw.answerCorrect as boolean[]).map(Boolean)
      : [],
    correctCount: asNum(fbRaw.correctCount, 0),
  };

  const today = todayKey();
  return {
    ...base,
    rdm: asNum(payload.rdm, 0),
    streak: asNum(payload.streak, 0),
    signedIn: asBool(payload.signedIn),
    pledgeAM: asBool(payload.pledgeAM || payload.signedMorning),
    pledgePM: asBool(payload.pledgePM || payload.signedNight),
    habits,
    dose,
    funbrain,
    history: Array.isArray(payload.history)
      ? (payload.history as GameState['history'])
      : [],
    joinedDate:
      typeof payload.joinedDate === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(payload.joinedDate)
        ? payload.joinedDate
        : today,
    lastActiveDate:
      typeof payload.lastActiveDate === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(payload.lastActiveDate)
        ? payload.lastActiveDate
        : today,
    doseRdmCredited: asNum(payload.doseRdmCredited, 0),
    funbrainRdmCredited: asNum(payload.funbrainRdmCredited, 0),
    puzzleCompleted: asBool(payload.puzzleCompleted),
    doseDayLog: normalizeDoseDayLog(payload.doseDayLog),
    dayCriteriaLog:
      payload.dayCriteriaLog && typeof payload.dayCriteriaLog === 'object'
        ? (payload.dayCriteriaLog as GameState['dayCriteriaLog'])
        : {},
    challengeEnrolledMonthKey:
      typeof payload.challengeEnrolledMonthKey === 'string'
        ? payload.challengeEnrolledMonthKey
        : null,
    challengeEnrolledMonths: Array.isArray(payload.challengeEnrolledMonths)
      ? (payload.challengeEnrolledMonths as string[])
      : [],
    challengePuzzleSubmittedMonthKey:
      typeof payload.challengePuzzleSubmittedMonthKey === 'string'
        ? payload.challengePuzzleSubmittedMonthKey
        : null,
    gyanTimeMs: asNum(payload.gyanTimeMs, 0),
    gyanUnlockedIds: Array.isArray(payload.gyanUnlockedIds)
      ? (payload.gyanUnlockedIds as string[])
      : base.gyanUnlockedIds,
    notifications: Array.isArray(payload.notifications)
      ? (payload.notifications as GameState['notifications'])
      : base.notifications,
  };
}

export function toPersistable(state: GameState): Record<string, unknown> {
  return {
    ...state,
    dose: { ...state.dose, running: false },
    funbrain: { ...state.funbrain, running: false },
    signedMorning: state.pledgeAM,
    signedNight: state.pledgePM,
    habitsChecked: state.habits.filter((h) => h.done).length,
  };
}
