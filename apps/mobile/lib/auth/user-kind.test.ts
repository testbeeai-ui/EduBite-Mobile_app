import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { User } from '@supabase/supabase-js';
import { isAnonymousUser, isAuthenticatedLearner } from './user-kind';

function user(partial: Partial<User> & { app_metadata?: Record<string, unknown> }): User {
  return {
    id: 'u1',
    aud: 'authenticated',
    created_at: '',
    app_metadata: {},
    user_metadata: {},
    ...partial,
  } as User;
}

describe('user-kind', () => {
  it('treats null as anonymous / not authenticated', () => {
    assert.equal(isAnonymousUser(null), true);
    assert.equal(isAuthenticatedLearner(null), false);
  });

  it('detects anonymous flag and provider', () => {
    assert.equal(isAnonymousUser(user({ is_anonymous: true })), true);
    assert.equal(
      isAnonymousUser(user({ app_metadata: { provider: 'anonymous' } })),
      true,
    );
    assert.equal(
      isAnonymousUser(user({ app_metadata: { providers: ['anonymous'] } })),
      true,
    );
  });

  it('accepts Google learner as authenticated', () => {
    const google = user({
      is_anonymous: false,
      app_metadata: { provider: 'google', providers: ['google'] },
      email: 'a@b.com',
    });
    assert.equal(isAnonymousUser(google), false);
    assert.equal(isAuthenticatedLearner(google), true);
  });

  it('rejects non-Google non-anonymous users', () => {
    const emailOnly = user({
      is_anonymous: false,
      app_metadata: { provider: 'email', providers: ['email'] },
      email: 'a@b.com',
    });
    assert.equal(isAuthenticatedLearner(emailOnly), false);
  });
});

