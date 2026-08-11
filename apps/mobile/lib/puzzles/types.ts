export type PuzzleGrade = "XI" | "XII" | "Competitive";

interface PuzzleBase {
  id: string;
  number: number;
  grade: PuzzleGrade;
  title: string;
  prompt: string;
  hint: string;
  answer: string;
  topic: string;
}

export interface OpenEndedPuzzleDef extends PuzzleBase {
  kind?: "open-ended";
}

export interface McqPuzzleDef extends PuzzleBase {
  kind: "mcq";
  options: [string, string, string, string];
  correctOptionIndex: number;
}

export type PuzzleDef = OpenEndedPuzzleDef | McqPuzzleDef;

export interface PuzzleAttempt {
  puzzleId: string;
  dateKey: string;
  responseType: "open-ended" | "mcq";
  note: string;
  selectedOptionIndex: number | null;
  submittedAt: string;
}

export interface PuzzleProgress {
  version: 2;
  attempts: Record<string, PuzzleAttempt>;
  streak: number;
  lastAttemptDate: string | null;
}

export function createDefaultPuzzleProgress(): PuzzleProgress {
  return {
    version: 2,
    attempts: {},
    streak: 0,
    lastAttemptDate: null,
  };
}
