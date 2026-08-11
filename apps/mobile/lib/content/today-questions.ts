/**
 * Single learner content pipeline for DailyDose / FunBrain.
 * Anon key is public — anything selected here is world-readable.
 * Do not add `correct` (or other answer keys) to these DTOs.
 */
import { scheduleDateInCycle, todayKey } from '../game/date';
import {
  fetchDailyDoseQuestions,
  fetchFunBrainQuestions,
  type ContentQuestion,
} from '../supabase';

export type LearnerQuestion = {
  id: string;
  tag: string;
  text: string;
  opts: string[];
};

function normalizeOpts(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((o) => String(o ?? '').trim()).filter(Boolean);
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((o) => String(o ?? '').trim()).filter(Boolean);
      }
    } catch {
      /* ignore */
    }
  }
  return [];
}

/** Matches web FunBrain prompt cleanup for bank-prefixed rows. */
export function stripFunBrainBankLabel(prompt: string): string {
  return prompt.replace(/^[A-Za-z]+(?:\s+[A-Za-z]+)*\s+\d+:\s*/, '').trim();
}

export function mapContentRows(
  rows: ContentQuestion[],
  opts?: { stripFunBrainLabel?: boolean },
): LearnerQuestion[] {
  return rows
    .map((row) => {
      const text = opts?.stripFunBrainLabel
        ? stripFunBrainBankLabel(row.q || '')
        : (row.q || '').trim();
      return {
        id: String(row.id),
        tag: (row.tag || '').trim(),
        text,
        opts: normalizeOpts(row.opts),
      };
    })
    .filter((q) => q.text.length > 0 && q.opts.length >= 2);
}

export async function loadTodayDailyDose(
  classLevel: '11' | '12',
): Promise<{ scheduleDate: string; dateKey: string; questions: LearnerQuestion[] }> {
  const dateKey = todayKey();
  const scheduleDate = scheduleDateInCycle(dateKey);
  const rows = await fetchDailyDoseQuestions(classLevel, scheduleDate);
  return {
    dateKey,
    scheduleDate,
    questions: mapContentRows(rows),
  };
}

export async function loadTodayFunBrain(): Promise<{
  scheduleDate: string;
  dateKey: string;
  questions: LearnerQuestion[];
}> {
  const dateKey = todayKey();
  const scheduleDate = scheduleDateInCycle(dateKey);
  const rows = await fetchFunBrainQuestions(scheduleDate);
  return {
    dateKey,
    scheduleDate,
    questions: mapContentRows(rows, { stripFunBrainLabel: true }),
  };
}
