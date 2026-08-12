import * as WebBrowser from 'expo-web-browser';
import type { Session } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { supabase } from '../supabase';
import { getMobileAuthRedirectUri } from './redirect';
import { createSessionFromCallbackUrl } from './session-from-url';

WebBrowser.maybeCompleteAuthSession();

/** True while openAuthSessionAsync owns the PKCE exchange (Linking should not race). */
let oauthBrowserInFlight = false;

export function isOAuthBrowserInFlight(): boolean {
  return oauthBrowserInFlight;
}

export type GoogleSignInResult =
  | { ok: true; session: Session }
  | { ok: false; cancelled?: boolean; error: string };

/**
 * Official Expo + Supabase Google OAuth (PKCE):
 * 1. signInWithOAuth(..., skipBrowserRedirect: true)
 * 2. openAuthSessionAsync with mobile redirect URI
 * 3. exchangeCodeForSession on success callback
 *
 * Web Edubite continues to use its own Next.js / cookie OAuth path — this module
 * is mobile-only (native + Expo web shell uses the same deep-link redirect).
 */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  const redirectTo = getMobileAuthRedirectUri();
  console.info('[auth] starting Google OAuth', {
    platform: Platform.OS,
    redirectTo,
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    console.warn('[auth] signInWithOAuth failed', error.message);
    return { ok: false, error: error.message };
  }
  if (!data?.url) {
    return {
      ok: false,
      error: 'Supabase did not return an OAuth URL. Check Google provider config.',
    };
  }

  console.info('[auth] opening system auth session');
  oauthBrowserInFlight = true;
  try {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    console.info('[auth] auth-session result', { type: result.type });

    if (result.type === 'cancel' || result.type === 'dismiss') {
      return { ok: false, cancelled: true, error: 'Sign-in cancelled.' };
    }
    if (result.type !== 'success' || !('url' in result) || !result.url) {
      return {
        ok: false,
        error: `Unexpected auth session result: ${result.type}`,
      };
    }

    return createSessionFromCallbackUrl(result.url);
  } finally {
    oauthBrowserInFlight = false;
  }
}

export async function signOut(): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.warn('[auth] signOut failed', error.message);
    return { ok: false, error: error.message };
  }
  console.info('[auth] signed out');
  return { ok: true };
}
