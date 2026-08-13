import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameComponentProps } from '../types';
import { difficultyMultiplier } from '../storage';
import { shuffle } from '../utils';
import { sfx } from '../utils/sound';
import { usePausableScheduler } from './_pausable-scheduler';

function makeQuestion(difficulty: GameComponentProps['difficulty']) {
  const max = difficulty === 'easy' ? 12 : difficulty === 'medium' ? 20 : 40;
  const a = 1 + Math.floor(Math.random() * max);
  const b = 1 + Math.floor(Math.random() * max);
  const ops = difficulty === 'hard' ? ['+', '-', '*'] : ['+', '-'];
  const op = ops[Math.floor(Math.random() * ops.length)]!;
  let answer = a + b;
  let equation = `${a} + ${b}`;
  if (op === '-') {
    const x = Math.max(a, b);
    const y = Math.min(a, b);
    answer = x - y;
    equation = `${x} − ${y}`;
  } else if (op === '*') {
    const x = 2 + Math.floor(Math.random() * 9);
    const y = 2 + Math.floor(Math.random() * 9);
    answer = x * y;
    equation = `${x} × ${y}`;
  }
  const distractors = new Set<number>();
  while (distractors.size < 3) {
    const d = answer + (Math.floor(Math.random() * 11) - 5);
    if (d !== answer && d >= 0) distractors.add(d);
  }
  return {
    equation,
    answer,
    options: shuffle([answer, ...distractors]),
  };
}

export function SpeedMathGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const duration = difficulty === 'easy' ? 45000 : difficulty === 'medium' ? 40000 : 35000;
  const [q, setQ] = useState(() => makeQuestion(difficulty));
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [left, setLeft] = useState(duration);
  const [start] = useState(() => Date.now());
  const done = useRef(false);
  const { schedule } = usePausableScheduler(paused);

  useEffect(() => {
    if (paused || done.current) return;
    const id = setInterval(() => {
      const remain = duration - (Date.now() - start);
      setLeft(Math.max(0, remain));
      if (remain <= 0 && !done.current) {
        done.current = true;
        onComplete({
          score,
          won: score >= 100,
          timeMs: Date.now() - start,
          difficulty,
        });
      }
    }, 100);
    return () => clearInterval(id);
  }, [paused, duration, start, score, onComplete, difficulty]);

  const pick = (val: number) => {
    if (paused || done.current) return;
    if (val === q.answer) {
      sfx.correct(soundEnabled);
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      const ns =
        score +
        Math.round(20 * difficultyMultiplier(difficulty) * (1 + nextCombo * 0.1));
      setScore(ns);
      onScoreChange?.(ns);
      setQ(makeQuestion(difficulty));
    } else {
      sfx.wrong(soundEnabled);
      setCombo(0);
      const nl = lives - 1;
      setLives(nl);
      onLivesChange?.(nl);
      if (nl <= 0) {
        done.current = true;
        onComplete({ score, won: false, timeMs: Date.now() - start, difficulty });
      } else setQ(makeQuestion(difficulty));
    }
  };

  return (
    <View style={styles.board}>
      <Text style={styles.status}>
        {Math.ceil(left / 1000)}s · Combo {combo} · Score {score}
      </Text>
      <Text style={styles.eq}>{q.equation} = ?</Text>
      <View style={styles.grid}>
        {q.options.map((opt) => (
          <Pressable key={opt} style={styles.cell} onPress={() => pick(opt)}>
            <Text style={styles.opt}>{opt}</Text>
          </Pressable>
        ))}
      </View>
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
  eq: {
    textAlign: 'center',
    color: '#EAEEF3',
    fontSize: 36,
    fontWeight: '800',
    marginVertical: 28,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  cell: {
    width: '45%',
    paddingVertical: 22,
    borderRadius: 16,
    backgroundColor: '#171E28',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  opt: { color: '#fff', fontSize: 24, fontWeight: '800' },
});
