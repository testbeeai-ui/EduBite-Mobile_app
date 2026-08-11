import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface SubjectPillsProps {
  subjects: string[];
  activeSubject: string;
}

export const SubjectPills = ({ subjects, activeSubject }: SubjectPillsProps) => {
  return (
    <View style={styles.subjStrip}>
      {subjects.map(s => {
        const isActive = s.toLowerCase() === activeSubject.toLowerCase();
        return (
          <View key={s} style={[styles.subjPip, isActive && styles.subjPipActive]}>
            <Text style={[styles.subjPipText, isActive && styles.subjPipTextActive]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  subjStrip: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  subjPip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.cardAlt,
  },
  subjPipActive: {
    borderColor: theme.colors.teal,
    backgroundColor: theme.colors.tealSoft,
  },
  subjPipText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textFaint,
    fontFamily: theme.fonts.body,
  },
  subjPipTextActive: {
    color: theme.colors.teal,
  },
});
