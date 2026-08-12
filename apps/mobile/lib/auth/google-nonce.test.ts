import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { encodeUrlSafeNonce } from './google-nonce-encode';

describe('encodeUrlSafeNonce', () => {
  it('maps bytes to url-safe alphabet of equal length', () => {
    const bytes = Uint8Array.from([0, 1, 63, 64, 255]);
    const nonce = encodeUrlSafeNonce(bytes);
    assert.equal(nonce.length, 5);
    assert.match(nonce, /^[A-Za-z0-9_-]+$/);
    assert.equal(nonce[0], 'A'); // 0
    assert.equal(nonce[1], 'B'); // 1
    assert.equal(nonce[2], '_'); // 63 → last alphabet char
    assert.equal(nonce[3], 'A'); // 64 % 64 === 0
    assert.equal(nonce[4], '_'); // 255 % 64 === 63
  });
});
