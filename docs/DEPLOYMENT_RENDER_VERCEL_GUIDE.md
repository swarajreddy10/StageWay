# StageWay Deployment Guide (Render + Vercel + GitHub Actions)

This guide covers:
- Backend on Render using Docker only
- Frontend on Vercel
- GitHub Actions cron ping every 10 minutes
- Supabase auth configuration
- Fixing the GitHub push-protection error (secrets)

---

## 0) Fix the GitHub push-protection error (required)

GitHub blocked the push because secrets were committed inside docs. We removed the secrets from the files, but the secrets still exist in the commit history. You must rewrite history to purge them.

Checklist:
- [ ] Secrets replaced with placeholders in docs
- [ ] History rewritten to remove the leaked values
- [ ] Force-push updated history

Recommended steps (Windows PowerShell):

1) Create a replacement list (use the exact leaked values from the error log):

```txt
Mscrpostgres10==>YOUR_DB_PASSWORD
GOCSPX-REPLACE_WITH_YOUR_SECRET==>YOUR_GOOGLE_CLIENT_SECRET
835115378178-REPLACE_WITH_YOUR_CLIENT_ID.apps.googleusercontent.com==>YOUR_GOOGLE_CLIENT_ID
```

2) Run git filter-repo to rewrite history:

```bash
git filter-repo --replace-text replacements.txt
```

3) Force-push:

```bash
git push --force --set-upstream origin main
```

Notes:
- If you do not want to rewrite history, you can use the GitHub unblock link, but that keeps the secret in your history and is not recommended.
- After the cleanup, rotate the leaked secrets in Supabase/Google.

---

## 1) Supabase setup (required for auth)

### 1.1 Create or reuse a Supabase project
- Get these values:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`

### 1.2 Enable Google OAuth in Supabase
Supabase console:
- Auth > Providers > Google
- Paste Google Client ID and Secret
- Save

### 1.3 Configure redirect URLs
Supabase console:
- Auth > URL Configuration
- Site URL: `https://YOUR_VERCEL_DOMAIN`
- Additional Redirect URLs:
  - `https://YOUR_VERCEL_DOMAIN/auth/callback`
  - `http://localhost:3000/auth/callback`

Google Cloud Console (OAuth consent screen):
- Authorized redirect URI:
  - `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`

---

## 2) Backend on Render (Docker only)

### 2.1 Create Render Web Service
- New > Web Service
- Connect your GitHub repo
- Root directory: `backend`
- Environment: `Docker`
- Dockerfile path: `Dockerfile`
- Region: closest to your users

### 2.2 Render environment variables (backend)

Required:
- `PORT` = (Render sets this automatically)
- `DATABASE_URL` = `jdbc:postgresql://YOUR_SUPABASE_POOLER:5432/postgres?sslmode=require`
- `DATABASE_USERNAME` = `YOUR_DB_USER`
- `DATABASE_PASSWORD` = `YOUR_DB_PASSWORD`
- `SUPABASE_URL` = `https://YOUR_PROJECT.supabase.co`
- `SUPABASE_ANON_KEY` = `YOUR_SUPABASE_ANON_KEY`
- `CORS_ALLOWED_ORIGINS` = `https://YOUR_VERCEL_DOMAIN`
- `QR_SECRET` = `YOUR_32_CHAR_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY` = `YOUR_SUPABASE_SERVICE_ROLE_KEY` (required for uploads)
- `SUPABASE_STORAGE_BUCKET` = `stageway-assets` (or your bucket name)

Auth notes:
- Backend is JWT-only; the frontend sends `Authorization: Bearer <supabase_access_token>`.
- No session cookies or Redis are required.

QR_SECRET notes:
- 32+ characters is recommended so you do not ship the default insecure value.
- The current QR payload is `REG-<id>`, so this value is reserved for future signed QR payloads.
- Keep it stable across deployments if you later enable signed QR codes.

### 2.3 File uploads
Uploads use Supabase Storage (recommended):
- Create a bucket (ex: `stageway-assets`)
- Make it public for now (simple redirects from `/api/files/{id}`)
- Set `SUPABASE_SERVICE_ROLE_KEY` + `SUPABASE_STORAGE_BUCKET`

Local disk is only for dev:
- Add a Render disk **only** if you intentionally want local storage
- Mount path: `/app/uploads`

### 2.4 Health check
Render Health Check Path:
- `/actuator/health`

---

### 2.5 Runtime optimization (optional)
- Keep the keep-awake GitHub Action enabled to reduce cold starts on free tiers.
- For faster boot time, you can set `SPRING_MAIN_LAZY_INITIALIZATION=true` (first request may be slower).

---

## 3) Frontend on Vercel

### 3.1 Create Vercel project
- Import the repo
- Root directory: `frontend`
- Framework: Next.js

### 3.2 Vercel environment variables (frontend)

Required:
- `NEXT_PUBLIC_API_BASE_URL` = `https://YOUR_RENDER_DOMAIN`
- `NEXT_PUBLIC_SUPABASE_URL` = `https://YOUR_PROJECT.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `YOUR_SUPABASE_ANON_KEY`

Optional:
- `NEXT_PUBLIC_FILE_API_BASE_URL` = `https://YOUR_RENDER_DOMAIN`

### 3.3 Build settings
If Vercel detects Bun:
- Install: `bun install`
- Build: `bun run build`

Otherwise use:
- Install: `npm install`
- Build: `npm run build`

---

## 4) GitHub Actions: keep backend awake (cron)

Create `.github/workflows/keep-backend-awake.yml`:

```yaml
name: keep-backend-awake
on:
  schedule:
    - cron: "*/10 * * * *"
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: curl -fsS https://YOUR_RENDER_DOMAIN/actuator/health
```

Commit and push. This pings the backend every 10 minutes.

---

## 5) Deployment checklist (A to Z)

### Repo & Security
- [ ] Remove secrets from docs
- [ ] Rewrite git history
- [ ] Rotate leaked secrets
- [ ] Verify `.gitignore` excludes `.env*`

### Supabase
- [ ] Project created
- [ ] Google OAuth enabled
- [ ] Redirect URLs set

### Backend (Render)
- [ ] Docker service created
- [ ] Env vars set
- [ ] Health check path set
- [ ] `/app/uploads` disk mounted (optional)

### Frontend (Vercel)
- [ ] Environment variables set
- [ ] Build succeeds
- [ ] Vercel domain added to Supabase redirect URLs
- [ ] Vercel domain added to backend CORS

### Post-deploy tests
- [ ] `https://YOUR_RENDER_DOMAIN/actuator/health` returns UP
- [ ] Sign in works (Google + email)
- [ ] Create event works
- [ ] File uploads work (if enabled)

---

## 6) Common pitfalls

- If the backend fails to start on Render, confirm `PORT` is used:
  - `server.port` should be `${PORT:8081}` in `application.yml`.
- If auth callback fails, check Supabase redirect URLs and Google OAuth redirect URL.
- If CORS errors appear, include your Vercel domain in `CORS_ALLOWED_ORIGINS`.
- If uploads fail, confirm `SUPABASE_SERVICE_ROLE_KEY` and the bucket name.

---

## 7) Minimal env reference

Backend:
- `DATABASE_URL`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `CORS_ALLOWED_ORIGINS`
- `QR_SECRET`

Frontend:
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_FILE_API_BASE_URL` (optional)

---

If you want, I can also add the GitHub Actions workflow file and a Render/Vercel quickstart script. Use the exact URLs you plan to use and I will wire them in.
