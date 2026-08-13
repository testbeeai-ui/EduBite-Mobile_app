import React, { useEffect, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import type { GameComponentProps } from '../types';
import { difficultyMultiplier } from '../storage';
import { sfx } from '../utils/sound';
import {
  canMove,
  emptyBoard,
  move,
  spawn,
  type Board,
  type Dir,
} from './game-2048-logic';

export function Game2048({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  paused,
}: GameComponentProps) {
  const target = difficulty === 'easy' ? 128 : difficulty === 'medium' ? 256 : 2048;
  const [board, setBoard] = useState<Board>(() => spawn(spawn(emptyBoard())));
  const [score, setScore] = useState(0);
  const [start] = useState(() => Date.now());
  const done = useRef(false);
  const boardRef = useRef(board);
  const scoreRef = useRef(score);
  const pausedRef = useRef(paused);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const applyDirRef = useRef<(dir: Dir) => void>(() => {});

  applyDirRef.current = (dir: Dir) => {
    if (pausedRef.current || done.current) return;
    const res = move(boardRef.current, dir);
    if (!res.moved) return;
    sfx.tap(soundEnabled);
    const withSpawn = spawn(res.board);
    const ns = scoreRef.current + res.gained;
    scoreRef.current = ns;
    boardRef.current = withSpawn;
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
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 12 || Math.abs(g.dy) > 12,
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > Math.abs(g.dy)) {
          applyDirRef.current(g.dx > 0 ? 'right' : 'left');
        } else {
          applyDirRef.current(g.dy > 0 ? 'down' : 'up');
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
