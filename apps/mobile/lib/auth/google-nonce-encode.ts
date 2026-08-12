const URL_SAFE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** Map random bytes to a URL-safe nonce string (testable seam). */
export function encodeUrlSafeNonce(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) {
    out += URL_SAFE[bytes[i]! % URL_SAFE.length]!;
  }
  return out;
}
