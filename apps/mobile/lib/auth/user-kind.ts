import type { User } from '@supabase/supabase-js';

/** True when there is no user, or the user is an anonymous Supabase identity. */
export function isAnonymousUser(user: User | null | undefined): boolean {
  if (!user) return true;
  if (user.is_anonymous === true) return true;
  const providers = user.app_metadata?.providers;
  if (Array.isArray(providers) && providers.includes('anonymous')) return true;
  return user.app_metadata?.provider === 'anonymous';
}

function hasGoogleProvider(user: User): boolean {
  if (user.app_metadata?.provider === 'google') return true;
  const providers = user.app_metadata?.providers;
  return Array.isArray(providers) && providers.includes('google');
}

/** Google learner session required to use the app (not email/anonymous). */
export function isAuthenticatedLearner(user: User | null | undefined): boolean {
  if (!user || isAnonymousUser(user)) return false;
  return hasGoogleProvider(user);
}
