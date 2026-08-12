import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';

export { isEdublastWebAuthDeadEnd } from './redirect-guards';

// Registered Expo scheme — must match app.json expo.scheme.
export const MOBILE_AUTH_SCHEME = 'edubite';

// Path segment for OAuth return — production URI: edubite://auth/callback
export const MOBILE_AUTH_CALLBACK_PATH = 'auth/callback';

// Stable redirect for dev builds / production APK.
export const STABLE_MOBILE_AUTH_REDIRECT = `${MOBILE_AUTH_SCHEME}://${MOBILE_AUTH_CALLBACK_PATH}`;

// Expo Go: use Supabase Site URL (always allowlisted). AuthSession captures
// https://www.edublast.in?code=... for on-device PKCE exchange.
export const EXPO_GO_HTTPS_REDIRECT_DEFAULT = 'https://www.edublast.in';

export function isRunningInExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

export function getMobileAuthRedirectUri(): string {
  if (Platform.OS === 'web') {
    return makeRedirectUri({
      scheme: MOBILE_AUTH_SCHEME,
      path: MOBILE_AUTH_CALLBACK_PATH,
    });
  }

  const override = process.env.EXPO_PUBLIC_OAUTH_REDIRECT_URL?.trim();
  if (override) {
    console.info('[auth] using EXPO_PUBLIC_OAUTH_REDIRECT_URL', { redirectTo: override });
    return override;
  }

  if (isRunningInExpoGo()) {
    const redirectTo = EXPO_GO_HTTPS_REDIRECT_DEFAULT;
    console.info(
      '[auth] Expo Go using HTTPS Site URL redirect (always allowlisted in Supabase)',
      { redirectTo },
    );
    return redirectTo;
  }

  return STABLE_MOBILE_AUTH_REDIRECT;
}
