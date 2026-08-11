import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { theme } from '@edubite/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../../lib/game/GameProvider';
import { parseDateKey, todayKey } from '../../lib/game/date';
import {
  formatCountdown,
  msUntilDateEnd,
  puzzleForDate,
  yesterdayKey,
  yesterdayPuzzle,
} from '../../lib/puzzles/daily';
import type { McqPuzzleDef, PuzzleDef, PuzzleProgress } from '../../lib/puzzles/types';
import { fetchPuzzleProgress, lockPuzzleAttempt } from '../../lib/supabase';

function formatDisplayDate(dateKey: string): string {
  const d = parseDateKey(dateKey);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function gradeLabel(puzzle: PuzzleDef): string {
  if (puzzle.grade === 'Competitive') return 'Competitive';
  return `Class ${puzzle.grade}`;
}

function isMcq(puzzle: PuzzleDef): puzzle is McqPuzzleDef {
  return puzzle.kind === 'mcq';
}

export default function PuzzlesScreen() {
  const { state, completePuzzle } = useGame();
  const today = todayKey();
  const yKey = yesterdayKey(today);

  const puzzle = useMemo(() => puzzleForDate(today), [today]);
  const yPuzzle = useMemo(() => yesterdayPuzzle(today), [today]);

  const [hintVisible, setHintVisible] = useState(false);
  const [workText, setWorkText] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [attemptLocked, setAttemptLocked] = useState(false);
  const [locking, setLocking] = useState(false);
  const [countdownMs, setCountdownMs] = useState(() => msUntilDateEnd(today));
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [puzzleStreak, setPuzzleStreak] = useState(0);
  const [solvedDays, setSolvedDays] = useState(0);

  const isLocked = attemptLocked || state.puzzleCompleted;

  useEffect(() => {
    let cancelled = false;
    void fetchPuzzleProgress().then((row) => {
      if (cancelled) return;
      const progress =
        (row as { payload?: PuzzleProgress } | null)?.payload ??
        (row as PuzzleProgress | null);
      if (progress?.attempts) {
        setPuzzleStreak(progress.streak ?? 0);
        setSolvedDays(Object.keys(progress.attempts).length);
        const existing = progress.attempts[today];
        if (existing?.puzzleId === puzzle.id) {
          setWorkText(existing.note ?? '');
          setSelectedOption(existing.selectedOptionIndex);
          setAttemptLocked(true);
        }
      }
      setLoadingProgress(false);
    });
    return () => {
      cancelled = true;
    };
  }, [today, puzzle.id]);

  useEffect(() => {
    const tick = () => setCountdownMs(msUntilDateEnd(today));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [today]);

  const handleLockAttempt = async () => {
    if (isLocked || locking) return;
    if (isMcq(puzzle) && selectedOption === null) return;
    if (!isMcq(puzzle) && !workText.trim()) return;

    setLocking(true);
    try {
      const result = await lockPuzzleAttempt({
        puzzleId: puzzle.id,
        dateKey: today,
        responseType: isMcq(puzzle) ? 'mcq' : 'open-ended',
        note: workText.trim(),
        selectedOptionIndex: isMcq(puzzle) ? selectedOption : null,
      });
      if (result) {
        setAttemptLocked(true);
        await completePuzzle();
      }
    } finally {
      setLocking(false);
    }
  };

  const lockDisabled =
    isLocked ||
    locking ||
    (isMcq(puzzle) ? selectedOption === null : !workText.trim());

  if (loadingProgress) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={theme.colors.amber} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <LinearGradient
          colors={['rgba(239,159,39,0.14)', 'transparent']}
          start={{ x: 0.8, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.eyebrowRow}>
          <View style={styles.dot} />
          <Text style={styles.eyebrowText}>FUNCTION 03B · ONE A DAY</Text>
        </View>
        <Text style={styles.heroTitle}>Puzzles</Text>
        <Text style={styles.heroDesc}>
          One Class XI / XII brain-bender each day. Lock your attempt today — tomorrow&apos;s
          in-app reveal shows the official write-up.
        </Text>

        <View style={styles.heroPills}>
          <View style={[styles.hpill, styles.hpillAmber]}>
            <Text style={[styles.hpillText, styles.hpillTextAmber]}>
              🔥 {puzzleStreak || state.streak}d streak
            </Text>
          </View>
          <View style={styles.hpill}>
            <Text style={styles.hpillText}>🎓 {solvedDays} solved days</Text>
          </View>
          <View style={[styles.hpill, styles.hpillTeal]}>
            <Text style={[styles.hpillText, styles.hpillTextTeal]}>
              📅 {formatDisplayDate(today)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.ptitleRow}>
          <Text style={styles.ptitle}>{puzzle.title}</Text>
          <View style={styles.diffPill}>
            <Text style={styles.diffPillText}>{gradeLabel(puzzle)}</Text>
          </View>
        </View>

        <Text style={styles.topicMeta}>{puzzle.topic}</Text>
        <Text style={styles.qtext}>{puzzle.prompt}</Text>

        <TouchableOpacity
          style={styles.hintLink}
          onPress={() => setHintVisible(!hintVisible)}
        >
          <Text style={styles.hintLinkText}>
            💡 {hintVisible ? 'Hide hint' : 'Peek a hint'}
          </Text>
        </TouchableOpacity>

        {hintVisible && (
          <View style={styles.hintReveal}>
            <Text style={styles.hintRevealText}>{puzzle.hint}</Text>
          </View>
        )}

        {isMcq(puzzle) ? (
          <View style={styles.mcqBlock}>
            <Text style={styles.workLabel}>CHOOSE ONE ANSWER</Text>
            {puzzle.options.map((option, index) => {
              const selected = selectedOption === index;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.mcqOption, selected && styles.mcqOptionSelected]}
                  onPress={() => !isLocked && setSelectedOption(index)}
                  disabled={isLocked}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.mcqOptionText, selected && styles.mcqOptionTextSelected]}>
                    {String.fromCharCode(65 + index)}. {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <>
            <Text style={styles.workLabel}>YOUR WORKING &amp; ANSWER</Text>
            <TextInput
              style={styles.workArea}
              placeholder="Scratch your reasoning here... official answer unlocks tomorrow."
              placeholderTextColor={theme.colors.textFaint}
              multiline
              textAlignVertical="top"
              value={workText}
              onChangeText={setWorkText}
              editable={!isLocked}
            />
          </>
        )}

        <TouchableOpacity
          onPress={() => void handleLockAttempt()}
          disabled={lockDisabled}
          style={styles.lockBtnWrap}
        >
          <LinearGradient
            colors={
              isLocked
                ? [theme.colors.cardHi, theme.colors.cardHi]
                : [theme.colors.amber, '#c9820f']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.lockBtn}
          >
            {locking ? (
              <ActivityIndicator color="#2A1A02" />
            ) : (
              <Text style={[styles.lockBtnText, isLocked && styles.lockBtnTextLocked]}>
                {isLocked ? 'Attempt locked ✓' : 'Lock in attempt'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {isLocked && (
          <Text style={styles.lockNote}>
            ✓ Attempt locked — come back tomorrow for the reveal
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.unlocksNote}>
          Come back tomorrow to compare your attempt with the reveal.
        </Text>
        <View style={styles.countdownBox}>
          <Text style={styles.unlocksLbl}>UNLOCKS IN</Text>
          <Text style={styles.countdownVal}>🕐 {formatCountdown(countdownMs)}</Text>
        </View>
        <View style={styles.sealedBoxWrap}>
          <View style={styles.sealedBox}>
            <Text style={styles.sealedBoxText}>
              REVEALS IN-APP AFTER {formatDisplayDate(today).toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.unlocksNote}>
          Today&apos;s official write-up is hidden in the UI until tomorrow — focus on your own
          attempt first.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.revealHead}>
          <Text style={styles.revealHeadIcon}>🔓</Text>
          <Text style={styles.revealHeadText}>Yesterday&apos;s reveal</Text>
        </View>
        <Text style={styles.revealMeta}>
          {formatDisplayDate(yKey)} · {gradeLabel(yPuzzle)} · {yPuzzle.topic}
        </Text>
        <Text style={styles.revealTitle}>{yPuzzle.title}</Text>
        <Text style={styles.revealQ}>{yPuzzle.prompt}</Text>

        <View style={styles.answerBox}>
          <Text style={styles.answerLbl}>OFFICIAL ANSWER</Text>
          <Text style={styles.answerText}>{yPuzzle.answer}</Text>
        </View>

        <Text style={styles.revealFoot}>
          {attemptLocked
            ? 'Your attempt for today is locked — compare with yesterday’s solution above.'
            : "You didn't lock an attempt yesterday — still handy to read the solution."}
        </Text>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    paddingBottom: 26,
  },
  hero: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 18,
    paddingTop: 16,
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    borderColor: 'rgba(239,159,39,0.22)',
    borderWidth: 1,
    overflow: 'hidden',
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 7,
  },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: theme.colors.amber },
  eyebrowText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: theme.colors.amber,
    fontFamily: theme.fonts.body,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    marginBottom: 9,
  },
  heroDesc: {
    fontSize: 12,
    color: theme.colors.textDim,
    lineHeight: 18,
    marginBottom: 14,
    fontFamily: theme.fonts.body,
  },
  heroPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  hpill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.cardHi,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  hpillAmber: { borderColor: 'rgba(239,159,39,0.3)' },
  hpillTeal: { borderColor: 'rgba(29,158,117,0.3)' },
  hpillText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textDim,
    fontFamily: theme.fonts.body,
  },
  hpillTextAmber: { color: theme.colors.amber },
  hpillTextTeal: { color: theme.colors.teal },

  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 18,
    padding: 16,
  },

  ptitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  ptitle: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
  },
  diffPill: {
    backgroundColor: theme.colors.amberSoft,
    borderWidth: 1,
    borderColor: 'rgba(239,159,39,0.3)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  diffPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.amber,
    fontFamily: theme.fonts.body,
  },
  topicMeta: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textFaint,
    marginBottom: 10,
    fontFamily: theme.fonts.body,
  },
  qtext: {
    fontSize: 13,
    lineHeight: 20.15,
    color: theme.colors.text,
    marginBottom: 14,
    fontFamily: theme.fonts.body,
  },

  hintLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  hintLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.amber,
    fontFamily: theme.fonts.body,
  },
  hintReveal: {
    backgroundColor: theme.colors.cardHi,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 11,
    marginTop: -8,
    marginBottom: 16,
  },
  hintRevealText: { fontSize: 11, color: theme.colors.textDim, fontFamily: theme.fonts.body },

  workLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: theme.colors.textFaint,
    marginBottom: 8,
    fontFamily: theme.fonts.body,
  },
  workArea: {
    width: '100%',
    minHeight: 100,
    backgroundColor: theme.colors.cardHi,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 13,
    padding: 12,
    fontSize: 12,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    marginBottom: 14,
  },
  mcqBlock: { marginBottom: 14, gap: 8 },
  mcqOption: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.cardHi,
  },
  mcqOptionSelected: {
    borderColor: theme.colors.amber,
    backgroundColor: theme.colors.amberSoft,
  },
  mcqOptionText: {
    fontSize: 12,
    color: theme.colors.textDim,
    fontFamily: theme.fonts.body,
  },
  mcqOptionTextSelected: {
    color: theme.colors.text,
    fontWeight: '700',
  },

  lockBtnWrap: { borderRadius: 13, overflow: 'hidden' },
  lockBtn: { width: '100%', padding: 13, alignItems: 'center', justifyContent: 'center' },
  lockBtnText: {
    color: '#2A1A02',
    fontWeight: '800',
    fontSize: 13,
    fontFamily: theme.fonts.body,
  },
  lockBtnTextLocked: { color: theme.colors.textFaint },
  lockNote: {
    textAlign: 'center',
    fontSize: 10.5,
    color: theme.colors.teal,
    marginTop: 9,
    fontFamily: theme.fonts.body,
  },

  unlocksNote: {
    fontSize: 11.5,
    color: theme.colors.textDim,
    lineHeight: 17.25,
    marginBottom: 14,
    fontFamily: theme.fonts.body,
  },
  countdownBox: {
    alignItems: 'center',
    backgroundColor: theme.colors.cardHi,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  unlocksLbl: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: theme.colors.textFaint,
    marginBottom: 8,
    fontFamily: theme.fonts.body,
  },
  countdownVal: {
    fontFamily: theme.fonts.heading,
    fontWeight: '800',
    fontSize: 24,
    color: theme.colors.amber,
  },

  sealedBoxWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  sealedBox: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.cardHi,
  },
  sealedBoxText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: theme.colors.amber,
    fontFamily: theme.fonts.body,
  },

  revealHead: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 },
  revealHeadIcon: { fontSize: 14 },
  revealHeadText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.teal,
    fontFamily: theme.fonts.body,
  },
  revealMeta: {
    fontSize: 10.5,
    color: theme.colors.textFaint,
    marginBottom: 8,
    fontFamily: theme.fonts.body,
  },
  revealTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 9,
    fontFamily: theme.fonts.body,
  },
  revealQ: {
    fontSize: 12.5,
    lineHeight: 19.37,
    color: theme.colors.textDim,
    marginBottom: 14,
    fontFamily: theme.fonts.body,
  },
  answerBox: {
    backgroundColor: theme.colors.tealSoft,
    borderWidth: 1,
    borderColor: 'rgba(29,158,117,0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 13,
    marginBottom: 10,
  },
  answerLbl: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: theme.colors.teal,
    marginBottom: 6,
    fontFamily: theme.fonts.body,
  },
  answerText: {
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },
  revealFoot: {
    fontSize: 10.5,
    color: theme.colors.textFaint,
    fontStyle: 'italic',
    fontFamily: theme.fonts.body,
  },
});
