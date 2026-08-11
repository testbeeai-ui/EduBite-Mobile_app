import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme, BadgeCard } from '@edubite/ui';
import { useGame } from '../../lib/game/GameProvider';

export default function AchievementsScreen() {
  const { state, criteria } = useGame();

  const userRdm = state.rdm ?? 0;
  const currentStreak = state.streak ?? 0;
  const habitsChecked = state.habits.filter((h) => h.done).length;
  const dosePerfect =
    Boolean(state.dose.completed) &&
    state.dose.correct > 0 &&
    Object.values(state.doseDayLog).some(
      (d) => d.completed && d.total > 0 && d.correct >= d.total,
    );
  const funBest = state.funbrain.highScore ?? 0;
  const pledgeBoth = Boolean(criteria.pledgeAM && criteria.pledgePM);
  const brainGymMinutes = Math.floor((state.gyanTimeMs || 0) / 60_000);

  const achievements = useMemo(
    () => [
      {
        id: '1',
        icon: '🔥',
        iconBgColor: theme.colors.amberSoft,
        title: '7-Day Streak',
        desc: 'Complete Daily Dose, Fun Brain, Puzzles, Habits, and Pledge for 7 days straight.',
        current: Math.min(currentStreak, 7),
        max: 7,
        isActive: currentStreak > 0,
      },
      {
        id: '2',
        icon: '🚀',
        iconBgColor: theme.colors.pinkSoft,
        title: '30-Day Streak',
        desc: 'A full month of all five daily activities without missing a beat.',
        current: Math.min(currentStreak, 30),
        max: 30,
        isActive: currentStreak >= 7,
      },
      {
        id: '3',
        icon: '💎',
        iconBgColor: theme.colors.blueSoft,
        title: '1,000 RDM Club',
        desc: 'Cross 1,000 RDM earned in total.',
        current: Math.min(userRdm, 1000),
        max: 1000,
        isActive: userRdm >= 1000,
      },
      {
        id: '4',
        icon: '💎',
        iconBgColor: theme.colors.blueSoft,
        title: '5,000 RDM Club',
        desc: 'Cross 5,000 RDM earned in total.',
        current: Math.min(userRdm, 5000),
        max: 5000,
        isActive: userRdm >= 5000,
      },
      {
        id: '5',
        icon: '🎯',
        iconBgColor: theme.colors.pinkSoft,
        title: 'DailyDose Perfectionist',
        desc: 'Get every question right in a single DailyDose.',
        current: dosePerfect ? 5 : Math.min(state.dose.correct, 5),
        max: 5,
        isActive: dosePerfect,
      },
      {
        id: '6',
        icon: '⚡',
        iconBgColor: theme.colors.amberSoft,
        title: 'FunBrain High Scorer',
        desc: 'Score 100+ points in a single Quick Sprint.',
        current: Math.min(funBest, 100),
        max: 100,
        isActive: funBest >= 100,
      },
      {
        id: '7',
        icon: '🌱',
        iconBgColor: theme.colors.tealSoft,
        title: 'Perfect Habit Day',
        desc: 'Check off all 8 habits in a single day.',
        current: habitsChecked,
        max: 8,
        isActive: habitsChecked === 8,
      },
      {
        id: '8',
        icon: '🤖',
        iconBgColor: theme.colors.pinkSoft,
        title: 'AI-Integrity Streak',
        desc: 'Sign both the 8AM and 10PM pledge on the same day.',
        current: (criteria.pledgeAM ? 1 : 0) + (criteria.pledgePM ? 1 : 0),
        max: 2,
        isActive: pledgeBoth,
      },
      {
        id: '9',
        icon: '✨',
        iconBgColor: theme.colors.amberSoft,
        title: 'Brain Gym Explorer',
        desc: 'Spend 30 minutes inside Brain Gym in a single day.',
        current: Math.min(brainGymMinutes, 30),
        max: 30,
        isActive: brainGymMinutes >= 30,
      },
    ],
    [
      brainGymMinutes,
      criteria.pledgeAM,
      criteria.pledgePM,
      currentStreak,
      dosePerfect,
      funBest,
      habitsChecked,
      pledgeBoth,
      state.dose.correct,
      userRdm,
    ],
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.eyebrowRow}>
        <View style={styles.dot} />
        <Text style={styles.eyebrowText}>MILESTONES</Text>
      </View>
      <Text style={styles.title}>Achievements</Text>
      <Text style={styles.subtitle}>
        Badges unlock automatically as you build the habit — every one below is live, tied to your real progress.
      </Text>

      {achievements.map((ach) => (
        <BadgeCard
          key={ach.id}
          icon={ach.icon}
          iconBgColor={ach.iconBgColor}
          title={ach.title}
          desc={ach.desc}
          current={ach.current}
          max={ach.max}
          isActive={ach.isActive}
        />
      ))}
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.amber },
  eyebrowText: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.6, color: theme.colors.amber, fontFamily: theme.fonts.body },
  title: { fontSize: 23, fontWeight: '800', color: theme.colors.text, fontFamily: theme.fonts.heading, marginBottom: 6 },
  subtitle: { fontSize: 12, color: theme.colors.textDim, lineHeight: 18, marginBottom: 18, fontFamily: theme.fonts.body },
});
