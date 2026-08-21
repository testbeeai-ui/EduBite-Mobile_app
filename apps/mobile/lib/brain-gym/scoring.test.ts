import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  game2048FinalScore,
  hiddenObjectsPartialScore,
  hiddenObjectsWinScore,
  matchShadowCorrectDelta,
  minesweeperLoseScore,
  minesweeperWinScore,
  oddOneOutCorrectDelta,
  reactionScoreForMs,
  reactionSessionScore,
  speedMathCorrectDelta,
  sudokuWinScore,
  visualSearchPartialScore,
  visualSearchWinScore,
} from './scoring';

describe('brain gym scoring matches Edubite web', () => {
  it('minesweeper: lose awards partial; win is time-banded', () => {
    assert.equal(minesweeperLoseScore(4, 'easy'), 20);
    assert.equal(minesweeperLoseScore(4, 'medium'), 24);
    const win = minesweeperWinScore('easy', 10_000);
    assert.ok(win >= 100 && win <= 1400);
  });

  it('sudoku: web base/speed/mistakes formula', () => {
    // easy base 700, ~full speed bonus 300, 0 mistakes/hints → ~1000
    assert.equal(
      sudokuWinScore({
        difficulty: 'easy',
        timeMs: 0,
        mistakes: 0,
        hintsUsed: 0,
      }),
      1000,
    );
    assert.equal(
      sudokuWinScore({
        difficulty: 'easy',
        timeMs: 0,
        mistakes: 2,
        hintsUsed: 1,
      }),
      650,
    );
  });

  it('2048: multiplies board score; win adds max tile first', () => {
    assert.equal(
      game2048FinalScore({
        boardScore: 100,
        maxTile: 128,
        won: true,
        difficulty: 'easy',
      }),
      228,
    );
    assert.equal(
      game2048FinalScore({
        boardScore: 100,
        maxTile: 128,
        won: false,
        difficulty: 'medium',
      }),
      120,
    );
  });

  it('hidden-objects: partial ×100; win uses targets×200 + time bonus × mult', () => {
    assert.equal(hiddenObjectsPartialScore(3), 300);
    assert.equal(
      hiddenObjectsWinScore({
        targetCount: 4,
        timeLimitMs: 75_000,
        elapsedMs: 15_000,
        difficulty: 'easy',
      }),
      6_800,
    );
  });

  it('odd-one-out / match-shadow / speed-math deltas match web', () => {
    assert.equal(oddOneOutCorrectDelta('easy'), 20);
    assert.equal(oddOneOutCorrectDelta('medium'), 24);
    assert.equal(matchShadowCorrectDelta('easy'), 100);
    assert.equal(matchShadowCorrectDelta('hard'), 150);
    assert.equal(speedMathCorrectDelta('easy'), 100);
    assert.equal(speedMathCorrectDelta('medium'), 120);
  });

  it('visual-search: partial ×50; win uses targets×100 + timeLeft/10 × mult', () => {
    assert.equal(visualSearchPartialScore(3), 150);
    assert.equal(
      visualSearchWinScore({
        numTargets: 4,
        timeLeftMs: 20_000,
        difficulty: 'easy',
      }),
      2400,
    );
  });

  it('reaction-time: quality score minus false-start penalty (no mult)', () => {
    assert.equal(reactionScoreForMs(180), 100);
    assert.equal(reactionScoreForMs(580), 0);
    assert.equal(reactionSessionScore([180, 180, 180, 180, 180], 0), 100);
    assert.equal(reactionSessionScore([180, 180, 180, 180, 180], 2), 90);
  });
});
