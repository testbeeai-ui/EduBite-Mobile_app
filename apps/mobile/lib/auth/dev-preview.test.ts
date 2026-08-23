import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isSkipLoginForPreviewEnabled } from './dev-preview';

describe('isSkipLoginForPreviewEnabled', () => {
  it('follows EXPO_PUBLIC_SKIP_AUTH in release and in dev', () => {
    assert.equal(isSkipLoginForPreviewEnabled(false, '1'), true);
    assert.equal(isSkipLoginForPreviewEnabled(true, '1'), true);
    assert.equal(isSkipLoginForPreviewEnabled(false, 'true'), true);
    assert.equal(isSkipLoginForPreviewEnabled(true, 'yes'), true);
  });

  it('is off when the flag is missing or 0', () => {
    assert.equal(isSkipLoginForPreviewEnabled(true, undefined), false);
    assert.equal(isSkipLoginForPreviewEnabled(false, '0'), false);
    assert.equal(isSkipLoginForPreviewEnabled(true, ''), false);
  });
});
