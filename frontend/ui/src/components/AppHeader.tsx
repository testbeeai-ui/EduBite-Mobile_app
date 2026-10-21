import React, { type ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { theme } from '../theme';

export const AppHeader = ({
  onOpenDrawer,
  onOpenNotifications,
  onLoginPress,
  streak = 0,
  unreadCount = 0,
  showLogin = false,
  loginLabel = 'Login',
  logo,
}: {
  onOpenDrawer?: () => void;
  onOpenNotifications?: () => void;
  onLoginPress?: () => void;
  streak?: number;
  unreadCount?: number;
  /** When true, show Google/login CTA instead of Learner chip. */
  showLogin?: boolean;
  loginLabel?: string;
  /** Replaces the text wordmark. */
  logo?: ReactNode;
}) => {
  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && (
        <View style={styles.statusbar}>
          <Text style={styles.time}>9:41</Text>
          <Text style={styles.icons}>●●●● 5G 🔋</Text>
        </View>
      )}

      <View style={styles.appbar}>
        <View style={styles.left}>
          <TouchableOpacity style={styles.hbtn} onPress={onOpenDrawer}>
            <Text style={styles.hbtnText}>☰</Text>
          </TouchableOpacity>
          {logo ?? (
            <Text style={styles.wordmark}>
              Edu<Text style={styles.wordmarkHighlight}>bite</Text>
            </Text>
          )}
        </View>

        <View style={styles.right}>
          <View style={styles.streakChip}>
            <Text style={styles.streakText}>
              🔥 {streak} day streak
            </Text>
          </View>
          <TouchableOpacity style={styles.hbtn} onPress={onOpenNotifications}>
            <Text style={styles.hbtnText}>🔔</Text>
            {unreadCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : String(unreadCount)}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
          {showLogin ? (
            <TouchableOpacity style={styles.loginBtn} onPress={onLoginPress}>
              <Text style={styles.loginBtnText}>👤 {loginLabel}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.learnerChip} onPress={onLoginPress}>
              <Text style={styles.learnerChipText}>Account</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.bg,
    flexShrink: 0,
  },
  statusbar: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingRight: 26,
  },
  time: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: theme.fonts.body,
  },
  icons: {
    color: theme.colors.textDim,
    fontSize: 11,
    fontFamily: theme.fonts.body,
  },
  appbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 10,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  hbtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  hbtnText: {
    color: theme.colors.text,
    fontSize: 15,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: theme.fonts.body,
  },
  wordmark: {
    fontFamily: theme.fonts.heading,
    fontWeight: '800',
    fontSize: 16,
    color: theme.colors.text,
  },
  wordmarkHighlight: {
    color: theme.colors.teal,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.amberSoft,
    borderColor: 'rgba(239,159,39,0.3)',
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  streakText: {
    color: theme.colors.amber,
    fontSize: 10.5,
    fontWeight: '800',
    fontFamily: theme.fonts.body,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  loginBtnText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: theme.fonts.body,
  },
  learnerChip: {
    backgroundColor: theme.colors.tealSoft,
    borderColor: 'rgba(29,158,117,0.35)',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  learnerChipText: {
    color: theme.colors.teal,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: theme.fonts.body,
  },
});
