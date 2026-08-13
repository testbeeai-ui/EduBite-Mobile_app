import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@edubite/ui';
import { MonthlyChallengeInfoModal } from '../../components/challenge/MonthlyChallengeInfoModal';
import {
  formatCountdown,
  formatCountdownLong,
  msUntilDateEnd,
  msUntilDateStart,
} from '../../lib/challenge/countdown';
import {
  buildChallengeProgress,
  challengePuzzlePrompt,
  challengeUnlockProgressPct,
  firstWeekdayOfMonth,
  formatActivityTime,
  formatChallengeLongDate,
  formatRdm,
  formatWinnerTime,
  getChallengeMonthMeta,
  getEntryState,
  getMonthlyChallengeEntryStakeRdm,
  getMonthlyChallengeTargetRdm,
  isEnrolledForChallengeMonth,
  MONTHLY_CHALLENGE_STREAK_REQUIRED,
  MONTHLY_CHALLENGE_WINNER_SLOTS,
  ordinal,
  streakBannerCopy,
  type ChallengeCalendarDay,
  type ChallengeDayStatus,
  type MonthlyEntryState,
} from '../../lib/challenge/monthly';
import { useAuth } from '../../lib/auth/AuthProvider';
import { useGame } from '../../lib/game/GameProvider';
import { todayKey } from '../../lib/game/date';
import {
  fetchMonthlyChallengeWinners,
  fetchOwnMonthlyChallengeEntry,
} from '../../lib/supabase';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type WinnerSlot = { name: string; time: string } | null;

