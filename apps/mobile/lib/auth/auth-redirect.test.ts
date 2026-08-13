import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  resolveAuthRedirectUri,
  STABLE_MOBILE_AUTH_REDIRECT,
} from './redirect';

describe('resolveAuthRedirectUri', () => {
  it('prefers EXPO_PUBLIC_OAUTH_REDIRECT_URL when set', () => {
    assert.equal(
      resolveAuthRedirectUri({
        envRedirect: 'edubite://custom-callback',
        runningInExpoGo: true,
        expoGoRedirectUri: 'exp://ignored/--/auth/callback',
      }),
      'edubite://custom-callback',
    );
  });

  it('uses Expo Go URI when running in Expo Go', () => {
    assert.equal(
      resolveAuthRedirectUri({
        envRedirect: null,
        runningInExpoGo: true,
        expoGoRedirectUri: 'exp://192.168.1.10:8081/--/auth/callback',
      }),
      'exp://192.168.1.10:8081/--/auth/callback',
    );
  });

  it('uses stable custom scheme outside Expo Go', () => {
    assert.equal(
      resolveAuthRedirectUri({
        envRedirect: undefined,
        runningInExpoGo: false,
        expoGoRedirectUri: 'exp://ignored/--/auth/callback',
      }),
      STABLE_MOBILE_AUTH_REDIRECT,
    );
  });
});
