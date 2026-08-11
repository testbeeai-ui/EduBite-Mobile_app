import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '@edubite/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../../lib/game/GameProvider';
import { openHttpsUrl } from '../../lib/safe-link';

export default function WASquadScreen() {
  const { state } = useGame();
  const streak = state.streak ?? 0;

  const handleJoinPress = () => {
    void openHttpsUrl('https://chat.whatsapp.com/KRGYkPhUWSRF89Ghp04iCb');
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer} 
      showsVerticalScrollIndicator={false}
    >
      {/* Header section */}
      <View style={styles.eyebrowRow}>
        <View style={styles.dot} />
        <Text style={styles.eyebrowText}>FUNCTION 04</Text>
      </View>
      <Text style={styles.title}>WhatsApp Squad</Text>
      <Text style={styles.subtitle}>
        The habit's home outside the app — tips, free courses, and weekly challenge jackpots.
      </Text>

      {/* Jackpot Card */}
      <View style={styles.jackpotCard}>
        <Text style={styles.jackpotLabel}>THIS WEEK'S CHALLENGE JACKPOT</Text>
        <Text style={styles.jackpotAmount}>₹10,000</Text>
        <Text style={styles.jackpotSubtext}>
          Top streak in the group wins the pot Sunday 9PM · your streak: {streak}
        </Text>
      </View>

      {/* Benefits Card */}
      <View style={styles.benefitsCard}>
        <View style={styles.benefitRow}>
          <Text style={styles.benefitEmoji}>💡</Text>
          <Text style={styles.benefitText}>
            <Text style={styles.benefitLabel}>Daily tips & tricks</Text>
            <Text style={styles.benefitDesc}> — exam shortcuts shared every morning</Text>
          </Text>
        </View>

        <View style={styles.benefitRow}>
          <Text style={styles.benefitEmoji}>🔮</Text>
          <Text style={styles.benefitText}>
            <Text style={styles.benefitLabel}>Free courses & strategies</Text>
            <Text style={styles.benefitDesc}> — drops from top rankers, no cost</Text>
          </Text>
        </View>

        <View style={styles.benefitRow}>
          <Text style={styles.benefitEmoji}>🏆</Text>
          <Text style={styles.benefitText}>
            <Text style={styles.benefitLabel}>Challenge jackpots</Text>
            <Text style={styles.benefitDesc}> — weekly cash & badge prize pools</Text>
          </Text>
        </View>
      </View>

      {/* Call to Action Section */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity 
          onPress={handleJoinPress} 
          style={styles.ctaButton} 
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#10B981', '#059669']} // Stylish green gradient matching WhatsApp premium
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.ctaButtonText}>Join the WhatsApp squad →</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.ctaSubtext}>Opens the official Edubite WhatsApp group invite.</Text>
      </View>

      <View style={{ height: 40 }} />
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
  dot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: theme.colors.amber 
  },
  eyebrowText: { 
    fontSize: 10.5, 
    fontWeight: '800', 
    letterSpacing: 0.6, 
    color: theme.colors.amber, 
    fontFamily: theme.fonts.body 
  },
  title: { 
    fontSize: 23, 
    fontWeight: '800', 
    color: theme.colors.text, 
    fontFamily: theme.fonts.heading, 
    marginBottom: 6 
  },
  subtitle: { 
    fontSize: 12, 
    color: theme.colors.textDim, 
    marginBottom: 20, 
    fontFamily: theme.fonts.body,
    lineHeight: 18,
  },

  // Jackpot Card
  jackpotCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  jackpotLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#10B981', // Clean bright green accent
    fontFamily: theme.fonts.body,
    marginBottom: 8,
  },
  jackpotAmount: {
    fontFamily: theme.fonts.heading,
    fontWeight: '800',
    fontSize: 40,
    color: '#10B981',
    marginBottom: 8,
  },
  jackpotSubtext: {
    fontSize: 11,
    color: theme.colors.textDim,
    fontFamily: theme.fonts.body,
    textAlign: 'center',
  },

  // Benefits Card
  benefitsCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 24,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  benefitEmoji: {
    fontSize: 18,
    marginTop: 1,
  },
  benefitText: {
    flex: 1,
    lineHeight: 18,
  },
  benefitLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },
  benefitDesc: {
    fontSize: 12,
    color: theme.colors.textDim,
    fontFamily: theme.fonts.body,
  },

  // Call to Action
  ctaContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  ctaButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
  },
  gradientButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: theme.fonts.heading,
  },
  ctaSubtext: {
    fontSize: 10.5,
    color: theme.colors.textFaint,
    fontFamily: theme.fonts.body,
    textAlign: 'center',
  },
});
