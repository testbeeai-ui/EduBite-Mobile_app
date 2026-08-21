import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameComponentProps } from '../types';
import {
  isReactionRunWon,
  reactionSessionScore,
} from '../scoring';
import { sfx } from '../utils/sound';
import { usePausableScheduler } from './_pausable-scheduler';

const MAX_FALSE_STARTS_FOR_WIN = 2;

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
          extra: { falseStarts: falseStarts.current },
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
    const score = reactionSessionScore(next, falseStarts.current, difficulty);
    onScoreChange?.(score);
    if (r >= 5) {
      completedRef.current = true;
      const avg = next.reduce((a, b) => a + b, 0) / next.length;
      onComplete({
        score,
        won: isReactionRunWon(falseStarts.current, score),
        timeMs: Date.now() - start,
        difficulty,
        extra: {
          avgMs: Math.round(avg),
          falseStarts: falseStarts.current,
        },
      });
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
          ? '#243041'
          : '#1B2330';

  return (
    <Pressable style={[styles.board, { backgroundColor: bg }]} onPress={tap}>
      <Text style={styles.status}>
        Round {Math.min(round + 1, 5)}/5 · False starts {falseStarts.current}
      </Text>
      <Text style={styles.prompt}>
        {phase === 'ready'
          ? 'Wait for green…'
          : phase === 'go'
            ? 'TAP!'
            : phase === 'early'
              ? 'Too early!'
              : phase === 'done'
                ? 'Done'
                : 'Get ready'}
      </Text>
      {times.length > 0 ? (
        <Text style={styles.avg}>
          Avg {Math.round(times.reduce((a, b) => a + b, 0) / times.length)}ms
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
  status: { color: '#8B96A8', fontWeight: '600', marginBottom: 12 },
  prompt: { color: '#EAEEF3', fontSize: 36, fontWeight: '800' },
  avg: { color: '#8B96A8', marginTop: 16, fontWeight: '600' },
});
