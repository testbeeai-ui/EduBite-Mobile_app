import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import type { GameComponentProps } from "../types";
import { sfx } from "../utils/sound";
import { difficultyMultiplier } from "../storage";
import { GameBoard, StatusLine, PrimaryButton, COLORS } from "./_shared";
import { usePausableScheduler } from "./_pausable-scheduler";

export function NumberFlashGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const len = difficulty === "easy" ? 4 : difficulty === "medium" ? 5 : 6;
  const [seq, setSeq] = useState<number[]>([]);
  const [display, setDisplay] = useState<string>("");
  const [phase, setPhase] = useState<"flash" | "input">("flash");
  const [answer, setAnswer] = useState("");
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [start] = useState(() => Date.now());
  const completedRef = useRef(false);
  const { schedule } = usePausableScheduler(paused);

  const flash = (s: number[]) => {
    setPhase("flash");
    setAnswer("");
    let i = 0;
    setDisplay(String(s[0]));
    const nextDigit = () => {
      schedule(() => {
        i++;
        if (i >= s.length) {
          setDisplay("?");
          setPhase("input");
          return;
        }
        setDisplay(String(s[i]));
        sfx.tick(soundEnabled);
        nextDigit();
      }, difficulty === "hard" ? 450 : 700);
    };
    nextDigit();
  };

  useEffect(() => {
    const s = Array.from({ length: len }, () => Math.floor(Math.random() * 10));
    setSeq(s);
    flash(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = () => {
    if (paused || phase !== "input" || completedRef.current) return;
    const target = seq.join("");
    if (answer.replace(/\s/g, "") === target) {
      sfx.correct(soundEnabled);
      const ns = score + Math.round(50 * difficultyMultiplier(difficulty) * round);
      setScore(ns);
      onScoreChange?.(ns);
      if (round >= 5) {
        completedRef.current = true;
        onComplete({ score: ns, won: true, timeMs: Date.now() - start, difficulty });
        return;
      }
      const nextLen = len + (round >= 3 ? 1 : 0);
      const s = Array.from({ length: nextLen }, () => Math.floor(Math.random() * 10));
      setSeq(s);
      setRound((r) => r + 1);
      schedule(() => flash(s), 300);
    } else {
      sfx.wrong(soundEnabled);
      const nl = lives - 1;
      setLives(nl);
      onLivesChange?.(nl);
      if (nl <= 0) {
        completedRef.current = true;
        onComplete({ score, won: false, timeMs: Date.now() - start, difficulty });
      } else schedule(() => flash(seq), 300);
    }
  };

  return (
    <GameBoard>
      <StatusLine>Round {round}/5 · Remember the digits</StatusLine>
      <View style={styles.displayWrap}>
        <Text style={styles.display}>{display}</Text>
      </View>
      {phase === "input" && (
        <View style={styles.form}>
          <TextInput
            keyboardType="number-pad"
            value={answer}
            onChangeText={(t) => setAnswer(t.replace(/\D/g, ""))}
            onSubmitEditing={submit}
            placeholder="Type the sequence"
            placeholderTextColor={COLORS.textDim}
            style={styles.input}
            autoFocus
          />
          <PrimaryButton label="Submit" onPress={submit} />
        </View>
      )}
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  displayWrap: {
    paddingVertical: 40,
    alignItems: "center",
  },
  display: {
    fontSize: 52,
    fontWeight: "800",
    letterSpacing: 8,
    color: COLORS.teal,
  },
  form: {
    gap: 12,
  },
  input: {
    textAlign: "center",
    fontSize: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface2,
    color: COLORS.text,
    paddingVertical: 12,
  },
});
