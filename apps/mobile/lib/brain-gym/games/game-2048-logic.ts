export type Board = number[][];
export type Dir = 'left' | 'right' | 'up' | 'down';

export function emptyBoard(): Board {
  return Array.from({ length: 4 }, () => Array(4).fill(0));
}

export function spawn(board: Board): Board {
  const next = board.map((r) => [...r]);
  const empties: Array<[number, number]> = [];
  next.forEach((row, r) =>
    row.forEach((v, c) => {
      if (!v) empties.push([r, c]);
    }),
  );
  if (!empties.length) return next;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)]!;
  next[r]![c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function slide(row: number[]): { row: number[]; gained: number; moved: boolean } {
  const filtered = row.filter((v) => v !== 0);
  const out: number[] = [];
  let gained = 0;
  for (let i = 0; i < filtered.length; i++) {
    if (filtered[i] === filtered[i + 1]) {
      const v = filtered[i]! * 2;
      out.push(v);
      gained += v;
      i++;
    } else out.push(filtered[i]!);
  }
  while (out.length < 4) out.push(0);
  const moved = out.some((v, i) => v !== row[i]);
  return { row: out, gained, moved };
}

export function move(
  board: Board,
  dir: Dir,
): { board: Board; gained: number; moved: boolean } {
  let gained = 0;
  let moved = false;
  let next = board.map((r) => [...r]);
  const applyRow = (r: number, reverse: boolean) => {
    const row = reverse ? [...next[r]!].reverse() : [...next[r]!];
    const res = slide(row);
    gained += res.gained;
    moved = moved || res.moved;
    next[r] = reverse ? res.row.reverse() : res.row;
  };
  if (dir === 'left' || dir === 'right') {
    for (let r = 0; r < 4; r++) applyRow(r, dir === 'right');
  } else {
    const t = emptyBoard();
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) t[c]![r] = next[r]![c]!;
    next = t;
    for (let r = 0; r < 4; r++) applyRow(r, dir === 'down');
    const back = emptyBoard();
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) back[c]![r] = next[r]![c]!;
    next = back;
  }
  return { board: next, gained, moved };
}

export function canMove(board: Board): boolean {
  for (const dir of ['left', 'right', 'up', 'down'] as const) {
    if (move(board, dir).moved) return true;
  }
  return false;
}
