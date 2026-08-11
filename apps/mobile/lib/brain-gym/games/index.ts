import type { ComponentType } from 'react';
import type { GameComponentProps, GameId } from '../types';
import { SequenceMemoryGame } from './sequence-memory';
import { PatternMemoryGame } from './pattern-memory';
import { NumberFlashGame } from './number-flash';
import { RecallReaderGame } from './recall-reader';
import { LetterMemoryGame } from './letter-memory';
import { ImageMemoryGame } from './image-memory';
import { SudokuGame } from './sudoku';
import { MinesweeperGame } from './minesweeper';
import { Game2048 } from './game-2048';
import { HiddenObjectsGame } from './hidden-objects';
import { OddOneOutGame } from './odd-one-out';
import { MatchShadowGame } from './match-shadow';
import { VisualSearchGame } from './visual-search';
import { ReactionTimeGame } from './reaction-time';
import { SpeedMathGame } from './speed-math';

export const GAME_COMPONENTS: Record<
  GameId,
  ComponentType<GameComponentProps>
> = {
  'sequence-memory': SequenceMemoryGame,
  'pattern-memory': PatternMemoryGame,
  'number-flash': NumberFlashGame,
  'recall-reader': RecallReaderGame,
  'letter-memory': LetterMemoryGame,
  'image-memory': ImageMemoryGame,
  sudoku: SudokuGame,
  minesweeper: MinesweeperGame,
  'game-2048': Game2048,
  'hidden-objects': HiddenObjectsGame,
  'odd-one-out': OddOneOutGame,
  'match-shadow': MatchShadowGame,
  'visual-search': VisualSearchGame,
  'reaction-time': ReactionTimeGame,
  'speed-math': SpeedMathGame,
};
