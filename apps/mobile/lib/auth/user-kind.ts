import type { User } from '@supabase/supabase-js';

/** True when there is no user, or the user is an anonymous Supabase identity. */
export function isAnonymousUser(user: User | null | undefined): boolean {
  if (!user) return true;
  if (user.is_anonymous === true) return true;
  const providers = user.app_metadata?.providers;
  if (Array.isArray(providers) && providers.includes('anonymous')) return true;
  return user.app_metadata?.provider === 'anonymous';
}

/** Real learner login (Google / email / etc.) — required to use the app. */
export function isAuthenticatedLearner(user: User | null | undefined): boolean {
  return Boolean(user) && !isAnonymousUser(user);
}
