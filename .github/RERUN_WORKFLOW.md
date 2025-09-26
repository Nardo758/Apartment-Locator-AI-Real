# Re-run a workflow run via GitHub API

This file shows an example curl command to re-run a workflow run. Use this from your machine and set GITHUB_TOKEN to a token with repo scope.

1) Find the failed workflow run id in the Actions UI or via the API.

2) Run this command locally (replace OWNER, REPO and RUN_ID):

```bash
GITHUB_TOKEN="ghp_xxx" # set as environment variable locally
curl -X POST -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/OWNER/REPO/actions/runs/RUN_ID/rerun
```

Note: Running this requires a valid token. Do not commit tokens into the repository.
