import { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import type { GameComponentProps } from "../types";
import { shuffle, range } from "../utils/shuffle";
import { sfx } from "../utils/sound";
import { difficultyMultiplier } from "../storage";
import { GameBoard, StatusLine, GridWrap, CellButton, PrimaryButton, COLORS } from "./_shared";
import { usePausableScheduler } from "./_pausable-scheduler";

export function PatternMemoryGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const size = difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 5;
  const cells = size * size;
  const count = difficulty === "easy" ? 3 : difficulty === "medium" ? 5 : 7;
  const [pattern, setPattern] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [show, setShow] = useState(true);
  const [round, setRound] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [start] = useState(() => Date.now());
  const completedRef = useRef(false);
  const { schedule } = usePausableScheduler(paused);

  const gen = (targetRound: number) => {
    const roundCount = Math.min(cells, count + Math.floor((targetRound - 1) / 2));
    const p = new Set(shuffle(range(cells)).slice(0, roundCount));
    setPattern(p);
    setSelected(new Set());
    setShow(true);
    const studyMs = difficulty === "easy" ? 1_800 : difficulty === "medium" ? 1_500 : 1_200;
    schedule(() => setShow(false), studyMs);
  };

  useEffect(() => {
    gen(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (i: number) => {
    if (paused || show || completedRef.current) return;
    sfx.tap(soundEnabled);
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  };

  const submit = () => {
    if (paused || show || completedRef.current) return;
    const ok = selected.size === pattern.size && [...selected].every((i) => pattern.has(i));
    if (ok) {
      sfx.correct(soundEnabled);
      const ns = score + Math.round(40 * difficultyMultiplier(difficulty) * round);
      setScore(ns);
      onScoreChange?.(ns);
      if (round >= 5) {
        completedRef.current = true;
        onComplete({ score: ns, won: true, timeMs: Date.now() - start, difficulty });
      } else {
        setRound((r) => r + 1);
        schedule(() => gen(round + 1), 400);
      }
    } else {
      sfx.wrong(soundEnabled);
      const nl = lives - 1;
      setLives(nl);
      onLivesChange?.(nl);
      if (nl <= 0) {
        completedRef.current = true;
        onComplete({ score, won: false, timeMs: Date.now() - start, difficulty });
      } else schedule(() => gen(round), 400);
    }
  };

  return (
    <GameBoard>
      <StatusLine>{show ? "Memorize the pattern!" : "Recreate it"} · Round {round}/5</StatusLine>
      <GridWrap columns={size}>
        {range(cells).map((i) => {
          const on = show ? pattern.has(i) : selected.has(i);
          return (
            <CellButton
              key={i}
              onPress={() => toggle(i)}
              style={on ? styles.on : undefined}
            />
          );
        })}
      </GridWrap>
      {!show && <PrimaryButton label="Check pattern" onPress={submit} style={styles.submit} />}
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  on: {
    borderColor: "rgba(167,139,250,0.5)",
    backgroundColor: "rgba(167,139,250,0.25)",
  },
  submit: {
    marginTop: 14,
  },
});
