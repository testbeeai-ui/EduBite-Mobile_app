// Registered Expo scheme — must match app.json expo.scheme.
export const MOBILE_AUTH_SCHEME = 'edubite';

// Path segment for optional deep-link recovery — edubite://auth/callback
export const MOBILE_AUTH_CALLBACK_PATH = 'auth/callback';

export const STABLE_MOBILE_AUTH_REDIRECT = `${MOBILE_AUTH_SCHEME}://${MOBILE_AUTH_CALLBACK_PATH}`;
