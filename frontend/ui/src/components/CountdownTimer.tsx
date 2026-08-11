import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

export const CountdownTimer = ({ totalSeconds }: { totalSeconds: number }) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const label = `${m}:${s < 10 ? '0' : ''}${s}`;
  const isLow = totalSeconds <= 30;

  return (
    <Text style={[styles.qtimer, isLow && styles.low]}>
      {label}
    </Text>
  );
};

const styles = StyleSheet.create({
  qtimer: {
    fontFamily: theme.fonts.heading,
    fontWeight: '800',
    fontSize: 16,
    color: theme.colors.teal,
  },
  low: {
    color: theme.colors.pink,
  }
});
