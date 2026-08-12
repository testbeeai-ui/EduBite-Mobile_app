import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';

// Registered Expo scheme — must match app.json expo.scheme.
export const MOBILE_AUTH_SCHEME = 'edubite';

// Path segment for OAuth return — production URI: edubite://auth/callback
export const MOBILE_AUTH_CALLBACK_PATH = 'auth/callback';

// Stable redirect for dev builds / production APK — NOT used inside Expo Go.
export const STABLE_MOBILE_AUTH_REDIRECT = `${MOBILE_AUTH_SCHEME}://${MOBILE_AUTH_CALLBACK_PATH}`;

export function isRunningInExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

// Mobile redirect for Supabase signInWithOAuth({ redirectTo }).
// Expo Go must use exp://... so the auth browser can return into Expo Go.
// Custom edubite:// is only for real native builds.
// Supabase Redirect URLs need: edubite://auth/callback AND the current exp:// URL
// (or an exp:// wildcard if your project supports it).
export function getMobileAuthRedirectUri(): string {
  if (Platform.OS === 'web') {
    return makeRedirectUri({
      scheme: MOBILE_AUTH_SCHEME,
      path: MOBILE_AUTH_CALLBACK_PATH,
    });
  }

  if (isRunningInExpoGo()) {
    const viaLinking = Linking.createURL(MOBILE_AUTH_CALLBACK_PATH);
    console.info(
      '[auth] Expo Go redirect — add this exact URL in Supabase Redirect URLs',
      { redirectTo: viaLinking },
    );
    return viaLinking;
  }

  return STABLE_MOBILE_AUTH_REDIRECT;
}
