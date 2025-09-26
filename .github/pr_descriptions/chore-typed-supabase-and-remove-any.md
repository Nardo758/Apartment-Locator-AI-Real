### Summary

This PR centralizes Supabase-related TypeScript types, removes explicit `any` usages in key serverless functions and UI code, and extracts non-component helpers into utility modules so component files export only React components (fixes react-refresh fast-refresh warnings).

Important: this branch now contains a manually-derived `Database` type in `supabase/types.ts` that was created from code analysis to cover the most-used tables. It's a conservative, safe mapping intended to improve type-safety until a full Supabase-generated `Database` type can be produced and integrated.

Key changes

- Add `supabase/types.ts` with shared interfaces used by client code and serverless functions.
- Replace unsafe `any` usages with `unknown` and domain-specific interfaces in several `supabase/functions/*` endpoints.
- Extract helper utilities from UI component files into `src/components/ui/*-utils` modules and update component exports to satisfy the react-refresh rule.
- Split a few context files into `context`, `provider`, `hook`, and `utils` files to avoid parse errors and keep components pure.
- Minor runtime-safe error handling improvements (use `unknown` in catch and safe message extraction).

Why

- Reduce runtime type-safety risk and make future type migrations easier by centralizing Supabase types.
- Remove ESLint react-refresh violations and improve dev DX (fast refresh stability).
- Prepare the codebase for stricter TypeScript checks and easier code review.

Files of interest (high-level)

- `supabase/types.ts` (new)
- `supabase/functions/*` (updated) — safe narrowing replacing `any`
- `src/components/ui/*-utils` (new)
- `src/contexts/*` (split into smaller modules)

Testing & verification

- Ran local TypeScript checks and ESLint during development; see CI run in PR for full coverage.
- Recommended: run a CI lint + tsc (warnings as errors) before merging.

Checklist for reviewers

- [ ] Confirm that `supabase/types.ts` contains only types/interfaces and no secrets.
- [ ] Spot-check serverless functions for runtime narrowing correctness (particularly payload parsing).
- [ ] Run app locally and smoke-test core pages (listings, property details, market intelligence).
- [ ] Ensure there are no regressions from moving helpers into `*-utils` files (search paths updated).

Notes / Follow-ups

- The `Database` type in `supabase/types.ts` is currently a manually-derived mapping for priority tables. Next steps:
	 1. (Optional) Generate full DB types with the Supabase CLI and replace `supabase/types.ts`.
	 2. Run a stricter CI pass (lint + `tsc --noEmit`) and fix any narrow typing regressions introduced by generated types.
	 3. Iterate on replacing `any` / `unknown` usages across the codebase with the new Row types.
- I can update the PR description or open the PR for you if you'd like me to (no GH CLI detected in this environment). The branch has been pushed: `chore/typed-supabase-and-remove-any`.

Suggested PR title: chore(types): centralize Supabase types and remove explicit any in serverless functions
