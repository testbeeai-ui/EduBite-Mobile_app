# Edubite Backend (`/backend`)

This directory contains the database schema, Supabase configuration, RLS security policies, and backend API type definitions for the Edubite ecosystem.

## Structure

```
backend/
├── supabase/
│   ├── schema.sql         # Table schemas (edubite_*, profiles, user_roles)
│   └── rls_policies.sql   # Row Level Security (RLS) policies for Supabase
└── api/
    ├── index.ts           # Backend client API & TypeScript interfaces
    └── package.json       # Backend API workspace configuration
```

## Database Tables Overview

| Table Name | Description | Access Mode |
| :--- | :--- | :--- |
| `edubite_rdm_rewards` | Master RDM point rewards configuration | Public READ |
| `edubite_content_questions` | Daily Dose & FunBrain quiz questions | Public READ (`published=true`) |
| `edubite_inspiration_quotes` | Motivation quotes | Public READ |
| `edubite_inspiration_phenomena` | Daily science phenomena | Public READ |
| `edubite_inspiration_role_models` | Role model profiles | Public READ |
| `edubite_pledge_reel_days` | AI Integrity pledge days | Public READ |
| `edubite_pledge_reel_slides` | AI Integrity reel slides | Public READ |
| `edubite_game_state` | User streak, habits, & points payload | User Session READ |
| `edubite_brain_gym_progress` | Brain Gym mini-game progress | User Session READ |
| `edubite_puzzle_progress` | Daily puzzle attempt history | User Session READ |
| `profiles` | User profiles & roles | User Session READ |

## Supabase Instance
- **URL**: `https://bytsiknhtcnlxwzgqkrd.supabase.co`
- **Client Key**: `SUPABASE_ANON_KEY` (Client-safe only, service role key is NEVER used in frontend apps).
