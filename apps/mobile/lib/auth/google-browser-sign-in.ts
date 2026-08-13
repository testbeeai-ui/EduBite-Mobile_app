import * as WebBrowser from 'expo-web-browser';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { getAuthRedirectUri } from './auth-redirect';
import { createSessionFromCallbackUrl } from './session-from-url';

export type BrowserGoogleSignInResult =
  | { ok: true; session: Session }
  | { ok: false; cancelled?: boolean; error: string };

WebBrowser.maybeCompleteAuthSession();

/**
 * Browser / Expo Go Google OAuth via Supabase PKCE.
 * Prefer native ID-token Sign-In in development/production builds.
 */
export async function signInWithGoogleBrowser(): Promise<BrowserGoogleSignInResult> {
  const redirectTo = getAuthRedirectUri();
  console.info('[auth] starting browser Google OAuth', { redirectTo });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: { prompt: 'select_account' },
    },
  });

  if (error) {
    console.warn('[auth] signInWithOAuth failed', error.message);
    return { ok: false, error: error.message };
  }
  if (!data.url) {
    return { ok: false, error: 'Supabase did not return an OAuth URL.' };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === 'cancel' || result.type === 'dismiss') {
    return { ok: false, cancelled: true, error: 'Sign-in cancelled.' };
  }
  if (result.type !== 'success' || !('url' in result) || !result.url) {
    return {
      ok: false,
      error:
        'Google sign-in did not return to the app. Add this Redirect URL in Supabase Auth: ' +
        redirectTo,
    };
  }

  const exchanged = await createSessionFromCallbackUrl(result.url);
  if (!exchanged.ok) {
    return { ok: false, cancelled: exchanged.cancelled, error: exchanged.error };
  }
  return { ok: true, session: exchanged.session };
}
