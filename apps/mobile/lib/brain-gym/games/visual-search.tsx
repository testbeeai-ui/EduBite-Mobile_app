import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameComponentProps } from '../types';
import {
  visualSearchPartialScore,
  visualSearchWinScore,
} from '../scoring';
import { range } from '../utils';
import { sfx } from '../utils/sound';
import { COLORS, HudPill, PlayStage, SquareGrid } from './_shared';

const SWATCHES = [
  '#60a5fa',
  '#f472b6',
  '#2dd4bf',
  '#fbbf24',
  '#a78bfa',
  '#ef4444',
];

export function VisualSearchGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const size = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : 6;
  const cells = size * size;
  const numTargets = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
  const duration =
    difficulty === 'easy' ? 45_000 : difficulty === 'medium' ? 40_000 : 35_000;
  const [target, setTarget] = useState(SWATCHES[0]!);
  const [grid, setGrid] = useState<string[]>([]);
  const [found, setFound] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [leftMs, setLeftMs] = useState(duration);
  const [start] = useState(() => Date.now());
  const done = useRef(false);
  const foundRef = useRef(0);

  const gen = () => {
    const t = SWATCHES[Math.floor(Math.random() * SWATCHES.length)]!;
    const g = range(cells).map(
      () => SWATCHES[Math.floor(Math.random() * SWATCHES.length)]!,
    );
    for (let i = 0; i < numTargets; i++) g[i] = t;
    for (let i = g.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [g[i], g[j]] = [g[j]!, g[i]!];
    }
    setTarget(t);
    setFound(0);
    foundRef.current = 0;
    setGrid(g);
  };

  useEffect(() => {
    gen();
    const id = setInterval(() => {
      if (done.current || paused) return;
      const elapsed = Date.now() - start;
      const left = Math.max(0, duration - elapsed);
      setLeftMs(left);
      if (elapsed >= duration) {
        done.current = true;
        const partial = visualSearchPartialScore(foundRef.current);
        onScoreChange?.(partial);
        onComplete({
          score: partial,
          won: foundRef.current >= numTargets,
          timeMs: duration,
          difficulty,
        });
      }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tap = (i: number) => {
    if (paused || done.current) return;
    if (grid[i] === target) {
      sfx.correct(soundEnabled);
      const nextFound = found + 1;
      foundRef.current = nextFound;
      const partial = visualSearchPartialScore(nextFound);
      setScore(partial);
      onScoreChange?.(partial);
      const nextGrid = [...grid];
      nextGrid[i] = 'cleared';
      setGrid(nextGrid);
      setFound(nextFound);
      if (nextFound >= numTargets) {
        done.current = true;
        const timeLeft = Math.max(0, duration - (Date.now() - start));
        const finalScore = visualSearchWinScore({
          numTargets,
          timeLeftMs: timeLeft,
          difficulty,
        });
        setScore(finalScore);
        onScoreChange?.(finalScore);
        onComplete({
          score: finalScore,
          won: true,
          timeMs: Date.now() - start,
          difficulty,
        });
      }
    } else if (grid[i] !== 'cleared') {
      sfx.wrong(soundEnabled);
      const nl = lives - 1;
      setLives(nl);
      onLivesChange?.(nl);
      if (nl <= 0) {
        done.current = true;
        const partial = visualSearchPartialScore(found);
        setScore(partial);
        onScoreChange?.(partial);
        onComplete({
          score: partial,
          won: false,
          timeMs: Date.now() - start,
          difficulty,
        });
      }
    }
  };

  return (
    <PlayStage>
      <View style={styles.board}>
        <HudPill>
          <Text style={styles.hudText}>
            Tap all matching tiles · {found}/{numTargets} ·{' '}
            {Math.ceil(leftMs / 1000)}s
          </Text>
        </HudPill>
        <View style={styles.targetRow}>
          <View style={[styles.swatch, { backgroundColor: target }]} />
          <Text style={styles.targetLabel}>Find this color · Score {score}</Text>
        </View>
        <SquareGrid cols={size} rows={size} gap={6} minCell={44} style={styles.gridHost}>
          {({ cell }) =>
            grid.map((color, i) => (
              <Pressable
                key={i}
                onPress={() => tap(i)}
                disabled={color === 'cleared'}
                style={[
                  styles.cell,
                  {
                    width: cell,
                    height: cell,
                    backgroundColor: color === 'cleared' ? '#171E28' : color,
                    opacity: color === 'cleared' ? 0.35 : 1,
                  },
                ]}
              />
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
    padding: 14,
  },
  hudText: { color: COLORS.text, fontWeight: '700', fontSize: 13 },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    justifyContent: 'center',
  },
  swatch: { width: 28, height: 28, borderRadius: 8 },
  targetLabel: { color: COLORS.textDim, fontWeight: '600' },
  gridHost: {
    flex: 1,
    minHeight: 260,
    maxWidth: 360,
    alignSelf: 'center',
    width: '100%',
  },
  cell: { borderRadius: 8 },
});
