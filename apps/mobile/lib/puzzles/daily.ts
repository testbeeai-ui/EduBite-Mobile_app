import { ORIGINAL_PUZZLES, PUZZLES } from './catalog';
import type { PuzzleDef } from './types';
import { addDaysToKey, todayKey } from '../game/date';

const DAY_MS = 24 * 60 * 60 * 1_000;
const COMPETITIVE_LAUNCH_ORDINAL = Math.floor(
  Date.UTC(2026, 6, 20) / DAY_MS,
);
const FIRST_LAUNCH_PUZZLE_ID = "competitive-s1-q1";
const SHUFFLE_VERSION = "edubite-puzzle-cycle-v1";
const puzzleCycleCache = new Map<number, PuzzleDef[]>();

function hashSeed(value: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const shuffled = [...items];
  const random = seededRandom(seed);
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex]!,
      shuffled[index]!,
    ];
  }
  return shuffled;
}

function mixByTopic(
  puzzles: readonly PuzzleDef[],
  seed: number,
  previousTopic: string | null,
): PuzzleDef[] {
  const shuffled = seededShuffle(puzzles, seed);
  const groups = new Map<string, PuzzleDef[]>();
  for (const puzzle of shuffled) {
    const group = groups.get(puzzle.topic) ?? [];
    group.push(puzzle);
    groups.set(puzzle.topic, group);
  }

  const topicOrder = seededShuffle(
    [...groups.keys()],
    seed ^ 0x9e3779b9,
  );
  const random = seededRandom(seed ^ 0x85ebca6b);
  const mixed: PuzzleDef[] = [];
  let lastTopic = previousTopic;

  while (mixed.length < puzzles.length) {
    const availableTopics = topicOrder.filter(
      (topic) => (groups.get(topic)?.length ?? 0) > 0,
    );
    const differentTopics = availableTopics.filter(
      (topic) => topic !== lastTopic,
    );
    const candidates =
      differentTopics.length > 0 ? differentTopics : availableTopics;
    const remainingAfterPick = puzzles.length - mixed.length - 1;
    const feasibleCandidates = candidates.filter((candidate) => {
      const candidateRemaining =
        (groups.get(candidate)?.length ?? 0) - 1;
      const largestOtherGroup = Math.max(
        0,
        ...availableTopics
          .filter((topic) => topic !== candidate)
          .map((topic) => groups.get(topic)?.length ?? 0),
      );
      return (
        candidateRemaining <= Math.floor(remainingAfterPick / 2) &&
        largestOtherGroup <= Math.ceil(remainingAfterPick / 2)
      );
    });
    const selectionPool =
      feasibleCandidates.length > 0 ? feasibleCandidates : candidates;
    const totalWeight = selectionPool.reduce(
      (total, topic) => total + (groups.get(topic)?.length ?? 0),
      0,
    );
    let roll = random() * totalWeight;
    const selectedTopic =
      selectionPool.find((topic) => {
        roll -= groups.get(topic)?.length ?? 0;
        return roll < 0;
      }) ?? selectionPool[selectionPool.length - 1];
    if (!selectedTopic) break;
    const selected = groups.get(selectedTopic)?.shift();
    if (!selected) break;
    mixed.push(selected);
    lastTopic = selected.topic;
  }

  return mixed;
}

function puzzleCycle(cycleIndex: number): PuzzleDef[] {
  const cached = puzzleCycleCache.get(cycleIndex);
  if (cached) return cached;

  let previousTopic: string | null = null;
  if (cycleIndex > 0) {
    const previousCycle = puzzleCycle(cycleIndex - 1);
    previousTopic = previousCycle[previousCycle.length - 1]?.topic ?? null;
  }

  const seed = hashSeed(`${SHUFFLE_VERSION}:${cycleIndex}`);
  let cycle: PuzzleDef[];
  if (cycleIndex === 0) {
    const launchPuzzle = PUZZLES.find(
      (puzzle) => puzzle.id === FIRST_LAUNCH_PUZZLE_ID,
    );
    if (!launchPuzzle) {
      throw new Error("Launch puzzle is missing from the puzzle catalog");
    }
    const remaining = PUZZLES.filter(
      (puzzle) => puzzle.id !== launchPuzzle.id,
    );
    cycle = [
      launchPuzzle,
      ...mixByTopic(remaining, seed, launchPuzzle.topic),
    ];
  } else {
    cycle = mixByTopic(PUZZLES, seed, previousTopic);
  }

  puzzleCycleCache.set(cycleIndex, cycle);
  return cycle;
}

/** Deterministic daily pick so every user shares the same puzzle of the day. */
export function puzzleForDate(dateKey: string): PuzzleDef {
  const [y, m, d] = dateKey.split("-").map(Number);
  const ordinal = Math.floor(Date.UTC(y, m - 1, d) / DAY_MS);
  if (ordinal < COMPETITIVE_LAUNCH_ORDINAL) {
    const legacyIndex =
      ((ordinal % ORIGINAL_PUZZLES.length) + ORIGINAL_PUZZLES.length) %
      ORIGINAL_PUZZLES.length;
    return ORIGINAL_PUZZLES[legacyIndex]!;
  }
  const daysSinceLaunch = ordinal - COMPETITIVE_LAUNCH_ORDINAL;
  const cycleIndex = Math.floor(daysSinceLaunch / PUZZLES.length);
  const dayInCycle = daysSinceLaunch % PUZZLES.length;
  return puzzleCycle(cycleIndex)[dayInCycle]!;
}

export function todayPuzzle(): PuzzleDef {
  return puzzleForDate(todayKey());
}

export function yesterdayKey(from = todayKey()): string {
  return addDaysToKey(from, -1);
}

export function yesterdayPuzzle(from = todayKey()): PuzzleDef {
  return puzzleForDate(yesterdayKey(from));
}

/** Answer for a date is revealed starting the next calendar day. */
export function isAnswerUnlocked(puzzleDateKey: string, now = todayKey()): boolean {
  return puzzleDateKey < now;
}

export function msUntilTomorrow(): number {
  const now = new Date();
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0,
  );
  return Math.max(0, tomorrow.getTime() - now.getTime());
}

/** Milliseconds until local midnight of `dateKey` (YYYY-MM-DD). */
export function msUntilDateStart(dateKey: string, now = new Date()): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (!y || !m || !d) return 0;
  const target = new Date(y, m - 1, d, 0, 0, 0, 0);
  return Math.max(0, target.getTime() - now.getTime());
}

/** Milliseconds until local end of `dateKey` (next midnight). */
export function msUntilDateEnd(dateKey: string, now = new Date()): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (!y || !m || !d) return 0;
  const target = new Date(y, m - 1, d + 1, 0, 0, 0, 0);
  return Math.max(0, target.getTime() - now.getTime());
}

/**
 * Map wall-clock time-of-day onto an App Clock dateKey.
 * So Date traveler “Jul 8” at real 3:45pm → countdown to Jul 8 midnight, not 00:00:00.
 */
export function appClockNow(dateKey: string, realNow = new Date()): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (!y || !m || !d) return realNow;
  return new Date(
    y,
    m - 1,
    d,
    realNow.getHours(),
    realNow.getMinutes(),
    realNow.getSeconds(),
    realNow.getMilliseconds(),
  );
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Longer countdown when days remain (e.g. puzzle opens). */
export function formatCountdownLong(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (days > 0) {
    return `${days}d ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return formatCountdown(ms);
}
