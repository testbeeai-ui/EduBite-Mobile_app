import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface Pill {
  key: string;
  label: string;
}

const pills: Pill[] = [
  { key: 'index', label: '🏠 Home' },
  { key: 'dailydose', label: '🍬 DailyDose' },
  { key: 'funbrain', label: '⚡ FunBrain' },
  { key: 'braingym', label: '🧠 Brain Gym' },
  { key: 'puzzles', label: '🧩 Puzzles' },
  { key: 'wasquad', label: '💬 WA Squad' },
  { key: 'habits', label: '🌱 Habits' },
  { key: 'achievements', label: '🏆 Achievements' },
  { key: 'ai_integrity', label: '🤖 AI' },
  { key: 'profile', label: '👤 Profile' },
];

export const PillNav = ({ 
  activeRoute, 
  onPillPress 
}: { 
  activeRoute: string; 
  onPillPress: (key: string) => void 
}) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {pills.map((pill) => {
        const isActive = activeRoute === pill.key;
        return (
          <TouchableOpacity
            key={pill.key}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onPillPress(pill.key)}
          >
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {pill.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    flexShrink: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSoft,
    backgroundColor: theme.colors.bg,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 7,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  pillActive: {
    backgroundColor: theme.colors.tealSoft,
    borderColor: 'rgba(29,158,117,0.4)',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textDim,
    fontFamily: theme.fonts.body,
  },
  pillTextActive: {
    color: theme.colors.teal,
  },
});
