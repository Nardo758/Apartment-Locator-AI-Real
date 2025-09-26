# Supabase Quick Start (local development)

This quick-start will help you run the frontend locally and connect it to a Supabase project for development.

## 1) Create a Supabase project

1. Go to https://app.supabase.com and create a new project.
2. Note the project URL and anon public key from Project Settings → API.
3. (Optional) Create a Service Role Key in Project Settings → API for server-side use.

## 2) Set local environment variables

Create a `.env.local` file at the project root (or use your preferred env mechanism):

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhb...
# Optional server key (DO NOT expose to the client)
SUPABASE_SERVICE_ROLE_KEY=eyJhb...
```

Replace the values above with the values from your Supabase project.

## 3) Run the frontend locally

Install packages and start the dev server:

```powershell
npm install
npm run dev
```

Your frontend will pick up `REACT_APP_SUPABASE_*` environment variables automatically (Vite/CRA will do that for local env files).

## 4) Local DB and migrations

If you need a local Postgres instance (optional):

```powershell
# using Docker Compose (simple example)
docker run -d --name local-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15
# run migrations using your preferred tool (alembic, pg-migrate, etc.)
```

If you prefer, use Supabase local development tools or `supabase` CLI for local emulation.

## 5) Using the service role key (server-only)

When you need to run privileged queries, call your server (API routes) which uses the `SUPABASE_SERVICE_ROLE_KEY` from server environment variables, not bundled into the client build.

## 6) Tips

- Enable Row Level Security (RLS) and create appropriate policies for `profiles`, `properties`, and other sensitive tables.
- Use the Supabase dashboard to view logs and backups.

If you'd like, I can add a Docker Compose file for local Postgres + Supabase CLI or create Vercel/Netlify deployment templates next.
