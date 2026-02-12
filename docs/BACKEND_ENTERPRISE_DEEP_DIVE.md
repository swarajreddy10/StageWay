# Backend Enterprise Deep Dive (Free-Tier Backend Enhancements)

Documenting what the Spring Boot backend already owns and which practical, free-tier backend capabilities we can layer on top of it to reach enterprise quality.

## 1. Backend snapshot

- **Core REST surface.** `EventController` orchestrates filtering, pagination, owner-scoped CRUD (see `backend/src/main/java/com/eventmanagement/controller/EventController.java:29`), backed by `EventService` that already understands `organizationId`, capacity, statuses and pricing (`backend/src/main/java/com/eventmanagement/service/EventService.java:36`).  
- **Registration & check-in lifecycle.** `RegistrationController` exposes sign-up, waitlist, check-in, QR download and manual flows (`backend/src/main/java/com/eventmanagement/controller/RegistrationController.java:30`). `RegistrationService` implements seat assignment, waitlists, signed QR payloads, check-in guards, and publishes WebSocket updates (`backend/src/main/java/com/eventmanagement/service/RegistrationService.java:57`, `backend/src/main/java/com/eventmanagement/service/RegistrationService.java:90`, `backend/src/main/java/com/eventmanagement/service/RegistrationService.java:573`).  
- **Analytics & reporting base.** Host-facing dashboards already aggregate metrics via `AnalyticsController` and `AnalyticsService`, covering overview, per-event trends, revenue snapshots and status distributions (`backend/src/main/java/com/eventmanagement/controller/AnalyticsController.java:16`, `backend/src/main/java/com/eventmanagement/service/AnalyticsService.java:35`).  
- **Security & identity.** Method-level security, Supabase token validation, role propagation and request correlation are wired through `SecurityConfig`, `SupabaseAuthService`, and `RequestIdFilter`, plus the hosted STOMP endpoint (`backend/src/main/java/com/eventmanagement/config/SecurityConfig.java:29`, `backend/src/main/java/com/eventmanagement/service/SupabaseAuthService.java:22`, `backend/src/main/java/com/eventmanagement/config/RequestIdFilter.java:12`, `backend/src/main/java/com/eventmanagement/config/WebSocketConfig.java:14`).  
- **Host enablement.** Host requests are managed by `HostAccessRequestController`/`HostAccessRequestService`, providing a workflow for admin approval of new organizers (`backend/src/main/java/com/eventmanagement/controller/HostAccessRequestController.java:17`, `backend/src/main/java/com/eventmanagement/service/HostAccessRequestService.java:19`).  
- **File uploads & storage.** File assets upload to either local disk or Supabase storage with validation, metadata tracking and signed URLs through `FileController` and `FileStorageService` (`backend/src/main/java/com/eventmanagement/controller/FileController.java:12`, `backend/src/main/java/com/eventmanagement/service/FileStorageService.java:31`).  
- **Configuration defaults.** `application.yml` already sets CORS, actuator, datasource, multipart, Flyway and QR-secret defaults, so extending behavior just means adding more entries under `app.*` or `management.*` (`backend/src/main/resources/application.yml:56`, `backend/src/main/resources/application.yml:91`).  
- **Domain model & auditing hooks.** `Event` carries `organizationId` (`backend/src/main/java/com/eventmanagement/model/Event.java:32`), `User` persists role/email/full name (`backend/src/main/java/com/eventmanagement/model/User.java:22`, `backend/src/main/java/com/eventmanagement/model/User.java:27`), and `Registration` already captures status, seat, waitlist and audit timestamps (`backend/src/main/java/com/eventmanagement/model/Registration.java:16`, `backend/src/main/java/com/eventmanagement/model/Registration.java:25`).  

## 2. Performance, scalability, and concurrent request handling

