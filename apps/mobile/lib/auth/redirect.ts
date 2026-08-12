import { makeRedirectUri } from 'expo-auth-session';

/** Registered Expo scheme — must match app.json `expo.scheme`. */
export const MOBILE_AUTH_SCHEME = 'edubite';

/** Path segment for OAuth return — final URI: edubite://auth/callback */
export const MOBILE_AUTH_CALLBACK_PATH = 'auth/callback';

/**
 * Mobile redirect URI passed to Supabase `signInWithOAuth({ redirectTo })`.
 *
 * - Dev builds / production: `edubite://auth/callback`
 * - Expo Go may return an `exp://…` URI — add that exact value to Supabase Redirect URLs too.
 *
 * Google Cloud authorized redirect stays on Supabase:
 * `https://<project-ref>.supabase.co/auth/v1/callback`
 */
export function getMobileAuthRedirectUri(): string {
  return makeRedirectUri({
    scheme: MOBILE_AUTH_SCHEME,
    path: MOBILE_AUTH_CALLBACK_PATH,
  });
}
