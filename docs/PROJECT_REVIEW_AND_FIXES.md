# Project Review and Hardening Plan

This document captures the honest review, the concrete fixes, and a safe rollout plan that does **not** break the current working codebase. It is written for an early career full stack developer and is meant to be executed incrementally.

---

## 1) Executive Summary

Current status:
- MVP works and is deployable.
- Security and scalability need hardening before real users or production traffic.
- The biggest risks are secrets in git, client-controlled role escalation, and per-request auth calls to Supabase.

Goal:
- Keep current codebase working.
- Add fixes as small, safe steps.
- Reach a stable, secure, and scalable baseline.

---

## 2) What is already fixed in the current codebase

Auth and Redis:
- JWT-only auth (Supabase access tokens in `Authorization` header).
- Redis/session cookies removed.
- Admin-only role upgrades (self-upgrade off by default).
- Host access requests with admin review (no client role escalation).
- Frontend no longer sends `X-Desired-Role`.

Uploads:
- Supabase Storage supported, with a local fallback for dev.
- Private assets return signed URLs (public bucket still works).

Auth performance:
- Local JWT verification via Supabase JWKS, with remote fallback.
- Timeouts added for Supabase HTTP calls.

Docs:
- Updated deployment guide and MVP checklist.

Reference:
- `docs/MVP_STABILIZATION.md`
- `docs/DEPLOYMENT_RENDER_VERCEL_GUIDE.md`

---

## 3) Critical Issues (must fix)

### C1) Secrets in git history (Critical)
Risk:
- Compromised database, Supabase, and OAuth keys.

Fix (required):
1) Rotate all leaked secrets.
2) Purge git history with `git filter-repo`.
3) Force-push cleaned history.

Files to clean:
- `backend/.env`
- `backend/.env.properties`
- Any old commits containing secrets.

---

### C2) Client-controlled role escalation (Critical)
Risk:
- Any user can promote themselves to HOST/ORGANIZER by sending `X-Desired-Role`.

Fix (required):
- Enforce server-side approval for role upgrades.
- Suggested options:
  1) Allow ATTENDEE only by default, store role change requests in DB.
  2) Admin-only endpoint to approve or upgrade a user.
  3) A trusted service flag for staging-only host creation.

Status:
- Implemented with host access requests + admin review endpoints.

Affected areas:
- `backend/src/main/java/com/eventmanagement/service/AuthService.java`
- `frontend/src/app/auth/callback/page.tsx`
- `frontend/src/stores/authStore.ts`

---

### C3) Public file access for private assets (High)
Risk:
- Private file metadata still serves a public URL.

Fix:
- Use signed URLs for private assets or proxy downloads only after auth checks.
- If all files are public in MVP, explicitly document that and remove private logic.

Affected areas:
- `backend/src/main/java/com/eventmanagement/service/FileStorageService.java`

---

## 4) Performance and Scalability Issues

### P1) Supabase validation on every request (High)
Risk:
- Each API request makes a network call to Supabase, doubling latency and increasing failure rate.

Fix:
1) Validate JWT locally with Supabase JWT secret or JWKS.
2) Cache user identity in-memory for short TTL if needed.

Affected areas:
- `backend/src/main/java/com/eventmanagement/service/SupabaseAuthService.java`
- `backend/src/main/java/com/eventmanagement/config/SupabaseAuthenticationFilter.java`

---

### P2) Missing HTTP timeouts (Medium)
Risk:
- Slow external calls can freeze request threads and cause downtime.

Fix:
- Set connection + read timeouts for the RestTemplate.

Affected areas:
- `backend/src/main/java/com/eventmanagement/config/SecurityConfig.java`

---

## 5) Standards and Best Practices Gaps

### S1) Unused or misleading env vars
Risk:
- Confusion and misconfiguration.

Fix:
- Remove or document unused keys (JWT_SECRET, Redis, etc.).
Already updated:
- `backend/.env.example`

---

### S2) Security context not used in services
Risk:
- Duplicate auth verification, inconsistent behavior, unnecessary overhead.

Fix:
- Read authenticated principal from Spring Security context where possible.

Affected areas:
- `backend/src/main/java/com/eventmanagement/service/*`

---

## 6) Recommended Fixes in Priority Order

### Phase 1 (do now, no app downtime)
1) Rotate secrets and purge git history.
2) Lock role escalation to admin approval (no client role upgrades).
3) Add timeouts to RestTemplate calls.

### Phase 2 (low risk, medium effort)
1) Local JWT verification (reduce Supabase round trips).
2) Signed URLs for private storage.

### Phase 3 (scale-ready)
1) Add rate limiting for auth endpoints.
2) Centralized audit logging.
3) Background jobs (email, notifications, cleanup).

---

## 7) Safe Rollout Plan (no breakage)

Step-by-step:
1) Rotate secrets and push cleaned history.
2) Deploy backend with role upgrade disabled by default.
3) Update frontend to remove any role header or mark it as dev-only.
4) Deploy backend with JWT local verification.
5) Add signed URLs or make buckets public by policy (document which).

Rollback:
- Keep a known-good tag on Render.
- If auth fails, revert to Supabase remote verification temporarily.

---

## 8) Verification Checklist

Auth:
- [ ] Login works (email + Google).
- [ ] All protected endpoints reject missing tokens.
- [ ] Role upgrade cannot happen without admin approval.

Events:
- [ ] Public events list works.
- [ ] Host can see `/api/events/my`.

Uploads:
- [ ] Upload succeeds.
- [ ] Public file is accessible.
- [ ] Private file access blocked or signed.

---

## 9) Summary for Early Career Dev Feedback

What is strong:
- You shipped an MVP.
- You wired frontend/backend flows correctly.
- Your structure is clean for an MVP.

What needs growth:
- Security boundaries (never trust client role).
- Secrets management (never store secrets in repo).
- Scalability thinking (avoid per-request external auth calls).

---

If you want, I can turn each fix into a small PR-sized patch with exact diffs and tests.
