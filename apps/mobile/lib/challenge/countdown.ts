/** Milliseconds until local midnight of `dateKey` (YYYY-MM-DD). */
export function msUntilDateStart(dateKey: string, now = new Date()): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return 0;
  const target = new Date(y, m - 1, d, 0, 0, 0, 0);
  return Math.max(0, target.getTime() - now.getTime());
}

/** Milliseconds until local end of `dateKey` (next midnight). */
export function msUntilDateEnd(dateKey: string, now = new Date()): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return 0;
  const target = new Date(y, m - 1, d + 1, 0, 0, 0, 0);
  return Math.max(0, target.getTime() - now.getTime());
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Longer countdown when days remain (e.g. puzzle opens). */
export function formatCountdownLong(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (days > 0) {
    return `${days}d ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return formatCountdown(ms);
}
