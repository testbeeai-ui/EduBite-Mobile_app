import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Session } from '@supabase/supabase-js';
import { mapGoogleIdTokenSignIn } from './google-id-token-result';

const session = { user: { id: 'u1' } } as Session;

describe('mapGoogleIdTokenSignIn', () => {
  it('maps cancel', () => {
    const result = mapGoogleIdTokenSignIn({ cancelled: true });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.cancelled, true);
      assert.match(result.error, /cancelled/i);
    }
  });

  it('maps missing id token', () => {
    const result = mapGoogleIdTokenSignIn({ idToken: null });
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /ID token/i);
  });

  it('maps supabase error', () => {
    const result = mapGoogleIdTokenSignIn({
      idToken: 'jwt',
      supabase: { data: { session: null }, error: { message: 'bad nonce' } },
    });
    assert.deepEqual(result, { ok: false, error: 'bad nonce' });
  });

  it('maps session success', () => {
    const result = mapGoogleIdTokenSignIn({
      idToken: 'jwt',
      supabase: { data: { session }, error: null },
    });
    assert.deepEqual(result, { ok: true, session });
  });

  it('maps native error message', () => {
    const result = mapGoogleIdTokenSignIn({
      nativeErrorMessage: 'Play Services missing',
    });
    assert.deepEqual(result, { ok: false, error: 'Play Services missing' });
  });

  it('maps missing supabase response and null session', () => {
    assert.match(
      (mapGoogleIdTokenSignIn({ idToken: 'jwt' }) as { error: string }).error,
      /Missing Supabase/i,
    );
    assert.match(
      (
        mapGoogleIdTokenSignIn({
          idToken: 'jwt',
          supabase: { data: { session: null }, error: null },
        }) as { error: string }
      ).error,
      /no session/i,
    );
  });
});
