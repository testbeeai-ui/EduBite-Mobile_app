import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@edubite/ui';
import { GAME_MAP } from '../../lib/brain-gym/registry';
import { GAME_COMPONENTS } from '../../lib/brain-gym/games';
import { useBrainGym } from '../../lib/brain-gym/hooks/useBrainGym';
import { isDifficultyLocked } from '../../lib/brain-gym/storage';
import type { Difficulty } from '../../lib/brain-gym/types';
import { formatMsAsClock } from '../../lib/brain-gym/utils';
import { PostGameLobby, PreGameLobby } from './PreGameLobby';

type Phase = 'intro' | 'play' | 'result';

export function GameShell() {
  const insets = useSafeAreaInsets();
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
    if (!activeGameId) return;
    const nextMeta = GAME_MAP[activeGameId];
    setPhase('intro');
    setPaused(false);
    setScore(0);
    setLives(nextMeta?.maxLives ?? 0);
    setRestartKey((k) => k + 1);
    setElapsed(0);
    completionHandledRef.current = false;
    clearLastResult();
    startRef.current = Date.now();
    // Only reset when a different game is opened — not when a session saves.
  }, [activeGameId, clearLastResult]);

  useEffect(() => {
    if (!activeGameId) return;
    if (!isDifficultyLocked(progress, activeGameId, difficulty)) return;
    const order: Difficulty[] = ['easy', 'medium', 'hard'];
    const next = order.find((d) => !isDifficultyLocked(progress, activeGameId, d));
    if (next) setDifficulty(next);
  }, [activeGameId, difficulty, progress, setDifficulty]);

  useEffect(() => {
    if (phase !== 'play' || paused) return;
    const id = setInterval(() => {
      setElapsed(Date.now() - startRef.current);
    }, 250);
    return () => clearInterval(id);
  }, [phase, paused, restartKey]);

  if (!activeGameId || !meta || !Game) return null;

  const startPlay = () => {
    completionHandledRef.current = false;
    startRef.current = Date.now();
    setElapsed(0);
    setPaused(false);
    setPhase('play');
    setRestartKey((k) => k + 1);
  };

  const tip =
    activeGameId === 'reaction-time'
      ? "Don't tap before green."
      : undefined;

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen">
      <View
        style={[
          styles.root,
          {
            paddingTop: Math.max(insets.top, 10),
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ]}
      >
        <View style={styles.topBar}>
          <Pressable onPress={closeGame} style={styles.iconBtn}>
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
          {phase === 'play' || phase === 'result' ? (
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreBadgeText}>
                {lastResult?.result.score ?? score}
              </Text>
            </View>
          ) : null}
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

        <View style={styles.body}>
          {phase === 'intro' ? (
            <PreGameLobby
              instructions={meta.instructions}
              tip={tip}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              isDifficultyLocked={(d: Difficulty) =>
                isDifficultyLocked(progress, activeGameId, d)
              }
              onStart={startPlay}
              startLabel={isDailyRun ? 'Start Daily' : 'Start'}
              watermarkEmoji={meta.emoji}
            />
          ) : null}

          {phase === 'play' ? (
            <View style={styles.playArea}>
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
                  const nextScore = Number.isFinite(result.score)
                    ? Math.max(0, Math.round(result.score))
                    : 0;
                  const safeResult = {
                    ...result,
                    score: nextScore,
                    timeMs: Number.isFinite(result.timeMs)
                      ? Math.max(0, Math.round(result.timeMs))
                      : Date.now() - startRef.current,
                    difficulty: result.difficulty || difficulty,
                  };
                  setScore(nextScore);
                  completeSession(safeResult);
                  setPhase('result');
                }}
              />
            </View>
          ) : null}

          {phase === 'result' ? (
            <PostGameLobby
              won={lastResult?.result.won ?? false}
              score={lastResult?.result.score ?? score}
              timeLabel={formatMsAsClock(lastResult?.result.timeMs ?? elapsed)}
              rdmGain={lastResult?.rdmGain ?? 0}
              badgesLine={
                lastResult && lastResult.newBadges.length > 0
                  ? `Badges: ${lastResult.newBadges.join(', ')}`
                  : null
              }
              watermarkEmoji={meta.emoji}
              onPlayAgain={() => {
                completionHandledRef.current = false;
                clearLastResult();
                setScore(0);
                setLives(meta.maxLives ?? 0);
                startPlay();
              }}
              onDone={closeGame}
            />
          ) : null}
        </View>
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
  scoreBadge: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: theme.colors.cardHi,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBadgeText: {
    color: theme.colors.teal,
    fontWeight: '800',
    fontSize: 14,
  },
  title: { color: theme.colors.text, fontWeight: '700', fontSize: 15 },
  sub: { color: theme.colors.textDim, fontSize: 12, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  stat: { color: theme.colors.textDim, fontWeight: '600' },
  body: { flex: 1 },
  playArea: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
});
