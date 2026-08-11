import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameComponentProps } from '../types';
import { difficultyMultiplier } from '../storage';
import { shuffle } from '../utils';
import { sfx } from '../utils/sound';

const ITEMS = ['🔑', '💍', '🪙', '📎', '🧩', '🧿', '🎩', '🧸', '📷', '🧪'];

export function HiddenObjectsGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  paused,
}: GameComponentProps) {
  const count = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : 6;
  const duration = difficulty === 'hard' ? 35000 : 45000;
  const targets = useState(() => shuffle(ITEMS).slice(0, count))[0];
  const [found, setFound] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [start] = useState(() => Date.now());
  const done = useRef(false);
  const clutter = useState(() =>
    shuffle([...ITEMS, ...ITEMS, ...ITEMS]).slice(0, 18),
  )[0];

  useEffect(() => {
    const id = setInterval(() => {
      if (done.current || paused) return;
      if (Date.now() - start >= duration) {
        done.current = true;
        onComplete({
          score,
          won: found.length >= count,
          timeMs: Date.now() - start,
          difficulty,
        });
      }
    }, 200);
    return () => clearInterval(id);
  }, [paused, start, duration, score, found.length, count, onComplete, difficulty]);

  const tap = (item: string, index: number) => {
    if (paused || done.current) return;
    if (!targets.includes(item) || found.includes(`${item}-${index}`)) {
      sfx.wrong(soundEnabled);
      return;
    }
    if (!targets.includes(item)) return;
    // mark by value once
    if (found.some((f) => f.startsWith(item))) {
      sfx.wrong(soundEnabled);
      return;
    }
    sfx.correct(soundEnabled);
    const nextFound = [...found, `${item}-${index}`];
    setFound(nextFound);
    const ns = score + Math.round(40 * difficultyMultiplier(difficulty));
    setScore(ns);
    onScoreChange?.(ns);
    const uniqueFound = new Set(nextFound.map((f) => f.split('-')[0]));
    if (uniqueFound.size >= count) {
      done.current = true;
      onComplete({
        score: ns,
        won: true,
        timeMs: Date.now() - start,
        difficulty,
      });
    }
  };

  return (
    <View style={styles.board}>
      <Text style={styles.status}>
        Find: {targets.join(' ')} · {found.length}/{count}
      </Text>
      <View style={styles.scene}>
        {clutter.map((item, i) => (
          <Pressable
            key={`${item}-${i}`}
            onPress={() => tap(item, i)}
            style={[
              styles.item,
              {
                left: `${(i * 17) % 85}%`,
                top: `${(i * 23) % 75}%`,
                opacity: found.some((f) => f.startsWith(item)) ? 0.2 : 1,
              },
            ]}
          >
            <Text style={styles.emoji}>{item}</Text>
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
    padding: 12,
    backgroundColor: 'rgba(11,13,18,0.4)',
  },
  status: { textAlign: 'center', color: '#8B96A8', marginBottom: 10, fontWeight: '600' },
  scene: {
    height: 280,
    borderRadius: 14,
    backgroundColor: '#141A23',
    overflow: 'hidden',
    position: 'relative',
  },
  item: { position: 'absolute', padding: 6 },
  emoji: { fontSize: 28 },
});
