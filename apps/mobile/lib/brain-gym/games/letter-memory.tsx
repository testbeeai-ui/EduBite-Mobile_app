import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import type { GameComponentProps } from "../types";
import { sfx } from "../utils/sound";
import { difficultyMultiplier } from "../storage";
import { shuffle } from "../utils/shuffle";
import { GameBoard, StatusLine, PrimaryButton, COLORS } from "./_shared";
import { usePausableScheduler } from "./_pausable-scheduler";

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";

export function LetterMemoryGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const len = difficulty === "easy" ? 4 : difficulty === "medium" ? 5 : 6;
  const [seq, setSeq] = useState<string[]>([]);
  const [display, setDisplay] = useState("");
  const [phase, setPhase] = useState<"flash" | "input">("flash");
  const [flashPosition, setFlashPosition] = useState(0);
  const [answer, setAnswer] = useState("");
  const [replaysLeft, setReplaysLeft] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [start] = useState(() => Date.now());
  const completedRef = useRef(false);
  const { schedule } = usePausableScheduler(paused);

  const make = (n: number) => shuffle([...LETTERS]).slice(0, n);

  const flash = (s: string[]) => {
    setPhase("flash");
    setAnswer("");
    let i = 0;
    const showNextLetter = () => {
      setFlashPosition(i);
      setDisplay(s[i]!);
      sfx.tick(soundEnabled);
      schedule(() => {
        setDisplay("");
        schedule(() => {
          i++;
          if (i >= s.length) {
            setDisplay("?");
            setPhase("input");
            return;
          }
          showNextLetter();
        }, 300);
      }, difficulty === "easy" ? 1_000 : difficulty === "medium" ? 850 : 650);
    };
    showNextLetter();
  };

  useEffect(() => {
    const s = make(len);
    setSeq(s);
    flash(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = () => {
    if (paused || phase !== "input" || completedRef.current) return;
    if (answer.toUpperCase().replace(/\s/g, "") === seq.join("")) {
      sfx.correct(soundEnabled);
      const ns = score + Math.round(50 * difficultyMultiplier(difficulty) * round);
      setScore(ns);
      onScoreChange?.(ns);
      if (round >= 5) {
        completedRef.current = true;
        onComplete({ score: ns, won: true, timeMs: Date.now() - start, difficulty });
        return;
      }
      const s = make(len + (round >= 3 ? 1 : 0));
      setSeq(s);
      setReplaysLeft(1);
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
      <StatusLine>
        Round {round}/5 ·{" "}
        {phase === "flash" ? `Letter ${flashPosition + 1} of ${seq.length}` : `Enter all ${seq.length} letters`}
      </StatusLine>
      <View style={styles.displayWrap}>
        <Text style={styles.display}>{display || (phase === "flash" ? "•" : "?")}</Text>
      </View>
      {phase === "input" && (
        <View style={styles.form}>
          <TextInput
            value={answer}
            onChangeText={(t) => setAnswer(t.toUpperCase().replace(/[^A-Z]/g, ""))}
            onSubmitEditing={submit}
            placeholder="Type the letters"
            placeholderTextColor={COLORS.textDim}
            style={styles.input}
            autoCapitalize="characters"
            autoFocus
          />
          <PrimaryButton label="Submit" onPress={submit} color={COLORS.blue} />
          <PrimaryButton
            label={replaysLeft > 0 ? "Replay letters once" : "Replay used"}
            onPress={() => {
              if (replaysLeft <= 0) return;
              setReplaysLeft(0);
              flash(seq);
            }}
            disabled={replaysLeft <= 0}
            color={COLORS.surface2}
            textColor={COLORS.text}
            style={styles.secondaryButton}
          />
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
    letterSpacing: 10,
    color: COLORS.blue,
  },
  form: {
    gap: 10,
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
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.line,
  },
});
