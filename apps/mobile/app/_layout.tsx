import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Slot, usePathname, useRouter } from 'expo-router';
import { AppHeader, PhoneShell, theme } from '@edubite/ui';
import { BrandLogo } from '../components/brand/BrandLogo';
import { LoginGate } from '../components/auth/LoginGate';
import { NotificationsPanel } from '../components/NotificationsPanel';
import { AuthProvider, useAuth } from '../lib/auth/AuthProvider';
import { SKIP_LOGIN_FOR_PREVIEW } from '../lib/auth/dev-preview';
import { GameProvider, useGame } from '../lib/game/GameProvider';

const QUICK_LINKS: Array<{ label: string; route: string }> = [
  { label: '🏠 Home', route: '/' },
  { label: '🏆 Monthly Challenge', route: '/challenge' },
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
  const { signOut } = useAuth();
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

  return (
    <PhoneShell>
      <AppHeader
        streak={state.streak}
        unreadCount={unreadCount}
        showLogin={false}
        onLoginPress={() => go('/profile')}
        onOpenDrawer={() => setDrawerOpen(true)}
        onOpenNotifications={() => setNotesOpen(true)}
        logo={<BrandLogo place="bar" />}
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
            <View style={styles.logoWrap}>
              <BrandLogo place="menu" />
            </View>
            <Text style={styles.drawerSub}>
              {SKIP_LOGIN_FOR_PREVIEW
                ? 'Preview · login off'
                : `${state.rdm} RDM · ${state.streak} day streak`}
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
            <TouchableOpacity
              style={[styles.link, styles.signOutLink]}
              onPress={() => {
                setDrawerOpen(false);
                void signOut();
              }}
            >
              <Text style={styles.linkText}>🚪 Sign out</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </PhoneShell>
  );
}

function RootGate() {
  const pathname = usePathname();
  const { loading, isGoogleUser } = useAuth();
  const isAuthCallback =
    pathname === '/auth/callback' || pathname?.endsWith('/auth/callback');

  // Allow OAuth deep-link route even before GameProvider mounts.
  if (isAuthCallback) {
    return <Slot />;
  }

  // Controlled by EXPO_PUBLIC_SKIP_AUTH (1 = off, 0 = on). Flip in .env / eas.json.
  const requireGoogleLogin = !SKIP_LOGIN_FOR_PREVIEW;

  if (requireGoogleLogin && loading) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={theme.colors.purple} size="large" />
        <Text style={styles.bootText}>Checking sign-in…</Text>
      </View>
    );
  }

  if (requireGoogleLogin && !isGoogleUser) {
    return <LoginGate />;
  }

  return (
    <GameProvider>
      <AppShell />
    </GameProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootGate />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  bootText: {
    color: theme.colors.textDim,
    fontSize: 13,
    fontFamily: theme.fonts.body,
  },
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
  drawerSub: {
    marginTop: 4,
    marginBottom: 18,
    fontSize: 12,
    color: theme.colors.textFaint,
    fontFamily: theme.fonts.body,
  },
  logoWrap: {
    marginBottom: 2,
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
  signOutLink: {
    marginTop: 8,
    borderColor: 'rgba(220,60,60,0.35)',
  },
  linkText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: theme.fonts.body,
  },
});
