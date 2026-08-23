import type { DoseDayRecord } from './types';

export type DoseResultStatus = 'pending' | 'graded' | 'unsigned';

export type DoseResultView = {
  status: DoseResultStatus;
  correct: number;
  total: number;
  pct: number;
};

/**
 * DailyDose results after the exam — same fields web uses:
 * doseDayLog[today] { correct, total, pct, completed, classLevel }.
 * While persist is in flight the log is not official yet.
 */
export function doseResultView(args: {
  signedIn: boolean;
  classLevel: '11' | '12';
  dayLog?: DoseDayRecord | null;
  questionCount: number;
  saving?: boolean;
}): DoseResultView {
  const total =
    args.dayLog?.classLevel === args.classLevel && args.dayLog.total > 0
      ? args.dayLog.total
      : Math.max(0, args.questionCount);

  if (!args.signedIn) {
    return { status: 'unsigned', correct: 0, total, pct: 0 };
  }

  if (args.saving) {
    return { status: 'pending', correct: 0, total, pct: 0 };
  }

  const sameClass = args.dayLog?.classLevel === args.classLevel;
  if (sameClass && args.dayLog?.completed) {
    return {
      status: 'graded',
      correct: args.dayLog.correct,
      total: args.dayLog.total > 0 ? args.dayLog.total : total,
      pct: args.dayLog.pct,
    };
  }

  return { status: 'pending', correct: 0, total, pct: 0 };
}
