import { ensureSilentSession } from '../brain-gym/silent-auth';
import { fetchUserGameState, saveGameState } from '../supabase';
import type { PledgeType } from './constants';
import { todayKey } from './day';

export type PledgeFlags = {
  pledgeAM: boolean;
  pledgePM: boolean;
  pledges: boolean;
};

export function readPledgeFlags(
  payload: Record<string, unknown> | null | undefined,
): PledgeFlags {
  const pledgeAM = Boolean(payload?.pledgeAM || payload?.signedMorning || payload?.pledges);
  const pledgePM = Boolean(payload?.pledgePM || payload?.signedNight || payload?.pledges);
  return {
    pledgeAM,
    pledgePM,
    pledges: pledgeAM && pledgePM,
  };
}

/**
 * Persist AM/PM pledge into edubite_game_state (same keys as web).
 * Merges with existing payload; keeps local UI usable if RPC fails.
 */
export async function completePledgePersist(
  type: PledgeType,
  signed: boolean = true,
): Promise<PledgeFlags | null> {
  await ensureSilentSession();

  const current = await fetchUserGameState();
  const prev = (current?.payload ?? {}) as Record<string, unknown>;
  const nextAM = type === 'am' ? signed : Boolean(prev.pledgeAM || prev.signedMorning);
  const nextPM = type === 'pm' ? signed : Boolean(prev.pledgePM || prev.signedNight);
  const asOf = todayKey();

  const payload: Record<string, unknown> = {
    ...prev,
    pledgeAM: nextAM,
    pledgePM: nextPM,
    pledges: nextAM && nextPM,
    // Clear legacy misaligned keys if present
    signedMorning: nextAM,
    signedNight: nextPM,
    lastActiveDate: typeof prev.lastActiveDate === 'string' ? prev.lastActiveDate : asOf,
    joinedDate:
      typeof prev.joinedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(prev.joinedDate)
        ? prev.joinedDate
        : asOf,
  };

  const saved = await saveGameState(payload);
  if (!saved) {
    console.warn('[pledge] saveGameState failed; returning optimistic flags');
  }

  return {
    pledgeAM: nextAM,
    pledgePM: nextPM,
    pledges: nextAM && nextPM,
  };
}
