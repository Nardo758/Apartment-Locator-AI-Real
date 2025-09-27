# Pull Request Template

Describe the purpose of this PR and the high-level change.

## Summary

Briefly describe what this PR does and why. Include any security fixes or dependency bumps.

## Changes

- List of notable package upgrades (example: `vite` -> 7.1.7, `puppeteer` -> 24.22.3)
- Files changed: `package.json`, `package-lock.json`

## Local verification checklist (reviewer)

- [ ] git fetch && git checkout $BRANCH
- [ ] npm ci
- [ ] npm run build (should succeed)
- [ ] npm run dev and manually smoke-test main flows (login, property search, generate offer)
- [ ] Run tests: `npm test` (if available)

## Migration notes & risks

- Vite major upgrade may require plugin/config changes. Confirm dev server HMR and routes work.
- Puppeteer changes may affect scraping scripts and CI jobs that run headless browsers.

## Rollback plan

- If anything critical breaks, revert the branch and address upgrades incrementally.

## Deployment and secrets

If this PR affects deployment, server functions, or authentication, confirm the following:

- [ ] Client environment variables are set in the deployment platform (Vercel/Netlify/GitHub):
  - `REACT_APP_SUPABASE_URL`
  - `REACT_APP_SUPABASE_ANON_KEY`
- [ ] If this PR adds or modifies server-side code that requires elevated DB access, confirm `SUPABASE_SERVICE_ROLE_KEY` is stored as a GitHub secret and NOT included in the repo
- [ ] If using Vercel deploy action, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are configured in repository secrets

## Server-side changes

- [ ] Any server-side example or function added includes guidance on where to store `SUPABASE_SERVICE_ROLE_KEY`
- [ ] RLS policies and migrations (if needed) are documented or included in the PR

If any of the above items are not applicable, mark them `N/A` and explain in the PR description.

## Checklist

Please fill out and ensure the following before requesting a merge:

- [ ] Description: Clear summary of changes and rationale
- [ ] Tests: New/updated tests added or manual test steps documented
