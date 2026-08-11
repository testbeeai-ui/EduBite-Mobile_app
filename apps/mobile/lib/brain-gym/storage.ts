import AsyncStorage from '@react-native-async-storage/async-storage';
import { GAMES } from './registry';
import type {
  BrainGymMutation,
  BrainGymProgress,
  Difficulty,
  DifficultyWins,
  GameId,
  GameSessionResult,
  GameStats,
} from './types';
import { addDaysToKey, pickWithSeed, todayKey } from './utils';
import { supabase } from '../supabase';

const LOCAL_KEY = 'edubite.braingym.v1';
const MASTERY_WIN_LIMIT = 5;

const RDM_DEFAULTS: Record<string, number> = {
  'brain_gym.min_base': 5,
  'brain_gym.score_divisor': 50,
  'brain_gym.win_bonus': 10,
  'brain_gym.daily_win_bonus': 25,
  'brain_gym.session_cap': 100,
};

function getRdmAmount(key: string): number {
  return RDM_DEFAULTS[key] ?? 0;
}

export function emptyDifficultyWins(): DifficultyWins {
  return { easy: 0, medium: 0, hard: 0 };
}

function emptyStats(): GameStats {
  return {
    plays: 0,
    wins: 0,
    winsByDifficulty: emptyDifficultyWins(),
    bestScore: 0,
    recentScores: [],
    favorite: false,
  };
}

export function createDefaultProgress(): BrainGymProgress {
  const today = todayKey();
  return {
    version: 2,
    soundEnabled: true,
    darkMode: true,
    streak: 0,
    lastPlayDate: null,
    playDates: [],
    totalPlays: 0,
    totalWins: 0,
    games: {},
    badges: [],
    dailyChallenge: {
      date: today,
      gameId: pickWithSeed(
        GAMES.map((g) => g.id),
        Number(today.replace(/-/g, '')),
      ),
      completed: false,
      score: 0,
    },
    recentGameIds: [],
    rdmEarned: 0,
  };
}

export function normalizeBrainGymProgress(raw: unknown): BrainGymProgress {
  const base = createDefaultProgress();
  if (!raw || typeof raw !== 'object') return base;
  const p = raw as Partial<BrainGymProgress>;
  const today = todayKey();
  const daily =
    p.dailyChallenge?.date === today && p.dailyChallenge.gameId
      ? p.dailyChallenge
      : base.dailyChallenge;
  return {
    version: 2,
    soundEnabled: p.soundEnabled ?? true,
    darkMode: p.darkMode ?? true,
    streak: typeof p.streak === 'number' ? p.streak : 0,
    lastPlayDate: p.lastPlayDate ?? null,
    playDates: Array.isArray(p.playDates) ? p.playDates.map(String) : [],
    totalPlays: typeof p.totalPlays === 'number' ? p.totalPlays : 0,
    totalWins: typeof p.totalWins === 'number' ? p.totalWins : 0,
    games: (p.games as BrainGymProgress['games']) ?? {},
    badges: Array.isArray(p.badges) ? p.badges.map(String) : [],
    dailyChallenge: daily,
    recentGameIds: Array.isArray(p.recentGameIds)
      ? (p.recentGameIds as GameId[])
      : [],
    rdmEarned: typeof p.rdmEarned === 'number' ? p.rdmEarned : 0,
  };
}

export function difficultyWinsFor(
  progress: BrainGymProgress,
  gameId: GameId,
  difficulty: Difficulty,
): number {
  return progress.games[gameId]?.winsByDifficulty[difficulty] ?? 0;
}

export function isDifficultyLocked(
  progress: BrainGymProgress,
  gameId: GameId,
  difficulty: Difficulty,
): boolean {
  if (difficulty === 'hard') return false;
  return difficultyWinsFor(progress, gameId, difficulty) >= MASTERY_WIN_LIMIT;
}

export function difficultyMultiplier(d: Difficulty): number {
  if (d === 'hard') return 1.5;
  if (d === 'medium') return 1.2;
  return 1;
}

