import type { Session } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { supabase } from '../supabase';
import {
  getGoogleWebClientId,
  mapGoogleIdTokenSignIn,
  type GoogleIdTokenSignInResult,
} from './google-id-token-result';
import { signInWithGoogleBrowser } from './google-browser-sign-in';
import { isRunningInExpoGo } from './runtime';

export type GoogleSignInResult = GoogleIdTokenSignInResult;

type GoogleSignInNative = typeof import('@react-native-google-signin/google-signin');

let configured = false;
let nativeModule: GoogleSignInNative | null = null;

/**
 * Lazy-load native Google Sign-In.
 * Top-level import crashes Expo Go (RNGoogleSignin TurboModule missing).
 * Documented exception to "no inline imports" for native-binary gating.
 */
function loadGoogleSignInNative(): GoogleSignInNative {
  if (!nativeModule) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- Expo Go cannot resolve this native module at startup
    nativeModule = require('@react-native-google-signin/google-signin') as GoogleSignInNative;
  }
  return nativeModule;
}

function ensureGoogleConfigured(GoogleSignin: GoogleSignInNative['GoogleSignin']): string {
  const webClientId = getGoogleWebClientId();
  if (!webClientId) {
    throw new Error(
      'Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID. Use the Google Cloud Web application Client ID.',
    );
  }
  if (!configured) {
    GoogleSignin.configure({ webClientId });
    configured = true;
    console.info('[auth] GoogleSignin configured', {
      webClientIdSuffix: webClientId.slice(-24),
    });
  }
  return webClientId;
}

/**
 * Google → Supabase session.
 * - Development / production builds: native ID token (preferred)
 * - Expo Go: browser PKCE OAuth fallback
 *
 * Note: native Original API does not attach a custom nonce. Enable Supabase
 * Google → "Skip nonce check" for the ID-token path.
 */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  if (isRunningInExpoGo()) {
    console.info('[auth] Expo Go — using browser Google OAuth');
    return signInWithGoogleBrowser();
  }

  console.info('[auth] starting native Google Sign-In', { platform: Platform.OS });

  try {
    const {
      GoogleSignin,
      isCancelledResponse,
      isErrorWithCode,
      isSuccessResponse,
      statusCodes,
    } = loadGoogleSignInNative();

    ensureGoogleConfigured(GoogleSignin);
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const response = await GoogleSignin.signIn();

    if (isCancelledResponse(response)) {
      return mapGoogleIdTokenSignIn({ cancelled: true });
    }
    if (!isSuccessResponse(response)) {
      return {
        ok: false,
        error: 'Google Sign-In did not complete. Try again.',
      };
    }

    const idToken = response.data.idToken;
    if (!idToken) {
      return mapGoogleIdTokenSignIn({ idToken: null });
    }

    console.info('[auth] Google idToken obtained');
    const supabaseResult = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    const mapped = mapGoogleIdTokenSignIn({
      idToken,
      supabase: {
        data: { session: supabaseResult.data.session },
        error: supabaseResult.error
          ? { message: supabaseResult.error.message }
          : null,
      },
    });

    if (mapped.ok) {
      console.info('[auth] session created', {
        userId: mapped.session.user.id,
        provider: mapped.session.user.app_metadata?.provider ?? 'google',
      });
    } else {
      console.warn('[auth] signInWithIdToken failed', mapped.error);
    }
    return mapped;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Google Sign-In failed.';
    if (message.includes('RNGoogleSignin') || message.includes('TurboModuleRegistry')) {
      console.warn('[auth] native module missing — falling back to browser OAuth');
      return signInWithGoogleBrowser();
    }

    try {
      const { isErrorWithCode, statusCodes } = loadGoogleSignInNative();
      if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
        return mapGoogleIdTokenSignIn({ cancelled: true });
      }
      if (isErrorWithCode(error) && error.code === statusCodes.IN_PROGRESS) {
        return { ok: false, error: 'Google Sign-In already in progress.' };
      }
      if (
        isErrorWithCode(error) &&
        error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
      ) {
        return {
          ok: false,
          error: 'Google Play Services is unavailable or outdated.',
        };
      }
    } catch {
      /* native module unavailable */
    }

    console.warn('[auth] native Google Sign-In error', message);
    return mapGoogleIdTokenSignIn({ nativeErrorMessage: message });
  }
}

export async function signOut(): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isRunningInExpoGo()) {
    try {
      const { GoogleSignin } = loadGoogleSignInNative();
      const current = GoogleSignin.getCurrentUser();
      if (current) {
        await GoogleSignin.signOut();
      }
    } catch (error: unknown) {
      console.warn(
        '[auth] GoogleSignin.signOut warning',
        error instanceof Error ? error.message : error,
      );
    }
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    console.warn('[auth] supabase signOut failed', error.message);
    return { ok: false, error: error.message };
  }
  console.info('[auth] signed out');
  return { ok: true };
}

export type { Session };