**Why:** Enterprises prioritize a backend that remains responsive under bursts, maximizes throughput, and keeps user-facing latency low without sacrificing ACID safety.  
**Current hooks:** `EventService` already delivers filtered, paginated listings and `RegistrationService` drives seat assignment plus waitlist churn while broadcasting via `SimpMessagingTemplate` (`backend/src/main/java/com/eventmanagement/service/EventService.java:36`, `backend/src/main/java/com/eventmanagement/service/RegistrationService.java:90`, `backend/src/main/java/com/eventmanagement/service/RegistrationService.java:573`). These flows are central to every request path, so tuning them unlocks better scaling.
**Free-tier additions:**  
  - Introduce a lightweight caching layer backed by Redis (available on free tiers) or Caffeine to reuse computed seat availability, event listings, and pricing details and avoid hitting Postgres for identical filters.  
  - Make registration/check-in flows asynchronous where safe: offload heavy QR generation or notification dispatch to Spring `@Async` workers, limit threads via custom executors, and keep the main servlet threads focused on request turnaround.  
  - Apply optimistic locking/row-version checks on `Event` and `Registration` updates so concurrent edits fail fast and callers can retry gracefully; Spring Data JPA supports this with minimal annotations.  
  - Enable HTTP/2 or keep-alive-friendly connectors (configured in `application.yml`) and tune HikariCP to use the lower-latency connection pool settings already defined (`backend/src/main/resources/application.yml:18-40`), ensuring the database can serve more concurrent JDBC sessions.

## 3. Database resilience, ACID properties, and user handling

**Why:** To maintain trust, event operations must stay ACID-compliant, keep user data consistent, and gracefully handle conflicts even during spikes.  
**Current hooks:** `RegistrationService` already wraps bookings within `@Transactional`, uses `eventRepository.findByIdForUpdate` to lock rows, and relies on Postgres via Flyway-managed migrations (`backend/src/main/java/com/eventmanagement/service/RegistrationService.java:57`, `backend/src/main/resources/db/migration/V7__event_price_amount.sql`). The `User` entity persists roles and metadata that feed into authorization decisions.  
**Free-tier additions:**  
  - Explicitly set Postgres isolation levels for the busiest flows (e.g., `SERIALIZABLE` or `REPEATABLE_READ`) inside transactional boundaries and log any serialization failures so retries can be triggered by SAP-style policies.  
  - Define derived materialized views or indexed expression columns for high-cardinality filters (e.g., categorization, location) to keep reads fast; update them via triggers or scheduled jobs without extra paid tools.  
  - Harden user tenants by defaulting to well-scoped queries (`AuthService.validateAuth` already enforces identity) and running routine consistency checks between `users`, `registrations`, and `events` in nightly Spring `@Scheduled` jobs.  
  - Consider Postgres partitioning or sharding by time/location for large event systems, coupled with connection-pooling best practices already present in `application.yml`, to keep ACID under load.

## 4. Observability with Prometheus & Grafana

**Why:** Enterprises need transparent SLAs, monitoring of throughput/latency, and the ability to pivot from metrics dashboards when incidents arise.  
**Current hooks:** `RequestIdFilter` already tags requests (`backend/src/main/java/com/eventmanagement/config/RequestIdFilter.java:12`) and Actuator currently exposes `/health`/`/info` (`backend/src/main/resources/application.yml:91`).  
**Free-tier additions:**  
  - Enable Micrometer + Prometheus registry via `spring-boot-starter-actuator`, expose `/actuator/prometheus`, and create counters/timers around `EventController` pagination, registration successes/failures, and QR issuance latencies.  
  - Wire those metrics to a Prometheus + Grafana stack (both free/self-hostable) to visualize throughput, error rates, database connection use, and queue depth for async tasks.  
  - Attach the existing request ID to logs and metric tags so Grafana dashboards can link errors to specific inbound requests and `RequestIdFilter` correlations continue to function.
  - Collect GC, thread pool, and JDBC pool metrics via Micrometer to spot saturation early and adjust `SimpMessagingTemplate` or executor thread counts proactively.
  - The same observability push keeps `server.http2.enabled`, Tomcat keep-alive/thread tuning, and Hikari validation/leak detection in `application.yml` aligned so metrics match the higher-concurrency runtime.

## Next steps

1. Prioritize tuning the registration/event hot paths (caching + async) to keep concurrent requests fast while riding the existing `SimpMessagingTemplate` broadcast pipeline.  
2. Harden Postgres transactions and user consistency checks with isolation-level guards, retry logic, and maintenance jobs that rely solely on Flyway-managed migrations.  
3. Turn on Micrometer + Prometheus, connect Grafana dashboards, and extend `RequestIdFilter` logs so every incident can be traced to a request identifier.
