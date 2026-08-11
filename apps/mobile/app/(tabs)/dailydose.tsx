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
  loadTodayDailyDose,
  type LearnerQuestion,
} from '../../lib/content/today-questions';
import { useGame } from '../../lib/game/GameProvider';
import { todayKey } from '../../lib/game/date';
import { DOSE_DURATION_SEC } from '../../lib/game/state';

export default function DailyDoseScreen() {
  const router = useRouter();
  const {
    state,
    rewardMap,
    completeDose,
    setClassLevel,
    startDose,
    resetDose,
  } = useGame();
  const dosePerCorrect = rewardMap['dose.per_correct']?.amount ?? 10;
  const doseMinutes = Math.round(DOSE_DURATION_SEC / 60);

  const classLevel: '11' | '12' =
    state.dose.currentClass === '12' ? '12' : '11';
  const classChosen = state.dose.classChosen;
  const classDone =
    classLevel === '11' ? state.dose.completed11 : state.dose.completed12;
  const running = state.dose.running && !classDone;
  const today = todayKey();
  const dayLog = state.doseDayLog[today];
  const savedAnswers =
    classLevel === '11' ? state.dose.answers11 : state.dose.answers12;

  const [questions, setQuestions] = useState<LearnerQuestion[]>([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [totalSeconds, setTotalSeconds] = useState(DOSE_DURATION_SEC);
  const [answered, setAnswered] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const finishCalled = useRef(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const resetLocalQuiz = useCallback(() => {
    setIdx(0);
    setAnswers([]);
    setTotalSeconds(DOSE_DURATION_SEC);
    setAnswered(false);
    setSelectedOpt(null);
    setIsFinished(false);
    finishCalled.current = false;
  }, []);

  useEffect(() => {
    if (!classChosen) return;
    let cancelled = false;
    const alreadyDone =
      classLevel === '11' ? state.dose.completed11 : state.dose.completed12;
    setLoadingQuestions(true);
    setLoadError(null);
    if (!alreadyDone) resetLocalQuiz();
    void loadTodayDailyDose(classLevel)
      .then(({ scheduleDate: sd, questions: qs }) => {
        if (cancelled) return;
        setScheduleDate(sd);
        setQuestions(qs);
        if (qs.length === 0) {
          setLoadError('No published DailyDose questions for today yet.');
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setQuestions([]);
        setLoadError(
          err instanceof Error ? err.message : 'Failed to load today\'s questions.',
        );
      })
      .finally(() => {
        if (!cancelled) setLoadingQuestions(false);
      });
    return () => {
      cancelled = true;
    };
    // Intentionally only reload when class bank changes — not on complete/replay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classLevel, classChosen, resetLocalQuiz]);

  const finishQuiz = useCallback(
    async (finalAnswers: number[]) => {
      if (finishCalled.current || classDone) return;
      finishCalled.current = true;
      // Server grades from answers[] — client never holds answer keys.
      await completeDose({
        classLevel,
        answers: finalAnswers,
        correct: 0,
        total: questions.length,
      });
      setIsFinished(true);
    },
    [classDone, classLevel, completeDose, questions.length],
  );

  useEffect(() => {
    if (!running || classDone || isFinished || loadingQuestions) return;
    if (questions.length === 0) return;

    const timer = setInterval(() => {
      setTotalSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          void finishQuiz(answersRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    running,
    classDone,
    finishQuiz,
    isFinished,
    loadingQuestions,
    questions.length,
  ]);

  const switchClass = (next: '11' | '12') => {
    if (next === classLevel || running) return;
    setClassLevel(next);
  };

  const handleStart = () => {
    if (questions.length === 0 || classDone) return;
    resetLocalQuiz();
    startDose();
  };

  const handleReplay = () => {
    if (questions.length === 0) return;
    resetLocalQuiz();
    // Defer provider updates so we never setState in GameProvider during this render pass.
    queueMicrotask(() => {
      resetDose();
      startDose();
    });
  };

  const selectAnswer = (i: number) => {
    if (!running || answered || classDone || isFinished) return;
    setAnswered(true);
    setSelectedOpt(i);

    const nextAnswers = [...answers];
    nextAnswers[idx] = i;
    setAnswers(nextAnswers);

    setTimeout(() => {
      if (idx < questions.length - 1) {
        setIdx((prev) => prev + 1);
        setAnswered(false);
        setSelectedOpt(null);
      } else {
        void finishQuiz(nextAnswers);
      }
    }, 400);
  };

  const showCompleted = classDone || isFinished;
  const displayAnswers = savedAnswers.length ? savedAnswers : answers;
  const answeredCount = displayAnswers.filter((a) => typeof a === 'number').length;
  const displayCorrect =
    dayLog?.classLevel === classLevel ? dayLog.correct : 0;
  const displayTotal =
    dayLog?.classLevel === classLevel
      ? dayLog.total
      : questions.length || answeredCount;
  const earnedRdm = displayCorrect * dosePerCorrect;

  const currentQ = questions[idx];

  const getOptionState = (optIndex: number): OptionState => {
    if (!answered) return 'default';
    // Highlight pick only — no answer-key feedback on device.
    if (optIndex === selectedOpt) return 'correct';
    return 'default';
  };

  if (loadingQuestions && classChosen && questions.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={theme.colors.teal} />
        <Text style={styles.loadingText}>Loading today&apos;s questions from DB…</Text>
      </View>
    );
  }

  if (!classChosen) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.eyebrowRow}>
          <View style={styles.dot} />
          <Text style={styles.eyebrowText}>FUNCTION 01</Text>
        </View>
        <Text style={styles.title}>DailyDose</Text>
        <Text style={styles.subtitle}>
          Choose your class once — we&apos;ll load today&apos;s published questions.
        </Text>

        <View style={styles.startCard}>
          <Text style={styles.startTitle}>Which class are you in?</Text>
          <Text style={styles.startMeta}>
            Pick 11th or 12th for today&apos;s PCM bank from Supabase.
          </Text>

          <TouchableOpacity
            style={styles.classPickBtn}
            onPress={() => setClassLevel('11')}
          >
            <Text style={styles.classPickTitle}>Class 11th</Text>
            <Text style={styles.classPickSub}>Today&apos;s published set</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.classPickBtn}
            onPress={() => setClassLevel('12')}
          >
            <Text style={styles.classPickTitle}>Class 12th</Text>
            <Text style={styles.classPickSub}>Today&apos;s published set</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
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
        <Text style={styles.eyebrowText}>FUNCTION 01</Text>
      </View>

      <View style={styles.headRow}>
        <Text style={styles.title}>DailyDose</Text>
        <View style={[styles.classToggle, running && styles.classToggleDisabled]}>
          <TouchableOpacity
            style={[styles.toggleBtn, classLevel === '11' && styles.toggleBtnActive]}
            onPress={() => switchClass('11')}
            disabled={running}
          >
            <Text
              style={[
                styles.toggleBtnText,
                classLevel === '11' && styles.toggleBtnTextActive,
              ]}
            >
              Class 11th
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, classLevel === '12' && styles.toggleBtnActive]}
            onPress={() => switchClass('12')}
            disabled={running}
          >
            <Text
              style={[
                styles.toggleBtnText,
                classLevel === '12' && styles.toggleBtnTextActive,
              ]}
            >
              Class 12th
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.subtitle}>
        {showCompleted
          ? 'Nice work — see your results below.'
          : running
            ? 'DailyDose in progress — finish before the timer ends.'
            : `${doseMinutes}-minute timer · today&apos;s published questions from DB.`}
      </Text>

      {showCompleted ? (
        <>
          <View style={styles.completeCard}>
            <View style={styles.completeWrap}>
              <Text style={styles.earnedBig}>
                {dayLog?.classLevel === classLevel
                  ? `${earnedRdm} RDM earned today`
                  : 'Dose submitted'}
              </Text>
              <Text style={styles.completeSub}>
                {answeredCount} of {displayTotal || questions.length || 5} answered
                {dayLog?.classLevel === classLevel
                  ? ` · ${displayCorrect} correct after server grade`
                  : ' · scoring syncs when session can save'}
                . Finish Fun Brain, Puzzles, Habits, and Pledge too for streak.
              </Text>
              {scheduleDate ? (
                <Text style={styles.scheduleLine}>DB schedule · {scheduleDate}</Text>
              ) : null}

              <TouchableOpacity style={styles.replayBtn} onPress={handleReplay}>
                <Text style={styles.replayBtnText}>Replay DailyDose</Text>
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
          <Text style={styles.startTitle}>DailyDose</Text>
          <Text style={styles.startMeta}>
            {doseMinutes}-minute timer · {questions.length || 0} questions · Class{' '}
            {classLevel}
          </Text>
          {scheduleDate ? (
            <Text style={styles.scheduleLine}>DB schedule date · {scheduleDate}</Text>
          ) : null}
          {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}
          <Text style={styles.startHint}>
            When the timer hits zero, the exam stops. RDM is credited once per day from
            server grading.
          </Text>
          <TouchableOpacity
            style={[styles.startBtn, questions.length === 0 && styles.startBtnDisabled]}
            onPress={handleStart}
            disabled={questions.length === 0}
          >
            <Text style={styles.startBtnText}>Start DailyDose →</Text>
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

          {currentQ.tag ? <Text style={styles.qtag}>{currentQ.tag}</Text> : null}
          <Text style={styles.qtext}>{currentQ.text}</Text>

          <View style={styles.opts}>
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
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: theme.fonts.heading,
    color: theme.colors.text,
  },
  classToggle: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 999,
    padding: 3,
  },
  classToggleDisabled: { opacity: 0.55 },
  toggleBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  toggleBtnActive: { backgroundColor: theme.colors.cardHi },
  toggleBtnText: {
    color: theme.colors.textFaint,
    fontSize: 10.5,
    fontWeight: '700',
    fontFamily: theme.fonts.body,
  },
  toggleBtnTextActive: { color: theme.colors.text },
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
    paddingVertical: 40,
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
    color: theme.colors.teal,
    fontFamily: theme.fonts.body,
  },
  startHint: {
    marginTop: 12,
    fontSize: 11.5,
    color: theme.colors.textFaint,
    textAlign: 'center',
    lineHeight: 17,
    maxWidth: 320,
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
    backgroundColor: theme.colors.teal,
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 13,
    minWidth: 200,
    alignItems: 'center',
  },
  startBtnDisabled: { opacity: 0.45 },
  startBtnText: {
    color: '#08130F',
    fontWeight: '800',
    fontSize: 14,
    fontFamily: theme.fonts.body,
  },
  classPickBtn: {
    marginTop: 12,
    width: '100%',
    backgroundColor: theme.colors.cardHi,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  classPickTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
  },
  classPickSub: {
    marginTop: 3,
    fontSize: 11,
    color: theme.colors.textFaint,
    fontFamily: theme.fonts.body,
  },
  quizCard: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  qtop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  qcount: {
    fontSize: 11.5,
    fontWeight: '700',
    color: theme.colors.textDim,
    fontFamily: theme.fonts.body,
  },
  qtag: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 9,
    color: theme.colors.teal,
    fontFamily: theme.fonts.body,
  },
  qtext: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21.75,
    marginBottom: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },
  opts: {},
  completeCard: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  completeWrap: {
    alignItems: 'center',
    paddingTop: 18,
    paddingHorizontal: 10,
    paddingBottom: 10,
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
    marginTop: 8,
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: theme.fonts.body,
  },
  replayBtn: {
    width: '100%',
    marginTop: 10,
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
    backgroundColor: theme.colors.teal,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#08130F',
    fontWeight: '800',
    fontSize: 13.5,
    fontFamily: theme.fonts.body,
  },
});
