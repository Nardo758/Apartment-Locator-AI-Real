# Deployment Checklist

Use this checklist before triggering a production deploy.

## Secrets & Env

- [ ] `REACT_APP_SUPABASE_URL` set in production environment
- [ ] `REACT_APP_SUPABASE_ANON_KEY` set in production environment
- [ ] `SUPABASE_SERVICE_ROLE_KEY` stored in repo secrets and NOT in client builds
- [ ] `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` (if using Vercel deploy action)

## Database & Migrations

- [ ] Run migrations in staging and verify schema compatibility
- [ ] Ensure RLS policies are in place for new tables
- [ ] Verify backups/retention in Supabase

## Smoke Tests

- [ ] Authentication flow works (sign up, sign in)
- [ ] Basic API endpoints return expected responses
- [ ] Frontend can query public data with anon key

## Rollback Plan

- [ ] Backup DB snapshot created
- [ ] Previous deployment tag available to redeploy

## Post-deploy

- [ ] Verify logs and monitoring dashboards
- [ ] Run a quick data integrity check
- [ ] Notify stakeholders
