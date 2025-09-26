# Supabase Setup

This project uses Supabase for managed Postgres and auth. This document explains the minimal environment setup and how to use the provided Supabase client and helper functions.

## Required environment variables

Set these in your deployment platform (Vercel, Netlify, Docker, etc.):

- `REACT_APP_SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`) - your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`) - the public anon key used by the client
- `SUPABASE_SERVICE_ROLE_KEY` - (server-side only) service role key for privileged operations. Never expose this in client-side code or public repos.

## Client usage

The project initializes the Supabase client at `src/integrations/supabase/client.ts` and exports utility helpers:

- `supabase` - the initialized Supabase client
- `getCurrentUser()` - returns the currently authenticated user or `null`
- `getCurrentUserId()` - returns the current user's `id` or `null`

Example:

```ts
import { supabase, getCurrentUserId } from '@/integrations/supabase/client'

async function profile() {
  const userId = await getCurrentUserId()
  if (!userId) return null
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) throw error
  return data
}
```

## Security notes

- Keep `SUPABASE_SERVICE_ROLE_KEY` strictly server-side. Use it only in server functions, API routes, or environment-protected contexts.
- Use Row-Level Security (RLS) on tables and create policies that enforce ownership and least privilege.
- Do not commit service role keys into the repository. Rotate keys if they are ever exposed.

## Backups and Migrations

- Supabase provides automated backups; configure retention in the Supabase dashboard.
- For schema migrations, use Supabase migrations or a tool like `pg-migrate`/`sqitch`/`alembic` depending on your stack.

If you'd like, I can also add a small `supabase/quick-start.md` with commands to set up local development and environment variable examples.
