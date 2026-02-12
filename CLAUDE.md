# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StageWay — a full-stack event management platform. Spring Boot 3.2.4 (Java 21) backend with Next.js 16 (React 19, TypeScript) frontend. Authentication via Supabase JWT. PostgreSQL in production, H2 in-memory for local development/testing.

## Build & Run Commands

### Backend (from `backend/`)

```bash
# Run with H2 in-memory (default, no DB setup needed)
./mvnw spring-boot:run

# Run with PostgreSQL (requires docker-compose up -d)
./mvnw spring-boot:run -Dspring.profiles.active=dev

# Run all tests
./mvnw test

# Run single test class
./mvnw test -Dtest=EventServiceTest

# Run single test method
./mvnw test -Dtest=EventServiceTest#createEvent_requiresName

# Checkstyle lint
./mvnw checkstyle:check

# Build production JAR
./mvnw clean package -Pprod

# Flyway migration commands (dev profile only)
./mvnw flyway:migrate -Dspring.profiles.active=dev
./mvnw flyway:info -Dspring.profiles.active=dev
```

### Frontend (from `frontend/`)

```bash
bun install          # Install dependencies
bun dev              # Dev server on :3000
bun run build        # Production build
bun run lint         # ESLint
bun run typecheck    # TypeScript check
bun run format:check # Prettier check
bun run verify       # lint + typecheck + audit
bun test             # Run tests (Bun test runner)
bun test:coverage    # Tests with coverage
```

### Infrastructure

```bash
docker-compose up -d   # Start PostgreSQL (:5432) and Redis (:6379)
```

## Architecture

### Backend (`backend/src/main/java/com/eventmanagement/`)

Standard Spring Boot layered architecture:

- **controller/** — REST endpoints. Security via `@PreAuthorize("hasRole('HOST')")` annotations.
- **service/** — Business logic. Key services: `EventService` (caching + Specification-based filtering), `RegistrationService` (capacity management, waitlisting, QR check-in with HMAC-SHA256 signing), `SeatService` (auto-assignment), `AnalyticsService`.
- **model/** — JPA entities: `Event`, `Registration`, `User`, `FileUpload`, `HostAccessRequest`. Events and Registrations use optimistic locking (`version` column).
- **repository/** — Spring Data JPA. `EventRepository` extends `JpaSpecificationExecutor` for dynamic filtering. Pessimistic locking via `findByIdForUpdate()`.
- **dto/** — ~45 record/POJO DTOs for request/response shapes.
- **config/** — `SecurityConfig` (stateless sessions, Supabase JWT filter, CORS), `CacheConfig` (Caffeine: `eventsByFilter` 5min, `seatAvailability` 2min), `AsyncConfig` (thread pool for registration updates), `WebSocketConfig` (STOMP over SockJS at `/ws`).
- **exception/** — Global exception handler.

**Database migrations**: Flyway, `backend/src/main/resources/db/migration/` (V1–V13).

**Spring profiles**: `default` (H2), `dev` (PostgreSQL localhost), `prod` (Supabase PostgreSQL). Config in `application.yml`, `application-dev.yml`, `application-prod.yml`.

**Ports**: Backend :8081, H2 console at `/h2-console` (default profile only).

### Frontend (`frontend/src/`)

Next.js App Router with file-based routing:

- **app/** — Pages and layouts. Key routes: `/events`, `/events/[id]`, `/events/new`, `/dashboard`, `/registrations`, `/check-in`, `/analytics`, `/admin/host-requests`, `/auth/*`.
- **components/** — Organized by feature (`analytics/`, `auth/`, `checkin/`, `events/`, `registration/`, `waitlist/`) plus `ui/` (shadcn/ui primitives) and `shared/` (PageHeader, StatCard, EmptyState).
- **stores/** — Zustand stores: `authStore` (user session), `eventStore` (event CRUD + pagination).
- **hooks/** — `useEvents`, `useRegistrations`, `useDebounce`, `useAutosave`.
- **lib/** — API client (`api.ts`, `api-client.ts`) with 60s timeout and Bearer token auth. Feature-specific API modules (`event-api.ts`, `registration-api.ts`, `analytics-api.ts`). Route constants in `api-routes.ts`. Supabase client in `supabase.ts`.
- **types/** — TypeScript interfaces for all domain objects.

**State**: Zustand for client state, TanStack React Query for server state (5min stale time).
**Styling**: Tailwind CSS 4 + shadcn/ui (Radix UI) + Framer Motion.
**Path alias**: `@/*` maps to `./src/*`.

### Auth Flow

1. Frontend authenticates via Supabase (email/password or Google OAuth)
2. Supabase JWT sent as `Authorization: Bearer <token>` to backend
3. `SupabaseAuthenticationFilter` verifies token and populates SecurityContext
4. Roles: ATTENDEE (default), HOST (event management), ADMIN (full access)

### API Proxy

Frontend Next.js rewrites `/api/*` requests to backend at `localhost:8081` (see `next.config.mjs`).

## Code Style

### Backend
- Checkstyle enforced: max 120 char lines, max 220 line methods, no `System.out` (use logger)
- Java naming: camelCase parameters/members, UPPER_SNAKE constants

### Frontend
- ESLint (Next.js core-web-vitals), Prettier (single quotes, semicolons, trailing commas)
- Strict TypeScript
