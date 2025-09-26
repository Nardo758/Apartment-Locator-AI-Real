# GitHub Actions: Required Secrets for this Repository

This repository's workflows require a few Supabase-related secrets to run CI / deploy jobs. Without these repository secrets the Actions jobs will fail (exit code 1) when they need to access Supabase.

Add the following repository secrets at: Settings → Secrets and variables → Actions (requires repo admin permissions).

- `REACT_APP_SUPABASE_URL` — your Supabase project URL (example: https://xxxx.supabase.co)
- `REACT_APP_SUPABASE_ANON_KEY` — your Supabase anon/public API key (used by the frontend)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only; store this as a secret and never expose in the repo)

Example: reference these secrets in a workflow YAML via `env`:

```yaml
env:
  REACT_APP_SUPABASE_URL: ${{ secrets.REACT_APP_SUPABASE_URL }}
  REACT_APP_SUPABASE_ANON_KEY: ${{ secrets.REACT_APP_SUPABASE_ANON_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

Security notes

- `SUPABASE_SERVICE_ROLE_KEY` grants elevated privileges; only store it as an Actions secret and limit workflow access if possible.
- Do not commit keys or secrets to the repository. Use GitHub Secrets or your deployment platform's secret store.
- If a secret is rotated, update it in the repository settings and re-run the affected workflows.

Re-run workflows

After adding the secrets in the repository settings, go to the GitHub Actions page for the workflow run and click "Re-run jobs" on the failed run (or re-run all jobs). The workflow should proceed without the previous missing-secret errors.

If you want, I can prepare a small PR that adds the `env:` mapping to the main workflow files so the secrets are explicitly passed to jobs (the values remain secret and are not stored in code). Let me know and I will add that change.
