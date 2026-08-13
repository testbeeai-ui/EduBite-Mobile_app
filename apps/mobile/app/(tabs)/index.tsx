import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { theme } from '@edubite/ui';
import { MonthlyChallengeInfoModal } from '../../components/challenge/MonthlyChallengeInfoModal';
import {
  buildChallengeProgress,
  formatRdm,
  getChallengeMonthMeta,
  getEntryState,
  getMonthlyChallengeTargetRdm,
  isEnrolledForChallengeMonth,
  MONTHLY_CHALLENGE_STREAK_REQUIRED,
} from '../../lib/challenge/monthly';
import { useAuth } from '../../lib/auth/AuthProvider';
import { useGame } from '../../lib/game/GameProvider';
import { addDaysToKey, daysBetween, parseDateKey, todayKey } from '../../lib/game/date';
import { isFullDay } from '../../lib/game/state';
import type { DayCriteria } from '../../lib/game/types';

function criteriaDots(log?: DayCriteria | null) {
  return [
    { on: Boolean(log?.dose), color: theme.colors.teal },
    { on: Boolean(log?.funbrain), color: theme.colors.amber },
    { on: Boolean(log?.puzzles), color: theme.colors.pink },
    { on: Boolean(log?.habits), color: theme.colors.blue },
    { on: Boolean(log?.pledges), color: theme.colors.purple },
  ];
}

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

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { state, rewardMap, level, criteria, enrollMonthlyChallenge, saving } = useGame();
  const [enrolling, setEnrolling] = useState(false);
  const [showChallengeInfo, setShowChallengeInfo] = useState(false);

  const today = todayKey();
  const userRdm = state.rdm ?? 0;
  const targetRdm = getMonthlyChallengeTargetRdm(rewardMap);
  const meta = useMemo(() => getChallengeMonthMeta(today), [today]);
  const entryState = getEntryState({
    rdm: userRdm,
    dateKey: today,
    enrolledMonthKey: state.challengeEnrolledMonthKey,
    enrolledMonths: state.challengeEnrolledMonths,
    rewardMap,
  });
  const enrolled = isEnrolledForChallengeMonth(
    meta.monthKey,
    state.challengeEnrolledMonthKey,
    state.challengeEnrolledMonths,
  );
  const challengeProgress = useMemo(
    () => buildChallengeProgress(state, today),
    [state, today],
  );
  const currentStreak = state.streak ?? 0;
  const habitsChecked = state.habits.filter((h) => h.done).length;
  const habitsTotal = state.habits.length || 8;
  const challengeProgressPct = Math.min(100, Math.floor((userRdm / Math.max(1, targetRdm)) * 100));
  const ringProgress = Math.min(1, level.progress / 100);
  const monthTitle = `${meta.monthLabel} ${meta.year}`;

  const weekDays = useMemo(() => {
    const start = state.joinedDate || today;
    return Array.from({ length: 7 }, (_, i) => {
      const key = addDaysToKey(start, i);
      const log = state.dayCriteriaLog[key];
      const isPastOrToday = daysBetween(key, today) >= 0;
      return {
        key,
        dayNum: i + 1,
        log,
        isToday: key === today,
        isJoined: i === 0,
        full: Boolean(log && isFullDay(log)),
        upcoming: !isPastOrToday && key !== today,
      };
    });
  }, [state.joinedDate, state.dayCriteriaLog, today]);

  const weekFull = weekDays.filter((d) => d.full).length;
  const journeyDays = useMemo(() => {
    const start = state.joinedDate || today;
    return Array.from({ length: 28 }, (_, i) => {
      const key = addDaysToKey(start, i);
      const log = state.dayCriteriaLog[key];
      const pillarCount = log
        ? [log.dose, log.funbrain, log.puzzles, log.habits, log.pledges].filter(Boolean).length
        : 0;
      return {
        key,
        dayNum: i + 1,
        isToday: key === today,
        pillarCount,
        full: Boolean(log && isFullDay(log)),
      };
    });
  }, [state.joinedDate, state.dayCriteriaLog, today]);
  const journeyFull = journeyDays.filter((d) => d.full).length;

  const todayDots = criteriaDots(criteria);
  const criteriaDoneCount = todayDots.filter((d) => d.on).length;

  const openChallenge = async () => {
    if (entryState === 'open' && !enrolled) {
      setEnrolling(true);
      try {
        const result = await enrollMonthlyChallenge(displayNameFromUser(user));
        if (!result.ok) {
          Alert.alert(
            'Could not enter',
            result.error ?? 'Could not enter Monthly Challenge. Please try again.',
          );
          return;
        }
      } finally {
        setEnrolling(false);
      }
    }
    router.navigate('/challenge');
  };

  const heatColor = (pillarCount: number, full: boolean) => {
    if (full) return theme.colors.teal;
    if (pillarCount >= 3) return 'rgba(29,158,117,0.7)';
    if (pillarCount >= 1) return 'rgba(29,158,117,0.35)';
    return '#1B2330';
  };

  const challengeSubtitle = (() => {
    switch (entryState) {
      case 'open':
        return enrolled
          ? `You're in for ${monthTitle} — stake already paid.`
          : `${monthTitle} unlocked — enter once to join (entry stake applies).`;
      case 'locked_window':
        return `Opens ${meta.nextEntryOpensLabel} — each month is a fresh entry + stake`;
      case 'locked_rdm':
        return `Reach ${formatRdm(targetRdm)} RDM to unlock ${meta.monthLabel}`;
      default: {
        const _exhaustive: never = entryState;
        return _exhaustive;
      }
    }
  })();

  const challengeBadge = (() => {
    switch (entryState) {
      case 'open':
        return enrolled ? '✓ Joined' : 'Open';
      case 'locked_window':
        return 'Closed';
      case 'locked_rdm':
        return '🔒 Locked';
      default: {
        const _exhaustive: never = entryState;
        return _exhaustive;
      }
    }
  })();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <View style={styles.lvlTop}>
          <View style={styles.lvlRing}>
            <Svg width="56" height="56" viewBox="0 0 56 56" style={styles.svgRotated}>
              <Circle cx="28" cy="28" r="23" fill="none" stroke={theme.colors.cardHi} strokeWidth="6" />
              <Circle
                cx="28"
                cy="28"
                r="23"
                fill="none"
                stroke={theme.colors.teal}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="144.5"
                strokeDashoffset={144.5 - 144.5 * ringProgress}
              />
            </Svg>
            <View style={styles.lvlCenter}>
              <Text style={styles.lvlCenterText}>Lv{level.current.level}</Text>
            </View>
          </View>

          <View style={styles.lvlInfo}>
            <View style={styles.lvlNameRow}>
              <Text style={styles.lvlTitle}>{level.current.name}</Text>
              <View style={styles.lvlBadge}>
                <Text style={styles.lvlBadgeText}>Lv.{level.current.level}</Text>
              </View>
            </View>
            <Text style={styles.lvlSub}>
              {level.rdmToNext} RDM to Level {level.next.level}
            </Text>
          </View>

          <Text style={styles.lvlPct}>{level.progress}% to Lv{level.next.level}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.chalTop}>
          <View style={styles.chalIcon}>
            <Text style={styles.chalIconText}>🏆</Text>
          </View>
          <View style={styles.chalInfo}>
            <Text style={styles.chalTitle}>{monthTitle} Challenge</Text>
            <Text style={styles.chalSub}>{challengeSubtitle}</Text>
          </View>
          <View style={styles.lockPill}>
            <Text style={styles.lockPillText}>{challengeBadge}</Text>
          </View>
        </View>

        {entryState === 'locked_rdm' ? (
          <>
            <View style={styles.chalProgRow}>
              <Text style={styles.chalProgText}>Progress to unlock</Text>
              <Text style={styles.chalProgValue}>
                {formatRdm(userRdm)} / {formatRdm(targetRdm)} RDM
              </Text>
            </View>
            <View style={styles.chalTrack}>
              <View style={[styles.chalFill, { width: `${challengeProgressPct}%` }]} />
            </View>
          </>
        ) : enrolled ? (
          <View style={styles.chalProgRow}>
            <Text style={styles.chalProgText}>Challenge streak</Text>
            <Text style={styles.chalProgValue}>
              {challengeProgress.currentStretch}/{MONTHLY_CHALLENGE_STREAK_REQUIRED} · best{' '}
              {challengeProgress.bestStretch}
            </Text>
          </View>
        ) : null}

        {entryState === 'open' ? (
          <TouchableOpacity
            style={styles.learnBtn}
            disabled={enrolling || saving}
            onPress={() => void openChallenge()}
          >
            <Text style={styles.learnBtnText}>
              {enrolling
                ? 'Enrolling…'
                : enrolled
                  ? '🏆 Continue Challenge'
                  : '🏆 Enter Challenge'}
            </Text>
          </TouchableOpacity>
        ) : entryState === 'locked_window' ? (
          <TouchableOpacity style={styles.lockedBtn} onPress={() => router.navigate('/challenge')}>
            <Text style={styles.lockedBtnText}>
              {monthTitle} opens {meta.nextEntryOpensLabel}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.lockedBtn} onPress={() => router.navigate('/challenge')}>
            <Text style={styles.lockedBtnText}>
              Reach {formatRdm(targetRdm)} RDM to unlock {meta.monthLabel}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.infoBtn}
          onPress={() => setShowChallengeInfo(true)}
        >
          <Text style={styles.infoBtnText}>ⓘ Learn How? — Conditions & Benefits</Text>
        </TouchableOpacity>
      </View>

      <MonthlyChallengeInfoModal
        open={showChallengeInfo}
        onClose={() => setShowChallengeInfo(false)}
      />

      <View style={styles.card}>
        <View style={styles.ccHead}>
          <View style={styles.ccHeadLeft}>
            <View style={styles.ccIcon}><Text style={styles.ccIconText}>🔥</Text></View>
            <View>
              <Text style={styles.ccTitle}>Consistency Corner</Text>
              <Text style={styles.ccSub}>Daily Check-in & Streak Meter</Text>
            </View>
          </View>
          <View style={styles.ccBadge}>
            <Text style={styles.ccBadgeText}>🔥 {currentStreak} Day Streak</Text>
          </View>
        </View>

        <View style={[styles.card, styles.cardAlt, { marginBottom: 10 }]}>
          <View style={styles.checkinTop}>
            <View style={styles.checkinTopLeft}>
              <View style={styles.leafIcon}><Text style={styles.leafIconText}>🌱</Text></View>
              <View>
                <Text style={styles.ctTitle}>Daily check-in</Text>
                <Text style={styles.ctSub}>Habits tracker progress</Text>
              </View>
            </View>
            <View style={styles.checkinCountBadge}>
              <Text style={styles.checkinCountText}>{habitsChecked}/{habitsTotal}</Text>
            </View>
          </View>

          <View style={styles.habitDots}>
            {state.habits.map((h) => (
              <View
                key={h.id}
                style={[styles.hdot, h.done && { backgroundColor: theme.colors.teal }]}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.checkinBtn} onPress={() => router.navigate('/habits')}>
            <Text style={styles.checkinBtnText}>
              {habitsChecked === habitsTotal ? 'All habits done ✓' : 'Tap to check habits →'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, styles.cardAlt, { marginBottom: 0 }]}>
          <View style={styles.smTop}>
            <View style={styles.flmIcon}><Text style={styles.flmIconText}>🔥</Text></View>
            <View>
              <Text style={styles.smTitle}>Streak Meter</Text>
              <Text style={styles.smSub}>5 daily streak criteria · {criteriaDoneCount}/5 today</Text>
            </View>
          </View>

          <View style={styles.smStats}>
            <View style={styles.smStat}>
              <Text style={[styles.smStatV, { color: theme.colors.teal }]}>{currentStreak}</Text>
              <Text style={styles.smStatK}>DAYS</Text>
            </View>
            <View style={styles.smStat}>
              <Text style={[styles.smStatV, { color: theme.colors.blue }]}>{userRdm}</Text>
              <Text style={styles.smStatK}>TOTAL RDM</Text>
            </View>
            <View style={styles.smStat}>
              <Text style={[styles.smStatV, { color: theme.colors.blue }]}>
                {habitsChecked}/{habitsTotal}
              </Text>
              <Text style={styles.smStatK}>HABITS</Text>
            </View>
          </View>

          <View style={styles.dayDotsRow}>
            {todayDots.map((d, i) => (
              <View
                key={i}
                style={[
                  styles.critDot,
                  { backgroundColor: d.on ? d.color : theme.colors.border },
                ]}
              />
            ))}
          </View>

          <View style={styles.smFoot}>
            <Text style={styles.smFootText}>Complete all five pillars for a full day</Text>
            <TouchableOpacity onPress={() => router.navigate('/dailydose')}>
              <Text style={styles.smFootDet}>Details →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.statTrio}>
        <View style={[styles.statMini, styles.smAmber]}>
          <Text style={styles.si}>🔥</Text>
          <Text style={styles.sv}>{currentStreak} Days</Text>
          <Text style={styles.sk}>CURRENT STREAK</Text>
        </View>
        <View style={[styles.statMini, styles.smTeal]}>
          <Text style={styles.si}>⚡</Text>
          <Text style={styles.sv}>{weekFull}/7 Full</Text>
          <Text style={styles.sk}>WEEK PROGRESS</Text>
        </View>
        <View style={[styles.statMini, styles.smPink]}>
          <Text style={styles.si}>🎯</Text>
          <Text style={styles.sv}>{journeyFull}/28 Full</Text>
          <Text style={styles.sk}>28-DAY JOURNEY</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.legendTitle}>CRITERIA LEGEND</Text>
        <View style={styles.legendWrap}>
          {[
            { label: 'Daily Dose', color: theme.colors.teal },
            { label: 'Fun Brain', color: theme.colors.amber },
            { label: 'Puzzles', color: theme.colors.pink },
            { label: 'Habits', color: theme.colors.blue },
            { label: 'Pledge', color: theme.colors.purple },
          ].map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.ldot, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.secTitleRow}>
        <Text style={styles.secTitleSpark}>✦</Text>
        <Text style={styles.secTitleText}>Your first week</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekScroll} contentContainerStyle={styles.weekScrollContent}>
        {weekDays.map((day) => {
          const dots = criteriaDots(day.log);
          return (
            <View
              key={day.key}
              style={[
                styles.dayChip,
                day.isJoined && styles.dayChipJoined,
                day.isToday && !day.isJoined && { borderColor: theme.colors.teal },
              ]}
            >
              <Text style={styles.dtag}>
                {day.isJoined ? 'DAY 1' : day.isToday ? 'TODAY' : day.upcoming ? 'SOON' : `DAY ${day.dayNum}`}
              </Text>
              <Text style={[styles.dname, day.isJoined && styles.dnameJoined]}>
                {day.isJoined ? 'Joined' : `Day ${day.dayNum}`}
              </Text>
              <View style={styles.dayDots}>
                {dots.map((d, i) => (
                  <View
                    key={i}
                    style={[styles.ddot, d.on && { backgroundColor: d.color }]}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.secTitleRow}>
        <Text style={styles.secTitleSpark}>✦</Text>
        <Text style={styles.secTitleText}>Your first 4 weeks</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.calHead}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <Text key={i} style={styles.calHeadText}>{d}</Text>
          ))}
        </View>
        <View style={styles.calGrid}>
          {journeyDays.map((day) => (
            <View
              key={day.key}
              style={[
                styles.calCell,
                day.isToday && styles.calCellToday,
                { backgroundColor: heatColor(day.pillarCount, day.full) },
                day.isToday && { borderColor: theme.colors.amber },
              ]}
            >
              <Text style={[styles.calCellText, day.isToday && styles.calCellTextToday]}>
                {day.dayNum}
              </Text>
            </View>
          ))}
        </View>
        <Text style={styles.calFoot}>
          Day 1 · Joined {parseDateKey(state.joinedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · Heat = pillars completed
        </Text>

        <View style={styles.heatLegend}>
          <Text style={styles.heatLegendText}>Less</Text>
          <View style={[styles.sq, { backgroundColor: '#1B2330' }]} />
          <View style={[styles.sq, { backgroundColor: 'rgba(29,158,117,0.35)' }]} />
          <View style={[styles.sq, { backgroundColor: 'rgba(29,158,117,0.7)' }]} />
          <View style={[styles.sq, { backgroundColor: theme.colors.teal }]} />
          <Text style={styles.heatLegendText}>More</Text>
        </View>
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
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  cardAlt: {
    backgroundColor: theme.colors.cardAlt,
  },
  lvlTop: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  lvlRing: { width: 56, height: 56, position: 'relative' },
  svgRotated: { transform: [{ rotate: '-90deg' }] },
  lvlCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  lvlCenterText: { fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 13, color: theme.colors.teal },
  lvlInfo: { flex: 1 },
  lvlNameRow: { flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  lvlTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text, fontFamily: theme.fonts.heading },
  lvlBadge: { backgroundColor: theme.colors.tealSoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  lvlBadgeText: { fontSize: 10, fontWeight: '800', color: theme.colors.teal, fontFamily: theme.fonts.body },
  lvlSub: { fontSize: 11, color: theme.colors.textFaint, marginTop: 3, fontFamily: theme.fonts.body },
  lvlPct: { fontSize: 10.5, color: theme.colors.textDim, alignSelf: 'flex-start', fontFamily: theme.fonts.body },

  chalTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  chalIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#574fc9', alignItems: 'center', justifyContent: 'center' },
  chalIconText: { fontSize: 17 },
  chalInfo: { flex: 1 },
  chalTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.text, fontFamily: theme.fonts.heading },
  chalSub: { fontSize: 10.5, color: theme.colors.textFaint, marginTop: 2, fontFamily: theme.fonts.body },
  lockPill: { backgroundColor: theme.colors.amberSoft, borderColor: 'rgba(239,159,39,0.3)', borderWidth: 1, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 3 },
  lockPillText: { fontSize: 9.5, fontWeight: '700', color: theme.colors.amber, fontFamily: theme.fonts.body },
  chalProgRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  chalProgText: { fontSize: 11, color: theme.colors.textFaint, fontFamily: theme.fonts.body },
  chalProgValue: { fontSize: 11, fontWeight: '700', color: theme.colors.textDim, fontFamily: theme.fonts.body },
  chalTrack: { height: 6, borderRadius: 99, backgroundColor: theme.colors.cardHi, marginTop: 6, overflow: 'hidden' },
  chalFill: { width: '0%', height: '100%', borderRadius: 99, backgroundColor: theme.colors.purple },
  learnBtn: { marginTop: 12, padding: 11, borderRadius: 12, backgroundColor: 'rgba(127,119,221,0.18)', borderColor: 'rgba(127,119,221,0.35)', borderWidth: 1, alignItems: 'center' },
  learnBtnText: { color: '#AFA9EC', fontSize: 12, fontWeight: '700' },
  lockedBtn: {
    marginTop: 12,
    padding: 11,
    borderRadius: 12,
    backgroundColor: 'rgba(239,159,39,0.08)',
    borderColor: 'rgba(239,159,39,0.3)',
    borderWidth: 1,
    alignItems: 'center',
  },
  lockedBtnText: { color: theme.colors.amber, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  infoBtn: {
    marginTop: 8,
    padding: 11,
    borderRadius: 12,
    backgroundColor: 'rgba(127,119,221,0.06)',
    borderColor: 'rgba(127,119,221,0.28)',
    borderWidth: 1,
    alignItems: 'center',
  },
  infoBtnText: { color: theme.colors.purple, fontSize: 11.5, fontWeight: '600' },

  ccHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  ccHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  ccIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: theme.colors.amberSoft, alignItems: 'center', justifyContent: 'center' },
  ccIconText: { fontSize: 14 },
  ccTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text, fontFamily: theme.fonts.heading },
  ccSub: { fontSize: 10.5, color: theme.colors.textFaint, fontFamily: theme.fonts.body },
  ccBadge: { backgroundColor: theme.colors.amberSoft, borderColor: 'rgba(239,159,39,0.3)', borderWidth: 1, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
  ccBadgeText: { fontSize: 10, fontWeight: '700', color: theme.colors.amber, fontFamily: theme.fonts.body },

  checkinTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  checkinTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  leafIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: theme.colors.tealSoft, alignItems: 'center', justifyContent: 'center' },
  leafIconText: { fontSize: 13 },
  ctTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.text, fontFamily: theme.fonts.body },
  ctSub: { fontSize: 10, color: theme.colors.textFaint, fontFamily: theme.fonts.body },
  checkinCountBadge: { backgroundColor: theme.colors.tealSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  checkinCountText: { fontSize: 10.5, fontWeight: '800', color: theme.colors.teal, fontFamily: theme.fonts.body },
  habitDots: { flexDirection: 'row', gap: 5, marginBottom: 12 },
  hdot: { flex: 1, height: 7, borderRadius: 99, backgroundColor: theme.colors.cardHi, borderColor: theme.colors.borderSoft, borderWidth: 1 },
  checkinBtn: { width: '100%', padding: 11, borderRadius: 12, backgroundColor: theme.colors.tealSoft, borderColor: 'rgba(29,158,117,0.35)', borderWidth: 1, alignItems: 'center' },
  checkinBtnText: { color: theme.colors.teal, fontSize: 12, fontWeight: '700', fontFamily: theme.fonts.body },

  smTop: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12 },
  flmIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: theme.colors.amberSoft, alignItems: 'center', justifyContent: 'center' },
  flmIconText: { fontSize: 13 },
  smTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.text, fontFamily: theme.fonts.body },
  smSub: { fontSize: 10, color: theme.colors.textFaint, fontFamily: theme.fonts.body },
  smStats: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  smStat: { flex: 1, backgroundColor: theme.colors.cardHi, borderColor: theme.colors.borderSoft, borderWidth: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center' },
  smStatV: { fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 15 },
  smStatK: { fontSize: 8, color: theme.colors.textFaint, letterSpacing: 0.3, marginTop: 2, fontFamily: theme.fonts.body },
  dayDotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 },
  critDot: { width: 10, height: 10, borderRadius: 5 },
  smFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  smFootText: { fontSize: 10, color: theme.colors.textFaint, fontFamily: theme.fonts.body },
  smFootDet: { fontSize: 10, color: theme.colors.blue, fontWeight: '700', fontFamily: theme.fonts.body },

  statTrio: { flexDirection: 'row', gap: 9, marginBottom: 12 },
  statMini: { flex: 1, borderRadius: 14, paddingVertical: 11, paddingHorizontal: 8, alignItems: 'center', borderWidth: 1 },
  smAmber: { backgroundColor: theme.colors.amberSoft, borderColor: 'rgba(239,159,39,0.25)' },
  smTeal: { backgroundColor: theme.colors.tealSoft, borderColor: 'rgba(29,158,117,0.25)' },
  smPink: { backgroundColor: theme.colors.pinkSoft, borderColor: 'rgba(212,83,126,0.25)' },
  si: { fontSize: 15, marginBottom: 4 },
  sv: { fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 13.5, color: theme.colors.text },
  sk: { fontSize: 8, color: theme.colors.textFaint, letterSpacing: 0.3, marginTop: 2, fontFamily: theme.fonts.body },

  legendTitle: { fontSize: 10.5, color: theme.colors.textFaint, letterSpacing: 0.3, fontWeight: '700', marginBottom: 10, fontFamily: theme.fonts.body },
  legendWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, rowGap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 6 },
  ldot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11.5, color: theme.colors.textDim, fontFamily: theme.fonts.body },

  secTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginHorizontal: 2, marginTop: 16, marginBottom: 10 },
  secTitleSpark: { color: theme.colors.teal, fontSize: 13.5, fontWeight: '700' },
  secTitleText: { fontSize: 13.5, fontWeight: '700', color: theme.colors.text, fontFamily: theme.fonts.body },

  weekScroll: { paddingBottom: 4 },
  weekScrollContent: { gap: 9 },
  dayChip: { width: 70, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center', backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, marginRight: 9 },
  dayChipJoined: { backgroundColor: theme.colors.amberSoft, borderColor: theme.colors.amber },
  dtag: { fontSize: 8.5, color: theme.colors.textFaint, fontWeight: '700', letterSpacing: 0.3, fontFamily: theme.fonts.body },
  dname: { fontSize: 11.5, fontWeight: '700', marginVertical: 7, color: theme.colors.text, fontFamily: theme.fonts.body },
  dnameJoined: { color: theme.colors.amber },
  dayDots: { flexDirection: 'row', justifyContent: 'center', gap: 3 },
  ddot: { width: 4.5, height: 4.5, borderRadius: 2.25, backgroundColor: theme.colors.border },

  calHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  calHeadText: { flex: 1, textAlign: 'center', fontSize: 9.5, color: theme.colors.textFaint, fontWeight: '700', fontFamily: theme.fonts.body },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  calCell: { width: '13%', aspectRatio: 1 / 0.85, borderRadius: 8, backgroundColor: theme.colors.cardHi, borderColor: theme.colors.borderSoft, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  calCellToday: { borderColor: theme.colors.amber },
  calCellText: { fontSize: 10.5, color: theme.colors.textDim, fontWeight: '600', fontFamily: theme.fonts.body },
  calCellTextToday: { color: theme.colors.amber, fontWeight: '800' },
  calFoot: { fontSize: 10, color: theme.colors.textFaint, marginTop: 10, lineHeight: 15, fontFamily: theme.fonts.body },
  heatLegend: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  heatLegendText: { fontSize: 10, color: theme.colors.textFaint, fontFamily: theme.fonts.body },
  sq: { width: 8, height: 8, borderRadius: 2 },
});
