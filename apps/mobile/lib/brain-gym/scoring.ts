import type { Difficulty } from './types';

/** Same as Edubite web `difficultyMultiplier` (storage.ts). */
export function difficultyMultiplier(d: Difficulty): number {
  if (d === 'hard') return 1.5;
  if (d === 'medium') return 1.2;
  return 1;
}

/** Minesweeper lose — web: revealedSafe × 5 × multiplier. */
export function minesweeperLoseScore(
  openedSafe: number,
  difficulty: Difficulty,
): number {
  return Math.round(
    Math.max(0, openedSafe) * 5 * difficultyMultiplier(difficulty),
  );
}

/** Minesweeper win — web time-based band. */
export function minesweeperWinScore(
  difficulty: Difficulty,
  timeMs: number,
): number {
  const base =
    difficulty === 'easy' ? 700 : difficulty === 'medium' ? 900 : 1_100;
  const budget =
    difficulty === 'easy'
      ? 120_000
      : difficulty === 'medium'
        ? 150_000
        : 180_000;
  return Math.max(
    100,
    Math.min(
      1_400,
      Math.round(base + 300 * Math.max(0, 1 - timeMs / budget)),
    ),
  );
}

/** Sudoku win — web: base + speed − mistakes×100 − hints×150, clamped. */
export function sudokuWinScore(args: {
  difficulty: Difficulty;
  timeMs: number;
  mistakes: number;
  hintsUsed?: number;
}): number {
  const { difficulty, timeMs, mistakes } = args;
  const hintsUsed = args.hintsUsed ?? 0;
  const targetMs =
    difficulty === 'easy'
      ? 180_000
      : difficulty === 'medium'
        ? 240_000
        : 300_000;
  const base =
    difficulty === 'easy' ? 700 : difficulty === 'medium' ? 850 : 1_000;
  const speedBonus = 300 * Math.max(0, 1 - timeMs / targetMs);
  return Math.max(
    100,
    Math.min(
      1_300,
      Math.round(base + speedBonus - mistakes * 100 - hintsUsed * 150),
    ),
  );
}

/** 2048 finish — web always multiplies board score (win adds max tile). */
export function game2048FinalScore(args: {
  boardScore: number;
  maxTile: number;
  won: boolean;
  difficulty: Difficulty;
}): number {
  const raw = args.won
    ? args.boardScore + args.maxTile
    : args.boardScore;
  return Math.round(raw * difficultyMultiplier(args.difficulty));
}

/** Hidden Objects — timeout/lose partial. */
export function hiddenObjectsPartialScore(foundCount: number): number {
  return Math.max(0, foundCount) * 100;
}

/** Hidden Objects — clear all targets. */
export function hiddenObjectsWinScore(args: {
  targetCount: number;
  timeLimitMs: number;
  elapsedMs: number;
  difficulty: Difficulty;
}): number {
  const baseScore = args.targetCount * 200;
  const timeBonus = Math.max(
    0,
    Math.round((args.timeLimitMs - args.elapsedMs) / 10),
  );
  return Math.round(
    (baseScore + timeBonus) * difficultyMultiplier(args.difficulty),
  );
}

/** Odd One Out — per correct (web uses 20 × mult). */
export function oddOneOutCorrectDelta(difficulty: Difficulty): number {
  return Math.round(20 * difficultyMultiplier(difficulty));
}

/** Match Shadow — per correct (web uses 100 × mult). */
export function matchShadowCorrectDelta(difficulty: Difficulty): number {
  return Math.round(100 * difficultyMultiplier(difficulty));
}

/** Visual Search — timeout/lose partial. */
export function visualSearchPartialScore(foundCount: number): number {
  return Math.max(0, foundCount) * 50;
}

/** Visual Search — find all targets. */
export function visualSearchWinScore(args: {
  numTargets: number;
  timeLeftMs: number;
  difficulty: Difficulty;
}): number {
  return Math.max(
    100,
    Math.round(
      (args.numTargets * 100 + args.timeLeftMs / 10) *
        difficultyMultiplier(args.difficulty),
    ),
  );
}

/** Reaction — per-tap quality score (web ignores difficulty). */
export function reactionScoreForMs(
  reactionMs: number,
  _difficulty?: Difficulty,
): number {
  void _difficulty;
  const humanAdjustedMs = Math.max(120, Math.min(1_000, reactionMs));
  const score = 100 - Math.max(0, humanAdjustedMs - 180) * 0.25;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function isReactionRunWon(falseStarts: number, score: number): boolean {
  return falseStarts <= 2 && score >= 60;
}

/** Reaction — final session score from round times. */
export function reactionSessionScore(
  reactionMsList: number[],
  falseStarts: number,
  difficulty?: Difficulty,
): number {
  if (reactionMsList.length === 0) return 0;
  const reactionScores = reactionMsList.map((ms) =>
    reactionScoreForMs(ms, difficulty),
  );
  const average =
    reactionScores.reduce((sum, v) => sum + v, 0) / reactionScores.length;
  return Math.max(1, Math.round(average - falseStarts * 5));
}

/** Speed Math — per correct (web uses 100 × mult). */
export function speedMathCorrectDelta(difficulty: Difficulty): number {
  return Math.round(100 * difficultyMultiplier(difficulty));
}

/** Sequence Memory — per cleared sequence length. */
export function sequenceMemoryCorrectDelta(
  seqLength: number,
  difficulty: Difficulty,
): number {
  return Math.round(10 * seqLength * difficultyMultiplier(difficulty));
}

export function patternMemoryCorrectDelta(
  round: number,
  difficulty: Difficulty,
): number {
  return Math.round(40 * difficultyMultiplier(difficulty) * round);
}

export function numberFlashCorrectDelta(
  round: number,
  difficulty: Difficulty,
): number {
  return Math.round(50 * difficultyMultiplier(difficulty) * round);
}

export function letterMemoryCorrectDelta(
  round: number,
  difficulty: Difficulty,
): number {
  return Math.round(50 * difficultyMultiplier(difficulty) * round);
}

export function imageMemoryCorrectDelta(
  round: number,
  difficulty: Difficulty,
): number {
  return Math.round(45 * difficultyMultiplier(difficulty) * round);
}
