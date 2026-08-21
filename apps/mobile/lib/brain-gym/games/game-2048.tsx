import React, { useEffect, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import type { GameComponentProps } from '../types';
import { game2048FinalScore } from '../scoring';
import { sfx } from '../utils/sound';
import {
  canMove,
  emptyBoard,
  move,
  spawn,
  type Board,
  type Dir,
} from './game-2048-logic';
import { SquareGrid } from './_shared';

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
      const final = game2048FinalScore({
        boardScore: ns,
        maxTile: max,
        won: true,
        difficulty,
      });
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
      const final = game2048FinalScore({
        boardScore: ns,
        maxTile: max,
        won: false,
        difficulty,
      });
      onComplete({
        score: final,
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
      <SquareGrid cols={4} rows={4} gap={8} minCell={64} style={styles.gridHost}>
        {({ cell }) =>
          board.flat().map((v, i) => (
            <View
              key={i}
              style={[
                styles.cell,
                { width: cell, height: cell },
                v ? styles.filled : null,
              ]}
            >
              <Text
                style={[
                  styles.num,
                  { fontSize: Math.max(16, Math.round(cell * 0.32)) },
                ]}
              >
                {v || ''}
              </Text>
            </View>
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
  status: { textAlign: 'center', color: '#8B96A8', fontWeight: '600' },
  hint: { textAlign: 'center', color: '#5C6577', marginBottom: 14, fontSize: 12 },
  gridHost: {
    flex: 1,
    minHeight: 240,
    maxWidth: 360,
    alignSelf: 'center',
    width: '100%',
  },
  cell: {
    borderRadius: 12,
    backgroundColor: '#171E28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: { backgroundColor: '#2a3344' },
  num: { color: '#EAEEF3', fontWeight: '800', fontSize: 20 },
});