function displayNameFromUser(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
} | null): string {
  const meta = user?.user_metadata ?? {};
  const full =
    (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
    (typeof meta.name === 'string' && meta.name.trim()) ||
    '';
  if (full) return full.slice(0, 80);
  const email = user?.email?.trim();
  if (email) return (email.split('@')[0] ?? 'Learner').slice(0, 40);
  return 'Learner';
}

export default function MonthlyChallengeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    state,
    rewardMap,
    enrollMonthlyChallenge,
    submitMonthlyChallenge,
    markChallengePuzzleSubmitted,
    saving,
    syncChallengeRemote,
  } = useGame();

  const today = todayKey();
  const meta = useMemo(() => getChallengeMonthMeta(today), [today]);
  const targetRdm = getMonthlyChallengeTargetRdm(rewardMap);
  const entryStakeRdm = getMonthlyChallengeEntryStakeRdm(rewardMap);
  const entryState = getEntryState({
    rdm: state.rdm,
    dateKey: today,
    enrolledMonthKey: state.challengeEnrolledMonthKey,
    enrolledMonths: state.challengeEnrolledMonths,
    rewardMap,
  });
  const progress = useMemo(
    () => buildChallengeProgress(state, today),
    [state, today],
  );

  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitOk, setSubmitOk] = useState<string | null>(null);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [winners, setWinners] = useState<WinnerSlot[]>(
    Array.from({ length: MONTHLY_CHALLENGE_WINNER_SLOTS }, () => null),
  );

  const enrolled = isEnrolledForChallengeMonth(
    meta.monthKey,
    state.challengeEnrolledMonthKey,
    state.challengeEnrolledMonths,
  );
  const alreadySubmitted =
    state.challengePuzzleSubmittedMonthKey === meta.monthKey || Boolean(submitOk);

  // Quiet roster pull when opening challenge (keeps web enrollments visible after day 5).
  useEffect(() => {
    void syncChallengeRemote();
  }, [syncChallengeRemote]);

  const loadWinners = useCallback(async () => {
    try {
      const raw = await fetchMonthlyChallengeWinners(meta.monthKey);
      const slots: WinnerSlot[] = raw.map((row) => ({
        name: row.display_name,
        time: formatWinnerTime(row.submitted_at),
      }));
      while (slots.length < MONTHLY_CHALLENGE_WINNER_SLOTS) slots.push(null);
      setWinners(slots.slice(0, MONTHLY_CHALLENGE_WINNER_SLOTS));

      const own = await fetchOwnMonthlyChallengeEntry(meta.monthKey);
      if (own && state.challengePuzzleSubmittedMonthKey !== meta.monthKey) {
        markChallengePuzzleSubmitted(meta.monthKey);
      }
    } catch {
      // Board stays empty if offline
    }
  }, [
    markChallengePuzzleSubmitted,
    meta.monthKey,
    state.challengePuzzleSubmittedMonthKey,
  ]);

  useEffect(() => {
    if (entryState !== 'open' || !enrolled) return;
    void loadWinners();
  }, [entryState, enrolled, loadWinners]);

  const firstWeekday = firstWeekdayOfMonth(`${meta.monthKey}-01`);
  const lastDayLabel = formatChallengeLongDate(meta.lastDayKey);
  const streak = progress.currentStretch;
  const streakMet = progress.streakMet;
  const onPuzzleDay = progress.onPuzzleDay;
  const puzzlePrompt = challengePuzzlePrompt(meta);

  const handleEnroll = async () => {
    if (enrolling || enrolled || entryState !== 'open') return;
    setEnrolling(true);
    setEnrollError(null);
    try {
      const result = await enrollMonthlyChallenge(displayNameFromUser(user));
      if (!result.ok) {
        setEnrollError(result.error ?? 'Could not enter Monthly Challenge.');
      }
    } finally {
      setEnrolling(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim() || submitting || alreadySubmitted) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitOk(null);
    try {
      const result = await submitMonthlyChallenge({
        answer: answer.trim(),
        displayName: displayNameFromUser(user),
      });
      if (!result.ok) {
        setSubmitError(result.error ?? 'Could not submit entry');
        return;
      }
      setSubmitOk(
        result.message ??
          'Entry recorded. Edubite will verify and notify winners on WhatsApp and email.',
      );
      void loadWinners();
    } finally {
      setSubmitting(false);
    }
  };

  if (entryState !== 'open') {
    return (
      <LockedChallengeScreen
        entryState={entryState}
        rdm={state.rdm}
        targetRdm={targetRdm}
        entryStakeRdm={entryStakeRdm}
        nextEntryOpensLabel={meta.nextEntryOpensLabel}
        monthLabel={`${meta.monthLabel} ${meta.year}`}
        onBack={() => router.navigate('/')}
        onLearn={() => setShowInfoModal(true)}
        showInfoModal={showInfoModal}
        onCloseInfo={() => setShowInfoModal(false)}
      />
    );
  }

  if (!enrolled) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.pad}>
        <View style={styles.centerBlock}>
          <Text style={styles.bigEmoji}>🏆</Text>
          <Text style={styles.h1}>
            The {meta.monthLabel} {meta.year} Challenge
          </Text>
          <Text style={styles.body}>
            Entry stake is {formatRdm(entryStakeRdm)} RDM (non-refundable). Unlock
            threshold: {formatRdm(targetRdm)} RDM. Entry window: days 1–5.
          </Text>
          {enrollError ? <Text style={styles.errorText}>{enrollError}</Text> : null}
          <TouchableOpacity
            style={styles.primaryBtn}
            disabled={enrolling || saving}
            onPress={() => void handleEnroll()}
          >
            {enrolling ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Enter Challenge</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowInfoModal(true)}>
            <Text style={styles.link}>Learn how it works</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.navigate('/')}>
            <Text style={styles.linkDim}>Back to Home</Text>
          </TouchableOpacity>
        </View>
        <MonthlyChallengeInfoModal
          open={showInfoModal}
          onClose={() => setShowInfoModal(false)}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Monthly Challenge</Text>
        <Text style={styles.h1}>
          The <Text style={styles.hi}>{meta.monthLabel} {meta.year}</Text> Challenge
        </Text>
        <Text style={styles.body}>
          Complete your full learning day every day — all 5 tasks (Daily Dose,
          FunBrain, Puzzle, Habits, and both Pledges) — for a minimum{' '}
          {MONTHLY_CHALLENGE_STREAK_REQUIRED}-day stretch. Then crack the final
          puzzle on the last day of the month.
        </Text>
      </View>

      <Card
        icon="📋"
        title="How it works"
        action={
          <TouchableOpacity style={styles.learnChip} onPress={() => setShowInfoModal(true)}>
            <Text style={styles.learnChipText}>Learn How</Text>
          </TouchableOpacity>
        }
      >
        <RuleStep
          n={1}
          title={`Build your ${MONTHLY_CHALLENGE_STREAK_REQUIRED}-day streak`}
          body={`Finish the whole Day card every day — all 5 dots — for at least ${MONTHLY_CHALLENGE_STREAK_REQUIRED} consecutive calendar days.`}
        />
        <RuleStep
          n={2}
          title="Unlock the final puzzle"
          body={`Once your stretch is complete, the final puzzle opens for everyone on ${lastDayLabel}.`}
        />
        <RuleStep
          n={3}
          title="Be first, be right"
          body={`The first ${MONTHLY_CHALLENGE_WINNER_SLOTS} verified-correct answers win — ranked by server submit time.`}
        />
      </Card>

      <Card icon="🔥" title="Your streak this month">
        <View style={styles.streakBanner}>
          <Text style={styles.streakEmoji}>{streakMet ? '🎉' : '🔥'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.streakTitle}>
              {streakMet
                ? `${MONTHLY_CHALLENGE_STREAK_REQUIRED}-day streak requirement met`
                : `${streak} of ${MONTHLY_CHALLENGE_STREAK_REQUIRED} days completed`}
            </Text>
            <Text style={styles.streakSub}>
              {streakBannerCopy({
                streakMet,
                onPuzzleDay,
                puzzleOpen: progress.puzzleOpen,
                alreadySubmitted,
                lastDayLabel,
                lastDay: meta.lastDay,
                monthLabel: meta.monthLabel,
              })}
            </Text>
          </View>
        </View>

        <ChallengeTimerSection
          today={today}
          lastDayKey={meta.lastDayKey}
          lastDayLabel={lastDayLabel}
          onPuzzleDay={onPuzzleDay}
          alreadySubmitted={alreadySubmitted}
          activityDays={progress.calendar.filter((d) => d.status === 'done')}
        />

        <View style={styles.stretchRow}>
          <Text style={styles.muted}>Current stretch</Text>
          <Text style={styles.muted}>
            <Text style={styles.purpleBold}>{streak}</Text> /{' '}
            {MONTHLY_CHALLENGE_STREAK_REQUIRED} days required
          </Text>
        </View>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${Math.min(100, (streak / MONTHLY_CHALLENGE_STREAK_REQUIRED) * 100)}%`,
              },
            ]}
          />
        </View>

        <View style={styles.weekRow}>
          {WEEKDAYS.map((d) => (
            <Text key={d} style={styles.weekLabel}>
              {d}
            </Text>
          ))}
        </View>
        <View style={styles.calGrid}>
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <View key={`b-${i}`} style={styles.calCellBlank} />
          ))}
          {progress.calendar.map((day) => {
            const isToday = day.dateKey === today;
            return (
              <View
                key={day.dateKey}
                style={[
                  styles.calCell,
                  calendarCellStyle(day.status, day.isPuzzleDay, progress.puzzleOpen),
                  isToday && styles.calToday,
                ]}
              >
                <Text style={styles.calDay}>{day.day}</Text>
                {day.isPuzzleDay ? (
                  <Text style={styles.calMark}>{progress.puzzleOpen ? '🧩' : '🔒'}</Text>
                ) : day.status === 'done' && day.pct != null ? (
                  <Text style={styles.calMark}>{day.pct}%</Text>
                ) : day.status === 'missed' ? (
                  <Text style={styles.calMark}>✕</Text>
                ) : day.status === 'today_pending' ? (
                  <Text style={styles.calMark}>·</Text>
                ) : null}
              </View>
            );
          })}
        </View>

        <View style={styles.legendRow}>
          <Legend color={theme.colors.purple} label="Full day done" />
          <Legend color="rgba(212,83,126,0.5)" label="Missed" />
          <Legend color={theme.colors.cardHi} label="Upcoming" />
          <Legend
            color={theme.colors.purple}
            label={`Puzzle day (${meta.lastDay}${ordinal(meta.lastDay)})`}
          />
        </View>
      </Card>

      <Card icon="🧩" title="Final puzzle">
        {!onPuzzleDay ? (
          <LockedPuzzle
            title={`Opens ${lastDayLabel}`}
            body={`The puzzle stays locked until 12:00 AM on the last day — even if you've already completed your ${MONTHLY_CHALLENGE_STREAK_REQUIRED}-day stretch.`}
          />
        ) : !streakMet ? (
          <LockedPuzzle
            title="Not eligible this month"
            body={`You needed a ${MONTHLY_CHALLENGE_STREAK_REQUIRED}-day stretch of full journey days to unlock the final puzzle. Keep going next month.`}
          />
        ) : alreadySubmitted ? (
          <View style={styles.okBox}>
            <Text style={styles.okText}>
              Your entry is recorded. Edubite will verify correctness and notify
              winners on WhatsApp and email.
            </Text>
          </View>
        ) : (
          <View>
            <View style={styles.promptBox}>
              <Text style={styles.promptTitle}>🧩 Today&apos;s puzzle</Text>
              <Text style={styles.promptBody}>{puzzlePrompt}</Text>
            </View>
            <TextInput
              value={answer}
              onChangeText={setAnswer}
              editable={!submitting}
              placeholder="Type your answer here..."
              placeholderTextColor={theme.colors.textFaint}
              multiline
              style={styles.input}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, (!answer.trim() || submitting) && styles.btnDisabled]}
              disabled={submitting || !answer.trim()}
              onPress={() => void submitAnswer()}
            >
              <Text style={styles.primaryBtnText}>
                {submitting ? 'Submitting…' : 'Submit answer'}
              </Text>
            </TouchableOpacity>
            {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
            {submitOk ? <Text style={styles.okText}>{submitOk}</Text> : null}
          </View>
        )}
      </Card>

      <Card icon="🏆" title="First 5 winners">
        <Text style={styles.body}>
          Ranked by <Text style={styles.termBold}>server submit time</Text> among
          verified-correct answers. You&apos;ll be notified on WhatsApp and email.
        </Text>
        {winners.map((w, i) => (
          <View key={i} style={styles.winnerRow}>
            <View style={[styles.winnerRank, w && styles.winnerRankFilled]}>
              <Text style={[styles.winnerRankText, w && styles.winnerRankTextFilled]}>
                {i + 1}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              {w ? (
                <>
                  <Text style={styles.winnerName}>{w.name}</Text>
                  <Text style={styles.winnerTime}>{w.time}</Text>
                </>
              ) : (
                <Text style={styles.winnerEmpty}>— Awaiting entry —</Text>
              )}
            </View>
          </View>
        ))}
      </Card>

      <Card icon="📜" title="Terms & Conditions" muted>
        <View style={styles.termsBox}>
          <Term n={1}>
            To qualify for the final puzzle, complete all 5 tasks for at least{' '}
            {MONTHLY_CHALLENGE_STREAK_REQUIRED} consecutive calendar days.
          </Term>
          <Term n={2}>The final puzzle opens on {lastDayLabel}.</Term>
          <Term n={3}>
            The first 5 correct entries by system record win. Edubite notifies via
            WhatsApp and email.
          </Term>
          <Term n={4}>
            Winner names are announced with date and time of submission.
          </Term>
          <Term n={5}>
            The Edubite system record of submission time and correctness is binding.
          </Term>
          <Term n={6}>
            Entry stake claims{' '}
            <Text style={styles.amber}>{formatRdm(entryStakeRdm)} RDM</Text> — non-refundable.
          </Term>
          <Term n={7}>
            Valid this month only. Next month: unlock at {formatRdm(targetRdm)} RDM and
            pay a fresh {formatRdm(entryStakeRdm)} RDM stake during days 1–5.
          </Term>
        </View>
      </Card>

      <MonthlyChallengeInfoModal
        open={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </ScrollView>
  );
}

