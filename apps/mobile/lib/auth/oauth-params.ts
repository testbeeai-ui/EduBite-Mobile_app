/**
 * Pure OAuth callback URL parsing (PKCE-first).
 * Safe to unit-test without Expo / React Native runtime.
 */

export type OAuthCallbackParams = {
  code: string | null;
  error: string | null;
  errorDescription: string | null;
  /** Present only for legacy implicit redirects — not used in PKCE path. */
  accessToken: string | null;
  refreshToken: string | null;
};

function readParams(raw: string): URLSearchParams {
  const normalized = raw.startsWith('?') || raw.startsWith('#') ? raw.slice(1) : raw;
  return new URLSearchParams(normalized);
}

/**
 * Extract OAuth params from a deep-link / auth-session callback URL.
 * Checks query string first, then hash fragment (some providers use either).
 */
export function parseOAuthCallbackUrl(url: string): OAuthCallbackParams {
  let query = '';
  let hash = '';
  try {
    const parsed = new URL(url);
    query = parsed.search;
    hash = parsed.hash;
  } catch {
    const qIdx = url.indexOf('?');
    const hIdx = url.indexOf('#');
    if (qIdx >= 0) {
      query = url.slice(qIdx, hIdx >= 0 ? hIdx : undefined);
    }
    if (hIdx >= 0) {
      hash = url.slice(hIdx);
    }
  }

  const fromQuery = readParams(query);
  const fromHash = readParams(hash);

  const pick = (key: string) =>
    fromQuery.get(key) || fromHash.get(key) || null;

  return {
    code: pick('code'),
    error: pick('error') || pick('error_code'),
    errorDescription: pick('error_description'),
    accessToken: pick('access_token'),
    refreshToken: pick('refresh_token'),
  };
}

/** Human-readable error from callback params (never includes tokens). */
export function formatOAuthCallbackError(params: OAuthCallbackParams): string | null {
  if (!params.error) return null;
  const desc = params.errorDescription
    ? decodeURIComponent(params.errorDescription.replace(/\+/g, ' '))
    : null;
  return desc ? `${params.error}: ${desc}` : params.error;
}
