# Supabase Secrets Setup (GitHub / Vercel / Netlify)

This file contains step-by-step instructions to configure the environment variables and secrets used by the project.

## Required values
- REACT_APP_SUPABASE_URL — Supabase project URL (e.g., https://xxxxx.supabase.co)
- REACT_APP_SUPABASE_ANON_KEY — Supabase anon public key (safe for client)
- SUPABASE_SERVICE_ROLE_KEY — Service role key (server-only)
- VERCEL_TOKEN — (if using Vercel GitHub Action)
- VERCEL_ORG_ID and VERCEL_PROJECT_ID — used by Vercel Action

## GitHub Actions secrets
1. In GitHub, go to your repo → Settings → Secrets and variables → Actions → New repository secret
2. Add each required secret with their exact name (e.g., `REACT_APP_SUPABASE_URL`)
3. Confirm that secrets are present by running the `Validate Supabase Secrets` workflow (it will fail if any required secret is missing)

## Vercel
1. Open Vercel dashboard → Select your project → Settings → Environment Variables
2. Add these variables for the appropriate environment (Development / Preview / Production):
   - REACT_APP_SUPABASE_URL
   - REACT_APP_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY (only if needed by server functions)
3. If using the Vercel GitHub Action, add `VERCEL_TOKEN` as a GitHub repo secret.

## Netlify
1. Open Netlify → Site Settings → Build & deploy → Environment
2. Add the environment variables listed above

## Local Development
Create a `.env.local` at the repository root (DO NOT commit this file):
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb... # server only
```

## Security Notes
- Rotate service role keys if they are ever exposed.
- Use RLS for production tables and least privilege for server roles.
