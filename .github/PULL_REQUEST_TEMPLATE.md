## What this PR does

Describe the changes included in this pull request.

---

### Deployment checklist
Before merging, ensure the following are configured for the deployment environment:

- [ ] Vercel project secrets set: `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`, `VERCEL_TOKEN` (if using Vercel Action)
- [ ] GitHub repository secrets set if using Actions: `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (if server-only functionality is required)
- [ ] Netlify env vars set if deploying there: `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`

If this PR adds server-side functions that rely on Supabase service role keys, mark it explicitly and ensure a secret has been created.
