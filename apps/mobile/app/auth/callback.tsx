import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { theme } from '@edubite/ui';
import { supabase } from '../../lib/supabase';
import { createSessionFromCallbackUrl } from '../../lib/auth/session-from-url';

/**
 * Deep-link landing route for `edubite://auth/callback`.
 * Primary login is native Google ID-token; this screen covers rare cold-start
 * deep links and is idempotent if a session already exists.
 */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('Finishing Google sign-in…');

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const existing = await supabase.auth.getSession();
      if (existing.data.session) {
        if (!cancelled) {
          setMessage('Signed in — loading home…');
          router.replace('/');
        }
        return;
      }

      const url = (await Linking.getInitialURL()) ?? Linking.createURL('auth/callback');
      const hasCode =
        typeof url === 'string' &&
        (url.includes('code=') || url.includes('error=') || url.includes('access_token='));

      if (!hasCode) {
        // Wait briefly for AuthProvider Linking handler / session settle.
        await new Promise((r) => setTimeout(r, 600));
        const again = await supabase.auth.getSession();
        if (!cancelled) {
          if (again.data.session) {
            setMessage('Signed in — loading home…');
            router.replace('/');
          } else {
            setMessage('Waiting for sign-in to finish…');
            setTimeout(() => router.replace('/profile'), 1200);
          }
        }
        return;
      }

      const result = await createSessionFromCallbackUrl(url);
      if (cancelled) return;

      if (!result.ok) {
        setMessage(result.error);
        setTimeout(() => router.replace('/profile'), 1600);
        return;
      }

      setMessage('Signed in — loading home…');
      router.replace('/');
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={theme.colors.purple} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: theme.colors.bg,
    padding: 24,
  },
  text: {
    color: theme.colors.text,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: theme.fonts.body,
  },
});
