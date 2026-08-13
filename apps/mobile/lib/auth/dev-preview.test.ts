import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isSkipLoginForPreviewEnabled } from './dev-preview';

describe('isSkipLoginForPreviewEnabled', () => {
  it('is off in production even if the env flag is set', () => {
    assert.equal(isSkipLoginForPreviewEnabled(false, '1'), false);
  });

  it('is on in dev when EXPO_PUBLIC_SKIP_AUTH is 1/true/yes', () => {
    assert.equal(isSkipLoginForPreviewEnabled(true, '1'), true);
    assert.equal(isSkipLoginForPreviewEnabled(true, 'true'), true);
    assert.equal(isSkipLoginForPreviewEnabled(true, 'yes'), true);
  });

  it('is off in dev when the flag is missing or 0', () => {
    assert.equal(isSkipLoginForPreviewEnabled(true, undefined), false);
    assert.equal(isSkipLoginForPreviewEnabled(true, '0'), false);
    assert.equal(isSkipLoginForPreviewEnabled(true, ''), false);
  });
});
