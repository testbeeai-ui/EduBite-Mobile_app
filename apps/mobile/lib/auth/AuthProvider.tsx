import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import {
  isOAuthBrowserInFlight,
  signInWithGoogle,
  signOut as authSignOut,
} from './google-sign-in';
import { createSessionFromCallbackUrl } from './session-from-url';
import { MOBILE_AUTH_CALLBACK_PATH, MOBILE_AUTH_SCHEME } from './redirect';

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  /** True when session is a real (non-anonymous) Google/user login. */
  isGoogleUser: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isAuthCallbackUrl(url: string): boolean {
  const lower = url.toLowerCase();
  const schemeHit =
    lower.startsWith(`${MOBILE_AUTH_SCHEME}://`) ||
    lower.includes(`${MOBILE_AUTH_SCHEME}%3a%2f%2f`);
  const pathHit =
    lower.includes(`/${MOBILE_AUTH_CALLBACK_PATH}`) ||
    lower.includes(`--/${MOBILE_AUTH_CALLBACK_PATH}`); // Expo Go proxy form
  return (schemeHit || lower.startsWith('exp://') || lower.startsWith('exps://')) && pathHit;
}

function isAnonymousUser(user: User | null | undefined): boolean {
  if (!user) return true;
  if (user.is_anonymous === true) return true;
  const providers = user.app_metadata?.providers;
  if (Array.isArray(providers) && providers.includes('anonymous')) return true;
  return user.app_metadata?.provider === 'anonymous';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const applySession = useCallback((next: Session | null) => {
    setSession(next);
  }, []);

  useEffect(() => {
    let mounted = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        console.warn('[auth] getSession failed', error.message);
        setAuthError(error.message);
      }
      applySession(data.session ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      applySession(next);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [applySession]);

  const handleIncomingUrl = useCallback(
    async (url: string | null) => {
      if (!url || !isAuthCallbackUrl(url)) return;
      // openAuthSessionAsync path owns the exchange while the browser sheet is open.
      if (isOAuthBrowserInFlight()) {
        console.info('[auth] deep link ignored — browser OAuth in flight');
        return;
      }
      console.info('[auth] deep link callback received');
      const result = await createSessionFromCallbackUrl(url);
      if (!result.ok) {
        setAuthError(result.error);
        return;
      }
      setAuthError(null);
      applySession(result.session);
    },
    [applySession],
  );

  useEffect(() => {
    void Linking.getInitialURL().then((url) => {
      void handleIncomingUrl(url);
    });
    const sub = Linking.addEventListener('url', ({ url }) => {
      void handleIncomingUrl(url);
    });
    return () => sub.remove();
  }, [handleIncomingUrl]);

  const doGoogleSignIn = useCallback(async () => {
    setAuthError(null);
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result.ok) {
        if (!result.cancelled) setAuthError(result.error);
        return false;
      }
      applySession(result.session);
      return true;
    } finally {
      setLoading(false);
    }
  }, [applySession]);

  const doSignOut = useCallback(async () => {
    setAuthError(null);
    const result = await authSignOut();
    if (!result.ok) {
      setAuthError(result.error);
      return false;
    }
    applySession(null);
    return true;
  }, [applySession]);

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    return {
      loading,
      session,
      user,
      isGoogleUser: Boolean(user) && !isAnonymousUser(user),
      authError,
      clearAuthError: () => setAuthError(null),
      signInWithGoogle: doGoogleSignIn,
      signOut: doSignOut,
    };
  }, [authError, doGoogleSignIn, doSignOut, loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
