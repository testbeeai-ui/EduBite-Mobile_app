import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { theme } from '@edubite/ui';
import { GAME_MAP } from '../../lib/brain-gym/registry';
import { GAME_COMPONENTS } from '../../lib/brain-gym/games';
import { useBrainGym } from '../../lib/brain-gym/hooks/useBrainGym';
import { isDifficultyLocked } from '../../lib/brain-gym/storage';
import type { Difficulty } from '../../lib/brain-gym/types';
import { formatMsAsClock } from '../../lib/brain-gym/utils';

type Phase = 'intro' | 'play' | 'result';

export function GameShell() {
  const {
    activeGameId,
    closeGame,
    completeSession,
    difficulty,
    setDifficulty,
    progress,
    toggleSound,
    lastResult,
    clearLastResult,
    isDailyRun,
  } = useBrainGym();

  const meta = activeGameId ? GAME_MAP[activeGameId] : null;
  const Game = activeGameId ? GAME_COMPONENTS[activeGameId] : null;
  const [phase, setPhase] = useState<Phase>('intro');
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(meta?.maxLives ?? 0);
  const [restartKey, setRestartKey] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const completionHandledRef = useRef(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (!activeGameId || !meta) return;
    setPhase('intro');
    setPaused(false);
    setScore(0);
    setLives(meta.maxLives ?? 0);
    setRestartKey((k) => k + 1);
    setElapsed(0);
    completionHandledRef.current = false;
    clearLastResult();
    startRef.current = Date.now();
  }, [activeGameId, meta, clearLastResult]);

  useEffect(() => {
    if (phase !== 'play' || paused) return;
    const id = setInterval(() => {
      setElapsed(Date.now() - startRef.current);
    }, 250);
    return () => clearInterval(id);
  }, [phase, paused, restartKey]);

  if (!activeGameId || !meta || !Game) return null;

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen">
      <View style={styles.root}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => {
              if (phase === 'play' && !completionHandledRef.current) {
                // confirm-ish: just close for mobile speed
              }
              closeGame();
            }}
            style={styles.iconBtn}
          >
            <Text style={styles.iconBtnText}>✕</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              {meta.emoji} {meta.name}
              {isDailyRun ? ' · Daily' : ''}
            </Text>
            <Text style={styles.sub}>
              {phase === 'play'
                ? formatMsAsClock(elapsed)
                : meta.estimatedSeconds + 's · ' + meta.category}
            </Text>
          </View>
          <Pressable onPress={toggleSound} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>
              {progress.soundEnabled ? '🔊' : '🔇'}
            </Text>
          </Pressable>
          {phase === 'play' ? (
            <Pressable
              onPress={() => setPaused((p) => !p)}
              style={styles.iconBtn}
            >
              <Text style={styles.iconBtnText}>{paused ? '▶' : '⏸'}</Text>
            </Pressable>
          ) : null}
        </View>

        {phase === 'play' ? (
          <View style={styles.statsRow}>
            <Text style={styles.stat}>Score {score}</Text>
            {meta.hasLives ? <Text style={styles.stat}>❤ {lives}</Text> : null}
          </View>
        ) : null}

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          {phase === 'intro' ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>How to play</Text>
              <Text style={styles.cardBody}>{meta.instructions}</Text>
              <Text style={styles.diffLabel}>Difficulty</Text>
              <View style={styles.diffRow}>
                {difficulties.map((d) => {
                  const locked = isDifficultyLocked(progress, activeGameId, d);
                  const active = difficulty === d;
                  return (
                    <Pressable
                      key={d}
                      disabled={locked}
                      onPress={() => setDifficulty(d)}
                      style={[
                        styles.diffChip,
                        active && styles.diffChipActive,
                        locked && styles.diffChipLocked,
                      ]}
                    >
                      <Text
                        style={[
                          styles.diffText,
                          active && styles.diffTextActive,
                        ]}
                      >
                        {d}
                        {locked ? ' 🔒' : ''}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Pressable
                style={styles.primaryBtn}
                onPress={() => {
                  completionHandledRef.current = false;
                  startRef.current = Date.now();
                  setElapsed(0);
                  setPhase('play');
                  setRestartKey((k) => k + 1);
                }}
              >
                <Text style={styles.primaryBtnText}>Start</Text>
              </Pressable>
            </View>
          ) : null}

          {phase === 'play' ? (
            <Game
              key={restartKey}
              difficulty={difficulty}
              soundEnabled={progress.soundEnabled}
              paused={paused}
              restartKey={restartKey}
              onScoreChange={setScore}
              onLivesChange={setLives}
              onComplete={(result) => {
                if (completionHandledRef.current) return;
                completionHandledRef.current = true;
                completeSession(result);
                setPhase('result');
              }}
            />
          ) : null}

          {phase === 'result' && lastResult ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {lastResult.result.won ? 'You won!' : 'Session over'}
              </Text>
              <Text style={styles.cardBody}>
                Score {lastResult.result.score} ·{' '}
                {formatMsAsClock(lastResult.result.timeMs)}
                {lastResult.rdmGain > 0
                  ? ` · +${lastResult.rdmGain} RDM`
                  : ''}
              </Text>
              {lastResult.newBadges.length > 0 ? (
                <Text style={styles.cardBody}>
                  Badges: {lastResult.newBadges.join(', ')}
                </Text>
              ) : null}
              <View style={styles.rowBtns}>
                <Pressable
                  style={[styles.primaryBtn, { flex: 1 }]}
                  onPress={() => {
                    completionHandledRef.current = false;
                    clearLastResult();
                    startRef.current = Date.now();
                    setElapsed(0);
                    setScore(0);
                    setLives(meta.maxLives ?? 0);
                    setRestartKey((k) => k + 1);
                    setPhase('play');
                  }}
                >
                  <Text style={styles.primaryBtnText}>Play again</Text>
                </Pressable>
                <Pressable
                  style={[styles.secondaryBtn, { flex: 1 }]}
                  onPress={closeGame}
                >
                  <Text style={styles.secondaryBtnText}>Done</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.cardHi,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { color: theme.colors.text, fontSize: 14 },
  title: { color: theme.colors.text, fontWeight: '700', fontSize: 15 },
  sub: { color: theme.colors.textDim, fontSize: 12, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  stat: { color: theme.colors.textDim, fontWeight: '600' },
  body: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  cardBody: { color: theme.colors.textDim, lineHeight: 20, marginBottom: 12 },
  diffLabel: {
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 4,
  },
  diffRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  diffChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.cardHi,
  },
  diffChipActive: { backgroundColor: theme.colors.purple },
  diffChipLocked: { opacity: 0.4 },
  diffText: { color: theme.colors.textDim, textTransform: 'capitalize' },
  diffTextActive: { color: '#fff', fontWeight: '700' },
  primaryBtn: {
    backgroundColor: theme.colors.purple,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '800' },
  secondaryBtn: {
    backgroundColor: theme.colors.cardHi,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: { color: theme.colors.text, fontWeight: '700' },
  rowBtns: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
