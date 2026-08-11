import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { theme } from '../theme';

export const AppHeader = ({ onOpenDrawer }: { onOpenDrawer?: () => void }) => {
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
          <Text style={styles.wordmark}>
            Edu<Text style={styles.wordmarkHighlight}>bite</Text>
          </Text>
        </View>
        
        <View style={styles.right}>
          <View style={styles.streakChip}>
            <Text style={styles.streakText}>🔥 0 day streak</Text>
          </View>
          <TouchableOpacity style={styles.loginBtn}>
            <Text style={styles.loginBtnText}>👤 Login</Text>
          </TouchableOpacity>
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
  },
  hbtnText: {
    color: theme.colors.text,
    fontSize: 15,
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
});
