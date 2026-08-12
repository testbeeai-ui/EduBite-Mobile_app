import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Slot, useRouter } from 'expo-router';
import { AppHeader, PhoneShell, theme } from '@edubite/ui';
import { NotificationsPanel } from '../components/NotificationsPanel';
import { AuthProvider, useAuth } from '../lib/auth/AuthProvider';
import { GameProvider, useGame } from '../lib/game/GameProvider';

const QUICK_LINKS: Array<{ label: string; route: string }> = [
  { label: '🏠 Home', route: '/' },
  { label: '🍬 DailyDose', route: '/dailydose' },
  { label: '⚡ FunBrain', route: '/funbrain' },
  { label: '🧠 Brain Gym', route: '/braingym' },
  { label: '🧩 Puzzles', route: '/puzzles' },
  { label: '🌱 Habits', route: '/habits' },
  { label: '🌟 Inspiration', route: '/inspiration' },
  { label: '🤖 AI Integrity', route: '/ai_integrity' },
  { label: '🏆 Achievements', route: '/achievements' },
  { label: '👤 Profile', route: '/profile' },
];

function AppShell() {
  const router = useRouter();
  const { state } = useGame();
  const { isGoogleUser, loading: authLoading, signInWithGoogle } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const unreadCount = useMemo(
    () => (state.notifications || []).filter((n) => !n.read).length,
    [state.notifications],
  );

  const go = (route: string) => {
    setDrawerOpen(false);
    setNotesOpen(false);
    router.navigate(route as never);
  };

  const onLoginPress = async () => {
    if (isGoogleUser) {
      go('/profile');
      return;
    }
    const ok = await signInWithGoogle();
    if (ok) go('/');
  };

  return (
    <PhoneShell>
      <AppHeader
        streak={state.streak}
        unreadCount={unreadCount}
        showLogin={!isGoogleUser}
        loginLabel={authLoading ? '…' : 'Google'}
        onLoginPress={() => {
          void onLoginPress();
        }}
        onOpenDrawer={() => setDrawerOpen(true)}
        onOpenNotifications={() => setNotesOpen(true)}
      />
      <Slot />

      <NotificationsPanel
        open={notesOpen}
        onClose={() => setNotesOpen(false)}
        onNavigate={go}
      />

      <Modal
        visible={drawerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDrawerOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setDrawerOpen(false)}>
          <Pressable style={styles.drawer} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.drawerTitle}>Edubite</Text>
            <Text style={styles.drawerSub}>
              {state.rdm} RDM · {state.streak} day streak
            </Text>
            {QUICK_LINKS.map((link) => (
              <TouchableOpacity
                key={link.route}
                style={styles.link}
                onPress={() => go(link.route)}
              >
                <Text style={styles.linkText}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </PhoneShell>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <GameProvider>
        <AppShell />
      </GameProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
  },
  drawer: {
    width: '78%',
    maxWidth: 320,
    backgroundColor: theme.colors.bg,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
  },
  drawerSub: {
    marginTop: 4,
    marginBottom: 18,
    fontSize: 12,
    color: theme.colors.textFaint,
    fontFamily: theme.fonts.body,
  },
  link: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 8,
  },
  linkText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: theme.fonts.body,
  },
});
