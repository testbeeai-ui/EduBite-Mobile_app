import { Linking } from 'react-native';

/** Only open absolute https URLs — blocks javascript: / custom schemes from content. */
export async function openHttpsUrl(url: string): Promise<boolean> {
  const trimmed = (url || '').trim();
  if (!/^https:\/\//i.test(trimmed)) {
    console.warn('[safe-link] blocked non-https url');
    return false;
  }
  try {
    await Linking.openURL(trimmed);
    return true;
  } catch (err) {
    console.warn('[safe-link] open failed', err);
    return false;
  }
}
