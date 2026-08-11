import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme';

export const ProgressTrack = ({ progress, color }: { progress: number, color?: string }) => {
  // progress is a value from 0 to 1
  return (
    <View style={styles.qtrack}>
      <View style={[styles.qfill, { width: `${progress * 100}%`, backgroundColor: color || theme.colors.teal }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  qtrack: {
    flex: 1,
    height: 6,
    borderRadius: 99,
    backgroundColor: theme.colors.cardHi,
    overflow: 'hidden',
  },
  qfill: {
    height: '100%',
    borderRadius: 99,
  }
});
