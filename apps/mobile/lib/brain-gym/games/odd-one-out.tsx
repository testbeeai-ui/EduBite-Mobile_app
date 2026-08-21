import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameComponentProps } from '../types';
import { oddOneOutCorrectDelta } from '../scoring';
import { shuffle } from '../utils';
import { sfx } from '../utils/sound';
import { COLORS, HudPill, PlayStage, SquareGrid } from './_shared';

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
  const roundsNeeded = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 8 : 10;
  const [round, setRound] = useState(() => generateRound());
  const [n, setN] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState<'good' | 'bad' | null>(null);
  const [start] = useState(() => Date.now());
  const done = useRef(false);

  const pick = (item: string) => {
    if (paused || done.current || flash) return;
    if (item === round.odd) {
      sfx.correct(soundEnabled);
      setFlash('good');
      const ns = score + oddOneOutCorrectDelta(difficulty);
      setScore(ns);
      onScoreChange?.(ns);
      setTimeout(() => {
        setFlash(null);
        if (n >= roundsNeeded) {
          done.current = true;
          onComplete({ score: ns, won: true, timeMs: Date.now() - start, difficulty });
          return;
        }
        setN((x) => x + 1);
        setRound(generateRound());
      }, 280);
    } else {
      sfx.wrong(soundEnabled);
      setFlash('bad');
      const nl = lives - 1;
      setLives(nl);
      onLivesChange?.(nl);
      setTimeout(() => {
        setFlash(null);
        if (nl <= 0) {
          done.current = true;
          onComplete({ score, won: false, timeMs: Date.now() - start, difficulty });
        }
      }, 280);
    }
  };

  return (
    <PlayStage>
      <View
        style={[
          styles.board,
          flash === 'good' && styles.boardGood,
          flash === 'bad' && styles.boardBad,
        ]}
      >
        <HudPill>
          <Text style={styles.hudText}>
            Find the odd one · Round {n}/{roundsNeeded}
          </Text>
        </HudPill>
        <Text style={styles.hint}>Three belong together — tap the one that doesn’t</Text>

        <SquareGrid cols={2} rows={2} gap={12} minCell={96} style={styles.gridHost}>
          {({ cell }) =>
            round.items.map((item, i) => (
              <Pressable
                key={`${n}-${item}-${i}`}
                style={({ pressed }) => [
                  styles.cell,
                  { width: cell, height: cell },
                  pressed && styles.cellPressed,
                ]}
                onPress={() => pick(item)}
              >
                <Text
                  style={[
                    styles.emoji,
                    { fontSize: Math.max(40, Math.round(cell * 0.45)) },
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))
          }
        </SquareGrid>
      </View>
    </PlayStage>
  );
}

const styles = StyleSheet.create({
  board: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: 'rgba(20,26,35,0.95)',
    padding: 16,
  },
  boardGood: { borderColor: 'rgba(29,158,117,0.55)' },
  boardBad: { borderColor: 'rgba(212,83,126,0.55)' },
  hudText: { color: COLORS.text, fontWeight: '700', fontSize: 13 },
  hint: {
    textAlign: 'center',
    color: COLORS.textDim,
    fontSize: 12,
    marginBottom: 16,
  },
  gridHost: {
    flex: 1,
    minHeight: 200,
  },
  cell: {
    borderRadius: 22,
    backgroundColor: COLORS.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  cellPressed: {
    borderColor: COLORS.purple,
    backgroundColor: 'rgba(127,119,221,0.18)',
    transform: [{ scale: 0.97 }],
  },
  emoji: { fontSize: 56 },
});
