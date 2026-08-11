import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@edubite/ui';
import { PLEDGE_AM, PLEDGE_PM, type PledgeType } from '../../lib/pledge/constants';

type Props = {
  type: PledgeType;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function PledgeSignModal({ type, open, onClose, onConfirm }: Props) {
  const [checked, setChecked] = useState(true);
  const config = type === 'am' ? PLEDGE_AM : PLEDGE_PM;
  const isAm = type === 'am';

  useEffect(() => {
    if (open) setChecked(true);
  }, [open]);

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.emoji}>{isAm ? '🌅' : '🌙'}</Text>
          <Text style={styles.meta}>
            {isAm ? '8:00 AM · DAILY PLEDGE' : '10:00 PM · DAILY PLEDGE'}
          </Text>
          <Text style={styles.title}>{config.modalTitle}</Text>

          <View
            style={[
              styles.quote,
              { borderLeftColor: isAm ? theme.colors.amber : theme.colors.purple },
            ]}
          >
            <Text style={styles.quoteText}>“{config.quote}”</Text>
          </View>

          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setChecked((c) => !c)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.checkbox,
                checked && {
                  backgroundColor: isAm ? theme.colors.amber : theme.colors.purple,
                  borderColor: isAm ? theme.colors.amber : theme.colors.purple,
                },
              ]}
            >
              {checked ? <Text style={styles.checkMark}>✓</Text> : null}
            </View>
            <Text style={styles.checkLabel}>I have read and mean this pledge</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryWrap}
            onPress={() => {
              if (!checked) setChecked(true);
              onConfirm();
            }}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={
                isAm
                  ? [theme.colors.amber, '#f7c15c']
                  : [theme.colors.purple, theme.colors.pink]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryBtn}
            >
              <Text
                style={[
                  styles.primaryText,
                  { color: isAm ? '#2A1A02' : '#2A0E1E' },
                ]}
              >
                {config.buttonLabel}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.ghostBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.ghostText}>Not now</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 20,
  },
  emoji: { fontSize: 30 },
  meta: {
    marginTop: 10,
    fontSize: 11,
    letterSpacing: 0.4,
    color: theme.colors.textDim,
    fontFamily: theme.fonts.body,
    fontWeight: '700',
  },
  title: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
  },
  quote: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: theme.colors.cardAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 3,
  },
  quoteText: {
    fontSize: 13.5,
    fontStyle: 'italic',
    lineHeight: 21,
    color: theme.colors.textDim,
    fontFamily: theme.fonts.body,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: theme.colors.textFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: '#0E1117', fontSize: 12, fontWeight: '800' },
  checkLabel: {
    flex: 1,
    fontSize: 12.5,
    color: theme.colors.textDim,
    fontFamily: theme.fonts.body,
  },
  primaryWrap: { marginTop: 20, borderRadius: 13, overflow: 'hidden' },
  primaryBtn: { paddingVertical: 13, alignItems: 'center' },
  primaryText: { fontWeight: '800', fontSize: 13, fontFamily: theme.fonts.body },
  ghostBtn: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 13,
  },
  ghostText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textDim,
    fontFamily: theme.fonts.body,
  },
});
