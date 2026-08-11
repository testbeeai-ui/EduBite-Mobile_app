import React, { useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import type { GameComponentProps } from '../types';
import { difficultyMultiplier } from '../storage';
import { sfx } from '../utils/sound';

type Board = number[][];

function empty(): Board {
  return Array.from({ length: 4 }, () => Array(4).fill(0));
}

function spawn(board: Board): Board {
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

function move(
  board: Board,
  dir: 'left' | 'right' | 'up' | 'down',
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
    // transpose
    const t = empty();
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) t[c]![r] = next[r]![c]!;
    next = t;
    for (let r = 0; r < 4; r++) applyRow(r, dir === 'down');
    const back = empty();
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) back[c]![r] = next[r]![c]!;
    next = back;
  }
  return { board: next, gained, moved };
}

function canMove(board: Board): boolean {
  for (const dir of ['left', 'right', 'up', 'down'] as const) {
    if (move(board, dir).moved) return true;
  }
  return false;
}

export function Game2048({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  paused,
}: GameComponentProps) {
  const target = difficulty === 'easy' ? 128 : difficulty === 'medium' ? 256 : 2048;
  const [board, setBoard] = useState(() => spawn(spawn(empty())));
  const [score, setScore] = useState(0);
  const [start] = useState(() => Date.now());
  const done = useRef(false);

  const applyDir = (dir: 'left' | 'right' | 'up' | 'down') => {
    if (paused || done.current) return;
    const res = move(board, dir);
    if (!res.moved) return;
    sfx.tap(soundEnabled);
    const withSpawn = spawn(res.board);
    const ns = score + res.gained;
    setScore(ns);
    onScoreChange?.(ns);
    setBoard(withSpawn);
    const max = Math.max(...withSpawn.flat());
    if (max >= target) {
      done.current = true;
      const final = Math.round(ns * difficultyMultiplier(difficulty));
      sfx.win(soundEnabled);
      onComplete({
        score: final,
        won: true,
        timeMs: Date.now() - start,
        difficulty,
      });
      return;
    }
    if (!canMove(withSpawn)) {
      done.current = true;
      onComplete({
        score: ns,
        won: false,
        timeMs: Date.now() - start,
        difficulty,
      });
    }
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 12 || Math.abs(g.dy) > 12,
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > Math.abs(g.dy)) {
          applyDir(g.dx > 0 ? 'right' : 'left');
        } else {
          applyDir(g.dy > 0 ? 'down' : 'up');
        }
      },
    }),
  ).current;

  return (
    <View style={styles.board} {...pan.panHandlers}>
      <Text style={styles.status}>
        2048 · Reach {target} · Score {score}
      </Text>
      <Text style={styles.hint}>Swipe to move</Text>
      <View style={styles.grid}>
        {board.flat().map((v, i) => (
          <View key={i} style={[styles.cell, v ? styles.filled : null]}>
            <Text style={styles.num}>{v || ''}</Text>
          </View>
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
    padding: 12,
    backgroundColor: 'rgba(11,13,18,0.4)',
  },
  status: { textAlign: 'center', color: '#8B96A8', fontWeight: '600' },
  hint: { textAlign: 'center', color: '#5C6577', marginBottom: 10, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  cell: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#171E28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: { backgroundColor: '#2a3344' },
  num: { color: '#EAEEF3', fontWeight: '800', fontSize: 18 },
});