function LockedChallengeScreen({
  entryState,
  rdm,
  targetRdm,
  entryStakeRdm,
  nextEntryOpensLabel,
  monthLabel,
  onBack,
  onLearn,
  showInfoModal,
  onCloseInfo,
}: {
  entryState: Exclude<MonthlyEntryState, 'open'>;
  rdm: number;
  targetRdm: number;
  entryStakeRdm: number;
  nextEntryOpensLabel: string;
  monthLabel: string;
  onBack: () => void;
  onLearn: () => void;
  showInfoModal: boolean;
  onCloseInfo: () => void;
}) {
  const isRdmLock = entryState === 'locked_rdm';
  const unlockPct = challengeUnlockProgressPct(rdm, targetRdm);
  const remaining = Math.max(0, targetRdm - rdm);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.lockedPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.lockedCard}>
        <Text style={styles.lockedEyebrow}>Monthly Challenge</Text>

        <View
          style={[
            styles.lockedIconWrap,
            isRdmLock ? styles.lockedIconAmber : styles.lockedIconPurple,
          ]}
        >
          <Text style={styles.lockedIconGlyph}>{isRdmLock ? '🔒' : '🏆'}</Text>
        </View>

        <Text style={styles.lockedTitle}>
          {isRdmLock ? 'Challenge locked' : 'Entry window closed'}
        </Text>
        <Text style={styles.lockedMonth}>{monthLabel}</Text>

        <Text style={styles.lockedBody}>
          {isRdmLock
            ? `Earn ${formatRdm(targetRdm)} RDM to unlock this month’s challenge. Keep completing your Day card — every full day moves you closer.`
            : `Entry opens only on days 1–5. Once you join, you stay in for the rest of the month. Next window: ${nextEntryOpensLabel}.`}
        </Text>

        {isRdmLock ? (
          <View style={styles.unlockPanel}>
            <View style={styles.unlockRow}>
              <Text style={styles.unlockLabel}>Your progress</Text>
              <Text style={styles.unlockPct}>{unlockPct}%</Text>
            </View>
            <View style={styles.unlockTrack}>
              <View style={[styles.unlockFill, { width: `${unlockPct}%` }]} />
            </View>
            <View style={styles.unlockRow}>
              <Text style={styles.unlockMeta}>
                <Text style={styles.unlockMetaStrong}>{formatRdm(rdm)}</Text>
                {' / '}
                {formatRdm(targetRdm)} RDM
              </Text>
              <Text style={styles.unlockMeta}>
                {remaining > 0
                  ? `${formatRdm(remaining)} to go`
                  : 'Threshold met'}
              </Text>
            </View>
            <Text style={styles.unlockStake}>
              Entry stake: {formatRdm(entryStakeRdm)} RDM · non-refundable
            </Text>
          </View>
        ) : (
          <View style={styles.windowChip}>
            <Text style={styles.windowChipEmoji}>🗓️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.windowChipTitle}>Next entry window</Text>
              <Text style={styles.windowChipBody}>{nextEntryOpensLabel}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.lockedPrimaryBtn}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back to Home"
        >
          <Text style={styles.lockedPrimaryBtnText} numberOfLines={1}>
            Back to Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.lockedSecondaryBtn}
          onPress={onLearn}
          accessibilityRole="button"
          accessibilityLabel="Learn how Monthly Challenge works"
        >
          <Text style={styles.lockedSecondaryBtnText}>Learn how it works</Text>
        </TouchableOpacity>
      </View>

      <MonthlyChallengeInfoModal open={showInfoModal} onClose={onCloseInfo} />
    </ScrollView>
  );
}

