# Auth Redesign and Fix Plan (Hosts + Attendees)

This document proposes a smooth, secure redesign to fix sign-in/sign-up issues for hosts and attendees,
remove fragile URL params, and standardize authentication + authorization without bloating the codebase.

## Key problems observed

- Role is passed via URL params and localStorage during OAuth (`/auth/callback?role=...`), which is
  easy to tamper with and creates inconsistent role assignments.
- Backend security config permits all `/api/**` requests, so authorization relies on manual checks.
- Multiple auth systems exist (Supabase OAuth + NextAuth + custom credential endpoints),
  leading to token mismatch and inconsistent session handling.
- Tokens are stored in localStorage/sessionStorage, exposing them to XSS and causing sync issues.
- Self-registration accepts arbitrary roles; `ADMIN` can be supplied via request payload.

## Design goals

- Single source of truth for auth and roles using **Supabase only**.
- Eliminate role and redirect data from URL params.
- Standardized security filter chain and RBAC enforcement.
- Smooth UX with predictable redirects and stable sessions.
- Minimal changes to the existing architecture.

## Recommended solution (high level)

1) **Unify auth flow on Supabase**  
   All login flows (OAuth + email/password) use Supabase as the identity provider.
   The backend accepts a Supabase access token, creates its own session, and the
   frontend never stores raw tokens in localStorage.

2) **Replace URL role params with server-signed state**  
   Role selection is stored in a short-lived, HttpOnly cookie or signed state parameter.
   Callback verifies state before assigning role.

3) **Lock down API access**  
   Require auth for protected endpoints via Spring Security and method-level authorization.

4) **Harden role assignment**  
   Attendee default; host role requires approval or an invite.

## Backend changes (Spring Boot)

### A) Enforce authentication and authorization centrally
- Update `SecurityConfig`:
  - `/api/auth/**`, `/api/events` (GET), `/api/events/{id}` (GET), and `/api/registrations/{id}/qr`
    can be public.
  - All other `/api/**` routes require authentication.
  - Add `@EnableMethodSecurity` and use `@PreAuthorize` on host-only routes.
- Why: Removes ad hoc auth checks and creates consistent protection.

### B) Use a single session model (Supabase -> backend session)
- Keep Supabase for identity, keep backend sessions for app access.
- Backend issues its own session after verifying Supabase token.
- Send the backend session in HttpOnly cookies (`SameSite=Lax`, `Secure` in prod).

### C) Harden role assignment and host onboarding
- Remove `ADMIN` from self-registration payload.
- Default role to `ATTENDEE`.
- For host creation:
  - Use an admin-only endpoint or invite link to promote.
  - Store `account_status` (PENDING, ACTIVE, SUSPENDED).
- Validate desired roles server-side in `AuthService`.
- Deprecate `/api/auth/login` and `/api/auth/register` once Supabase email/password is used.

### D) Standardize Supabase auth handling
- Add an endpoint: `POST /api/auth/oauth/start`
  - Stores intended role in a signed, short-lived cookie (or stores a state token in Redis).
- Supabase callback:
  - Verify the state/cookie.
  - Assign role if user is new and role is allowed.
  - Create session and redirect.

### E) Preserve role choice for email verification
- Store role in Supabase `user_metadata` on sign-up.
- If no OAuth state exists, use `user_metadata.role` during `/api/auth/supabase`.

## Frontend changes (Next.js)

### A) Remove role from URL params
- Replace `role` query param usage in `OAuthButtons` and `/auth/callback`.
- New flow:
  1. User selects role on signup screen.
  2. Frontend calls `/api/auth/oauth/start` to set state (cookie).
  3. Redirect to OAuth.
  4. Callback reads verified state on backend, not via URL.

### B) Stop storing raw tokens in localStorage
- Rely on HttpOnly cookies managed by backend.
- `authStore` should call `/api/auth/user` to hydrate user state.
- Remove token writes in `authStore` and `auth-storage`.

### C) Keep only Supabase auth
- Remove NextAuth routes and providers.
- Remove credential login/register endpoints that bypass Supabase.
- Keep `/auth/callback` minimal (spinner + redirect after backend sync).

### D) Update forms to use Supabase directly
- Login form: `supabase.auth.signInWithPassword` then call `/api/auth/supabase`.
- Sign-up form: `supabase.auth.signUp` then call `/api/auth/supabase` (or after email verify).
- Result: backend session is created only after Supabase verifies identity.

## Minimal API route map (recommended)

- `POST /api/auth/oauth/start` -> Set state cookie
- `POST /api/auth/supabase` -> Verify Supabase token, create backend session, return user
- `GET /api/auth/user` -> Current user
- `POST /api/auth/logout` -> Clear session

## Edge and boundary cases to validate

- Attempted role escalation via URL, storage, or payload.
- OAuth flow without role selection or missing state cookie.
- Multiple tabs logging in/out simultaneously.
- Redirect loops on `/auth/callback` when session missing.
- Host-only routes accessed by attendees.
- Token expiration and refresh under active use (Supabase refresh flow).
- Supabase outage or invalid token responses.

## Integration checklist (Supabase-only)

- Login (email/password): Supabase session -> `/api/auth/supabase` -> cookie set -> `/api/auth/user` works.
- Login (Google OAuth): state cookie set -> Supabase callback -> `/api/auth/supabase` -> cookie set.
- Sign-up (attendee): role saved in Supabase metadata, email verify path works.
- Sign-up (host): role stored in Supabase metadata, backend assigns organizer role on first sync.
- Logout: `/api/auth/logout` clears session cookie and `/api/auth/user` returns 401.
- Host-only endpoints (`/api/events/my`, `/api/analytics/overview`) return 403 for attendees.
- Attendee-only paths still accessible (public event listing, QR fetch).

## Smoke test

Run against a local backend using a real Supabase test token:

```bash
SUPABASE_TEST_ACCESS_TOKEN=... npm run auth:smoke
```

## Suggested migration steps

1) Lock down backend auth and role assignment.
2) Introduce state cookie for OAuth role selection.
3) Switch frontend to cookie-based session, remove localStorage tokens.
4) Remove redundant auth system (keep Supabase only).

## Outcome

This redesign removes fragile URL params, prevents role escalation, and provides a standard,
enterprise-grade authentication and authorization model while keeping the current stack intact.
