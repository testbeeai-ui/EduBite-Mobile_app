import { daysBetween, todayKey } from '../game/date';
import type {
  InspirationPhenomena,
  InspirationQuote,
  InspirationRoleModel,
} from '../supabase';

const INSPIRATION_EPOCH = '2026-07-20';

function dayIndex(dateKey: string = todayKey()): number {
  const offset = daysBetween(INSPIRATION_EPOCH, dateKey);
  return Math.max(0, offset);
}

function pickByDay<T>(items: T[], dateKey: string): T | null {
  if (!items.length) return null;
  return items[dayIndex(dateKey) % items.length] ?? null;
}

export function quoteForDate(
  quotes: InspirationQuote[],
  dateKey: string = todayKey(),
): InspirationQuote | null {
  return pickByDay(quotes, dateKey);
}

export function roleModelForDate(
  models: InspirationRoleModel[],
  dateKey: string = todayKey(),
): InspirationRoleModel | null {
  return pickByDay(models, dateKey);
}

export function phenomenonForDate(
  phenomena: InspirationPhenomena[],
  dateKey: string = todayKey(),
): InspirationPhenomena | null {
  return pickByDay(phenomena, dateKey);
}
