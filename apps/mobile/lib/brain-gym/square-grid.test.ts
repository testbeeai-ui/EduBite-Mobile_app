import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { computeSquareCellSize } from './square-grid';

describe('computeSquareCellSize', () => {
  it('returns equal width/height cells that fit a phone board', () => {
    const layout = computeSquareCellSize({
      width: 340,
      height: 420,
      cols: 3,
      rows: 3,
      gap: 10,
      minCell: 48,
    });
    assert.ok(layout.cell >= 48);
    assert.equal(layout.gridWidth, 3 * layout.cell + 2 * layout.gap);
    assert.equal(layout.gridHeight, 3 * layout.cell + 2 * layout.gap);
    assert.ok(layout.gridWidth <= 340);
    assert.ok(layout.gridHeight <= 420);
  });

  it('keeps visual-search 6x6 cells from collapsing to lines', () => {
    const layout = computeSquareCellSize({
      width: 360,
      height: 400,
      cols: 6,
      rows: 6,
      gap: 8,
      minCell: 48,
    });
    assert.ok(layout.cell >= 36);
    assert.ok(layout.cell >= 48 || layout.gap === 6);
    // Never a "line" — height equals width conceptually via same cell value
    assert.equal(layout.gridHeight / 6 > 20, true);
  });

  it('never returns zero/negative cell size', () => {
    const layout = computeSquareCellSize({
      width: 0,
      height: 0,
      cols: 4,
      rows: 4,
    });
    assert.ok(layout.cell >= 36);
  });

  it('fits height when minCell would overflow a short board', () => {
    const layout = computeSquareCellSize({
      width: 360,
      height: 220,
      cols: 6,
      rows: 6,
      gap: 8,
      minCell: 48,
    });
    assert.ok(layout.gridHeight <= 220);
    assert.ok(layout.gridWidth <= 360);
    assert.ok(layout.cell >= 1);
    assert.ok(layout.cell < 48);
  });
});
