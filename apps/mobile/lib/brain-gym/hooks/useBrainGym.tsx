import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ActivityIndicator, View } from 'react-native';
import {
  applySessionResult,
  isDifficultyLocked,
  loadBrainGym,
  saveBrainGym,
  setSound,
  toggleFavorite,
} from '../storage';
import { getGame } from '../registry';
import type {
  BrainGymProgress,
  Difficulty,
  GameId,
  GameSessionResult,
} from '../types';
import { ensureSilentSession } from '../silent-auth';

interface BrainGymContextValue {
  progress: BrainGymProgress;
  hydrated: boolean;
  userId: string | null;
  activeGameId: GameId | null;
  isDailyRun: boolean;
  difficulty: Difficulty;
  hubTab: 'hub' | 'progress' | 'leaderboard';
  setHubTab: (t: 'hub' | 'progress' | 'leaderboard') => void;
  setDifficulty: (d: Difficulty) => void;
  openGame: (id: GameId, daily?: boolean) => void;
  closeGame: () => void;
  completeSession: (result: GameSessionResult) => {
    rdmGain: number;
    newBadges: string[];
  };
  toggleSound: () => void;
  toggleFav: (id: GameId) => void;
  lastResult: {
    result: GameSessionResult;
    rdmGain: number;
    newBadges: string[];
  } | null;
  clearLastResult: () => void;
}

const BrainGymContext = createContext<BrainGymContextValue | null>(null);

export function BrainGymProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [progress, setProgress] = useState<BrainGymProgress | null>(null);
  const [activeGameId, setActiveGameId] = useState<GameId | null>(null);
  const [isDailyRun, setIsDailyRun] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [hubTab, setHubTab] = useState<'hub' | 'progress' | 'leaderboard'>('hub');
  const [lastResult, setLastResult] =
    useState<BrainGymContextValue['lastResult']>(null);
  const mutationSeqRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { user } = await ensureSilentSession();
      if (cancelled) return;
      const uid = user?.id ?? null;
      setUserId(uid);
      const loaded = await loadBrainGym(uid);
      if (!cancelled) setProgress(loaded);
      if (uid) {
        void saveBrainGym(uid, loaded, { type: 'initialize' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openGame = useCallback((id: GameId, daily = false) => {
    setActiveGameId(id);
    setIsDailyRun(daily);
    setLastResult(null);
    const preferred = getGame(id).defaultDifficulty;
    const order: Difficulty[] = [preferred, 'easy', 'medium', 'hard'];
    const pick =
      order.find((d) => !progress || !isDifficultyLocked(progress, id, d)) ??
      'easy';
    setDifficulty(pick);
  }, [progress]);

  const closeGame = useCallback(() => {
    setActiveGameId(null);
    setIsDailyRun(false);
  }, []);

  const completeSession = useCallback(
    (result: GameSessionResult) => {
      if (!progress || !activeGameId) {
        return { rdmGain: 0, newBadges: [] as string[] };
      }
      if (isDifficultyLocked(progress, activeGameId, result.difficulty)) {
        return { rdmGain: 0, newBadges: [] as string[] };
      }
      const { progress: next, newBadges, rdmGain } = applySessionResult(
        progress,
        activeGameId,
        result,
        isDailyRun,
      );
      setProgress(next);
      setLastResult({ result, rdmGain, newBadges });
      const sessionId =
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      const mutationSeq = ++mutationSeqRef.current;
      void saveBrainGym(userId, next, {
        type: 'session',
        sessionId,
        gameId: activeGameId,
        result,
        isDaily: isDailyRun,
        baseProgress: progress,
      }).then((save) => {
        if (save.ok && mutationSeq === mutationSeqRef.current) {
          setProgress(save.progress);
        }
      });
      return { rdmGain, newBadges };
    },
    [progress, activeGameId, isDailyRun, userId],
  );

  const toggleSoundFn = useCallback(() => {
    if (!progress) return;
    const enabled = !progress.soundEnabled;
    const next = setSound(progress, enabled);
    setProgress(next);
    void saveBrainGym(userId, next, { type: 'sound', enabled });
  }, [progress, userId]);

  const toggleFav = useCallback(
    (id: GameId) => {
      if (!progress) return;
      const next = toggleFavorite(progress, id);
      const favorite = !!next.games[id]?.favorite;
      setProgress(next);
      void saveBrainGym(userId, next, { type: 'favorite', gameId: id, favorite });
    },
    [progress, userId],
  );

  const value = useMemo<BrainGymContextValue | null>(() => {
    if (!progress) return null;
    return {
      progress,
      hydrated: true,
      userId,
      activeGameId,
      isDailyRun,
      difficulty,
      hubTab,
      setHubTab,
      setDifficulty,
      openGame,
      closeGame,
      completeSession,
      toggleSound: toggleSoundFn,
      toggleFav,
      lastResult,
      clearLastResult: () => setLastResult(null),
    };
  }, [
    progress,
    userId,
    activeGameId,
    isDailyRun,
    difficulty,
    hubTab,
    openGame,
    closeGame,
    completeSession,
    toggleSoundFn,
    toggleFav,
    lastResult,
  ]);

  if (!value) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0E1117' }}>
        <ActivityIndicator color="#7F77DD" />
      </View>
    );
  }

  return (
    <BrainGymContext.Provider value={value}>{children}</BrainGymContext.Provider>
  );
}

export function useBrainGym(): BrainGymContextValue {
  const ctx = useContext(BrainGymContext);
  if (!ctx) throw new Error('useBrainGym must be used within BrainGymProvider');
  return ctx;
}
