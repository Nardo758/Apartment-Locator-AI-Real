# chore(deps): audit fix & CI smoke tests (chore/deps/audit-fix-force)

This PR contains:

- Forced npm audit remediation changes (package.json / lockfile updates) on a dedicated branch.
- Added CI-friendly smoke script at `scripts/smoke.cjs` and npm script `smoke` to verify local dev server availability.
- Added npm script `test:ci` to run Jest in-band for CI environments.
- Added GitHub Actions workflow `deploy-database.yml` and supporting docs for required Supabase secrets.
- Minor TypeScript and ESLint hygiene changes from Group A work.

Required repository secrets (add these in GitHub Settings → Secrets & variables → Actions):

- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_ACCESS_TOKEN

Notes:

- After adding the required secrets, re-run the failing workflow via the GitHub Actions UI or use the API curl template in the README.
- The smoke script `npm run smoke` checks localhost:8080 and can be used in CI jobs that start the dev server before tests.

---

You can open the PR quickly at: [Create PR on GitHub](https://github.com/Nardo758/Apartment-Locator-AI-Real/compare/main...chore/deps/audit-fix-force?expand=1)
