import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';

/** Registered Expo scheme — must match app.json `expo.scheme`. */
export const MOBILE_AUTH_SCHEME = 'edubite';

/** Path segment for OAuth return — final URI: edubite://auth/callback */
export const MOBILE_AUTH_CALLBACK_PATH = 'auth/callback';

/** Stable redirect for dev builds / production APK — NOT used inside Expo Go. */
export const STABLE_MOBILE_AUTH_REDIRECT = `${MOBILE_AUTH_SCHEME}://${MOBILE_AUTH_CALLBACK_PATH}`;

export function isRunningInExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

/**
 * Mobile redirect URI for Supabase `signInWithOAuth({ redirectTo })`.
 *
 * - Expo Go: MUST use `exp://…/--/auth/callback` so the auth browser can return
 *   into Expo Go. Custom `edubite://` is NOT owned by Expo Go → session hangs.
 * - Dev build / store build: use `edubite://auth/callback`.
 *
 * Supabase Redirect URLs should include BOTH:
 *   - edubite://auth/callback
 *   - exp://*/--/auth/callback (and/or the exact exp://IP:PORT URL from Metro)
 *
 * Google Cloud redirect stays:
 *   https://PROJECT_REF.supabase.co/auth/v1/callback
 */
export function getMobileAuthRedirectUri(): string {
  if (Platform.OS === 'web') {
    return makeRedirectUri({
      scheme: MOBILE_AUTH_SCHEME,
      path: MOBILE_AUTH_CALLBACK_PATH,
    });
  }

  if (isRunningInExpoGo()) {
    // Prefer Linking.createURL — matches Expo Router deep-link shape.
    const viaLinking = Linking.createURL(MOBILE_AUTH_CALLBACK_PATH);
    console.info(
      '[auth] Expo Go redirect — add this exact URL (or a matching exp:// wildcard) in Supabase Redirect URLs',
      { redirectTo: viaLinking },
    );
    return viaLinking;
  }

  return STABLE_MOBILE_AUTH_REDIRECT;
}
