import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { formatOAuthCallbackError, parseOAuthCallbackUrl } from './oauth-params';

export type SessionFromUrlResult =
  | { ok: true; session: Session }
  | { ok: false; cancelled?: boolean; error: string };

/** Auth codes are single-use — dedupe concurrent Linking + openAuthSessionAsync handlers. */
const inflightByCode = new Map<string, Promise<SessionFromUrlResult>>();
const redeemedCodes = new Set<string>();

function sanitizeCallbackLog(url: string): void {
  console.info('[auth] callback receipt (sanitized host/path only)');
  try {
    const u = new URL(url);
    console.info('[auth] callback url shape', {
      protocol: u.protocol,
      host: u.host,
      pathname: u.pathname,
      hasQuery: Boolean(u.search),
      hasHash: Boolean(u.hash),
    });
  } catch {
    console.info('[auth] callback url could not be parsed as absolute URL');
  }
}

async function existingSessionResult(): Promise<SessionFromUrlResult | null> {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    console.info('[auth] session already present after callback race', {
      userId: data.session.user.id,
    });
    return { ok: true, session: data.session };
  }
  return null;
}

/**
 * Complete OAuth after the system browser returns to the app.
 *
 * Choice: PKCE only (`flowType: 'pkce'` on the Supabase client).
 * - Prefer `code` → `exchangeCodeForSession`
 * - Reject implicit `access_token` fragments so we never mix flows
 */
export async function createSessionFromCallbackUrl(
  url: string,
): Promise<SessionFromUrlResult> {
  sanitizeCallbackLog(url);

  const params = parseOAuthCallbackUrl(url);
  const callbackError = formatOAuthCallbackError(params);
  if (callbackError) {
    console.warn('[auth] oauth provider error', callbackError);
    return { ok: false, error: callbackError };
  }

  if (params.accessToken || params.refreshToken) {
    console.warn(
      '[auth] received implicit tokens; PKCE-only client rejects this. Ensure flowType=pkce.',
    );
    return {
      ok: false,
      error:
        'Received implicit OAuth tokens. This app uses PKCE only — check Supabase client flowType.',
    };
  }

  if (!params.code) {
    const existing = await existingSessionResult();
    if (existing) return existing;
    console.warn('[auth] callback missing authorization code');
    return {
      ok: false,
      error: 'OAuth callback missing authorization code. Try signing in again.',
    };
  }

  const code = params.code;
  if (redeemedCodes.has(code)) {
    const existing = await existingSessionResult();
    if (existing) return existing;
    return {
      ok: false,
      error: 'Authorization code was already used. Try signing in again.',
    };
  }

  const inflight = inflightByCode.get(code);
  if (inflight) return inflight;

  const exchangePromise = (async (): Promise<SessionFromUrlResult> => {
    console.info('[auth] exchanging authorization code for session');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.warn('[auth] code exchange failed', error.message);
      const existing = await existingSessionResult();
      if (existing) {
        redeemedCodes.add(code);
        return existing;
      }
      return { ok: false, error: error.message };
    }
    if (!data.session) {
      return { ok: false, error: 'Code exchange succeeded but no session was returned.' };
    }

    redeemedCodes.add(code);
    console.info('[auth] session created', {
      userId: data.session.user.id,
      provider: data.session.user.app_metadata?.provider ?? 'unknown',
      expiresAt: data.session.expires_at ?? null,
    });
    return { ok: true, session: data.session };
  })();

  inflightByCode.set(code, exchangePromise);
  try {
    return await exchangePromise;
  } finally {
    inflightByCode.delete(code);
  }
}
