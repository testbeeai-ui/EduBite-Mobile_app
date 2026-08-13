import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameComponentProps } from '../types';
import { difficultyMultiplier } from '../storage';
import { range } from '../utils';
import { sfx } from '../utils/sound';
import { SquareGrid } from './_shared';

type Cell = { mine: boolean; open: boolean; flag: boolean; n: number };

const SIZE = 6;

function build(difficulty: GameComponentProps['difficulty']): Cell[] {
  const size = SIZE;
  const mines = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 11;
  const cells: Cell[] = range(size * size).map(() => ({
    mine: false,
    open: false,
    flag: false,
    n: 0,
  }));
  let placed = 0;
  while (placed < mines) {
    const i = Math.floor(Math.random() * cells.length);
    if (cells[i]!.mine) continue;
    cells[i]!.mine = true;
    placed++;
  }
  const neighbors = (i: number) => {
    const r = Math.floor(i / size);
    const c = i % size;
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const rr = r + dr;
        const cc = c + dc;
        if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
        if (cells[rr * size + cc]!.mine) count++;
      }
    }
    return count;
  };
  cells.forEach((cell, i) => {
    if (!cell.mine) cell.n = neighbors(i);
  });
  return cells;
}

export function MinesweeperGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  paused,
}: GameComponentProps) {
  const size = SIZE;
  const [cells, setCells] = useState(() => build(difficulty));
  const [start] = useState(() => Date.now());
  const done = useRef(false);

  const flood = (arr: Cell[], i: number) => {
    const stack = [i];
    while (stack.length) {
      const cur = stack.pop()!;
      const cell = arr[cur]!;
      if (cell.open || cell.flag || cell.mine) continue;
      cell.open = true;
      if (cell.n === 0) {
        const r = Math.floor(cur / size);
        const c = cur % size;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const rr = r + dr;
            const cc = c + dc;
            if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
            stack.push(rr * size + cc);
          }
        }
      }
    }
  };

  const finishWin = (arr: Cell[]) => {
    const ns = Math.round(350 * difficultyMultiplier(difficulty));
    onScoreChange?.(ns);
    done.current = true;
    sfx.win(soundEnabled);
    onComplete({ score: ns, won: true, timeMs: Date.now() - start, difficulty });
    setCells([...arr]);
  };

  const open = (i: number) => {
    if (paused || done.current) return;
    const next = cells.map((c) => ({ ...c }));
    const cell = next[i]!;
    if (cell.open || cell.flag) return;
    if (cell.mine) {
      sfx.wrong(soundEnabled);
      done.current = true;
      next.forEach((c) => {
        if (c.mine) c.open = true;
      });
      setCells(next);
      onComplete({ score: 0, won: false, timeMs: Date.now() - start, difficulty });
      return;
    }
    sfx.tap(soundEnabled);
    flood(next, i);
    setCells(next);
    const won = next.every((c) => c.mine || c.open);
    if (won) finishWin(next);
  };

  const flag = (i: number) => {
    if (paused || done.current) return;
    const next = cells.map((c) => ({ ...c }));
    if (next[i]!.open) return;
    next[i]!.flag = !next[i]!.flag;
    setCells(next);
  };

  return (
    <View style={styles.board}>
      <Text style={styles.status}>Minesweeper · long-press to flag</Text>
      <SquareGrid cols={SIZE} rows={SIZE} gap={6} minCell={44} style={styles.gridHost}>
        {({ cell: size }) =>
          cells.map((cell, i) => (
            <Pressable
              key={i}
              onPress={() => open(i)}
              onLongPress={() => flag(i)}
              style={[
                styles.cell,
                { width: size, height: size },
                cell.open && styles.open,
              ]}
            >
              <Text style={[styles.txt, { fontSize: Math.max(12, Math.round(size * 0.35)) }]}>
                {cell.flag
                  ? '🚩'
                  : cell.open
                    ? cell.mine
                      ? '💣'
                      : cell.n || ''
                    : ''}
              </Text>
            </Pressable>
          ))
        }
      </SquareGrid>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    backgroundColor: 'rgba(20,26,35,0.95)',
    justifyContent: 'center',
  },
  status: { textAlign: 'center', color: '#8B96A8', marginBottom: 14, fontWeight: '600' },
  gridHost: {
    flex: 1,
    minHeight: 280,
    maxWidth: 360,
    alignSelf: 'center',
    width: '100%',
  },
  cell: {
    borderRadius: 8,
    backgroundColor: '#1B2330',
    alignItems: 'center',
    justifyContent: 'center',
  },
  open: { backgroundColor: '#171E28' },
  txt: { color: '#EAEEF3', fontWeight: '700' },
});
