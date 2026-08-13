import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameComponentProps } from '../types';
import { difficultyMultiplier } from '../storage';
import { shuffle } from '../utils';
import { sfx } from '../utils/sound';

const PAIRS: Array<{ solid: string; shadow: string }> = [
  { solid: '🍎', shadow: '⬛' },
  { solid: '🚗', shadow: '⬛' },
  { solid: '🐶', shadow: '⬛' },
  { solid: '⭐', shadow: '⬛' },
  { solid: '🏠', shadow: '⬛' },
  { solid: '🎸', shadow: '⬛' },
  { solid: '☂️', shadow: '⬛' },
  { solid: '🦋', shadow: '⬛' },
];

export function MatchShadowGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const needed = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 7 : 9;
  const [n, setN] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [start] = useState(() => Date.now());
  const done = useRef(false);

  const makeRound = () => {
    const opts = shuffle([...PAIRS]).slice(0, 4);
    const answer = opts[Math.floor(Math.random() * opts.length)]!;
    return { answer, options: opts };
  };
  const [round, setRound] = useState(makeRound);

  const pick = (solid: string) => {
    if (paused || done.current) return;
    if (solid === round.answer.solid) {
      sfx.correct(soundEnabled);
      const ns = score + Math.round(35 * difficultyMultiplier(difficulty));
      setScore(ns);
      onScoreChange?.(ns);
      if (n >= needed) {
        done.current = true;
        onComplete({ score: ns, won: true, timeMs: Date.now() - start, difficulty });
        return;
      }
      setN((x) => x + 1);
      setRound(makeRound());
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
      <Text style={styles.status}>Match the shadow · Round {n}/{needed}</Text>
      <View style={styles.shadowBox}>
        <Text style={[styles.shadowEmoji, styles.silhouette]}>{round.answer.solid}</Text>
        <Text style={styles.hint}>Match this silhouette</Text>
      </View>
      <View style={styles.grid}>
        {round.options.map((o) => (
          <Pressable key={o.solid} style={styles.cell} onPress={() => pick(o.solid)}>
            <Text style={styles.emoji}>{o.solid}</Text>
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
  shadowBox: {
    alignItems: 'center',
    paddingVertical: 18,
    marginBottom: 12,
    backgroundColor: '#0B0E16',
    borderRadius: 14,
  },
  shadowEmoji: { fontSize: 56 },
  silhouette: { opacity: 0.28, color: '#000' },
  hint: { color: '#5C6577', marginTop: 6, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  cell: {
    width: '45%',
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: '#171E28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 40 },
});
