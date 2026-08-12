import type { Session, User } from '@supabase/supabase-js';
import { isAuthenticatedLearner } from '../auth/user-kind';
import { supabase } from '../supabase';

/**
 * Require an existing Google (non-anonymous) session for progress writes.
 * Does NOT create anonymous sessions — login gate handles sign-in.
 */
export async function ensureSilentSession(): Promise<{
  user: User | null;
  session: Session | null;
}> {
  const existing = await supabase.auth.getSession();
  const session = existing.data.session;
  const user = session?.user ?? null;

  if (session && isAuthenticatedLearner(user)) {
    return { user, session };
  }

  if (session && user && !isAuthenticatedLearner(user)) {
    console.warn('[auth] Ignoring anonymous session — Google login required');
    await supabase.auth.signOut();
  }

  return { user: null, session: null };
}
