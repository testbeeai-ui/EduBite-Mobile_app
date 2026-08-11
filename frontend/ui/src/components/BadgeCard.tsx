import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

interface BadgeCardProps {
  icon: string;
  iconBgColor: string;
  title: string;
  desc: string;
  current: number;
  max: number;
  isActive?: boolean; // if true, uses gradient for fill, else faint text color
}

export const BadgeCard = ({ icon, iconBgColor, title, desc, current, max, isActive }: BadgeCardProps) => {
  const progress = max > 0 ? Math.min(Math.max(current / max, 0), 1) : 0;
  
  return (
    <View style={styles.badgeCard}>
      <View style={[styles.badgeIc, { backgroundColor: iconBgColor }]}>
        <Text style={styles.badgeIcText}>{icon}</Text>
      </View>
      <Text style={styles.badgeTitle}>{title}</Text>
      <Text style={styles.badgeDesc}>{desc}</Text>
      <Text style={styles.badgeFrac}>{current} / {max}</Text>
      
      <View style={styles.badgeTrack}>
        {isActive ? (
          <LinearGradient
            colors={[theme.colors.teal, theme.colors.blue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.badgeFill, { width: `${progress * 100}%` }]}
          />
        ) : (
          <View style={[styles.badgeFill, { width: `${progress * 100}%`, backgroundColor: theme.colors.textFaint }]} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  badgeIc: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  badgeIcText: {
    fontSize: 17,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },
  badgeDesc: {
    fontSize: 11.5,
    color: theme.colors.textDim,
    lineHeight: 17.25,
    marginBottom: 14,
    fontFamily: theme.fonts.body,
  },
  badgeFrac: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textDim,
    marginBottom: 7,
    fontFamily: theme.fonts.body,
  },
  badgeTrack: {
    height: 6,
    borderRadius: 99,
    backgroundColor: theme.colors.cardHi,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  badgeFill: {
    height: '100%',
    borderRadius: 99,
  }
});
