import { parseDateKey } from '../game/date';
import {
  criteriaForDate,
  isFullDay,
} from '../game/state';
import type { GameState } from '../game/types';

/** Fallback — prefer getMonthlyChallengeTargetRdm(rewardMap) at runtime. */
export const MONTHLY_CHALLENGE_TARGET_RDM = 5000;
/** Fallback — prefer getMonthlyChallengeEntryStakeRdm(rewardMap) at runtime. */
export const MONTHLY_CHALLENGE_ENTRY_STAKE_RDM = 3000;
export const MONTHLY_CHALLENGE_ENTRY_LAST_DAY = 5;
export const MONTHLY_CHALLENGE_STREAK_REQUIRED = 15;
export const MONTHLY_CHALLENGE_PASS_PCT = 80;
export const MONTHLY_CHALLENGE_WINNER_SLOTS = 5;

type RewardMap = Record<string, { amount?: number; label?: string }>;

export function getMonthlyChallengeTargetRdm(rewardMap?: RewardMap): number {
  const live = rewardMap?.['challenge.target_rdm']?.amount;
  return typeof live === 'number' && live > 0 ? live : MONTHLY_CHALLENGE_TARGET_RDM;
}

/** RDM deducted on enroll — live from edubite_rdm_rewards. */
export function getMonthlyChallengeEntryStakeRdm(rewardMap?: RewardMap): number {
  const live = rewardMap?.['challenge.entry_stake']?.amount;
  return typeof live === 'number' && live >= 0 ? live : MONTHLY_CHALLENGE_ENTRY_STAKE_RDM;
}

/** 0–100 progress toward Monthly Challenge unlock threshold. */
export function challengeUnlockProgressPct(rdm: number, targetRdm: number): number {
  const target = Math.max(1, Math.round(targetRdm));
  const current = Math.max(0, Math.round(rdm));
  return Math.min(100, Math.floor((current / target) * 100));
}

export function formatRdm(n: number): string {
  return Math.max(0, Math.round(n)).toLocaleString('en-IN');
}

export type MonthlyEntryState = 'locked_rdm' | 'locked_window' | 'open';

export type ChallengeDayStatus = 'done' | 'missed' | 'upcoming' | 'today_pending';

export type ChallengeCalendarDay = {
  day: number;
  dateKey: string;
  status: ChallengeDayStatus;
  pct: number | null;
  isPuzzleDay: boolean;
  completedAt: string | null;
};

export type ChallengeMonthMeta = {
  monthKey: string;
  monthLabel: string;
  year: number;
  monthIndex: number;
  daysInMonth: number;
  lastDay: number;
  lastDayKey: string;
  nextEntryOpensLabel: string;
  nextEntryOpensKey: string;
  entryWindowLabel: string;
};

export type ChallengeProgress = {
  calendar: ChallengeCalendarDay[];
  currentStretch: number;
  bestStretch: number;
  streakMet: boolean;
  onPuzzleDay: boolean;
  eligibleForPuzzle: boolean;
  puzzleOpen: boolean;
};

export function dayOfMonthFromKey(dateKey: string): number {
  return parseDateKey(dateKey).getDate();
}

export function isInEntryWindow(dateKey: string): boolean {
  const day = dayOfMonthFromKey(dateKey);
  return day >= 1 && day <= MONTHLY_CHALLENGE_ENTRY_LAST_DAY;
}

export function getChallengeMonthMeta(dateKey: string): ChallengeMonthMeta {
  const d = parseDateKey(dateKey);
  const year = d.getFullYear();
  const monthIndex = d.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const lastDay = daysInMonth;
  const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  const monthLabel = d.toLocaleDateString('en-US', { month: 'long' });

  let nextYear = year;
  let nextMonthIndex = monthIndex + 1;
  if (nextMonthIndex > 11) {
    nextMonthIndex = 0;
    nextYear += 1;
  }
  const nextEntryOpensKey = `${nextYear}-${String(nextMonthIndex + 1).padStart(2, '0')}-01`;
  const nextEntryDate = parseDateKey(nextEntryOpensKey);
  const nextMonthLabel = nextEntryDate.toLocaleDateString('en-US', {
    month: 'long',
  });
  const nextEntryOpensLabel = `1–${MONTHLY_CHALLENGE_ENTRY_LAST_DAY} ${nextMonthLabel}`;
  const lastDayKey = `${monthKey}-${String(lastDay).padStart(2, '0')}`;

  return {
    monthKey,
    monthLabel,
    year,
    monthIndex,
    daysInMonth,
    lastDay,
    lastDayKey,
    nextEntryOpensLabel,
    nextEntryOpensKey,
    entryWindowLabel: `1–${MONTHLY_CHALLENGE_ENTRY_LAST_DAY} ${monthLabel}`,
  };
}

