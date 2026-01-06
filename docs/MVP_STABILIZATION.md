# MVP Stabilization Checklist (JWT-only + Supabase Storage)

This checklist matches the current code changes and what you still need to do.

---

## 1) What changed in the code (now)
- Auth is JWT-only (Supabase access token in `Authorization` header).
- Redis/session cookies removed.
- File uploads go to Supabase Storage (public bucket by default) with DB metadata.
- Local email/SMPP checks removed.
- Role upgrades are admin-only by default.

---

## 2) Backend env vars (Render)
Required:
- `DATABASE_URL`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `CORS_ALLOWED_ORIGINS` = `https://YOUR_VERCEL_DOMAIN`
- `QR_SECRET` = `32+ chars`
- `APP_SECURITY_ADMIN_EMAILS` = `admin1@example.com,admin2@example.com` (optional)

Optional (runtime):
- `SPRING_MAIN_LAZY_INITIALIZATION=true` (faster boot, slower first request)
- `APP_SECURITY_ALLOW_SELF_UPGRADE=true` (staging only)

---

## 3) Supabase configuration
Auth:
- Enable Google OAuth.
- Add redirect URLs:
  - `https://YOUR_VERCEL_DOMAIN/auth/callback`
  - `http://localhost:3000/auth/callback` (dev)

Storage:
- Create bucket (ex: `stageway-assets`).
- Set it to **public** for now (simplest).
- Add `SUPABASE_SERVICE_ROLE_KEY` + `SUPABASE_STORAGE_BUCKET` to Render.
If you keep the bucket private:
- `/api/files/{id}` returns signed URLs for private assets.

---

## 4) Frontend env vars (Vercel)
Required:
- `NEXT_PUBLIC_API_BASE_URL` = `https://YOUR_RENDER_DOMAIN`
- `NEXT_PUBLIC_SUPABASE_URL` = `https://YOUR_PROJECT.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `YOUR_SUPABASE_ANON_KEY`

Optional:
- `NEXT_PUBLIC_FILE_API_BASE_URL` = `https://YOUR_RENDER_DOMAIN`

---

## 5) Post-deploy smoke tests
Backend:
1) `GET https://YOUR_RENDER_DOMAIN/actuator/health`
2) `POST /api/auth/supabase` with a valid Supabase access token.

Frontend:
1) Sign in (Google or email).
2) Create event as HOST.
3) Visit `/events` as attendee and confirm event appears.
4) Register for event and confirm `/registrations` works.
5) Upload a banner image.

---

## 6) Troubleshooting

### 403 on protected endpoints
- Confirm the frontend is sending `Authorization: Bearer <supabase_access_token>`.
- Check `NEXT_PUBLIC_API_BASE_URL` points to Render (no `localhost`).
- Make sure Supabase session exists (refresh token stored by Supabase client).

### Event not showing for attendee
1) Verify event status is `PUBLISHED`.
2) Hit `GET https://YOUR_RENDER_DOMAIN/api/events` directly; confirm the event is present.
3) Confirm the frontend is using the same Render base URL.
4) Clear browser cache and sign in again (token refresh).

### Need a host/admin account
- Add your email to `APP_SECURITY_ADMIN_EMAILS`, redeploy, and sign in.
- Admins can promote users via `PUT /api/admin/users/{id}/role`.

### Uploads fail
- Ensure `SUPABASE_SERVICE_ROLE_KEY` and bucket name are set.
- Bucket is public (or implement signed URLs later).

---

## 7) Next hardening (after MVP)
- Replace public bucket with signed URLs.
- Add backend-side rate limiting and request logging.
- Add environment-based feature flags for disabling optional endpoints.
- Rotate any leaked secrets and remove `.env` from git history.
