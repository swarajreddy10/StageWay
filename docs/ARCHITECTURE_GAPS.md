# Architecture Gaps and Risks (Industry Standard Review)

This review is based on a codebase walk-through of the Spring Boot backend and Next.js frontend.
It highlights gaps that can cause security, integrity, and operational issues at enterprise scale.
Each item includes the root cause and an efficient, modern fix.

## Critical security gaps

### 1) Privilege escalation during self-registration
- Evidence: `AuthService.resolveRole` allows `ADMIN` during registration in
  `backend/src/main/java/com/eventmanagement/service/AuthService.java`.
- Root cause: Role assignment is trusted from user input without guardrails.
- Fix: Remove `ADMIN` from self-registration, introduce admin-only role changes, and log role updates.
- Edge cases: Existing ADMIN accounts, migration of legacy roles, rollback when role update fails.

### 2) Authentication bypass via local tokens
- Evidence: `AuthService.validateAuth` accepts `local-<id>` tokens without environment gating.
- Root cause: Development shortcuts remain active in all environments.
- Fix: Disable local tokens outside development, or guard by profile and a server-side secret.
- Edge cases: Backward compatibility for local testing, mixed environments, missing auth header.

### 3) API-wide authorization not enforced by the security filter chain
- Evidence: `SecurityConfig` permits all `/api/**` requests in
  `backend/src/main/java/com/eventmanagement/config/SecurityConfig.java`.
- Root cause: Authorization is performed ad hoc in service methods.
- Fix: Require authentication on protected endpoints, use `@PreAuthorize` for roles,
  and limit anonymous access to intended public routes.
- Edge cases: Public event listing, public registration QR fetch, CORS preflight handling.

### 4) Missing tenant isolation in analytics
- Evidence: `AnalyticsService` aggregates across all events and registrations in
  `backend/src/main/java/com/eventmanagement/service/AnalyticsService.java`.
- Root cause: No organization scoping in analytics queries.
- Fix: Scope analytics by organization id and enforce ownership checks for event analytics.
- Edge cases: ADMIN global analytics, organizer access to shared events, deleted events.

## Data integrity and concurrency risks

### 5) Overbooking and seat assignment races
- Evidence: Seat assignment is computed in memory in
  `RegistrationService` and `SeatService` without transactional locks.
- Root cause: No database-level seat uniqueness, no transactional capacity check.
- Fix: Add a unique constraint on `(event_id, seat_number)` and use transactions with
  `SELECT ... FOR UPDATE` or a seat inventory table.
- Edge cases: Simultaneous registrations, cancellation releasing a seat, waitlist promotions.

### 6) Waitlist position drift
- Evidence: Waitlist position uses a count-before-insert pattern in
  `RegistrationService.joinWaitlist`.
- Root cause: No consistent ordering or locking.
- Fix: Store waitlist position at insert time with a database sequence or ordering by `created_at`.
- Edge cases: Re-joining after cancellation, concurrent waitlist joins.

### 7) Weak validation of event and registration data
- Evidence: Manual checks in `EventService` and `RegistrationService` with no bean validation.
- Root cause: DTOs are not annotated with validation constraints.
- Fix: Add `@Valid` and Jakarta validation annotations on request DTOs,
  plus consistent error payloads in `GlobalExceptionHandler`.
- Edge cases: Negative capacity, unsupported statuses, invalid time zones, empty tags array.

## Performance and scalability gaps

### 8) In-memory filtering and N+1 access patterns
- Evidence: `EventService.getAllEvents` loads all events then filters in memory, and
  `buildEventResponse` computes seat availability per event.
- Root cause: Missing query-level filters and aggregation.
- Fix: Add repository queries for filters and counts, use pagination at the DB level,
  and precompute availability with SQL aggregates.
- Edge cases: Large datasets, high concurrency, sparse filter combinations.

### 9) Analytics computed in memory
- Evidence: `AnalyticsService` loads and aggregates registrations in memory.
- Root cause: Lack of SQL aggregation and indexes for analytics queries.
- Fix: Use SQL aggregates or materialized views, and add indexes where needed.
- Edge cases: Large events with millions of registrations, empty datasets.

## Storage, files, and data governance

### 10) File uploads stored locally with Redis-only metadata
- Evidence: `FileStorageService` stores metadata in Redis and files on disk,
  no ownership checks on download.
- Root cause: MVP storage strategy without durable metadata and access control.
- Fix: Store metadata in Postgres, move files to object storage, issue signed URLs,
  and enforce authorization on download.
- Edge cases: Redis restart, file cleanup, orphaned files, content-type spoofing.

### 11) Data model drift in schema
- Evidence: `users` table includes unused `name` and `password` columns in
  `backend/src/main/resources/db/migration/V1__Create_initial_schema.sql`.
- Root cause: Schema not fully aligned with the cleaned entity model.
- Fix: Create a migration to drop unused columns and document schema changes.
- Edge cases: Existing data in unused columns, backwards compatibility with older clients.

## Observability and operations

### 12) Limited logging, tracing, and error visibility
- Evidence: No correlation ids or structured logs, email failures log to stderr.
- Root cause: No observability framework integrated.
- Fix: Add structured logging, request ids, distributed tracing, and error monitoring.
- Edge cases: PII in logs, log volume limits, trace sampling strategy.

### 13) Risky production defaults
- Evidence: `spring.flyway.clean-disabled: false` and open actuator metrics in
  `backend/src/main/resources/application.yml`.
- Root cause: Development-friendly defaults not overridden for production.
- Fix: Disable Flyway clean in prod, secure actuator endpoints, and use profile-based config.
- Edge cases: Production misconfiguration, secrets in logs, environment drift.

## Frontend-specific risks

### 14) Session tokens stored in localStorage
- Evidence: Tokens stored in `frontend/src/lib/auth-storage.ts`.
- Root cause: Client-side storage is simpler but vulnerable to XSS.
- Fix: Use HttpOnly cookies and same-site settings, or rotate short-lived tokens.
- Edge cases: Multi-tab sync, session refresh, logout across devices.

## Edge and boundary cases to validate
- Concurrent registrations exceeding capacity or assigning the same seat.
- Waitlist join and promotion order under high concurrency.
- Event start/end time parsing with local time zones and DST boundaries.
- Event with capacity null or zero and seat selection requests.
- Organizer trying to access analytics or attendees for another organizer event.
- File upload with spoofed content type or oversized payload.
- Redis outage during login or file upload; graceful degradation.
- Supabase config missing or invalid tokens; fallback behavior.
- Cancellation followed by immediate re-registration or check-in.
- Very large event lists and search filters; pagination correctness.
