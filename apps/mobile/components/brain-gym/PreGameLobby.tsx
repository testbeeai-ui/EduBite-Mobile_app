import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@edubite/ui';
import type { Difficulty } from '../../lib/brain-gym/types';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

type PreGameLobbyProps = {
  instructions: string;
  tip?: string;
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  isDifficultyLocked: (d: Difficulty) => boolean;
  onStart: () => void;
  startLabel?: string;
  watermarkEmoji?: string;
};

/** Centered intro card over dimmed playfield — shared by all Brain Gym games. */
export function PreGameLobby({
  instructions,
  tip,
  difficulty,
  onDifficultyChange,
  isDifficultyLocked,
  onStart,
  startLabel = 'Start',
  watermarkEmoji,
}: PreGameLobbyProps) {
  return (
    <View style={styles.stage}>
      {watermarkEmoji ? (
        <Text style={styles.watermark} pointerEvents="none">
          {watermarkEmoji}
        </Text>
      ) : null}
      <View style={styles.card}>
        <Text style={styles.title}>How to play</Text>
        <Text style={styles.body}>{instructions}</Text>
        {tip ? <Text style={styles.tip}>{tip}</Text> : null}
        <Text style={styles.diffLabel}>Difficulty</Text>
        <View style={styles.diffRow}>
          {DIFFICULTIES.map((d) => {
            const locked = isDifficultyLocked(d);
            const active = difficulty === d;
            return (
              <Pressable
                key={d}
                disabled={locked}
                onPress={() => onDifficultyChange(d)}
                style={[
                  styles.diffChip,
                  active && styles.diffChipActive,
                  locked && styles.diffChipLocked,
                ]}
              >
                <Text style={[styles.diffText, active && styles.diffTextActive]}>
                  {d}
                  {locked ? ' 🔒' : ''}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable style={styles.primaryBtn} onPress={onStart}>
          <Text style={styles.primaryBtnText}>{startLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

type PostGameLobbyProps = {
  won: boolean;
  summary: string;
  badgesLine?: string | null;
  onPlayAgain: () => void;
  onDone: () => void;
  watermarkEmoji?: string;
};

export function PostGameLobby({
  won,
  summary,
  badgesLine,
  onPlayAgain,
  onDone,
  watermarkEmoji,
}: PostGameLobbyProps) {
  return (
    <View style={styles.stage}>
      {watermarkEmoji ? (
        <Text style={styles.watermark} pointerEvents="none">
          {watermarkEmoji}
        </Text>
      ) : null}
      <View style={styles.card}>
        <Text style={styles.title}>{won ? 'You won!' : 'Session over'}</Text>
        <Text style={styles.body}>{summary}</Text>
        {badgesLine ? <Text style={styles.body}>{badgesLine}</Text> : null}
        <View style={styles.rowBtns}>
          <Pressable style={[styles.primaryBtn, styles.flex]} onPress={onPlayAgain}>
            <Text style={styles.primaryBtnText}>Play again</Text>
          </Pressable>
          <Pressable style={[styles.secondaryBtn, styles.flex]} onPress={onDone}>
            <Text style={styles.secondaryBtnText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  watermark: {
    position: 'absolute',
    fontSize: 120,
    opacity: 0.1,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.colors.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  body: { color: theme.colors.textDim, lineHeight: 20, marginBottom: 12 },
  tip: {
    color: theme.colors.amber,
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 17,
  },
  diffLabel: {
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 4,
  },
  diffRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  diffChip: {
    flex: 1,
    minHeight: 40,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.cardHi,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diffChipActive: { backgroundColor: theme.colors.purple },
  diffChipLocked: { opacity: 0.4 },
  diffText: {
    color: theme.colors.textDim,
    textTransform: 'capitalize',
    fontSize: 12,
    fontWeight: '600',
  },
  diffTextActive: { color: '#fff', fontWeight: '700' },
  primaryBtn: {
    backgroundColor: theme.colors.purple,
    borderRadius: 12,
    minHeight: 48,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  secondaryBtn: {
    backgroundColor: theme.colors.cardHi,
    borderRadius: 12,
    minHeight: 48,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { color: theme.colors.text, fontWeight: '700' },
  rowBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  flex: { flex: 1 },
});
