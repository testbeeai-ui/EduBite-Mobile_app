import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { theme } from '@edubite/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../../lib/game/GameProvider';
import type { HabitState } from '../../lib/game/types';

export default function HabitsScreen() {
  const { state, toggleHabit } = useGame();
  const habits = state.habits;

  const [selectedHabit, setSelectedHabit] = useState<HabitState | null>(null);

  const count = habits.filter((h) => h.done).length;
  const progress = habits.length > 0 ? count / habits.length : 0;

  const earnedRDM = habits.reduce((sum, habit) => {
    if (habit.done) return sum + habit.rdm;
    return sum;
  }, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.eyebrowRow}>
        <View style={styles.dot} />
        <Text style={styles.eyebrowText}>WELLBEING LAYER</Text>
      </View>
      <Text style={styles.title}>Habits</Text>
      <Text style={styles.subtitle}>8 habits that protect against burnout.</Text>

      <View style={styles.progressCard}>
        <View style={styles.progTop}>
          <View style={styles.progLblRow}>
            <Text style={styles.progLbl}>TODAY&apos;S PROGRESS</Text>
            <View style={styles.infoc}>
              <Text style={styles.infocText}>i</Text>
            </View>
          </View>
          <View style={styles.sprout}>
            <Text style={styles.sproutText}>🌱</Text>
          </View>
        </View>

        <View style={styles.progMid}>
          <Text style={styles.progNum}>
            {count}
            <Text style={styles.progNumTotal}>/{habits.length}</Text>
          </Text>
          <View style={styles.rdmPill}>
            <Text style={styles.rdmPillText}>⭐ {earnedRDM} RDM earned today</Text>
          </View>
        </View>

        <View style={styles.progTrack}>
          {progress > 0 && (
            <LinearGradient
              colors={[theme.colors.teal, '#57d9a8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progFill, { width: `${progress * 100}%` }]}
            />
          )}
        </View>
        <Text style={styles.progHint}>Tap habits you&apos;ve finished today.</Text>
      </View>

      <View>
        {habits.map((habit) => {
          const isDone = habit.done;
          return (
            <View key={habit.id} style={[styles.habitRow, isDone && styles.habitRowDone]}>
              <View style={[styles.hic, { backgroundColor: habit.bg }]}>
                <Text style={styles.hicText}>{habit.icon}</Text>
              </View>
              <View style={styles.hbody}>
                <Text style={[styles.htitle, isDone && styles.htitleDone]}>{habit.name}</Text>
                <Text style={styles.hsub}>{habit.sub}</Text>
              </View>
              <View style={styles.hright}>
                <TouchableOpacity
                  onPress={() => setSelectedHabit(habit)}
                  style={styles.infoBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.infoBtnText}>i</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => void toggleHabit(habit.id)}
                  style={[styles.checkBtn, isDone && styles.checkBtnDone]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.checkBtnText, isDone && styles.checkBtnTextDone]}>✓</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ height: 30 }} />

      <Modal
        transparent
        visible={!!selectedHabit}
        animationType="fade"
        onRequestClose={() => setSelectedHabit(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedHabit(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View
                    style={[styles.modalIconBg, { backgroundColor: selectedHabit?.bg }]}
                  >
                    <Text style={styles.modalIconText}>{selectedHabit?.icon}</Text>
                  </View>
                  <Text style={styles.modalTitle}>{selectedHabit?.name}</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedHabit(null)}
                    style={styles.modalCloseBtn}
                  >
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalDesc}>{selectedHabit?.desc}</Text>

                <View style={styles.modalBenefitsList}>
                  {selectedHabit?.benefits.map((benefit, i) => (
                    <View key={i} style={styles.modalBenefitRow}>
                      <Text style={styles.modalBenefitCheck}>✓</Text>
                      <Text style={styles.modalBenefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.modalFooter}>
                  <Text style={styles.modalFooterLabel}>Complete today to earn</Text>
                  <Text style={styles.modalFooterValue}>+{selectedHabit?.rdm} RDM</Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  eyebrowText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: theme.colors.amber,
    fontFamily: theme.fonts.body,
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textDim,
    marginBottom: 16,
    fontFamily: theme.fonts.body,
  },

  progressCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 14,
    marginBottom: 16,
  },
  progTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progLblRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progLbl: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: theme.colors.teal,
    fontFamily: theme.fonts.body,
  },
  infoc: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infocText: {
    fontSize: 9,
    color: theme.colors.textFaint,
    fontFamily: theme.fonts.body,
  },
  sprout: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.tealSoft,
    borderWidth: 1,
    borderColor: 'rgba(29,158,117,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sproutText: { fontSize: 17 },

  progMid: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  progNum: {
    fontFamily: theme.fonts.heading,
    fontWeight: '800',
    fontSize: 32,
    color: theme.colors.text,
  },
  progNumTotal: { fontSize: 18, color: theme.colors.textFaint, fontWeight: '700' },
  rdmPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.tealSoft,
    borderWidth: 1,
    borderColor: 'rgba(29,158,117,0.3)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  rdmPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.teal,
    fontFamily: theme.fonts.body,
  },

  progTrack: {
    height: 6,
    borderRadius: 99,
    backgroundColor: theme.colors.cardHi,
    overflow: 'hidden',
    marginBottom: 9,
    flexDirection: 'row',
  },
  progFill: { height: '100%', borderRadius: 99 },
  progHint: { fontSize: 10.5, color: theme.colors.textFaint, fontFamily: theme.fonts.body },

  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 13,
    marginBottom: 9,
  },
  habitRowDone: {
    borderColor: 'rgba(29,158,117,0.4)',
    backgroundColor: theme.colors.tealSoft,
  },
  hic: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  hicText: { fontSize: 16 },
  hbody: { flex: 1 },
  htitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },
  htitleDone: { color: theme.colors.teal },
  hsub: {
    fontSize: 10,
    color: theme.colors.textFaint,
    marginTop: 2,
    fontFamily: theme.fonts.body,
  },

  hright: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  infoBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(29,158,117,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBtnText: { color: theme.colors.teal, fontSize: 10, fontFamily: theme.fonts.body },
  checkBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.cardHi,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnDone: { backgroundColor: theme.colors.teal, borderColor: theme.colors.teal },
  checkBtnText: { color: 'transparent', fontSize: 11, fontFamily: theme.fonts.body },
  checkBtnTextDone: { color: '#08130F' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 17, 23, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  modalIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIconText: {
    fontSize: 15,
  },
  modalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
  },
  modalCloseBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.cardHi,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalCloseText: {
    fontSize: 10,
    color: theme.colors.textDim,
    fontWeight: '800',
  },
  modalDesc: {
    fontSize: 13,
    color: theme.colors.textDim,
    fontFamily: theme.fonts.body,
    lineHeight: 19,
    marginBottom: 20,
  },
  modalBenefitsList: {
    marginBottom: 24,
    gap: 12,
  },
  modalBenefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  modalBenefitCheck: {
    fontSize: 13,
    color: theme.colors.teal,
    fontWeight: 'bold',
    marginTop: 1,
  },
  modalBenefitText: {
    flex: 1,
    fontSize: 12.5,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.tealSoft,
    borderWidth: 1,
    borderColor: 'rgba(29,158,117,0.25)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  modalFooterLabel: {
    fontSize: 12,
    color: theme.colors.teal,
    fontWeight: '600',
    fontFamily: theme.fonts.body,
  },
  modalFooterValue: {
    fontSize: 13,
    color: theme.colors.teal,
    fontWeight: '800',
    fontFamily: theme.fonts.heading,
  },
});
