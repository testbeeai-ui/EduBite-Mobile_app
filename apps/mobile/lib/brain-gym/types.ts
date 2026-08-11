export type GameCategory = 'memory' | 'logic' | 'visual' | 'speed';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type DifficultyWins = Record<Difficulty, number>;

export type GameId =
  | 'sequence-memory'
  | 'pattern-memory'
  | 'number-flash'
  | 'recall-reader'
  | 'letter-memory'
  | 'image-memory'
  | 'sudoku'
  | 'minesweeper'
  | 'game-2048'
  | 'hidden-objects'
  | 'odd-one-out'
  | 'match-shadow'
  | 'visual-search'
  | 'reaction-time'
  | 'speed-math';

export interface GameMeta {
  id: GameId;
  name: string;
  shortName: string;
  emoji: string;
  category: GameCategory;
  description: string;
  instructions: string;
  estimatedSeconds: number;
  hasTimer: boolean;
  hasLives: boolean;
  maxLives?: number;
  defaultDifficulty: Difficulty;
  tags: string[];
  color: string;
}

export interface GameScoreEntry {
  score: number;
  bestTimeMs?: number;
  difficulty: Difficulty;
  at: string;
  won: boolean;
}

export interface GameStats {
  plays: number;
  wins: number;
  winsByDifficulty: DifficultyWins;
  bestScore: number;
  bestTimeMs?: number;
  lastPlayed?: string;
  recentScores: GameScoreEntry[];
  favorite: boolean;
}

export interface BrainGymProgress {
  version: 2;
  soundEnabled: boolean;
  darkMode: boolean;
  streak: number;
  lastPlayDate: string | null;
  playDates: string[];
  totalPlays: number;
  totalWins: number;
  games: Partial<Record<GameId, GameStats>>;
  badges: string[];
  dailyChallenge: {
    date: string;
    gameId: GameId;
    completed: boolean;
    score: number;
  } | null;
  recentGameIds: GameId[];
  rdmEarned: number;
}

export interface GameSessionResult {
  score: number;
  won: boolean;
  timeMs: number;
  difficulty: Difficulty;
  accuracy?: number;
  extra?: Record<string, number | string>;
}

export type BrainGymMutation =
  | { type: 'initialize' }
  | { type: 'sound'; enabled: boolean }
  | { type: 'favorite'; gameId: GameId; favorite: boolean }
  | {
      type: 'session';
      sessionId: string;
      gameId: GameId;
      result: GameSessionResult;
      isDaily: boolean;
      baseProgress: BrainGymProgress;
    };

export interface GameComponentProps {
  difficulty: Difficulty;
  soundEnabled: boolean;
  onComplete: (result: GameSessionResult) => void;
  onScoreChange?: (score: number) => void;
  onLivesChange?: (lives: number) => void;
  paused: boolean;
  restartKey: number;
}
