import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';

/** Registered Expo scheme — must match app.json `expo.scheme`. */
export const MOBILE_AUTH_SCHEME = 'edubite';

/** Path segment for OAuth return — final URI: edubite://auth/callback */
export const MOBILE_AUTH_CALLBACK_PATH = 'auth/callback';

/** Stable redirect — add this exact URI in Supabase Auth → Redirect URLs. */
export const STABLE_MOBILE_AUTH_REDIRECT = `${MOBILE_AUTH_SCHEME}://${MOBILE_AUTH_CALLBACK_PATH}`;

/**
 * Mobile redirect URI passed to Supabase `signInWithOAuth({ redirectTo })`.
 *
 * Always use the stable custom scheme on native so Supabase does not fall back
 * to Site URL (www.edublast.in) when the Expo Go LAN IP changes.
 *
 * Google Cloud authorized redirect stays on Supabase:
 * `https://<project-ref>.supabase.co/auth/v1/callback`
 */
export function getMobileAuthRedirectUri(): string {
  if (Platform.OS === 'web') {
    return makeRedirectUri({
      scheme: MOBILE_AUTH_SCHEME,
      path: MOBILE_AUTH_CALLBACK_PATH,
    });
  }

  // Force custom scheme (do not use exp://10.x… — that IP changes and breaks allowlist).
  return STABLE_MOBILE_AUTH_REDIRECT;
}
