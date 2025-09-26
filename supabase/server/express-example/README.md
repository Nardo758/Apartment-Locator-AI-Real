# Express Example (Supabase Service Role Key)

This small example shows how to run an Express endpoint that uses `SUPABASE_SERVICE_ROLE_KEY` stored as a server environment variable.

Run locally:

```powershell
# set env vars in your shell or use a .env.local file
npm install
npm start
```

Docker (example):

```powershell
docker build -t supabase-express-example .
docker run -e SUPABASE_URL=... -e SUPABASE_SERVICE_ROLE_KEY=... -p 3000:3000 supabase-express-example
```
