# DB types generation plan

Goal

Generate or scaffold a strong `Database` TypeScript type and place it in `supabase/types.ts` to enable fully-typed Supabase queries across the repo.

Options

1. Generate from Supabase (recommended)

   - Requirements: Supabase CLI installed and access to the project (API key / project id).
   - Command: `supabase gen types typescript --project-id <PROJECT_ID> > supabase/types.ts`
   - Verify and adjust any naming collisions, then run `npx tsc --noEmit`.

2. Introspect Postgres (alternative)

   - Use `pg` or `pg-to-ts` to introspect schemas and generate TS types.
   - Example: `pg-to-ts --connection "postgres://user:pass@host/db" --schema public --output supabase/types.ts`

3. Manual scaffold (safe fallback)

   - Copy critical table shapes into `supabase/types.ts` (example: `data_export_requests`, `user_profiles`, `rental_offers`, `orders`).
   - Keep `Database` as a union of these tables to gradually increase coverage.

PR checklist after generation

- Replace placeholder `Database` with generated types in `supabase/types.ts`.
- Run `npx tsc --noEmit` and fix any resulting type mismatches in code that rely on query results.
- Run `npm run lint` and address lint warnings/errors introduced by tighter typing.
- Add a short note to `supabase/README.md` describing how to regenerate types.

If you'd like, I can attempt to run the Supabase CLI here (requires credentials) or scaffold a `Database` object from the most-used tables found in the repo. Tell me which approach you prefer.
