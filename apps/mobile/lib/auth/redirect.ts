import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';

export { isEdublastWebAuthDeadEnd } from './redirect-guards';

// Registered Expo scheme — must match app.json expo.scheme.
export const MOBILE_AUTH_SCHEME = 'edubite';

// Path segment for deep-link recovery — edubite://auth/callback
export const MOBILE_AUTH_CALLBACK_PATH = 'auth/callback';

// Stable redirect for development / production native builds.
export const STABLE_MOBILE_AUTH_REDIRECT = `${MOBILE_AUTH_SCHEME}://${MOBILE_AUTH_CALLBACK_PATH}`;

/**
 * Deep-link URI for optional callback recovery on native builds.
 * Native Google Sign-In does not use this for the primary login path.
 */
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

  return STABLE_MOBILE_AUTH_REDIRECT;
}
