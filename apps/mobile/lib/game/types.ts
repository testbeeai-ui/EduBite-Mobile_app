export type DayCriteria = {
  dose: boolean;
  funbrain: boolean;
  puzzles: boolean;
  habits: boolean;
  pledges: boolean;
  completedAt?: string | null;
  pledgeAM?: boolean;
  pledgePM?: boolean;
  habitsDone?: string[];
};

export type HabitState = {
  id: string;
  icon: string;
  bg: string;
  name: string;
  sub: string;
  desc: string;
  benefits: string[];
  rdm: number;
  done: boolean;
};

export type DoseState = {
  index: number;
  locked: boolean;
  correct: number;
  completed: boolean;
  running: boolean;
  timeLeft: number;
  index11: number;
  locked11: boolean;
  correct11: number;
  completed11: boolean;
  index12: number;
  locked12: boolean;
  correct12: number;
  completed12: boolean;
  currentClass: '11' | '12';
  classChosen: boolean;
  answers11: number[];
  answers12: number[];
};

export type FunBrainState = {
  running: boolean;
  timeLeft: number;
  score: number;
  combo: number;
  highScore: number;
  currentQuestionIndex: number;
  answers: (number | null)[];
  finished: boolean;
  completed: boolean;
};

export type DoseDayRecord = {
  correct: number;
  total: number;
  pct: number;
  completed: boolean;
  classLevel: '11' | '12';
};

export type GameState = {
  rdm: number;
  streak: number;
  signedIn: boolean;
  pledgeAM: boolean;
  pledgePM: boolean;
  habits: HabitState[];
  dose: DoseState;
  funbrain: FunBrainState;
  history: DayCriteria[];
  joinedDate: string;
  lastActiveDate: string;
  doseRdmCredited: number;
  funbrainRdmCredited: number;
  puzzleCompleted: boolean;
  doseDayLog: Record<string, DoseDayRecord>;
  dayCriteriaLog: Record<string, DayCriteria>;
  challengeEnrolledMonthKey: string | null;
  challengeEnrolledMonths: string[];
  challengePuzzleSubmittedMonthKey: string | null;
  gyanTimeMs: number;
  gyanUnlockedIds: string[];
  notifications: Array<{
    id: string;
    icon: string;
    text: string;
    targetView?: string;
    createdAt?: string;
    read?: boolean;
  }>;
};
