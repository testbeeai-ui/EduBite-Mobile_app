import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatOAuthCallbackError, parseOAuthCallbackUrl } from './oauth-params';

describe('parseOAuthCallbackUrl', () => {
  it('reads PKCE code from query', () => {
    const params = parseOAuthCallbackUrl(
      'edubite://auth/callback?code=abc123&state=xyz',
    );
    assert.equal(params.code, 'abc123');
    assert.equal(params.error, null);
    assert.equal(params.accessToken, null);
  });

  it('reads error from query', () => {
    const params = parseOAuthCallbackUrl(
      'edubite://auth/callback?error=access_denied&error_description=User%20denied',
    );
    assert.equal(params.code, null);
    assert.equal(params.error, 'access_denied');
    assert.equal(formatOAuthCallbackError(params), 'access_denied: User denied');
  });

  it('reads code from hash fragment', () => {
    const params = parseOAuthCallbackUrl('edubite://auth/callback#code=fromhash');
    assert.equal(params.code, 'fromhash');
  });

  it('detects implicit tokens without treating them as PKCE code', () => {
    const params = parseOAuthCallbackUrl(
      'edubite://auth/callback#access_token=tok&refresh_token=ref',
    );
    assert.equal(params.code, null);
    assert.equal(params.accessToken, 'tok');
    assert.equal(params.refreshToken, 'ref');
  });
});
