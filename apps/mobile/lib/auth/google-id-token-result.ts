import type { Session } from '@supabase/supabase-js';

export type GoogleIdTokenSignInResult =
  | { ok: true; session: Session }
  | { ok: false; cancelled?: boolean; error: string };

type SupabaseIdTokenResponse = {
  data: { session: Session | null };
  error: { message: string } | null;
};

/** Map native Google Sign-In + Supabase exchange outcomes to a single result. */
export function mapGoogleIdTokenSignIn(input: {
  cancelled?: boolean;
  idToken?: string | null;
  supabase?: SupabaseIdTokenResponse;
  nativeErrorMessage?: string;
}): GoogleIdTokenSignInResult {
  if (input.cancelled) {
    return { ok: false, cancelled: true, error: 'Sign-in cancelled.' };
  }
  if (input.nativeErrorMessage) {
    return { ok: false, error: input.nativeErrorMessage };
  }
  if (!input.idToken) {
    return {
      ok: false,
      error:
        'Google did not return an ID token. Confirm EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is the Web client ID and Android SHA-1 is registered.',
    };
  }
  if (!input.supabase) {
    return { ok: false, error: 'Missing Supabase ID-token exchange response.' };
  }
  if (input.supabase.error) {
    return { ok: false, error: input.supabase.error.message };
  }
  if (!input.supabase.data.session) {
    return {
      ok: false,
      error: 'Supabase accepted the Google token but returned no session.',
    };
  }
  return { ok: true, session: input.supabase.data.session };
}

export function getGoogleWebClientId(): string | null {
  const id = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
  return id || null;
}
