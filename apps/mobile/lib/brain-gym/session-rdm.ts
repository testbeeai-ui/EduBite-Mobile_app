/**
 * Brain Gym session RDM — same keys as edubite_rdm_rewards / web.
 * Score 0 → no participation floor (only win bonuses if won).
 * Score > 0 → max(min_base, floor(score / divisor)) + bonuses.
 */
export const BRAIN_GYM_RDM_DEFAULTS: Record<string, number> = {
  'brain_gym.min_base': 5,
  'brain_gym.score_divisor': 20,
  'brain_gym.win_bonus': 15,
  'brain_gym.daily_win_bonus': 25,
  'brain_gym.session_cap': 120,
};

const liveOverrides: Record<string, number> = {};

export function setBrainGymRdmAmounts(
  next: Record<string, number | undefined> | null | undefined,
) {
  for (const key of Object.keys(BRAIN_GYM_RDM_DEFAULTS)) {
    delete liveOverrides[key];
  }
  if (!next) return;
  for (const [key, value] of Object.entries(next)) {
    if (!(key in BRAIN_GYM_RDM_DEFAULTS)) continue;
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      liveOverrides[key] = Math.floor(value);
    }
  }
}

export function getBrainGymRdmAmount(key: string): number {
  const live = liveOverrides[key];
  if (typeof live === 'number') return live;
  return BRAIN_GYM_RDM_DEFAULTS[key] ?? 0;
}

export function computeBrainGymSessionRdm(args: {
  score: number;
  won: boolean;
  isDaily: boolean;
}): number {
  const score = Number.isFinite(args.score)
    ? Math.max(0, Math.round(args.score))
    : 0;
  const minBase = getBrainGymRdmAmount('brain_gym.min_base');
  const divisor = Math.max(1, getBrainGymRdmAmount('brain_gym.score_divisor'));
  const winBonus = getBrainGymRdmAmount('brain_gym.win_bonus');
  const dailyBonus = getBrainGymRdmAmount('brain_gym.daily_win_bonus');
  const cap = getBrainGymRdmAmount('brain_gym.session_cap');

  let awarded = 0;
  if (score > 0) {
    awarded = Math.max(minBase, Math.floor(score / divisor));
  }
  if (args.won) awarded += winBonus;
  if (args.isDaily && args.won) awarded += dailyBonus;
  return Math.min(cap, awarded);
}
