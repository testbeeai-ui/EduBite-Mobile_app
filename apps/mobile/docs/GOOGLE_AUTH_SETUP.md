# Google Sign-In (live APK — no Metro / no :8081)

## Important

| Build | Needs Metro `:8081`? | Google Sign-In |
| --- | --- | --- |
| **preview / production APK** | **No** — fully standalone | Native Google button → Supabase |
| development client | Yes | For local coding only |
| Expo Go | Yes | Browser OAuth fallback only |

If you are testing the **live** app, install the **preview** APK and open **Edubite** — do **not** scan a QR into Expo Go and do **not** connect to Metro.

## Why Sign in was missing / broken on the old live APK

The last preview build (`b1caecc`) did **not** bake `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` into the **preview** profile in `eas.json`. Without that, native Google Sign-In cannot start on a standalone APK.

Current `eas.json` preview/production now include:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_SKIP_AUTH=0`

## Rebuild live APK

```bash
cd apps/mobile
npx eas-cli build --profile preview --platform android
```

Install the new APK from the Expo link. Cold-open the app → **Sign in to continue** → **Continue with Google**.

## Google Cloud / Supabase (native APK)

1. Android OAuth client: package `com.edubite.app` + **EAS preview/production SHA-1**
2. Supabase Google provider: Web + Android client IDs, **Skip nonce check**
3. Redirect URL for native: `edubite://auth/callback` (deep-link recovery only; primary path is ID token)

Get SHA-1:

```bash
npx eas-cli credentials -p android
```

## Mental model

| Thing | Role |
| --- | --- |
| Web Client ID | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` / `GoogleSignin.configure({ webClientId })` |
| Android Client ID | Package + SHA-1; listed in Supabase Authorized Client IDs |
| ID token | From native `GoogleSignin.signIn()` → `signInWithIdToken` |
