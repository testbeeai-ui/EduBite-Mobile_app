import * as Crypto from 'expo-crypto';
import { encodeUrlSafeNonce } from './google-nonce-encode';

export { encodeUrlSafeNonce } from './google-nonce-encode';

/** URL-safe random nonce for Google ID-token + Supabase verification. */
export function createRawNonce(byteLength = 32): string {
  return encodeUrlSafeNonce(Crypto.getRandomBytes(byteLength));
}

/**
 * Google receives the SHA-256 hex digest; Supabase receives the raw nonce
 * and hashes it to compare with the claim in the ID token.
 * Kept for a future nonce-capable Google Sign-In API.
 */
export async function createGoogleAuthNonce(): Promise<{
  rawNonce: string;
  nonceDigest: string;
}> {
  const rawNonce = createRawNonce();
  const nonceDigest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce,
  );
  return { rawNonce, nonceDigest };
}
