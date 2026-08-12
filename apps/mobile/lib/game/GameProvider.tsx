import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ensureSilentSession } from '../brain-gym/silent-auth';
import { useAuth } from '../auth/AuthProvider';
import {
  enrollMonthlyChallenge as enrollMonthlyChallengeRpc,
  fetchEdubiteRewards,
  fetchUserGameState,
  saveGameState,
} from '../supabase';
import { monthKey, todayKey } from './date';
import { hydrateGameState, toPersistable } from './hydrate';
import {
  DOSE_DURATION_SEC,
  DOSE_QUESTION_COUNT,
  FUNBRAIN_DURATION_SEC,
  FUNBRAIN_QUESTION_COUNT,
  getLevelInfo,
  rollDayIfNeeded,
  todayCriteria,
  withDerived,
} from './state';
import type { GameState } from './types';
import type { PledgeType } from '../pledge/constants';

type RewardMap = Record<string, { amount?: number; label?: string }>;

type GameContextValue = {
  loading: boolean;
  saving: boolean;
  state: GameState;
  rewardMap: RewardMap;
  level: ReturnType<typeof getLevelInfo>;
  criteria: ReturnType<typeof todayCriteria>;
  refetch: () => Promise<void>;
  completeDose: (args: {
    classLevel: '11' | '12';
    answers: number[];
    correct: number;
    total: number;
  }) => Promise<void>;
  completeFunbrain: (args: {
    answers: (number | null)[];
    score: number;
    combo: number;
  }) => Promise<void>;
  toggleHabit: (habitId: string) => Promise<void>;
  completePuzzle: () => Promise<void>;
  setPledge: (type: PledgeType, signed?: boolean) => Promise<void>;
  setClassLevel: (cls: '11' | '12') => void;
  startDose: () => void;
  startFunbrain: () => void;
  resetDose: () => void;
  resetFunbrain: () => void;
  enrollMonthlyChallenge: (displayName?: string) => Promise<boolean>;
  markNotificationRead: (id: string) => void;
  clearNotification: (id: string) => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rewardMap, setRewardMap] = useState<RewardMap>({});
  const [state, setState] = useState<GameState>(() => hydrateGameState(null));
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const persist = useCallback(async (next: GameState) => {
    setSaving(true);
    try {
      await ensureSilentSession();
      const saved = await saveGameState(toPersistable(next));
      if (saved && typeof saved === 'object') {
        const payload =
          (saved as { state?: Record<string, unknown> }).state ??
          (saved as Record<string, unknown>);
        if (payload && typeof payload === 'object' && 'rdm' in payload) {
          setState(withDerived(hydrateGameState(payload as Record<string, unknown>, rewardMap)));
          return;
        }
      }
    } catch (err) {
      console.warn('[game] persist failed', err);
    } finally {
      setSaving(false);
    }
  }, [rewardMap]);

  const queuePersist = useCallback(
    (next: GameState) => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
      persistTimer.current = setTimeout(() => {
        void persist(next);
      }, 250);
    },
    [persist],
  );

  const apply = useCallback(
    (updater: (prev: GameState) => GameState, save = true) => {
      setState((prev) => {
        const rolled = rollDayIfNeeded(prev);
        const next = withDerived(updater(rolled));
        if (save) queuePersist(next);
        return next;
      });
    },
    [queuePersist],
  );

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      await ensureSilentSession();
      const [rewards, row] = await Promise.all([
        fetchEdubiteRewards(),
        fetchUserGameState(),
      ]);
      const map: RewardMap = {};
      rewards.forEach((r) => {
        map[r.reward_key] = r;
      });
      setRewardMap(map);
      const hydrated = hydrateGameState(
        (row?.payload ?? null) as Record<string, unknown> | null,
        map,
      );
      setState(withDerived(rollDayIfNeeded(hydrated)));
    } catch (err) {
      console.warn('[game] refetch failed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch, user?.id]);

  const completeDose: GameContextValue['completeDose'] = useCallback(
    async ({ classLevel, answers, correct, total }) => {
      const today = todayKey();
      apply((prev) => ({
        ...prev,
        dose: {
          ...prev.dose,
          currentClass: classLevel,
          classChosen: true,
          completed: true,
          completed11: classLevel === '11' ? true : prev.dose.completed11,
          completed12: classLevel === '12' ? true : prev.dose.completed12,
          correct,
          answers11: classLevel === '11' ? answers : prev.dose.answers11,
          answers12: classLevel === '12' ? answers : prev.dose.answers12,
          running: false,
          locked: true,
          index: Math.max(0, total - 1),
        },
        doseDayLog: {
          ...prev.doseDayLog,
          [today]: {
            correct,
            total: Math.max(total, DOSE_QUESTION_COUNT),
            pct: total > 0 ? Math.round((correct / total) * 100) : 0,
            completed: true,
            classLevel,
          },
        },
      }));
    },
    [apply],
  );

  const completeFunbrain: GameContextValue['completeFunbrain'] = useCallback(
    async ({ answers, score, combo }) => {
      apply((prev) => ({
        ...prev,
        funbrain: {
          ...prev.funbrain,
          answers,
          score,
          combo,
          highScore: Math.max(prev.funbrain.highScore, score),
          completed: true,
          finished: true,
          running: false,
          currentQuestionIndex: Math.max(0, answers.length - 1),
        },
      }));
    },
    [apply],
  );

  const toggleHabit: GameContextValue['toggleHabit'] = useCallback(
    async (habitId) => {
      apply((prev) => ({
        ...prev,
        habits: prev.habits.map((h) =>
          h.id === habitId ? { ...h, done: !h.done } : h,
        ),
      }));
    },
    [apply],
  );

  const completePuzzle: GameContextValue['completePuzzle'] = useCallback(async () => {
    apply((prev) => ({ ...prev, puzzleCompleted: true }));
  }, [apply]);

  const setPledge: GameContextValue['setPledge'] = useCallback(
    async (type, signed = true) => {
      apply((prev) => ({
        ...prev,
        pledgeAM: type === 'am' ? signed : prev.pledgeAM,
        pledgePM: type === 'pm' ? signed : prev.pledgePM,
      }));
    },
    [apply],
  );

  const setClassLevel = useCallback((cls: '11' | '12') => {
    apply(
      (prev) => ({
        ...prev,
        dose: { ...prev.dose, currentClass: cls, classChosen: true },
      }),
      false,
    );
  }, [apply]);

  const startDose = useCallback(() => {
    apply(
      (prev) => {
        if (!prev.dose.classChosen || prev.dose.running) return prev;
        const cls = prev.dose.currentClass === '12' ? '12' : '11';
        const alreadyDone =
          cls === '11' ? prev.dose.completed11 : prev.dose.completed12;
        if (alreadyDone) return prev;
        return {
          ...prev,
          dose: {
            ...prev.dose,
            running: true,
            timeLeft: DOSE_DURATION_SEC,
            index: 0,
            locked: false,
            correct: 0,
            completed: false,
          },
        };
      },
      false,
    );
  }, [apply]);

  const startFunbrain = useCallback(() => {
    apply(
      (prev) => {
        if (prev.funbrain.completed || prev.funbrain.running) return prev;
        return {
          ...prev,
          funbrain: {
            ...prev.funbrain,
            running: true,
            timeLeft: FUNBRAIN_DURATION_SEC,
            score: 0,
            combo: 0,
            currentQuestionIndex: 0,
            answers: [],
            finished: false,
            completed: false,
          },
        };
      },
      false,
    );
  }, [apply]);

  /** Replay today's set — clears completion flags; RDM stay server-guarded. */
  const resetDose = useCallback(() => {
    apply((prev) => {
      const is11 = prev.dose.currentClass !== '12';
      return {
        ...prev,
        dose: {
          ...prev.dose,
          index: 0,
          locked: false,
          correct: 0,
          completed: false,
          running: false,
          timeLeft: DOSE_DURATION_SEC,
          completed11: is11 ? false : prev.dose.completed11,
          completed12: !is11 ? false : prev.dose.completed12,
          answers11: is11 ? [] : prev.dose.answers11,
          answers12: !is11 ? [] : prev.dose.answers12,
        },
      };
    }, false);
  }, [apply]);

  const resetFunbrain = useCallback(() => {
    apply(
      (prev) => ({
        ...prev,
        funbrain: {
          running: false,
          timeLeft: FUNBRAIN_DURATION_SEC,
          score: 0,
          combo: 0,
          highScore: prev.funbrain.highScore,
          currentQuestionIndex: 0,
          answers: [],
          finished: false,
          completed: false,
        },
      }),
      false,
    );
  }, [apply]);

  const enrollMonthlyChallenge = useCallback(
    async (displayName = 'Edubite Learner') => {
      const mk = monthKey();
      const result = await enrollMonthlyChallengeRpc({
        monthKey: mk,
        displayName,
        dateKey: todayKey(),
      });
      if (!result) return false;
      const payload =
        (result.state as Record<string, unknown> | undefined) ?? result;
      if (payload && typeof payload === 'object' && 'rdm' in payload) {
        setState(withDerived(hydrateGameState(payload, rewardMap)));
        return true;
      }
      apply((prev) => ({
        ...prev,
        challengeEnrolledMonthKey: mk,
        challengeEnrolledMonths: Array.from(
          new Set([...(prev.challengeEnrolledMonths || []), mk]),
        ),
      }));
      return true;
    },
    [apply, rewardMap],
  );

  const markNotificationRead = useCallback((id: string) => {
    apply((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    }));
  }, [apply]);

  const clearNotification = useCallback((id: string) => {
    apply((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== id),
    }));
  }, [apply]);

  const value = useMemo<GameContextValue>(
    () => ({
      loading,
      saving,
      state,
      rewardMap,
      level: getLevelInfo(state.rdm),
      criteria: todayCriteria(state),
      refetch,
      completeDose,
      completeFunbrain,
      toggleHabit,
      completePuzzle,
      setPledge,
      setClassLevel,
      startDose,
      startFunbrain,
      resetDose,
      resetFunbrain,
      enrollMonthlyChallenge,
      markNotificationRead,
      clearNotification,
    }),
    [
      loading,
      saving,
      state,
      rewardMap,
      refetch,
      completeDose,
      completeFunbrain,
      toggleHabit,
      completePuzzle,
      setPledge,
      setClassLevel,
      startDose,
      startFunbrain,
      resetDose,
      resetFunbrain,
      enrollMonthlyChallenge,
      markNotificationRead,
      clearNotification,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

export { DOSE_QUESTION_COUNT, FUNBRAIN_QUESTION_COUNT };
