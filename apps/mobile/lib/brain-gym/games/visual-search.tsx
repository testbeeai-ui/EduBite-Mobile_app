import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameComponentProps } from '../types';
import { difficultyMultiplier } from '../storage';
import { range } from '../utils';
import { sfx } from '../utils/sound';
import { usePausableScheduler } from './_pausable-scheduler';

const COLORS = ['#60a5fa', '#f472b6', '#2dd4bf', '#fbbf24', '#a78bfa', '#ef4444'];

export function VisualSearchGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const size = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : 6;
  const cells = size * size;
  const duration = difficulty === 'hard' ? 25000 : 30000;
  const [target, setTarget] = useState(COLORS[0]!);
  const [grid, setGrid] = useState<string[]>([]);
  const [found, setFound] = useState(0);
  const [needed, setNeeded] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [start] = useState(() => Date.now());
  const done = useRef(false);

  const gen = () => {
    const t = COLORS[Math.floor(Math.random() * COLORS.length)]!;
    const need = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
    const g = range(cells).map(() => COLORS[Math.floor(Math.random() * COLORS.length)]!);
    // ensure enough targets
    for (let i = 0; i < need; i++) g[i] = t;
    for (let i = g.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [g[i], g[j]] = [g[j]!, g[i]!];
    }
    setTarget(t);
    setNeeded(need);
    setFound(0);
    setGrid(g);
  };

  useEffect(() => {
    gen();
    const id = setInterval(() => {
      if (done.current || paused) return;
      if (Date.now() - start >= duration) {
        done.current = true;
        onComplete({
          score,
          won: score >= 80,
          timeMs: Date.now() - start,
          difficulty,
        });
      }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tap = (i: number) => {
    if (paused || done.current) return;
    if (grid[i] === target) {
      sfx.correct(soundEnabled);
      const nextFound = found + 1;
      const ns = score + Math.round(15 * difficultyMultiplier(difficulty));
      setScore(ns);
      onScoreChange?.(ns);
      const nextGrid = [...grid];
      nextGrid[i] = '#171E28';
      setGrid(nextGrid);
      setFound(nextFound);
      if (nextFound >= needed) gen();
    } else {
      sfx.wrong(soundEnabled);
      const nl = lives - 1;
      setLives(nl);
      onLivesChange?.(nl);
      if (nl <= 0) {
        done.current = true;
        onComplete({ score, won: false, timeMs: Date.now() - start, difficulty });
      }
    }
  };

  return (
    <View style={styles.board}>
      <Text style={styles.status}>
        Tap all <Text style={{ color: target }}>■■</Text> · Found {found}/{needed} · Score{' '}
        {score}
      </Text>
      <View style={styles.grid}>
        {range(cells).map((i) => (
          <Pressable
            key={i}
            onPress={() => tap(i)}
            style={[
              styles.cell,
              { width: `${100 / size - 2}%`, backgroundColor: grid[i] ?? '#171E28' },
            ]}
          />
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
  status: { textAlign: 'center', color: '#8B96A8', marginBottom: 14, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  cell: { aspectRatio: 1, borderRadius: 10 },
});
