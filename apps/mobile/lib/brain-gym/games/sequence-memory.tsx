import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { GameComponentProps } from "../types";
import { sfx } from "../utils/sound";
import { sequenceMemoryCorrectDelta } from '../scoring';
import { usePausableScheduler } from "./_pausable-scheduler";
import { COLORS, PlayStage, SquareGrid } from "./_shared";

export function SequenceMemoryGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const grid = 9;
  const cols = 3;
  const [seq, setSeq] = useState<number[]>([]);
  const [input, setInput] = useState<number[]>([]);
  const [lit, setLit] = useState<number | null>(null);
  const [mode, setMode] = useState<"watch" | "input">("watch");
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [start] = useState(() => Date.now());
  const completedRef = useRef(false);
  const { schedule } = usePausableScheduler(paused);

  const playSeq = useCallback(
    (s: number[]) => {
      setMode("watch");
      setInput([]);
      let index = 0;
      const showNext = () => {
        if (index >= s.length) {
          setMode("input");
          return;
        }
        const n = s[index]!;
        setLit(n);
        sfx.tap(soundEnabled);
        schedule(() => {
          setLit(null);
          schedule(() => {
            index++;
            showNext();
          }, 140);
        }, difficulty === "hard" ? 380 : 520);
      };
      showNext();
    },
    [soundEnabled, difficulty, schedule],
  );

  useEffect(() => {
    const first = [Math.floor(Math.random() * grid)];
    setSeq(first);
    void playSeq(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fail = (nextLives: number) => {
    sfx.wrong(soundEnabled);
    setLives(nextLives);
    onLivesChange?.(nextLives);
    if (nextLives <= 0) {
      completedRef.current = true;
      onComplete({
        score,
        won: false,
        timeMs: Date.now() - start,
        difficulty,
      });
    } else {
      void playSeq(seq);
    }
  };

  const tap = (i: number) => {
    if (paused || mode !== "input" || completedRef.current) return;
    sfx.tap(soundEnabled);
    const next = [...input, i];
    setInput(next);
    const idx = next.length - 1;
    if (seq[idx] !== i) {
      fail(lives - 1);
      return;
    }
    if (next.length === seq.length) {
      sfx.correct(soundEnabled);
      const ns =
        score + sequenceMemoryCorrectDelta(seq.length, difficulty);
      setScore(ns);
      onScoreChange?.(ns);
      if (
        seq.length >=
        (difficulty === "easy" ? 8 : difficulty === "medium" ? 10 : 12)
      ) {
        completedRef.current = true;
        onComplete({
          score: ns,
          won: true,
          timeMs: Date.now() - start,
          difficulty,
        });
        return;
      }
      const extended = [...seq, Math.floor(Math.random() * grid)];
      setSeq(extended);
      schedule(() => playSeq(extended), 450);
    }
  };

  return (
    <PlayStage>
      <View style={styles.board}>
        <Text style={styles.status}>
          {mode === "watch" ? "Watch sequence..." : "Your turn"} · Level{" "}
          {seq.length} · Score {score}
        </Text>
        <SquareGrid cols={cols} rows={cols} gap={12} minCell={72}>
          {({ cell }) =>
            Array.from({ length: grid }, (_, i) => {
              const isActive = lit === i;
              return (
                <Pressable
                  key={i}
                  disabled={paused || mode !== "input"}
                  onPress={() => tap(i)}
                  style={[
                    styles.tile,
                    {
                      width: cell,
                      height: cell,
                    },
                    isActive && styles.tileActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tileText,
                      { fontSize: Math.max(22, Math.round(cell * 0.32)) },
                    ]}
                  >
                    {i + 1}
                  </Text>
                </Pressable>
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
    padding: 16,
    width: "100%",
  },
  status: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textDim,
    marginBottom: 12,
  },
  tile: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  tileActive: {
    borderColor: COLORS.teal,
    backgroundColor: "rgba(45,212,191,0.28)",
    borderWidth: 2,
  },
  tileText: {
    color: COLORS.text,
    fontWeight: "700",
    textAlign: "center",
  },
});
