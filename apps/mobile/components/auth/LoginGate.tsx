import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@edubite/ui';
import { useAuth } from '../../lib/auth/AuthProvider';

/**
 * Full-screen gate — same idea as Edubite/Edublast web: sign in before using the app.
 * No guest / anonymous path.
 */
export function LoginGate() {
  const {
    loading,
    authError,
    clearAuthError,
    signInWithGoogle,
  } = useAuth();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(127,119,221,0.2)', theme.colors.bg, theme.colors.bg]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.card}>
        <Text style={styles.brand}>
          Edu<Text style={styles.brandHi}>bite</Text>
        </Text>
        <Text style={styles.title}>Sign in to continue</Text>
        <Text style={styles.sub}>
          Use Google — same account as Edubite web. Stay in the browser until it
          returns to the app by itself (do not tap around on edublast.in).
        </Text>

        {authError ? (
          <TouchableOpacity style={styles.errorBox} onPress={clearAuthError}>
            <Text style={styles.errorText}>{authError}</Text>
            <Text style={styles.errorHint}>Tap to dismiss</Text>
          </TouchableOpacity>
        ) : null}

        {loading ? (
          <ActivityIndicator color={theme.colors.purple} style={{ marginTop: 20 }} />
        ) : (
          <TouchableOpacity
            style={styles.btn}
            onPress={() => {
              void signInWithGoogle();
            }}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
          >
            <Text style={styles.btnText}>Continue with Google</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    padding: 22,
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    marginBottom: 12,
  },
  brandHi: { color: theme.colors.purple },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    marginBottom: 8,
  },
  sub: {
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.textDim,
    fontFamily: theme.fonts.body,
  },
  errorBox: {
    marginTop: 14,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(220,60,60,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220,60,60,0.3)',
  },
  errorText: {
    fontSize: 12,
    color: '#c0392b',
    fontFamily: theme.fonts.body,
  },
  errorHint: {
    marginTop: 4,
    fontSize: 10,
    color: theme.colors.textFaint,
    fontFamily: theme.fonts.body,
  },
  btn: {
    marginTop: 20,
    backgroundColor: theme.colors.purple,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    fontFamily: theme.fonts.body,
  },
});