export function isEnrolledForChallengeMonth(
  monthKey: string,
  enrolledMonthKey?: string | null,
  enrolledMonths?: string[] | null,
): boolean {
  if (!/^\d{4}-\d{2}$/.test(monthKey)) return false;
  if (enrolledMonthKey === monthKey) return true;
  return Array.isArray(enrolledMonths) && enrolledMonths.includes(monthKey);
}

export function getEntryState(args: {
  rdm: number;
  dateKey: string;
  enrolledMonthKey?: string | null;
  enrolledMonths?: string[] | null;
  rewardMap?: RewardMap;
}): MonthlyEntryState {
  const meta = getChallengeMonthMeta(args.dateKey);
  if (
    isEnrolledForChallengeMonth(
      meta.monthKey,
      args.enrolledMonthKey,
      args.enrolledMonths,
    )
  ) {
    return 'open';
  }
  // After day 5, window is closed regardless of RDM — don't push "earn more" when enroll is impossible.
  if (!isInEntryWindow(args.dateKey)) return 'locked_window';
  if (args.rdm < getMonthlyChallengeTargetRdm(args.rewardMap)) return 'locked_rdm';
  return 'open';
}

export function mergeEnrolledMonths(
  ...parts: Array<string[] | string | null | undefined>
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    const list = Array.isArray(part)
      ? part
      : typeof part === 'string'
        ? [part]
        : [];
    for (const key of list) {
      if (!/^\d{4}-\d{2}$/.test(key) || seen.has(key)) continue;
      seen.add(key);
      out.push(key);
    }
  }
  return out.sort();
}

/**
 * Merge Edubite roster enrollments + own submission into local game state.
 * Mirrors web `withRosterEnrollmentSync` so paid months stay open after day 5.
 */
export function withChallengeRemoteSync(
  state: GameState,
  args: {
    rosterMonths: string[];
    submittedMonthKey?: string | null;
  },
): GameState {
  const months = mergeEnrolledMonths(
    state.challengeEnrolledMonths,
    state.challengeEnrolledMonthKey,
    args.rosterMonths,
  );

  const challengeEnrolledMonthKey =
    state.challengeEnrolledMonthKey &&
    months.includes(state.challengeEnrolledMonthKey)
      ? state.challengeEnrolledMonthKey
      : (months[months.length - 1] ?? null);

  let challengePuzzleSubmittedMonthKey =
    state.challengePuzzleSubmittedMonthKey ?? null;
  const remoteSubmitted = args.submittedMonthKey;
  if (
    typeof remoteSubmitted === 'string' &&
    /^\d{4}-\d{2}$/.test(remoteSubmitted) &&
    (!challengePuzzleSubmittedMonthKey ||
      remoteSubmitted > challengePuzzleSubmittedMonthKey)
  ) {
    challengePuzzleSubmittedMonthKey = remoteSubmitted;
  }

  const monthsUnchanged =
    months.length === state.challengeEnrolledMonths.length &&
    months.every((m, i) => m === state.challengeEnrolledMonths[i]);

  if (
    monthsUnchanged &&
    challengeEnrolledMonthKey === state.challengeEnrolledMonthKey &&
    challengePuzzleSubmittedMonthKey === state.challengePuzzleSubmittedMonthKey
  ) {
    return state;
  }

  return {
    ...state,
    challengeEnrolledMonths: months,
    challengeEnrolledMonthKey,
    challengePuzzleSubmittedMonthKey,
  };
}

export function monthDayKey(monthKey: string, day: number): string {
  return `${monthKey}-${String(day).padStart(2, '0')}`;
}

export function firstWeekdayOfMonth(dateKey: string): number {
  const d = parseDateKey(dateKey);
  return new Date(d.getFullYear(), d.getMonth(), 1).getDay();
}