function ChallengeTimerSection({
  today,
  lastDayKey,
  lastDayLabel,
  onPuzzleDay,
  alreadySubmitted,
  activityDays,
}: {
  today: string;
  lastDayKey: string;
  lastDayLabel: string;
  onPuzzleDay: boolean;
  alreadySubmitted: boolean;
  activityDays: ChallengeCalendarDay[];
}) {
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const now = useMemo(() => new Date(nowTick), [nowTick]);
  const opensIn = msUntilDateStart(lastDayKey, now);
  const closesIn = msUntilDateEnd(lastDayKey, now);

  let timerLabel: string;
  let timerValue: string;
  let timerHint: string;

  if (alreadySubmitted) {
    timerLabel = 'Your entry is locked';
    timerValue = 'Submitted';
    timerHint =
      'Winner rank uses the server timestamp from your submit — earliest verified-correct wins.';
  } else if (onPuzzleDay) {
    timerLabel = 'Puzzle day · submit window';
    timerValue = formatCountdown(closesIn);
    timerHint =
      'Live countdown to end of puzzle day. Among correct answers, earlier server time ranks higher.';
  } else if (today > lastDayKey) {
    timerLabel = 'Puzzle window';
    timerValue = 'Closed';
    timerHint = "This month's final puzzle window has ended.";
  } else {
    timerLabel = 'Final puzzle opens';
    timerValue = formatCountdownLong(opensIn);
    timerHint = `Opens ${lastDayLabel} at 12:00 AM — first ${MONTHLY_CHALLENGE_WINNER_SLOTS} verified-correct by server time win.`;
  }

  return (
    <View style={styles.timerWrap}>
      <View style={styles.timerBox}>
        <Text style={styles.timerLabel}>{timerLabel}</Text>
        <Text style={styles.timerValue}>{timerValue}</Text>
        <Text style={styles.timerHint}>{timerHint}</Text>
      </View>
      <View style={styles.activityBox}>
        <View style={styles.stretchRow}>
          <Text style={styles.muted}>Day-by-day activity</Text>
          <Text style={styles.purpleSm}>
            {activityDays.length} full day{activityDays.length === 1 ? '' : 's'}
          </Text>
        </View>
        {activityDays.length === 0 ? (
          <Text style={styles.body}>
            Complete all 5 tasks today — this list grows one row per full day.
          </Text>
        ) : (
          activityDays.map((day) => (
            <View key={day.dateKey} style={styles.activityRow}>
              <Text style={styles.activityDay}>
                Day {day.day}
                {day.isPuzzleDay ? ' · Puzzle' : ''}
              </Text>
              <Text style={styles.activityTime}>{formatActivityTime(day.completedAt)}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

function Card({
  icon,
  title,
  children,
  action,
  muted,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <View style={styles.cardHeadLeft}>
          <View style={[styles.cardIcon, muted && styles.cardIconMuted]}>
            <Text>{icon}</Text>
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        {action}
      </View>
      {children}
    </View>
  );
}

function RuleStep({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <View style={styles.ruleStep}>
      <View style={styles.ruleN}>
        <Text style={styles.ruleNText}>{n}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.ruleTitle}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </View>
  );
}

function LockedPuzzle({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.lockedPuzzle}>
      <View style={styles.lockedIcon}>
        <Text>🔒</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.ruleTitle}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function Term({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <Text style={styles.term}>
      <Text style={styles.termBold}>{n}. </Text>
      {children}
    </Text>
  );
}

function calendarCellStyle(
  status: ChallengeDayStatus,
  isPuzzleDay: boolean,
  puzzleOpen: boolean,
): object {
  if (isPuzzleDay) {
    return puzzleOpen
      ? { backgroundColor: theme.colors.purple }
      : {
          backgroundColor: theme.colors.cardHi,
          borderStyle: 'dashed' as const,
          borderColor: 'rgba(255,255,255,0.14)',
        };
  }
  switch (status) {
    case 'upcoming':
      return { backgroundColor: theme.colors.cardHi, borderColor: theme.colors.border };
    case 'done':
      return { backgroundColor: theme.colors.purple };
    case 'missed':
      return {
        backgroundColor: 'rgba(212,83,126,0.16)',
        borderColor: 'rgba(212,83,126,0.4)',
      };
    case 'today_pending':
      return {
        backgroundColor: theme.colors.cardHi,
        borderColor: theme.colors.amber,
      };
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  pad: { padding: 16, paddingBottom: 40, gap: 14 },
  lockedPad: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  lockedCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
  },
  lockedEyebrow: {
    color: theme.colors.purple,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 18,
  },
  lockedIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  lockedIconAmber: {
    backgroundColor: theme.colors.amberSoft,
    borderColor: 'rgba(239,159,39,0.35)',
  },
  lockedIconPurple: {
    backgroundColor: theme.colors.purpleSoft,
    borderColor: 'rgba(127,119,221,0.35)',
  },
  lockedIconGlyph: { fontSize: 28 },
  lockedTitle: {
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  lockedMonth: {
    color: theme.colors.teal,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 14,
  },
  lockedBody: {
    color: theme.colors.textDim,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: 320,
  },
  unlockPanel: {
    alignSelf: 'stretch',
    backgroundColor: theme.colors.cardHi,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    marginBottom: 20,
    gap: 10,
  },
  unlockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unlockLabel: {
    color: theme.colors.textFaint,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  unlockPct: {
    color: theme.colors.teal,
    fontSize: 13,
    fontWeight: '700',
  },
  unlockTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  unlockFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: theme.colors.teal,
  },
  unlockMeta: {
    color: theme.colors.textDim,
    fontSize: 12,
  },
  unlockMetaStrong: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  unlockStake: {
    color: theme.colors.textFaint,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  windowChip: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.cardHi,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(127,119,221,0.28)',
    padding: 14,
    marginBottom: 20,
  },
  windowChipEmoji: { fontSize: 22 },
  windowChipTitle: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  windowChipBody: {
    color: theme.colors.textDim,
    fontSize: 12.5,
    lineHeight: 17,
  },
  lockedPrimaryBtn: {
    alignSelf: 'stretch',
    minHeight: 52,
    backgroundColor: theme.colors.teal,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedPrimaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
  lockedSecondaryBtn: {
    marginTop: 14,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedSecondaryBtnText: {
    color: '#C4B5FD',
    fontSize: 13,
    fontWeight: '600',
  },
  header: { marginBottom: 4 },
  eyebrow: {
    color: theme.colors.purple,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },
  h1: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  hi: { color: theme.colors.purple },
  body: { color: theme.colors.textDim, fontSize: 12.5, lineHeight: 18 },
  centerBlock: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  bigEmoji: { fontSize: 36, marginBottom: 4 },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.purpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconMuted: { backgroundColor: theme.colors.cardHi },
  cardTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  learnChip: {
    backgroundColor: 'rgba(127,119,221,0.18)',
    borderColor: 'rgba(127,119,221,0.35)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  learnChipText: { color: '#C4B5FD', fontSize: 11, fontWeight: '600' },
  ruleStep: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  ruleN: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.purpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleNText: { color: theme.colors.purple, fontWeight: '700', fontSize: 12 },
  ruleTitle: { color: theme.colors.text, fontWeight: '700', fontSize: 13.5, marginBottom: 4 },
  streakBanner: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(127,119,221,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(127,119,221,0.5)',
    marginBottom: 12,
  },
  streakEmoji: { fontSize: 22 },
  streakTitle: { color: theme.colors.purple, fontWeight: '700', fontSize: 13, marginBottom: 2 },
  streakSub: { color: theme.colors.textDim, fontSize: 11.5, lineHeight: 16 },
  stretchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  muted: { color: theme.colors.textFaint, fontSize: 11 },
  purpleBold: { color: theme.colors.purple, fontWeight: '700', fontSize: 13 },
  purpleSm: { color: theme.colors.purple, fontSize: 10 },
  track: {
    height: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  fill: { height: '100%', backgroundColor: theme.colors.purple, borderRadius: 999 },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    color: theme.colors.textFaint,
    fontSize: 9.5,
  },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCellBlank: { width: `${100 / 7}%`, aspectRatio: 1 },
  calCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  calToday: { borderWidth: 2, borderColor: theme.colors.amber },
  calDay: { color: theme.colors.text, fontSize: 11, fontWeight: '700' },
  calMark: { color: theme.colors.text, fontSize: 7, fontWeight: '700', marginTop: 1 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 11, height: 11, borderRadius: 4 },
  legendText: { color: theme.colors.textDim, fontSize: 10.5 },
  timerWrap: { gap: 10, marginBottom: 12 },
  timerBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(232,196,104,0.35)',
    backgroundColor: 'rgba(232,196,104,0.08)',
    padding: 14,
  },
  timerLabel: {
    color: '#E8C468',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  timerValue: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  timerHint: { color: theme.colors.textDim, fontSize: 11, marginTop: 8, lineHeight: 15 },
  activityBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.cardHi,
    padding: 12,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  activityDay: { color: theme.colors.text, fontWeight: '600', fontSize: 12 },
  activityTime: { color: theme.colors.textFaint, fontSize: 10 },
  lockedPuzzle: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  lockedIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: theme.colors.cardHi,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptBox: {
    backgroundColor: theme.colors.cardHi,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    padding: 14,
    marginBottom: 12,
  },
  promptTitle: { color: theme.colors.text, fontWeight: '700', fontSize: 13, marginBottom: 6 },
  promptBody: { color: theme.colors.textDim, fontSize: 12.5, lineHeight: 18 },
  input: {
    minHeight: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: theme.colors.bg,
    color: theme.colors.text,
    padding: 12,
    fontSize: 13,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: theme.colors.purple,
    borderRadius: 14,
    minHeight: 52,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    alignSelf: 'stretch',
  },
  btnDisabled: { backgroundColor: theme.colors.cardHi },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
  errorText: {
    color: theme.colors.pink,
    fontSize: 12,
    marginTop: 10,
    lineHeight: 16,
  },
  okBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(29,158,117,0.4)',
    backgroundColor: 'rgba(29,158,117,0.16)',
    padding: 12,
  },
  okText: { color: theme.colors.teal, fontSize: 12, lineHeight: 17, marginTop: 8 },
  winnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  winnerRank: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.cardHi,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winnerRankFilled: {
    backgroundColor: theme.colors.purple,
    borderColor: theme.colors.purple,
  },
  winnerRankText: { color: theme.colors.textFaint, fontSize: 11, fontWeight: '700' },
  winnerRankTextFilled: { color: '#fff' },
  winnerName: { color: theme.colors.text, fontWeight: '700', fontSize: 12.5 },
  winnerTime: { color: theme.colors.textFaint, fontSize: 10.5 },
  winnerEmpty: { color: theme.colors.textFaint, fontSize: 12, fontStyle: 'italic' },
  termsBox: { gap: 8 },
  term: { color: theme.colors.textFaint, fontSize: 11, lineHeight: 16 },
  termBold: { color: theme.colors.textDim, fontWeight: '700' },
  amber: { color: theme.colors.amber, fontWeight: '700' },
  link: { color: '#A5B4FC', fontSize: 13, fontWeight: '600', marginTop: 8 },
  linkDim: { color: theme.colors.textFaint, fontSize: 12, marginTop: 4 },
});
