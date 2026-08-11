import { HABIT_DEFINITIONS } from './habits';
import { todayKey, addDaysToKey, daysBetween } from './date';
import type { DayCriteria, GameState, HabitState } from './types';

export const DOSE_DURATION_SEC = 4 * 60;
export const FUNBRAIN_DURATION_SEC = 6 * 60;
export const DOSE_QUESTION_COUNT = 5;
export const FUNBRAIN_QUESTION_COUNT = 6;

export function createInitialState(rewardMap?: Record<string, { amount?: number }>): GameState {
  const habits: HabitState[] = HABIT_DEFINITIONS.map((h) => ({
    id: h.id,
    icon: h.icon,
    bg: h.bg,
    name: h.name,
    sub: h.sub,
    desc: h.desc,
    benefits: h.benefits,
    rdm: rewardMap?.[h.rdmKey]?.amount ?? h.defaultRdm,
    done: false,
  }));

  const today = todayKey();
  return {
    rdm: 0,
    streak: 0,
    signedIn: false,
    pledgeAM: false,
    pledgePM: false,
    habits,
    dose: {
      index: 0,
      locked: false,
      correct: 0,
      completed: false,
      running: false,
      timeLeft: DOSE_DURATION_SEC,
      index11: 0,
      locked11: false,
      correct11: 0,
      completed11: false,
      index12: 0,
      locked12: false,
      correct12: 0,
      completed12: false,
      currentClass: '11',
      classChosen: false,
      answers11: [],
      answers12: [],
    },
    funbrain: {
      running: false,
      timeLeft: FUNBRAIN_DURATION_SEC,
      score: 0,
      combo: 0,
      highScore: 0,
      currentQuestionIndex: 0,
      answers: [],
      finished: false,
      completed: false,
    },
    history: [],
    joinedDate: today,
    lastActiveDate: today,
    doseRdmCredited: 0,
    funbrainRdmCredited: 0,
    puzzleCompleted: false,
    doseDayLog: {},
    dayCriteriaLog: {},
    challengeEnrolledMonthKey: null,
    challengeEnrolledMonths: [],
    challengePuzzleSubmittedMonthKey: null,
    gyanTimeMs: 0,
    gyanUnlockedIds: ['velocity-vs-speed'],
    notifications: [
      {
        id: 'welcome',
        icon: '✨',
        text: "Welcome to Edubite — start with today's DailyDose.",
        targetView: 'dailydose',
        createdAt: new Date().toISOString(),
        read: false,
      },
    ],
  };
}

export function todayCriteria(state: GameState): DayCriteria {
  const habitsDone = state.habits.filter((h) => h.done).map((h) => h.id);
  return {
    dose: state.dose.completed,
    funbrain: state.funbrain.completed,
    puzzles: state.puzzleCompleted,
    habits: state.habits.length > 0 && state.habits.every((h) => h.done),
    pledges: state.pledgeAM && state.pledgePM,
    pledgeAM: state.pledgeAM,
    pledgePM: state.pledgePM,
    habitsDone,
  };
}

export function isFullDay(c: DayCriteria): boolean {
  return c.dose && c.funbrain && c.puzzles && c.habits && c.pledges;
}

export function mergeDayCriteria(
  prev: DayCriteria | undefined,
  live: DayCriteria,
): DayCriteria {
  const habitsDone = Array.from(
    new Set([...(prev?.habitsDone || []), ...(live.habitsDone || [])]),
  );
  const merged: DayCriteria = {
    dose: Boolean(live.dose || prev?.dose),
    funbrain: Boolean(live.funbrain || prev?.funbrain),
    puzzles: Boolean(live.puzzles || prev?.puzzles),
    habits: Boolean(live.habits || prev?.habits),
    pledges: Boolean(live.pledges || prev?.pledges),
    completedAt: prev?.completedAt ?? null,
    pledgeAM: Boolean(live.pledgeAM || prev?.pledgeAM),
    pledgePM: Boolean(live.pledgePM || prev?.pledgePM),
    habitsDone,
  };
  if (isFullDay(merged) && !merged.completedAt) {
    merged.completedAt = new Date().toISOString();
  }
  return merged;
}

export function withDerived(state: GameState): GameState {
  const today = todayKey();
  const live = todayCriteria(state);
  const dayCriteriaLog = {
    ...state.dayCriteriaLog,
    [today]: mergeDayCriteria(state.dayCriteriaLog[today], live),
  };
  return {
    ...state,
    dayCriteriaLog,
    streak: computeStreak({ ...state, dayCriteriaLog }, today),
    lastActiveDate: today,
  };
}

export function computeStreak(state: GameState, asOf: string = todayKey()): number {
  let streak = 0;
  let cursor = asOf;
  // Incomplete today doesn't break — skip today if not full yet
  const todayLog = state.dayCriteriaLog[asOf];
  if (!todayLog || !isFullDay(todayLog)) {
    cursor = addDaysToKey(asOf, -1);
  }
  for (let i = 0; i < 400; i++) {
    const log = state.dayCriteriaLog[cursor];
    if (!log || !isFullDay(log)) break;
    streak += 1;
    cursor = addDaysToKey(cursor, -1);
    if (daysBetween(state.joinedDate, cursor) < -1) break;
  }
  return streak;
}

export function rollDayIfNeeded(state: GameState): GameState {
  const today = todayKey();
  if (state.lastActiveDate === today) return state;

  const leaving = state.lastActiveDate;
  const snapshot = mergeDayCriteria(
    state.dayCriteriaLog[leaving],
    todayCriteria(state),
  );

  const resetHabits = state.habits.map((h) => ({ ...h, done: false }));
  const next: GameState = {
    ...state,
    habits: resetHabits,
    pledgeAM: false,
    pledgePM: false,
    puzzleCompleted: false,
    doseRdmCredited: 0,
    funbrainRdmCredited: 0,
    dose: {
      ...createInitialState().dose,
      currentClass: state.dose.currentClass,
      classChosen: state.dose.classChosen,
    },
    funbrain: {
      ...createInitialState().funbrain,
      highScore: state.funbrain.highScore,
    },
    dayCriteriaLog: {
      ...state.dayCriteriaLog,
      [leaving]: snapshot,
    },
    history: [...state.history, snapshot].slice(-60),
    lastActiveDate: today,
  };
  return withDerived(next);
}

export function getLevelInfo(rdm: number) {
  const LEVELS = [
    { level: 1, name: 'Curious Starter', rdmRequired: 0 },
    { level: 2, name: 'Daily Learner', rdmRequired: 500 },
    { level: 3, name: 'Focused Builder', rdmRequired: 1200 },
    { level: 4, name: 'Sharp Thinker', rdmRequired: 2100 },
    { level: 5, name: 'Concept Master', rdmRequired: 3400 },
    { level: 6, name: 'Exam Ready', rdmRequired: 5000 },
  ];
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = 0; i < LEVELS.length; i++) {
    if (rdm >= LEVELS[i].rdmRequired) {
      current = LEVELS[i];
      next = LEVELS[i + 1] ?? LEVELS[i];
    }
  }
  const range = next.rdmRequired - current.rdmRequired;
  const progress =
    range > 0
      ? Math.min(100, Math.round(((rdm - current.rdmRequired) / range) * 100))
      : 100;
  return {
    current,
    next,
    rdmToNext: Math.max(0, next.rdmRequired - rdm),
    progress,
  };
}
