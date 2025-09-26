---
## Pull Request Checklist

Please fill out and ensure the following before requesting a merge:

- [ ] Description: Clear summary of changes and rationale
- [ ] Tests: New/updated tests added or manual test steps documented

### Deployment and Secrets
If this PR affects deployment, server functions, or authentication, confirm the following:

- [ ] Client environment variables are set in the deployment platform (Vercel/Netlify/GitHub):
	- `REACT_APP_SUPABASE_URL`
	- `REACT_APP_SUPABASE_ANON_KEY`
- [ ] If this PR adds or modifies server-side code that requires elevated DB access, confirm `SUPABASE_SERVICE_ROLE_KEY` is stored as a GitHub secret and NOT included in the repo
- [ ] If using Vercel deploy action, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are configured in repository secrets

### Server side changes
- [ ] Any server-side example or function added includes guidance on where to store `SUPABASE_SERVICE_ROLE_KEY`
- [ ] RLS policies and migrations (if needed) are documented or included in the PR

If any of the above items are not applicable, mark them `N/A` and explain in the PR description.
