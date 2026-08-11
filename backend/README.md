# Edubite Backend (`/backend`)

Shared typed client for the Edubite ecosystem. Schema/RLS live in the Supabase project (and sibling Edubite migrations) — not duplicated here.

## Structure

```
backend/
└── api/
    ├── index.ts           # Typed Supabase client (env-required, anon only)
    └── package.json
```

## Supabase Instance
- Configure via env: `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` (or `SUPABASE_*` for non-Expo tooling).
- **Client Key**: anon/publishable only. Service role is NEVER used in frontend packages.
