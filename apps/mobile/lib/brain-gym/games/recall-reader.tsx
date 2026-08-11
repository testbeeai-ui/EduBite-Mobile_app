import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { GameComponentProps, GameSessionResult } from "../types";
import {
  RECALL_READER_MAX_LIVES,
  RECALL_READER_READING_MS,
  RECALL_READER_ROUNDS,
  createRecallReaderSession,
  scoreRecallReaderAnswer,
} from "../recall-reader-content";
import type { RecallReaderItem } from "../recall-reader-content";
import { difficultyMultiplier } from "../storage";
import { sfx } from "../utils/sound";
import { ChoiceButton, GameBoard, StatusLine, COLORS } from "./_shared";
import { usePausableScheduler } from "./_pausable-scheduler";

type Phase = "reading" | "question" | "feedback";

type Feedback = {
  correct: boolean;
  message: string;
};

function sessionSeed(restartKey: number): number {
  return (Date.now() ^ Math.imul(restartKey + 1, 1_103_515_245)) >>> 0;
}

function formatSeconds(ms: number): string {
  return Math.ceil(ms / 1000).toString();
}

export function RecallReaderGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
  restartKey,
}: GameComponentProps) {
  const [items, setItems] = useState<RecallReaderItem[]>(() =>
    createRecallReaderSession(sessionSeed(restartKey), difficulty),
  );
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("reading");
  const [readingMsLeft, setReadingMsLeft] = useState(RECALL_READER_READING_MS);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(RECALL_READER_MAX_LIVES);

  const startRef = useRef(Date.now());
  const completedRef = useRef(false);
  const scoreRef = useRef(0);
  const livesRef = useRef(RECALL_READER_MAX_LIVES);
  const correctCountRef = useRef(0);
  const feedbackCancelRef = useRef<(() => void) | null>(null);
  const answerElapsedRef = useRef(0);
  const { schedule } = usePausableScheduler(paused);

  const current = items[roundIndex] ?? items[0];
  const multiplier = difficultyMultiplier(difficulty);

  const clearFeedbackTimeout = useCallback(() => {
    feedbackCancelRef.current?.();
    feedbackCancelRef.current = null;
  }, []);

  const finish = useCallback(
    (result: Omit<GameSessionResult, "timeMs" | "difficulty">) => {
      if (completedRef.current) return;
      completedRef.current = true;
      clearFeedbackTimeout();
      onComplete({
        ...result,
        timeMs: Date.now() - startRef.current,
        difficulty,
      });
    },
    [clearFeedbackTimeout, difficulty, onComplete],
  );

  const resetGame = useCallback(() => {
    clearFeedbackTimeout();
    completedRef.current = false;
    startRef.current = Date.now();
    scoreRef.current = 0;
    livesRef.current = RECALL_READER_MAX_LIVES;
    correctCountRef.current = 0;
    answerElapsedRef.current = 0;
    setItems(createRecallReaderSession(sessionSeed(restartKey), difficulty));
    setRoundIndex(0);
    setPhase("reading");
    setReadingMsLeft(RECALL_READER_READING_MS);
    setSelectedIndex(null);
    setFeedback(null);
    setScore(0);
    setLives(RECALL_READER_MAX_LIVES);
    onScoreChange?.(0);
    onLivesChange?.(RECALL_READER_MAX_LIVES);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearFeedbackTimeout, difficulty, restartKey]);

  useEffect(() => {
    resetGame();
    return clearFeedbackTimeout;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetGame, clearFeedbackTimeout]);

  useEffect(() => {
    if (phase !== "reading" || paused || completedRef.current) return;

    let lastTick = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTick;
      lastTick = now;

      setReadingMsLeft((prev) => {
        if (prev <= 0) return 0;
        const next = Math.max(0, prev - elapsed);
        if (next === 0) {
          setPhase("question");
          answerElapsedRef.current = 0;
          sfx.tick(soundEnabled);
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [paused, phase, soundEnabled]);

  useEffect(() => {
    if (phase !== "question" || paused || completedRef.current) return;
    const interval = setInterval(() => {
      answerElapsedRef.current += 100;
    }, 100);
    return () => clearInterval(interval);
  }, [paused, phase]);

  const moveToNextRound = useCallback(() => {
    clearFeedbackTimeout();
    if (roundIndex >= RECALL_READER_ROUNDS - 1) {
      finish({
        score: scoreRef.current,
        won: true,
        accuracy: correctCountRef.current / RECALL_READER_ROUNDS,
      });
      return;
    }

    setRoundIndex((prev) => prev + 1);
    setPhase("reading");
    setReadingMsLeft(RECALL_READER_READING_MS);
    setSelectedIndex(null);
    setFeedback(null);
  }, [clearFeedbackTimeout, finish, roundIndex]);

  const scheduleAfterFeedback = useCallback(
    (callback: () => void) => {
      clearFeedbackTimeout();
      feedbackCancelRef.current = schedule(() => {
        feedbackCancelRef.current = null;
        callback();
      }, 1_200);
    },
    [clearFeedbackTimeout, schedule],
  );

  const chooseAnswer = useCallback(
    (optionIndex: number) => {
      if (
        paused ||
        completedRef.current ||
        phase !== "question" ||
        selectedIndex !== null ||
        !current
      ) {
        return;
      }

      const correct = optionIndex === current.correctIndex;
      setSelectedIndex(optionIndex);
      setPhase("feedback");

      if (correct) {
        sfx.correct(soundEnabled);
        const gained = scoreRecallReaderAnswer(
          difficulty,
          roundIndex + 1,
          answerElapsedRef.current,
          multiplier,
        );
        const nextScore = scoreRef.current + gained;
        const nextCorrect = correctCountRef.current + 1;
        scoreRef.current = nextScore;
        correctCountRef.current = nextCorrect;
        setScore(nextScore);
        onScoreChange?.(nextScore);
        setFeedback({ correct: true, message: `Correct. ${current.explanation}` });
        scheduleAfterFeedback(moveToNextRound);
        return;
      }

      sfx.wrong(soundEnabled);
      const nextLives = livesRef.current - 1;
      livesRef.current = nextLives;
      setLives(nextLives);
      onLivesChange?.(nextLives);
      setFeedback({ correct: false, message: `Not quite. ${current.explanation}` });

      if (nextLives <= 0) {
        scheduleAfterFeedback(() =>
          finish({
            score: scoreRef.current,
            won: false,
            accuracy: correctCountRef.current / RECALL_READER_ROUNDS,
          }),
        );
      } else {
        scheduleAfterFeedback(moveToNextRound);
      }
    },
    [
      current,
      difficulty,
      finish,
      moveToNextRound,
      multiplier,
      onLivesChange,
      onScoreChange,
      paused,
      phase,
      roundIndex,
      scheduleAfterFeedback,
      selectedIndex,
      soundEnabled,
    ],
  );

  const progressPct = Math.max(0, Math.min(100, (readingMsLeft / RECALL_READER_READING_MS) * 100));

  if (!current) return null;

  return (
    <GameBoard style={styles.board}>
      <StatusLine>
        Round {roundIndex + 1}/{RECALL_READER_ROUNDS} · Lives {lives} · Score {score}
      </StatusLine>

      <View style={styles.timerCard}>
        <View style={styles.timerRow}>
          <Text style={styles.timerLabel}>{phase === "reading" ? "Read carefully" : "Answer from memory"}</Text>
          <Text style={styles.timerLabel}>
            {phase === "reading" ? `${formatSeconds(readingMsLeft)}s` : "Passage hidden"}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${phase === "reading" ? progressPct : 0}%` },
            ]}
          />
        </View>
      </View>

      {phase === "reading" ? (
        <View style={styles.passageBox}>
          <Text style={styles.passageText}>{current.paragraph}</Text>
        </View>
      ) : (
        <View style={styles.questionBox}>
          <Text style={styles.questionText}>{current.question}</Text>
          <View style={styles.optionsList}>
            {current.options.map((option, index) => {
              const isCorrect = phase === "feedback" && index === current.correctIndex;
              const isWrong =
                phase === "feedback" && selectedIndex === index && index !== current.correctIndex;

              return (
                <ChoiceButton
                  key={option}
                  onPress={() => chooseAnswer(index)}
                  disabled={paused || phase !== "question"}
                  selected={selectedIndex === index}
                  style={[
                    styles.optionButton,
                    isCorrect && styles.optionCorrect,
                    isWrong && styles.optionWrong,
                  ]}
                >
                  {option}
                </ChoiceButton>
              );
            })}
          </View>
        </View>
      )}

      <View
        style={[
          styles.feedbackBox,
          feedback ? (feedback.correct ? styles.feedbackCorrect : styles.feedbackWrong) : undefined,
        ]}
      >
        <Text style={styles.feedbackText}>
          {feedback
            ? feedback.message
            : phase === "reading"
              ? "The passage will disappear completely when the timer ends."
              : "Choose the answer using only what you remember."}
        </Text>
      </View>
    </GameBoard>
  );
}

const styles = StyleSheet.create({
  board: {
    maxWidth: 560,
  },
  timerCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface2,
    padding: 12,
    marginBottom: 14,
  },
  timerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timerLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textDim,
  },
  progressTrack: {
    marginTop: 8,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.3)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: COLORS.teal,
  },
  passageBox: {
    minHeight: 170,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(45,212,191,0.3)",
    backgroundColor: "rgba(45,212,191,0.1)",
    padding: 18,
    justifyContent: "center",
    marginBottom: 14,
  },
  passageText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
  },
  questionBox: {
    minHeight: 170,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface2,
    padding: 18,
    marginBottom: 14,
  },
  questionText: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 12,
  },
  optionsList: {
    gap: 10,
  },
  optionButton: {
    minHeight: 60,
  },
  optionCorrect: {
    borderColor: "#34D399",
    backgroundColor: "rgba(52,211,153,0.15)",
  },
  optionWrong: {
    borderColor: COLORS.red,
    backgroundColor: "rgba(248,113,113,0.15)",
  },
  feedbackBox: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface2,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "center",
  },
  feedbackCorrect: {
    borderColor: "rgba(52,211,153,0.4)",
    backgroundColor: "rgba(52,211,153,0.1)",
  },
  feedbackWrong: {
    borderColor: "rgba(248,113,113,0.4)",
    backgroundColor: "rgba(248,113,113,0.1)",
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },
});
