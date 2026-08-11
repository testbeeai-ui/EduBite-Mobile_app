export function todayKey(date: Date = new Date()): string {
  // Align with IST-ish server day by using local device date (learner TZ).
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDaysToKey(key: string, days: number): string {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + days);
  return todayKey(d);
}

export function daysBetween(startKey: string, endKey: string): number {
  const start = parseDateKey(startKey).getTime();
  const end = parseDateKey(endKey).getTime();
  return Math.round((end - start) / 86_400_000);
}

export const CONTENT_CYCLE_START = '2026-01-01';
export const CONTENT_CYCLE_DAYS = 180;

export function scheduleDateInCycle(dateKey: string): string {
  const startMs = new Date(`${CONTENT_CYCLE_START}T12:00:00`).getTime();
  const targetMs = new Date(`${dateKey}T12:00:00`).getTime();
  const dayOffset = Math.floor((targetMs - startMs) / 86_400_000) % CONTENT_CYCLE_DAYS;
  const normalized =
    ((dayOffset % CONTENT_CYCLE_DAYS) + CONTENT_CYCLE_DAYS) % CONTENT_CYCLE_DAYS;
  return addDaysToKey(CONTENT_CYCLE_START, normalized);
}

export function monthKey(dateKey: string = todayKey()): string {
  return dateKey.slice(0, 7);
}
