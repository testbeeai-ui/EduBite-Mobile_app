import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameComponentProps } from '../types';
import { difficultyMultiplier } from '../storage';
import { shuffle } from '../utils';
import { sfx } from '../utils/sound';
import { COLORS, HudPill, PlayStage, SquareGrid } from './_shared';

const POOL = [
  '🔑',
  '💍',
  '🪙',
  '📎',
  '🧩',
  '🧿',
  '🎩',
  '🧸',
  '📷',
  '🧪',
  '🌙',
  '⭐',
  '🔔',
  '💎',
  '🎯',
  '🪄',
  '📦',
  '🛡️',
  '🧭',
  '⌛',
];

type SceneCell = {
  id: string;
  emoji: string;
  isTarget: boolean;
};

function buildScene(targetCount: number): {
  targets: string[];
  cells: SceneCell[];
  cols: number;
} {
  const cols = 4;
  const rows = 5;
  const slots = cols * rows;
  const shuffled = shuffle([...POOL]);
  const targets = shuffled.slice(0, targetCount);
  const decoys = shuffled.slice(targetCount, slots);
  const cells = shuffle([
    ...targets.map((emoji, i) => ({
      id: `t-${emoji}-${i}`,
      emoji,
      isTarget: true,
    })),
    ...decoys.map((emoji, i) => ({
      id: `d-${emoji}-${i}`,
      emoji,
      isTarget: false,
    })),
  ]).slice(0, slots);
  return { targets, cells, cols };
}

export function HiddenObjectsGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  paused,
}: GameComponentProps) {
  const count = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : 6;
  const duration = difficulty === 'hard' ? 35000 : 45000;
  const scene = useMemo(() => buildScene(count), [count]);
  const [found, setFound] = useState<Set<string>>(() => new Set());
  const [score, setScore] = useState(0);
  const [start] = useState(() => Date.now());
  const [leftMs, setLeftMs] = useState(duration);
  const done = useRef(false);
  const scoreRef = useRef(0);
  const foundRef = useRef(found);

  useEffect(() => {
    foundRef.current = found;
  }, [found]);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    const id = setInterval(() => {
      if (done.current || paused) return;
      const elapsed = Date.now() - start;
      setLeftMs(Math.max(0, duration - elapsed));
      if (elapsed >= duration) {
        done.current = true;
        onComplete({
          score: scoreRef.current,
          won: foundRef.current.size >= count,
          timeMs: Date.now() - start,
          difficulty,
        });
      }
    }, 200);
    return () => clearInterval(id);
  }, [paused, start, duration, count, onComplete, difficulty]);

  const tap = (cell: SceneCell) => {
    if (paused || done.current) return;
    if (found.has(cell.emoji)) {
      sfx.wrong(soundEnabled);
      return;
    }
    if (!cell.isTarget) {
      sfx.wrong(soundEnabled);
      return;
    }
    sfx.correct(soundEnabled);
    const next = new Set(found);
    next.add(cell.emoji);
    setFound(next);
    const ns = score + Math.round(40 * difficultyMultiplier(difficulty));
    setScore(ns);
    onScoreChange?.(ns);
    if (next.size >= count) {
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
    <PlayStage>
      <View style={styles.board}>
        <HudPill>
          <Text style={styles.hudText}>
            Find the targets · {found.size}/{count} · {Math.ceil(leftMs / 1000)}s
          </Text>
        </HudPill>

        <View style={styles.targetRow}>
          {scene.targets.map((emoji) => {
            const got = found.has(emoji);
            return (
              <View
                key={emoji}
                style={[styles.targetChip, got && styles.targetChipDone]}
              >
                <Text style={[styles.targetEmoji, got && styles.targetEmojiDone]}>
                  {got ? '✓' : emoji}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.scene}>
          <SquareGrid
            cols={scene.cols}
            rows={Math.ceil(scene.cells.length / scene.cols)}
            gap={8}
            minCell={56}
          >
            {({ cell: size }) =>
              scene.cells.map((cell) => {
                const got = found.has(cell.emoji) && cell.isTarget;
                return (
                  <Pressable
                    key={cell.id}
                    onPress={() => tap(cell)}
                    disabled={got}
                    style={({ pressed }) => [
                      styles.cell,
                      { width: size, height: size },
                      got && styles.cellFound,
                      pressed && !got && styles.cellPressed,
                    ]}
                  >
                    <View style={styles.cellInner}>
                      <Text
                        style={[
                          styles.emoji,
                          { fontSize: Math.max(20, Math.round(size * 0.4)) },
                          got && styles.emojiFound,
                        ]}
                      >
                        {got ? '✓' : cell.emoji}
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            }
          </SquareGrid>
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
    padding: 14,
  },
  hudText: { color: COLORS.text, fontWeight: '700', fontSize: 13 },
  targetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  targetChip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(127,119,221,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(127,119,221,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetChipDone: {
    backgroundColor: 'rgba(29,158,117,0.2)',
    borderColor: 'rgba(29,158,117,0.45)',
  },
  targetEmoji: { fontSize: 22 },
  targetEmojiDone: { color: COLORS.green, fontWeight: '800', fontSize: 18 },
  scene: {
    flex: 1,
    minHeight: 220,
    backgroundColor: '#0B0F16',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: 'hidden',
    padding: 8,
  },
  cell: {
    padding: 0,
  },
  cellInner: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFound: { opacity: 0.55 },
  cellPressed: { opacity: 0.8 },
  emoji: { fontSize: 26 },
  emojiFound: { color: COLORS.green, fontSize: 20, fontWeight: '800' },
});
