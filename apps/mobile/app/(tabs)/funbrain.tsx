import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  theme,
  ProgressTrack,
  CountdownTimer,
  QuizOption,
  OptionState,
} from '@edubite/ui';
import { useRouter } from 'expo-router';
import { AnswerReviewList } from '../../components/quiz/AnswerReviewList';
import {
  loadTodayFunBrain,
  type LearnerQuestion,
} from '../../lib/content/today-questions';
import { useGame } from '../../lib/game/GameProvider';
import { FUNBRAIN_DURATION_SEC } from '../../lib/game/state';

export default function FunBrainScreen() {
  const router = useRouter();
  const { state, completeFunbrain, startFunbrain, resetFunbrain } = useGame();
  const sprintMinutes = Math.round(FUNBRAIN_DURATION_SEC / 60);

  const alreadyCompleted = state.funbrain.completed || state.funbrain.finished;
  const running = state.funbrain.running && !alreadyCompleted;

  const [questions, setQuestions] = useState<LearnerQuestion[]>([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(FUNBRAIN_DURATION_SEC);
  const [answered, setAnswered] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const finishCalled = useRef(false);
  const answersRef = useRef(answers);
  const scoreRef = useRef(score);
  const comboRef = useRef(combo);
  answersRef.current = answers;
  scoreRef.current = score;
  comboRef.current = combo;

  const resetLocalQuiz = useCallback(() => {
    setIdx(0);
    setAnswers([]);
    setScore(0);
    setCombo(0);
    setTotalSeconds(FUNBRAIN_DURATION_SEC);
    setAnswered(false);
    setSelectedOpt(null);
    setIsFinished(false);
    finishCalled.current = false;
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingQuestions(true);
    setLoadError(null);
    resetLocalQuiz();
    void loadTodayFunBrain()
      .then(({ scheduleDate: sd, questions: qs }) => {
        if (cancelled) return;
        setScheduleDate(sd);
        setQuestions(qs);
        if (qs.length === 0) {
          setLoadError('No published FunBrain questions for today yet.');
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setQuestions([]);
        setLoadError(
          err instanceof Error ? err.message : 'Failed to load today\'s sprint.',
        );
      })
      .finally(() => {
        if (!cancelled) setLoadingQuestions(false);
      });
    return () => {
      cancelled = true;
    };
  }, [resetLocalQuiz]);

  const finishQuiz = useCallback(
    async (
      finalAnswers: (number | null)[],
      finalScore: number,
      finalCombo: number,
    ) => {
      if (finishCalled.current || alreadyCompleted) return;
      finishCalled.current = true;
      await completeFunbrain({
        answers: finalAnswers,
        score: finalScore,
        combo: finalCombo,
      });
      setIsFinished(true);
    },
    [alreadyCompleted, completeFunbrain],
  );

  useEffect(() => {
    if (!running || alreadyCompleted || isFinished || loadingQuestions) return;
    if (questions.length === 0) return;

    const timer = setInterval(() => {
      setTotalSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          void finishQuiz(answersRef.current, scoreRef.current, comboRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    running,
    alreadyCompleted,
    finishQuiz,
    isFinished,
    loadingQuestions,
    questions.length,
  ]);

  const handleStart = () => {
    if (questions.length === 0 || alreadyCompleted) return;
    resetLocalQuiz();
    startFunbrain();
  };

  const handleReplay = () => {
    if (questions.length === 0) return;
    resetLocalQuiz();
    queueMicrotask(() => {
      resetFunbrain();
      startFunbrain();
    });
  };

  const selectAnswer = (i: number) => {
    if (!running || answered || alreadyCompleted || isFinished) return;
    setAnswered(true);
    setSelectedOpt(i);

    // Participation score only — no client answer keys.
    const nextCombo = combo + 1;
    const nextScore = score + 10 + combo * 5;
    const nextAnswers = [...answers];
    nextAnswers[idx] = i;
    setAnswers(nextAnswers);
    setScore(nextScore);
    setCombo(nextCombo);

    setTimeout(() => {
      if (idx < questions.length - 1) {
        setIdx((prev) => prev + 1);
        setAnswered(false);
        setSelectedOpt(null);
      } else {
        void finishQuiz(nextAnswers, nextScore, nextCombo);
      }
    }, 400);
  };

  const showCompleted = alreadyCompleted || isFinished;
  const displayScore = alreadyCompleted ? state.funbrain.score : score;
  const displayAnswers = alreadyCompleted ? state.funbrain.answers : answers;
  const answeredCount = displayAnswers.filter((a) => a != null).length;
  const currentQ = questions[idx];

  const getOptionState = (optIndex: number): OptionState => {
    if (!answered) return 'default';
    if (optIndex === selectedOpt) return 'correct';
    return 'default';
  };

  if (loadingQuestions && questions.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={theme.colors.amber} />
        <Text style={styles.loadingText}>Loading today&apos;s sprint from DB…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.eyebrowRow}>
        <View style={styles.dot} />
        <Text style={styles.eyebrowText}>FUNCTION 02 · DAILY SPRINT</Text>
      </View>

      <Text style={styles.title}>FunBrain</Text>

      <Text style={styles.subtitle}>
        {showCompleted
          ? 'Nice work — see your sprint results below.'
          : running
            ? 'FunBrain sprint in progress — answer before time runs out.'
            : `${sprintMinutes}-minute Quick Sprint · today&apos;s published set from DB.`}
      </Text>

      {showCompleted ? (
        <>
          <View style={styles.completeCard}>
            <View style={styles.completeWrap}>
              <Text style={styles.earnedBig}>Score: {displayScore}</Text>
              <Text style={styles.completeSub}>
                {answeredCount} of {questions.length || answeredCount || 6} answered ·
                one sprint per day. Come back tomorrow for the next set.
              </Text>
              {scheduleDate ? (
                <Text style={styles.scheduleLine}>DB schedule · {scheduleDate}</Text>
              ) : null}

              <TouchableOpacity style={styles.replayBtn} onPress={handleReplay}>
                <Text style={styles.replayBtnText}>Replay sprint</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.navigate('/')} style={styles.doneBtn}>
                <Text style={styles.doneBtnText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </View>

          <AnswerReviewList questions={questions} answers={displayAnswers} />
        </>
      ) : !running ? (
        <View style={styles.startCard}>
          <Text style={styles.startTitle}>Quick Sprint</Text>
          <Text style={styles.startMeta}>
            {sprintMinutes}-minute timer · {questions.length || 0} questions · one pass
          </Text>
          {scheduleDate ? (
            <Text style={styles.scheduleLine}>DB schedule date · {scheduleDate}</Text>
          ) : null}
          {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}
          <TouchableOpacity
            style={[styles.startBtn, questions.length === 0 && styles.startBtnDisabled]}
            onPress={handleStart}
            disabled={questions.length === 0}
          >
            <Text style={styles.startBtnText}>Start sprint →</Text>
          </TouchableOpacity>
        </View>
      ) : currentQ ? (
        <View style={styles.quizCard}>
          <View style={styles.qtop}>
            <Text style={styles.qcount}>
              {idx + 1}/{questions.length}
            </Text>
            <ProgressTrack progress={(idx + 1) / Math.max(questions.length, 1)} />
            <CountdownTimer totalSeconds={totalSeconds} />
          </View>

          <View style={styles.scoreRow}>
            <Text style={styles.qscore}>Score {score}</Text>
            <Text style={styles.qcombo}>Combo ×{combo}</Text>
          </View>

          {currentQ.tag ? <Text style={styles.qtag}>{currentQ.tag}</Text> : null}
          <Text style={styles.qtext}>{currentQ.text}</Text>

          <View style={styles.optsGrid}>
            {currentQ.opts.map((opt, i) => (
              <QuizOption
                key={`${currentQ.id}-${i}`}
                label={opt}
                state={getOptionState(i)}
                onPress={() => selectAnswer(i)}
                disabled={answered}
              />
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.startCard}>
          <Text style={styles.errorText}>
            {loadError || 'No questions available to start.'}
          </Text>
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: {
    marginTop: 12,
    fontSize: 12,
    color: theme.colors.textDim,
    fontFamily: theme.fonts.body,
  },
  contentContainer: { padding: 16, paddingBottom: 26 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.amber },
  eyebrowText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: theme.colors.amber,
    fontFamily: theme.fonts.body,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: theme.fonts.heading,
    color: theme.colors.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 11.5,
    color: theme.colors.textDim,
    marginBottom: 16,
    fontFamily: theme.fonts.body,
  },
  startCard: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  startTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    textAlign: 'center',
  },
  startMeta: {
    marginTop: 8,
    fontSize: 13,
    color: theme.colors.textDim,
    textAlign: 'center',
    fontFamily: theme.fonts.body,
  },
  scheduleLine: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.amber,
    fontFamily: theme.fonts.body,
  },
  errorText: {
    marginTop: 12,
    fontSize: 12,
    color: theme.colors.pink,
    textAlign: 'center',
    fontFamily: theme.fonts.body,
  },
  startBtn: {
    marginTop: 28,
    backgroundColor: theme.colors.amber,
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 13,
    minWidth: 200,
    alignItems: 'center',
  },
  startBtnDisabled: { opacity: 0.45 },
  startBtnText: {
    color: '#3A2404',
    fontWeight: '800',
    fontSize: 14,
    fontFamily: theme.fonts.body,
  },
  quizCard: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 20,
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  qtop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  qscore: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.amber,
    fontFamily: theme.fonts.body,
  },
  qcombo: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.teal,
    fontFamily: theme.fonts.body,
  },
  qcount: {
    fontSize: 11.5,
    fontWeight: '700',
    color: theme.colors.textFaint,
    fontFamily: theme.fonts.body,
  },
  qtag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
    color: theme.colors.amber,
    fontFamily: theme.fonts.body,
  },
  qtext: {
    fontSize: 15.5,
    fontWeight: '700',
    lineHeight: 21.7,
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 4,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },
  optsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  completeCard: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  completeWrap: {
    alignItems: 'center',
    paddingTop: 22,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  earnedBig: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.teal,
    fontFamily: theme.fonts.heading,
    textAlign: 'center',
  },
  completeSub: {
    fontSize: 12,
    color: theme.colors.textDim,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: theme.fonts.body,
  },
  replayBtn: {
    width: '100%',
    marginTop: 16,
    padding: 13,
    borderRadius: 13,
    backgroundColor: theme.colors.cardHi,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  replayBtnText: {
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: 13.5,
    fontFamily: theme.fonts.body,
  },
  doneBtn: {
    width: '100%',
    marginTop: 10,
    padding: 13,
    borderRadius: 13,
    backgroundColor: theme.colors.amber,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#3A2404',
    fontWeight: '800',
    fontSize: 13.5,
    fontFamily: theme.fonts.body,
  },
});
