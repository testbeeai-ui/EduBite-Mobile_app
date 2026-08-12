import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase';

/**
 * Ensure a Supabase session for progress writes.
 * Prefer an existing Google (or other) session; only then try anonymous.
 */
export async function ensureSilentSession(): Promise<{
  user: User | null;
  session: Session | null;
}> {
  const existing = await supabase.auth.getSession();
  if (existing.data.session?.user) {
    return {
      user: existing.data.session.user,
      session: existing.data.session,
    };
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.warn(
      '[auth] No session and anonymous sign-in failed (enable Anonymous or use Google login):',
      error.message,
    );
    return { user: null, session: null };
  }
  return { user: data.user, session: data.session };
}
