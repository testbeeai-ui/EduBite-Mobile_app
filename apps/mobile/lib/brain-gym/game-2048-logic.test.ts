import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { canMove, move, spawn, emptyBoard } from './games/game-2048-logic';

describe('2048 board logic', () => {
  it('merges left and scores gained tiles', () => {
    const board = [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const res = move(board, 'left');
    assert.equal(res.moved, true);
    assert.equal(res.gained, 4);
    assert.deepEqual(res.board[0], [4, 0, 0, 0]);
  });

  it('detects when no moves remain', () => {
    const board = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ];
    assert.equal(canMove(board), false);
  });

  it('spawns into an empty cell', () => {
    const board = emptyBoard();
    const next = spawn(board);
    const filled = next.flat().filter((v) => v !== 0);
    assert.equal(filled.length, 1);
    assert.ok(filled[0] === 2 || filled[0] === 4);
  });
});
