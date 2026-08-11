import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { GameComponentProps } from "../types";
import { sfx } from "../utils/sound";
import { difficultyMultiplier } from "../storage";
import { usePausableScheduler } from "./_pausable-scheduler";
import { COLORS } from "./_shared";

export function SequenceMemoryGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const grid = 9;
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
      const ns = score + Math.round(10 * seq.length * difficultyMultiplier(difficulty));
      setScore(ns);
      onScoreChange?.(ns);
      if (seq.length >= (difficulty === "easy" ? 8 : difficulty === "medium" ? 10 : 12)) {
        completedRef.current = true;
        onComplete({ score: ns, won: true, timeMs: Date.now() - start, difficulty });
        return;
      }
      const extended = [...seq, Math.floor(Math.random() * grid)];
      setSeq(extended);
      schedule(() => playSeq(extended), 450);
    }
  };

  return (
    <View style={styles.board}>
      <Text style={styles.status}>
        {mode === "watch" ? "Watch sequence..." : "Your turn"} · Level {seq.length} · Score {score}
      </Text>
      <View style={styles.grid}>
        {Array.from({ length: grid }, (_, i) => {
          const isActive = lit === i;
          return (
            <View key={i} style={styles.tileSlot}>
              <Pressable
                disabled={paused || mode !== "input"}
                onPress={() => tap(i)}
                style={[styles.tile, isActive && styles.tileActive]}
              >
                <Text style={styles.tileText}>{i + 1}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: "rgba(11,13,18,0.4)",
    padding: 18,
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
  },
  status: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textDim,
    marginBottom: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -7,
  },
  tileSlot: {
    width: `${100 / 3}%`,
    padding: 7,
  },
  tile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  tileActive: {
    borderColor: COLORS.teal,
    backgroundColor: "rgba(45,212,191,0.18)",
  },
  tileText: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
  },
});
