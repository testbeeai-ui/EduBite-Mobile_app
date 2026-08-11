import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase';

/**
 * Silent device session — no login UI.
 * Uses anonymous auth when available; otherwise reuses any persisted session.
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
      '[auth] Anonymous sign-in failed (enable Anonymous in Supabase Auth):',
      error.message,
    );
    return { user: null, session: null };
  }
  return { user: data.user, session: data.session };
}