export function formatChallengeLongDate(dateKey: string): string {
  return parseDateKey(dateKey).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function buildChallengeProgress(
  state: GameState,
  dateKey: string,
): ChallengeProgress {
  const meta = getChallengeMonthMeta(dateKey);
  const todayDay = dayOfMonthFromKey(dateKey);
  const calendar: ChallengeCalendarDay[] = [];

  for (let day = 1; day <= meta.daysInMonth; day++) {
    const key = monthDayKey(meta.monthKey, day);
    const isPuzzleDay = day === meta.lastDay;
    const criteria = criteriaForDate(state, key, dateKey);
    const full = isFullDay(criteria);
    const criteriaDone = [
      criteria.dose,
      criteria.funbrain,
      criteria.puzzles,
      criteria.habits,
      criteria.pledges,
    ].filter(Boolean).length;

    if (day > todayDay) {
      if (full) {
        calendar.push({
          day,
          dateKey: key,
          status: 'done',
          pct: Math.round((criteriaDone / 5) * 100),
          isPuzzleDay,
          completedAt: criteria.completedAt ?? null,
        });
      } else {
        calendar.push({
          day,
          dateKey: key,
          status: 'upcoming',
          pct: null,
          isPuzzleDay,
          completedAt: null,
        });
      }
      continue;
    }

    if (full) {
      calendar.push({
        day,
        dateKey: key,
        status: 'done',
        pct: Math.round((criteriaDone / 5) * 100),
        isPuzzleDay,
        completedAt: criteria.completedAt ?? null,
      });
      continue;
    }

    if (day === todayDay) {
      calendar.push({
        day,
        dateKey: key,
        status: 'today_pending',
        pct: Math.round((criteriaDone / 5) * 100),
        isPuzzleDay,
        completedAt: null,
      });
      continue;
    }

    calendar.push({
      day,
      dateKey: key,
      status: 'missed',
      pct: criteriaDone > 0 ? Math.round((criteriaDone / 5) * 100) : null,
      isPuzzleDay,
      completedAt: null,
    });
  }

  const scored = calendar.filter((d) => d.day <= todayDay);
  let currentStretch = 0;
  for (let i = scored.length - 1; i >= 0; i--) {
    const cell = scored[i]!;
    if (cell.status === 'today_pending') continue;
    if (cell.status === 'done') currentStretch++;
    else break;
  }

  let bestStretch = 0;
  let run = 0;
  for (const cell of calendar) {
    if (cell.status === 'done') {
      run++;
      bestStretch = Math.max(bestStretch, run);
    } else if (cell.status === 'upcoming') {
      run = 0;
    } else if (cell.status !== 'today_pending') {
      run = 0;
    }
  }

  const streakMet = bestStretch >= MONTHLY_CHALLENGE_STREAK_REQUIRED;
  const onPuzzleDay = todayDay === meta.lastDay;
  const eligibleForPuzzle = streakMet;
  const puzzleOpen = onPuzzleDay && eligibleForPuzzle;

  return {
    calendar,
    currentStretch,
    bestStretch,
    streakMet,
    onPuzzleDay,
    eligibleForPuzzle,
    puzzleOpen,
  };
}

export function challengePuzzlePrompt(meta: ChallengeMonthMeta): string {
  return `Final puzzle for ${meta.monthLabel} ${meta.year} — submit one clear answer. The first ${MONTHLY_CHALLENGE_WINNER_SLOTS} correct entries (by system timestamp) win. Edubite will notify winners on your registered WhatsApp and email.`;
}

export function streakBannerCopy(args: {
  streakMet: boolean;
  onPuzzleDay: boolean;
  puzzleOpen: boolean;
  alreadySubmitted: boolean;
  lastDayLabel: string;
  lastDay: number;
  monthLabel: string;
}): string {
  if (args.alreadySubmitted) {
    return 'Entry submitted — winners are notified by Edubite after verification.';
  }
  if (args.streakMet) {
    if (args.puzzleOpen) {
      return 'The final puzzle is open — submit your answer below.';
    }
    if (args.onPuzzleDay) {
      return 'Puzzle day is here, but eligibility could not be confirmed.';
    }
    return `Locked in — you're eligible for the final puzzle on ${args.lastDay} ${args.monthLabel}.`;
  }
  return "Complete all 5 tasks on today's Day card to grow your streak and unlock the final puzzle.";
}

export function formatWinnerTime(iso: string): string {
  try {
    return (
      new Date(iso).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      }) + ' IST'
    );
  } catch {
    return iso;
  }
}

export function formatActivityTime(iso: string | null): string {
  if (!iso) return 'Completed';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return iso;
  }
}

export function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}
