import { PLEDGE_CATALOG_DAYS } from './constants';

export function todayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function daysBetween(fromKey: string, toKey: string): number {
  const from = Date.parse(`${fromKey}T00:00:00`);
  const to = Date.parse(`${toKey}T00:00:00`);
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.floor((to - from) / 86_400_000);
}

export function getPledgeReelDayNumber(
  joinedDate: string,
  asOfDateKey: string = todayKey(),
  catalogLength: number = PLEDGE_CATALOG_DAYS,
): number {
  if (catalogLength <= 0) return 1;
  const daysSinceJoin = Math.max(0, daysBetween(joinedDate, asOfDateKey));
  return (daysSinceJoin % catalogLength) + 1;
}

export function resolveJourneyJoinDate(
  payload: Record<string, unknown> | null | undefined,
  asOfDateKey: string = todayKey(),
): string {
  const joined = payload?.joinedDate;
  if (typeof joined === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(joined)) {
    return joined;
  }
  const lastActive = payload?.lastActiveDate;
  if (typeof lastActive === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(lastActive)) {
    return lastActive;
  }
  return asOfDateKey;
}
