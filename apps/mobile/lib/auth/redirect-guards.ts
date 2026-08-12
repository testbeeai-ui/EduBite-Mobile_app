/** True when the browser landed on Edublast web without a usable auth code. */
export function isEdublastWebAuthDeadEnd(url: string): boolean {
  const lower = url.toLowerCase();
  if (!lower.includes('edublast.in')) return false;
  if (lower.includes('code=')) return false;
  if (lower.includes('access_token=')) return false;
  return (
    lower.includes('sign-in failed') ||
    lower.includes('signin') ||
    lower.includes('/auth/') ||
    lower.includes('preview?mode=signin')
  );
}