function computeStreak(playDates: string[], lastPlay: string | null): number {
  if (!lastPlay || playDates.length === 0) return 0;
  const sorted = [...new Set(playDates)].sort().reverse();
  const today = todayKey();
  const yesterday = addDaysToKey(today, -1);
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;
  let streak = 0;
  let expect = sorted[0] === today ? today : yesterday;
  for (const d of sorted) {
    if (d === expect) {
      streak++;
      expect = addDaysToKey(expect, -1);
    } else if (d > expect) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}

function evaluateBadges(p: BrainGymProgress): string[] {
  const earned: string[] = [];
  if (p.totalPlays >= 1) earned.push('first-play');
  const playedIds = Object.keys(p.games) as GameId[];
  if (playedIds.length >= 5) earned.push('five-games');
  const cats = new Set(
    playedIds
      .map((id) => GAMES.find((g) => g.id === id)?.category)
      .filter(Boolean),
  );
  if (cats.size >= 4) earned.push('all-categories');
  if (p.streak >= 3) earned.push('streak-3');
  if (p.streak >= 7) earned.push('streak-7');
  if (p.dailyChallenge?.completed) earned.push('daily-done');
  if (p.totalWins >= 10) earned.push('ten-wins');
  return earned;
}

export function applySessionResult(
  progress: BrainGymProgress,
  gameId: GameId,
  result: GameSessionResult,
  isDaily: boolean,
): { progress: BrainGymProgress; newBadges: string[]; rdmGain: number } {
  if (isDifficultyLocked(progress, gameId, result.difficulty)) {
    return { progress, newBadges: [], rdmGain: 0 };
  }

  const score = Number.isFinite(result.score)
    ? Math.max(0, Math.round(result.score))
    : 0;
  const timeMs = Number.isFinite(result.timeMs)
    ? Math.max(0, Math.round(result.timeMs))
    : 0;
  const today = todayKey();
  const prev = progress.games[gameId] ?? emptyStats();
  const entry = {
    score,
    bestTimeMs: timeMs,
    difficulty: result.difficulty,
    at: new Date().toISOString(),
    won: result.won,
  };
  const bestScore = Math.max(prev.bestScore, score);
  const bestTimeMs =
    result.won && timeMs > 0
      ? prev.bestTimeMs
        ? Math.min(prev.bestTimeMs, timeMs)
        : timeMs
      : prev.bestTimeMs;
  const playDates = [...new Set([...progress.playDates, today])].slice(-60);
  const streak = computeStreak(playDates, today);

  let dailyChallenge = progress.dailyChallenge;
  if (isDaily && dailyChallenge?.date === today) {
    dailyChallenge = {
      ...dailyChallenge,
      completed: dailyChallenge.completed || result.won || score > 0,
      score: Math.max(dailyChallenge.score, score),
    };
  }

  const next: BrainGymProgress = {
    ...progress,
    totalPlays: progress.totalPlays + 1,
    totalWins: progress.totalWins + (result.won ? 1 : 0),
    playDates,
    lastPlayDate: today,
    streak,
    dailyChallenge,
    recentGameIds: [
      gameId,
      ...progress.recentGameIds.filter((id) => id !== gameId),
    ].slice(0, 8),
    games: {
      ...progress.games,
      [gameId]: {
        ...prev,
        plays: prev.plays + 1,
        wins: prev.wins + (result.won ? 1 : 0),
        winsByDifficulty: {
          ...prev.winsByDifficulty,
          [result.difficulty]:
            prev.winsByDifficulty[result.difficulty] + (result.won ? 1 : 0),
        },
        bestScore,
        bestTimeMs,
        lastPlayed: today,
        recentScores: [entry, ...prev.recentScores].slice(0, 10),
      },
    },
  };

  let rdmGain = Math.max(
    getRdmAmount('brain_gym.min_base'),
    Math.floor(score / Math.max(1, getRdmAmount('brain_gym.score_divisor'))),
  );
  if (result.won) rdmGain += getRdmAmount('brain_gym.win_bonus');
  if (isDaily && result.won) rdmGain += getRdmAmount('brain_gym.daily_win_bonus');
  rdmGain = Math.min(getRdmAmount('brain_gym.session_cap'), rdmGain);
  next.rdmEarned = progress.rdmEarned + rdmGain;

  const newBadges = evaluateBadges(next);
  next.badges = [...new Set([...progress.badges, ...newBadges])];
  return {
    progress: next,
    newBadges: newBadges.filter((b) => !progress.badges.includes(b)),
    rdmGain,
  };
}

export function toggleFavorite(
  progress: BrainGymProgress,
  gameId: GameId,
): BrainGymProgress {
  const prev = progress.games[gameId] ?? emptyStats();
  return {
    ...progress,
    games: {
      ...progress.games,
      [gameId]: { ...prev, favorite: !prev.favorite },
    },
  };
}

export function setSound(
  progress: BrainGymProgress,
  soundEnabled: boolean,
): BrainGymProgress {
  return { ...progress, soundEnabled };
}

async function writeLocal(userId: string, progress: BrainGymProgress) {
  try {
    await AsyncStorage.setItem(
      `${LOCAL_KEY}:user:${userId}`,
      JSON.stringify(progress),
    );
  } catch {
    /* ignore */
  }
}

async function readLocal(userId: string): Promise<BrainGymProgress | null> {
  try {
    const raw = await AsyncStorage.getItem(`${LOCAL_KEY}:user:${userId}`);
    if (!raw) return null;
    return normalizeBrainGymProgress(JSON.parse(raw));
  } catch {
    return null;
  }
}

export type BrainGymSaveResult =
  | {
      ok: true;
      awarded: number;
      gameRdm: number | null;
      progress: BrainGymProgress;
    }
  | { ok: false; error: string };

export async function loadBrainGym(
  userId: string | null,
): Promise<BrainGymProgress> {
  if (!userId) return createDefaultProgress();

  // Always bind remote read to the active session — never trust a foreign uid.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const sessionUid = session?.user?.id ?? null;
  const uid = sessionUid && sessionUid === userId ? userId : sessionUid;
  if (!uid) {
    const local = await readLocal(userId);
    return local ?? createDefaultProgress();
  }

  try {
    const { data, error } = await supabase
      .from('edubite_brain_gym_progress')
      .select('payload')
      .eq('user_id', uid)
      .maybeSingle();

    if (!error && data?.payload) {
      const normalized = normalizeBrainGymProgress(data.payload);
      await writeLocal(uid, normalized);
      return normalized;
    }
  } catch (err) {
    console.warn('loadBrainGym remote failed', err);
  }

  const local = await readLocal(uid);
  return local ?? createDefaultProgress();
}

export async function saveBrainGym(
  userId: string | null,
  progress: BrainGymProgress,
  mutation: BrainGymMutation,
): Promise<BrainGymSaveResult> {
  if (!userId) return { ok: false, error: 'No session' };

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const sessionUid = session?.user?.id ?? null;
  if (!sessionUid || sessionUid !== userId) {
    return { ok: false, error: 'Session mismatch' };
  }

  const normalized = normalizeBrainGymProgress(progress);
  await writeLocal(userId, normalized);

  try {
    const { data, error } = await supabase.rpc(
      'edubite_apply_brain_gym_mutation',
      {
        p_progress: normalized,
        p_mutation: mutation,
      },
    );
    if (error) {
      console.warn('brain-gym RPC failed', error.message);
      return { ok: false, error: error.message };
    }
    const result = data as {
      progress?: unknown;
      awarded?: number;
      gameState?: { rdm?: number } | null;
    };
    const next = normalizeBrainGymProgress(result.progress ?? normalized);
    await writeLocal(userId, next);
    return {
      ok: true,
      awarded: typeof result.awarded === 'number' ? result.awarded : 0,
      progress: next,
      gameRdm:
        typeof result.gameState?.rdm === 'number' ? result.gameState.rdm : null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'save failed';
    return { ok: false, error: message };
  }
}
