import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { GameComponentProps } from "../types";
import { difficultyMultiplier } from "../storage";
import { range } from "../utils";
import { sfx } from "../utils/sound";
import { COLORS, HudPill, PlayStage, SquareGrid } from "./_shared";

const SWATCHES = [
  "#60a5fa",
  "#f472b6",
  "#2dd4bf",
  "#fbbf24",
  "#a78bfa",
  "#ef4444",
];

export function VisualSearchGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const size = difficulty === "easy" ? 4 : difficulty === "medium" ? 5 : 6;
  const cells = size * size;
  const duration = difficulty === "hard" ? 25000 : 30000;
  const [target, setTarget] = useState(SWATCHES[0]!);
  const [grid, setGrid] = useState<string[]>([]);
  const [found, setFound] = useState(0);
  const [needed, setNeeded] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [leftMs, setLeftMs] = useState(duration);
  const [start] = useState(() => Date.now());
  const done = useRef(false);
  const scoreRef = useRef(0);

  const gen = () => {
    const t = SWATCHES[Math.floor(Math.random() * SWATCHES.length)]!;
    const need = difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 5;
    const g = range(cells).map(
      () => SWATCHES[Math.floor(Math.random() * SWATCHES.length)]!,
    );
    for (let i = 0; i < need; i++) g[i] = t;
    for (let i = g.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [g[i], g[j]] = [g[j]!, g[i]!];
    }
    setTarget(t);
    setNeeded(need);
    setFound(0);
    setGrid(g);
  };

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    gen();
    const id = setInterval(() => {
      if (done.current || paused) return;
      const elapsed = Date.now() - start;
      setLeftMs(Math.max(0, duration - elapsed));
      if (elapsed >= duration) {
        done.current = true;
        onComplete({
          score: scoreRef.current,
          won: scoreRef.current >= 80,
          timeMs: Date.now() - start,
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
      const ns = score + Math.round(15 * difficultyMultiplier(difficulty));
      setScore(ns);
      onScoreChange?.(ns);
      const nextGrid = [...grid];
      nextGrid[i] = "cleared";
      setGrid(nextGrid);
      setFound(nextFound);
      if (nextFound >= needed) gen();
    } else if (grid[i] !== "cleared") {
      sfx.wrong(soundEnabled);
      const nl = lives - 1;
      setLives(nl);
      onLivesChange?.(nl);
      if (nl <= 0) {
        done.current = true;
        onComplete({
          score,
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
            Tap all matching tiles · {found}/{needed} ·{" "}
            {Math.ceil(leftMs / 1000)}s
          </Text>
        </HudPill>
        <View style={styles.targetRow}>
          <Text style={styles.targetLabel}>Target</Text>
          <View style={[styles.targetSwatch, { backgroundColor: target }]} />
        </View>
        <SquareGrid cols={size} rows={size} gap={8} minCell={48}>
          {({ cell }) =>
            range(cells).map((i) => {
              const cleared = grid[i] === "cleared";
              return (
                <Pressable
                  key={i}
                  onPress={() => tap(i)}
                  disabled={cleared}
                  style={[
                    styles.cell,
                    {
                      width: cell,
                      height: cell,
                      backgroundColor: cleared
                        ? "#0B0F16"
                        : (grid[i] ?? COLORS.surface2),
                      opacity: cleared ? 0.35 : 1,
                    },
                  ]}
                />
              );
            })
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
    backgroundColor: "rgba(20,26,35,0.95)",
    padding: 14,
  },
  hudText: { color: COLORS.text, fontWeight: "700", fontSize: 13 },
  targetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  },
  targetLabel: { color: COLORS.textDim, fontWeight: "600", fontSize: 12 },
  targetSwatch: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
  cell: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
});
