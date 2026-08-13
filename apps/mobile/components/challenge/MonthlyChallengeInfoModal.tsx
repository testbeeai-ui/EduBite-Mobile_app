import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '@edubite/ui';
import {
  formatRdm,
  getMonthlyChallengeEntryStakeRdm,
  getMonthlyChallengeTargetRdm,
} from '../../lib/challenge/monthly';
import { useGame } from '../../lib/game/GameProvider';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function MonthlyChallengeInfoModal({ open, onClose }: Props) {
  const { rewardMap } = useGame();
  const targetRdm = getMonthlyChallengeTargetRdm(rewardMap);
  const entryStakeRdm = getMonthlyChallengeEntryStakeRdm(rewardMap);

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.head}>
              <View style={styles.headLeft}>
                <View style={styles.iconBox}>
                  <Text style={styles.icon}>🏆</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>Monthly Challenge</Text>
                  <Text style={styles.sub}>
                    How it works, who qualifies, and what you can win.
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={12}>
                <Text style={styles.close}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pills}>
              <Text style={styles.pill}>🔑 Unlock at {formatRdm(targetRdm)} RDM</Text>
              <Text style={[styles.pill, styles.pillAmber]}>⚡ Entry stake in Terms</Text>
            </View>

            <View style={styles.windowBox}>
              <Text style={styles.windowEmoji}>🗓️</Text>
              <View>
                <Text style={styles.windowTitle}>Opens 1st - 5th</Text>
                <Text style={styles.windowSub}>of every month</Text>
              </View>
            </View>

            <Section title="🎁 Prize">
              <Bullet>
                The first 5 entries to submit the correct answer win a gift prize
                worth ₹5,000 each.
              </Bullet>
              <Bullet>Prizes are physically shipped to your registered address.</Bullet>
            </Section>

            <Section title="📩 Notification">
              <Bullet>
                Winners are notified via WhatsApp and email, sent only to your
                registered contact details.
              </Bullet>
            </Section>

            <Section title="🎬 Recognition">
              <Bullet>
                Each winner gets a short reel/podcast feature on our social
                channels — a chance to get famous, along with your school.
              </Bullet>
            </Section>

            <Section title="📜 Terms & Conditions">
              <View style={styles.termsBox}>
                <Text style={styles.term}>
                  <Text style={styles.termBold}>1. </Text>
                  Winner names will be announced on the site along with their date
                  and time of submission, for full transparency.
                </Text>
                <Text style={styles.term}>
                  <Text style={styles.termBold}>2. </Text>
                  The Edubite system record of submission time and correctness is
                  binding on all parties.
                </Text>
                <Text style={styles.term}>
                  <Text style={styles.termBold}>3. </Text>
                  Entry stake — joining claims{' '}
                  <Text style={styles.amber}>{formatRdm(entryStakeRdm)} RDM</Text>{' '}
                  from your balance. The stake is non-refundable once you enroll.
                </Text>
                <Text style={styles.term}>
                  <Text style={styles.termBold}>4. </Text>
                  One month only — next month you must unlock again (reach{' '}
                  {formatRdm(targetRdm)} RDM) and pay a fresh{' '}
                  {formatRdm(entryStakeRdm)} RDM entry stake.
                </Text>
              </View>
            </Section>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <Text style={styles.bullet}>
      <Text style={styles.bulletDot}>• </Text>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    maxHeight: '92%',
    backgroundColor: '#141724',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(127,119,221,0.3)',
    padding: 16,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  headLeft: { flexDirection: 'row', gap: 10, flex: 1 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(127,119,221,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(127,119,221,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 16 },
  title: { color: theme.colors.text, fontWeight: '700', fontSize: 15 },
  sub: { color: theme.colors.textFaint, fontSize: 11, marginTop: 2 },
  close: { color: theme.colors.textDim, fontSize: 22, fontWeight: '700' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  pill: {
    fontSize: 11,
    color: '#A5B4FC',
    backgroundColor: 'rgba(99,102,241,0.12)',
    borderColor: 'rgba(99,102,241,0.25)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  pillAmber: {
    color: '#FCD34D',
    backgroundColor: 'rgba(239,159,39,0.12)',
    borderColor: 'rgba(239,159,39,0.25)',
  },
  windowBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(127,119,221,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(127,119,221,0.25)',
    marginBottom: 12,
  },
  windowEmoji: { fontSize: 20 },
  windowTitle: { color: theme.colors.purple, fontWeight: '700', fontSize: 13 },
  windowSub: { color: theme.colors.textFaint, fontSize: 11 },
  section: { marginBottom: 10 },
  sectionTitle: { color: theme.colors.text, fontWeight: '700', fontSize: 12, marginBottom: 4 },
  bullet: { color: theme.colors.textDim, fontSize: 11, lineHeight: 16, marginBottom: 2 },
  bulletDot: { color: theme.colors.purple },
  termsBox: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(15,23,42,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 6,
  },
  term: { color: theme.colors.textFaint, fontSize: 11, lineHeight: 16 },
  termBold: { color: theme.colors.textDim, fontWeight: '700' },
  amber: { color: theme.colors.amber, fontWeight: '700' },
  closeBtn: {
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeBtnText: { color: theme.colors.text, fontWeight: '600', fontSize: 13 },
});
