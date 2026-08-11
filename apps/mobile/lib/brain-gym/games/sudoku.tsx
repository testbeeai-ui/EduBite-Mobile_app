import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameComponentProps } from '../types';
import { difficultyMultiplier } from '../storage';
import { sfx } from '../utils/sound';

type Cell = number | null;

function emptyGrid(): Cell[] {
  return Array(16).fill(null);
}

function isValid(grid: Cell[], idx: number, val: number): boolean {
  const r = Math.floor(idx / 4);
  const c = idx % 4;
  for (let i = 0; i < 4; i++) {
    if (grid[r * 4 + i] === val) return false;
    if (grid[i * 4 + c] === val) return false;
  }
  const br = Math.floor(r / 2) * 2;
  const bc = Math.floor(c / 2) * 2;
  for (let rr = br; rr < br + 2; rr++) {
    for (let cc = bc; cc < bc + 2; cc++) {
      if (grid[rr * 4 + cc] === val) return false;
    }
  }
  return true;
}

function solve(grid: Cell[]): boolean {
  const i = grid.findIndex((v) => v == null);
  if (i < 0) return true;
  for (let v = 1; v <= 4; v++) {
    if (!isValid(grid, i, v)) continue;
    grid[i] = v;
    if (solve(grid)) return true;
    grid[i] = null;
  }
  return false;
}

function makePuzzle(difficulty: GameComponentProps['difficulty']): {
  given: Cell[];
  solution: number[];
} {
  const solution = emptyGrid();
  // seed diagonal boxes
  for (let box = 0; box < 2; box++) {
    const nums = [1, 2, 3, 4].sort(() => Math.random() - 0.5);
    let k = 0;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        solution[(box * 2 + r) * 4 + (box * 2 + c)] = nums[k++]!;
      }
    }
  }
  solve(solution);
  const solNums = solution.map((v) => v ?? 0);
  const given = [...solNums] as Cell[];
  const remove = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 8 : 10;
  const order = Array.from({ length: 16 }, (_, i) => i).sort(() => Math.random() - 0.5);
  for (let i = 0; i < remove; i++) given[order[i]!] = null;
  return { given, solution: solNums };
}

export function SudokuGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  paused,
}: GameComponentProps) {
  const puzzle = useState(() => makePuzzle(difficulty))[0];
  const [grid, setGrid] = useState<Cell[]>(() => [...puzzle.given]);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [start] = useState(() => Date.now());
  const done = useRef(false);

  const place = (val: number) => {
    if (paused || done.current || selected == null) return;
    if (puzzle.given[selected] != null) return;
    if (!isValid(
      grid.map((v, i) => (i === selected ? null : v)),
      selected,
      val,
    )) {
      sfx.wrong(soundEnabled);
      return;
    }
    sfx.tap(soundEnabled);
    const next = [...grid];
    next[selected] = val;
    setGrid(next);
    const filled = next.every((v) => v != null);
    const correct = next.every((v, i) => v === puzzle.solution[i]);
    if (filled && correct) {
      const ns = Math.round(400 * difficultyMultiplier(difficulty));
      setScore(ns);
      onScoreChange?.(ns);
      done.current = true;
      sfx.win(soundEnabled);
      onComplete({ score: ns, won: true, timeMs: Date.now() - start, difficulty });
    }
  };

  return (
    <View style={styles.board}>
      <Text style={styles.status}>4×4 Sudoku · Score {score}</Text>
      <View style={styles.grid}>
        {grid.map((v, i) => {
          const given = puzzle.given[i] != null;
          return (
            <Pressable
              key={i}
              onPress={() => setSelected(i)}
              style={[
                styles.cell,
                selected === i && styles.cellSel,
                given && styles.cellGiven,
              ]}
            >
              <Text style={styles.num}>{v ?? ''}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.pad}>
        {[1, 2, 3, 4].map((n) => (
          <Pressable key={n} style={styles.key} onPress={() => place(n)}>
            <Text style={styles.keyText}>{n}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    backgroundColor: 'rgba(11,13,18,0.4)',
  },
  status: { textAlign: 'center', color: '#8B96A8', marginBottom: 12, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  cell: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#171E28',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cellSel: { borderColor: '#7F77DD' },
  cellGiven: { backgroundColor: '#1B2330' },
  num: { color: '#EAEEF3', fontSize: 22, fontWeight: '800' },
  pad: { flexDirection: 'row', gap: 8, marginTop: 14, justifyContent: 'center' },
  key: {
    width: 56,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#378ADD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { color: '#fff', fontWeight: '800', fontSize: 18 },
});
