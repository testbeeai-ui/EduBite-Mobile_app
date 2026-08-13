import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameComponentProps } from '../types';
import { difficultyMultiplier } from '../storage';
import { sfx } from '../utils/sound';
import { usePausableScheduler } from './_pausable-scheduler';

const MAX_FALSE_STARTS_FOR_WIN = 2;

function reactionScoreForMs(reactionMs: number): number {
  const humanAdjustedMs = Math.max(120, Math.min(1000, reactionMs));
  const score = 100 - Math.max(0, humanAdjustedMs - 180) * 0.25;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function ReactionTimeGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  paused,
}: GameComponentProps) {
  const [phase, setPhase] = useState<'wait' | 'ready' | 'go' | 'early' | 'done'>(
    'wait',
  );
  const [times, setTimes] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const goAt = useRef(0);
  const activeMs = useRef(0);
  const completedRef = useRef(false);
  const inputLocked = useRef(false);
  const falseStarts = useRef(0);
  const armCancel = useRef<(() => void) | null>(null);
  const { schedule } = usePausableScheduler(paused);
  const [start] = useState(() => Date.now());

  const arm = () => {
    if (completedRef.current) return;
    inputLocked.current = false;
    setPhase('ready');
    const delay =
      (difficulty === 'hard' ? 800 : 1200) +
      Math.random() * (difficulty === 'easy' ? 2500 : 1800);
    armCancel.current = schedule(() => {
      if (completedRef.current) return;
      goAt.current = Date.now();
      activeMs.current = 1;
      setPhase('go');
      sfx.tick(soundEnabled);
    }, delay);
  };

  useEffect(() => {
    arm();
    return () => armCancel.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== 'go' || paused || completedRef.current) return;
    let last = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      activeMs.current += now - last;
      last = now;
    }, 10);
    return () => clearInterval(id);
  }, [paused, phase]);

  const tap = () => {
    if (paused || completedRef.current || inputLocked.current) return;
    if (phase === 'ready') {
      inputLocked.current = true;
      armCancel.current?.();
      falseStarts.current += 1;
      sfx.wrong(soundEnabled);
      if (falseStarts.current > MAX_FALSE_STARTS_FOR_WIN) {
        completedRef.current = true;
        onComplete({
          score: 0,
          won: false,
          timeMs: Date.now() - start,
          difficulty,
        });
        setPhase('done');
        return;
      }
      setPhase('early');
      schedule(arm, 800);
      return;
    }
    if (phase !== 'go') return;
    inputLocked.current = true;
    const ms = Math.max(1, Math.round(activeMs.current || Date.now() - goAt.current));
    sfx.correct(soundEnabled);
    const next = [...times, ms];
    setTimes(next);
    const r = round + 1;
    setRound(r);
    const reactionScores = next.map(reactionScoreForMs);
    const avg =
      reactionScores.reduce((a, b) => a + b, 0) / reactionScores.length;
    const score = Math.max(1, Math.round(avg * difficultyMultiplier(difficulty)));
    onScoreChange?.(score);
    if (r >= 5) {
      completedRef.current = true;
      const won = falseStarts.current <= MAX_FALSE_STARTS_FOR_WIN && score >= 60;
      onComplete({ score, won, timeMs: Date.now() - start, difficulty });
      setPhase('done');
      return;
    }
    schedule(arm, 700);
  };

  const bg =
    phase === 'go'
      ? '#1D9E75'
      : phase === 'early'
        ? '#D4537E'
        : phase === 'ready'
          ? '#EF9F27'
          : '#171E28';

  return (
    <Pressable onPress={tap} style={[styles.board, { backgroundColor: bg }]}>
      <Text style={styles.status}>
        Round {Math.min(round + 1, 5)}/5 ·{' '}
        {phase === 'ready'
          ? 'Wait for green…'
          : phase === 'go'
            ? 'TAP!'
            : phase === 'early'
              ? 'Too early!'
              : 'Get ready'}
      </Text>
      {times.length > 0 ? (
        <Text style={styles.meta}>
          Last {times[times.length - 1]}ms · avg{' '}
          {Math.round(times.reduce((a, b) => a + b, 0) / times.length)}ms
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  board: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  status: { color: '#fff', fontSize: 26, fontWeight: '800', textAlign: 'center' },
  meta: { color: 'rgba(255,255,255,0.85)', marginTop: 14, fontSize: 15 },
});
