# Project Status and Setup Guide

This file summarizes what is done, what is left, and exactly what to configure per phase to run the system locally or in a simple environment.

Note: The current codebase runs JWT-only auth (Supabase tokens) and no longer uses Redis sessions. See `docs/MVP_STABILIZATION.md` for the latest deploy steps.

## Completion Summary

- **Backend Service**: Completed
  - Single Spring Boot application with all business logic
  - JWT authentication, CORS, database integration
  - Events, users, registrations, seat allocation, notifications
  - WebSocket support, QR code generation, analytics endpoints
  - Redis-based session management (production-ready)
  - Flyway database migrations
  - Modern configuration with application.yml
  - Cleaned codebase with no dead code or outdated patterns

- **Frontend Service**: Completed  
  - Next.js application with TypeScript
  - Authentication flow, event management UI
  - Registration interface, real-time updates
  - Analytics dashboard, QR code scanning
  - Mobile-responsive design

## Architecture Overview

- **Two-Service Design**: Frontend (Next.js) + Backend (Spring Boot)
- **Communication**: REST APIs + WebSocket for real-time features
- **Database**: Single PostgreSQL database with Flyway migrations
- **Session Management**: Redis-based sessions (scalable, production-ready)
- **Caching**: Redis for performance optimization
- **File Storage**: Local storage with future Cloudinary integration

## Recent Modernization (Completed)

### Dead Code Removal
- Removed duplicate fields in User entity (`name`, `password`)
- Eliminated in-memory session management (HashMap-based)
- Cleaned up unused imports and dependencies
- Removed obsolete helper methods and records

### Modern Patterns Applied
- **Session Management**: Replaced in-memory HashMap with Redis-based SessionService
- **Database Migrations**: Replaced JPA auto-create with Flyway migrations
- **Configuration**: Migrated to modern application.yml structure
- **Timezone Handling**: Consistent UTC usage across all entities
- **Field Consistency**: Single source of truth (fullName, passwordHash)

### Production-Ready Improvements
- Redis session storage with proper serialization
- Database schema with indexes and foreign key constraints
- Environment variable support for all configurations
- Proper connection pooling and resource management
- Scalable architecture ready for horizontal scaling

- Add comprehensive test coverage (integration and e2e tests)
- Implement Redis message broker for production-scale WebSocket
- Add interactive seat map visualization
- Expand analytics with charts and predictive features
- Add file validation, virus scanning, and CDN integration
- Implement rate limiting, audit logs, and observability stack

## Step-by-Step Local Setup

1) **Start infrastructure**
   - `docker compose up -d`
   - This creates PostgreSQL database, Redis, and Mailhog

2) **Run backend service**
   - `cd backend`
   - `./mvnw spring-boot:run`
   - Backend starts on http://localhost:8081

3) **Run frontend service**
   - `cd frontend`
   - `npm install`
   - `npm run dev`
   - Frontend starts on http://localhost:3000

4) **Quick health checks**
   - Backend API: `http://localhost:8081/actuator/health`
   - Frontend: `http://localhost:3000`
   - Swagger UI: `http://localhost:8081/swagger-ui.html`

## Configuration by Service

### Backend Service Configuration

Backend (`backend/src/main/resources/application.yml`)
- `SERVER_PORT` (default 8081)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` (min 32 chars)
- `JWT_ISSUER`
- `CORS_ALLOWED_ORIGINS` (default `http://localhost:3000`)
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` (optional)
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`
- `QR_SECRET` (min 32 chars)
- `NOTIFICATION_ENABLED` (true/false)
- `NOTIFICATION_FROM` (email sender address)
- `GOOGLE_CLIENT_ID` (optional, for OAuth)

**Key Features:**
- Redis session management with 1-hour TTL
- Flyway database migrations (automatic on startup)
- Spring Session for distributed session storage
- HikariCP connection pooling
- WebSocket support for real-time updates

### Frontend Service Configuration

Frontend (`frontend/.env.local`)
- `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8081`)
- `NEXT_PUBLIC_WS_URL` (default `ws://localhost:8081/ws`)

## Notes

- **Single Backend**: All business logic consolidated in one Spring Boot service
- **Database**: Single PostgreSQL database with Flyway migrations for version control
- **Session Management**: Redis-based sessions (no in-memory storage)
- **Authentication**: JWT tokens with Redis session validation
- **Real-time**: WebSocket connection for live updates
- **Email Testing**: Mailhog included in docker compose for local development
- **Production**: Replace local services with managed cloud services
- **Code Quality**: Clean codebase with modern patterns, no dead code
- **Scalability**: Horizontal scaling ready with Redis sessions
