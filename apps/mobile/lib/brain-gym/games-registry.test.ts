import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GAMES, GAME_MAP } from './registry';
import type { GameId } from './types';

/** Keep in sync with `games/index.ts` GAME_COMPONENTS keys (tsc also enforces). */
const ALL_GAME_IDS: GameId[] = [
  'sequence-memory',
  'pattern-memory',
  'number-flash',
  'recall-reader',
  'letter-memory',
  'image-memory',
  'sudoku',
  'minesweeper',
  'game-2048',
  'hidden-objects',
  'odd-one-out',
  'match-shadow',
  'visual-search',
  'reaction-time',
  'speed-math',
];

describe('Brain Gym game registry wiring', () => {
  it('lists fifteen unique catalog games covering every GameId', () => {
    const catalogIds = GAMES.map((g) => g.id).sort();
    assert.equal(GAMES.length, 15);
    assert.deepEqual(catalogIds, [...ALL_GAME_IDS].sort());
    assert.equal(new Set(catalogIds).size, catalogIds.length);
  });

  it('exposes GAME_MAP entries for every catalog game', () => {
    for (const id of ALL_GAME_IDS) {
      assert.equal(GAME_MAP[id]?.id, id);
      assert.ok(GAME_MAP[id]?.instructions.length > 0);
      assert.ok(GAME_MAP[id]?.name.length > 0);
    }
  });
});
