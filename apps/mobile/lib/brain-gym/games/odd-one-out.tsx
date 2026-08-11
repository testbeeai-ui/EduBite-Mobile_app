import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameComponentProps } from '../types';
import { difficultyMultiplier } from '../storage';
import { shuffle } from '../utils';
import { sfx } from '../utils/sound';

const CATEGORIES: Record<string, string[]> = {
  fruits: ['🍎', '🍌', '🍇', '🍊', '🍋', '🍉', '🍓'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻'],
  vehicles: ['🚗', '🚕', '🚌', '🚑', '🚒', '🏎️', '🚓'],
  sports: ['⚽', '🏀', '🎾', '⚾', '🏐', '🏈', '🎱'],
  food: ['🍕', '🍔', '🌮', '🍟', '🍗', '🌭', '🥪'],
  weather: ['☀️', '🌧️', '⛈️', '❄️', '🌈', '🌪️', '🔥'],
};

const KEYS = Object.keys(CATEGORIES);

function generateRound(): { items: string[]; odd: string } {
  const mainKey = KEYS[Math.floor(Math.random() * KEYS.length)]!;
  const main = [...CATEGORIES[mainKey]!];
  const mainEmojis: string[] = [];
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * main.length);
    mainEmojis.push(main.splice(idx, 1)[0]!);
  }
  let oddKey = KEYS[Math.floor(Math.random() * KEYS.length)]!;
  while (oddKey === mainKey) oddKey = KEYS[Math.floor(Math.random() * KEYS.length)]!;
  const odd = CATEGORIES[oddKey]![Math.floor(Math.random() * CATEGORIES[oddKey]!.length)]!;
  return { items: shuffle([...mainEmojis, odd]), odd };
}

export function OddOneOutGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const roundsNeeded = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 7 : 9;
  const [round, setRound] = useState(() => generateRound());
  const [n, setN] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [start] = useState(() => Date.now());
  const done = useRef(false);

  const pick = (item: string) => {
    if (paused || done.current) return;
    if (item === round.odd) {
      sfx.correct(soundEnabled);
      const ns = score + Math.round(30 * difficultyMultiplier(difficulty));
      setScore(ns);
      onScoreChange?.(ns);
      if (n >= roundsNeeded) {
        done.current = true;
        onComplete({ score: ns, won: true, timeMs: Date.now() - start, difficulty });
        return;
      }
      setN((x) => x + 1);
      setRound(generateRound());
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
        Find the odd one · Round {n}/{roundsNeeded} · Score {score}
      </Text>
      <View style={styles.grid}>
        {round.items.map((item, i) => (
          <Pressable key={`${item}-${i}`} style={styles.cell} onPress={() => pick(item)}>
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
    padding: 16,
    backgroundColor: 'rgba(11,13,18,0.4)',
  },
  status: { textAlign: 'center', color: '#8B96A8', marginBottom: 14, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  cell: {
    width: '45%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#171E28',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  emoji: { fontSize: 40 },
});
