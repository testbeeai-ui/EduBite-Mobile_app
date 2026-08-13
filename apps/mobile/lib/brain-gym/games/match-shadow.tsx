import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameComponentProps } from '../types';
import { difficultyMultiplier } from '../storage';
import { shuffle } from '../utils';
import { sfx } from '../utils/sound';
import { COLORS, HudPill, PlayStage } from './_shared';

const PAIRS = ['🍎', '🚗', '🐶', '⭐', '🏠', '🎸', '☂️', '🦋', '🌙', '⚽'] as const;

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
    if (solid === round.answer) {
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
    <PlayStage>
      <View style={styles.board}>
        <HudPill>
          <Text style={styles.hudText}>
            Match the silhouette · Round {n}/{needed}
          </Text>
        </HudPill>

        <View style={styles.shadowBox}>
          <Text style={styles.silhouette}>{round.answer}</Text>
          <Text style={styles.hint}>Which object casts this shadow?</Text>
        </View>

        <View style={styles.grid}>
          {round.options.map((o) => (
            <Pressable
              key={o}
              style={({ pressed }) => [styles.cell, pressed && styles.cellPressed]}
              onPress={() => pick(o)}
            >
              <Text style={styles.emoji}>{o}</Text>
            </Pressable>
          ))}
        </View>
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
  hudText: { color: COLORS.text, fontWeight: '700', fontSize: 13 },
  shadowBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    marginBottom: 16,
    backgroundColor: '#070A10',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  silhouette: {
    fontSize: 72,
    opacity: 0.22,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  hint: { color: COLORS.textDim, marginTop: 10, fontSize: 12 },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    alignContent: 'center',
  },
  cell: {
    width: '46%',
    maxWidth: 180,
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: COLORS.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  cellPressed: {
    borderColor: COLORS.purple,
    backgroundColor: 'rgba(127,119,221,0.18)',
  },
  emoji: { fontSize: 48 },
});
