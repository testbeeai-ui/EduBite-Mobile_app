/**
 * Supabase PKCE needs WebCrypto subtle.digest (SHA-256).
 * Hermes/Expo Go do not provide it — bridge via expo-crypto.
 * Import this before creating the Supabase client.
 */
import 'react-native-get-random-values';
import * as Crypto from 'expo-crypto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

if (!g.crypto) {
  g.crypto = {};
}

if (!g.crypto.subtle) {
  g.crypto.subtle = {
    digest: async (algorithm: AlgorithmIdentifier, data: BufferSource) => {
      const name =
        typeof algorithm === 'string'
          ? algorithm
          : (algorithm as { name?: string }).name ?? 'SHA-256';

      let expoAlgo: Crypto.CryptoDigestAlgorithm;
      switch (String(name).toUpperCase()) {
        case 'SHA-256':
          expoAlgo = Crypto.CryptoDigestAlgorithm.SHA256;
          break;
        case 'SHA-384':
          expoAlgo = Crypto.CryptoDigestAlgorithm.SHA384;
          break;
        case 'SHA-512':
          expoAlgo = Crypto.CryptoDigestAlgorithm.SHA512;
          break;
        default:
          throw new Error(`Unsupported digest algorithm: ${name}`);
      }

      const bytes =
        data instanceof ArrayBuffer
          ? new Uint8Array(data)
          : new Uint8Array(
              (data as ArrayBufferView).buffer,
              (data as ArrayBufferView).byteOffset,
              (data as ArrayBufferView).byteLength,
            );

      if (typeof Crypto.digest === 'function') {
        return Crypto.digest(expoAlgo, bytes as BufferSource);
      }

      const hash = await Crypto.digestStringAsync(
        expoAlgo,
        Array.from(bytes, (b) => String.fromCharCode(b)).join(''),
        { encoding: Crypto.CryptoEncoding.HEX },
      );
      const pairs = hash.match(/.{1,2}/g) ?? [];
      return new Uint8Array(pairs.map((h) => parseInt(h, 16))).buffer;
    },
  };
}
