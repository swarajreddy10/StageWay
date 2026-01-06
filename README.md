# StageWay

StageWay is a full-stack event management platform built as a professional showcase of end-to-end product delivery, problem solving, and Spring Boot engineering. It combines a modern Next.js frontend with a secure Spring Boot backend, Supabase auth/storage, and a clean deployment pipeline.

## Project Goals
- Ship a production-ready event platform with clear role separation (attendee, host, admin).
- Demonstrate full-stack ownership: architecture, security, UI, backend, and deployment.
- Keep the system practical, testable, and easy to extend.

## Demo Links
| Item | Link |
| --- | --- |
| Frontend (Vercel) | https://stage-way.vercel.app |
| Backend (Render) | https://stageway-lste.onrender.com |
| Health Check | https://stageway-lste.onrender.com/actuator/health |
| Docs | `docs/DEPLOYMENT_RENDER_VERCEL_GUIDE.md` |

## Tech Stack (with rationale)
| Layer | Tech | Why |
| --- | --- | --- |
| Frontend | Next.js 16 + React 19 + TypeScript | Modern app routing, SSR where needed, type-safe UI. |
| UI | Tailwind CSS + shadcn/ui (Radix) | Fast iteration, consistent primitives, accessible components. |
| State + Forms | Zustand, React Hook Form, Zod | Predictable state, validated forms, strong typing. |
| Backend | Java 21 + Spring Boot 3.2 | Mature ecosystem, strong security, high performance. |
| Data | PostgreSQL + Spring Data JPA | Reliable relational data modeling with strong tooling. |
| Migrations | Flyway | Versioned, repeatable DB migrations. |
| Auth | Supabase Auth (JWT) | Secure, managed OAuth and token lifecycle. |
| Storage | Supabase Storage | Simple file storage with public/signed URL support. |
| Realtime | Spring WebSocket | Live updates and future streaming use cases. |
| Deploy | Render (backend), Vercel (frontend) | Simple managed deployments for each tier. |
| CI | GitHub Actions | Automated builds for backend and frontend. |

## Core Features
- Supabase JWT auth (Google OAuth supported).
- Role-based access: attendee, host, admin.
- Host access request + admin approval workflow.
- Event creation, editing, and publishing.
- Event discovery with reusable event cards.
- Event registration and attendee management.
- QR code generation for check-in.
- File uploads to Supabase Storage (public or signed URLs).
- Analytics endpoints for event insights.
- Health checks via Spring Actuator.

## Architecture at a Glance
- **Frontend**: Next.js app that calls backend REST APIs.
- **Backend**: Spring Boot REST API + WebSocket.
- **Auth**: Supabase issues JWT; frontend sends `Authorization: Bearer <token>`.
- **Data**: PostgreSQL with Flyway migrations.
- **Storage**: Supabase Storage, metadata stored in DB.

## Roles and Access Model
| Role | Capabilities |
| --- | --- |
| Attendee | Browse events, register, manage attendance. |
| Host | Create/edit events, upload banners, manage registrations. |
| Admin | Approve host requests, manage role upgrades. |

Host access is not self-service by default. Users submit a request; admins approve via the admin UI or API.

## Repository Structure
- `backend/`: Spring Boot API
- `frontend/`: Next.js app
- `docs/`: Design, deployment, and implementation notes
- `.github/workflows/`: CI workflows
- `docker-compose.yml`: Local multi-service dev

## Local Development Quickstart
Prereqs:
- Java 21
- Bun 1.3.x (or Node, but Bun is preferred here)
- Docker Desktop (optional but recommended)

1) Start infra (optional):
```bash
docker compose up -d
```

2) Run backend:
```bash
cd backend
./mvnw spring-boot:run
```

3) Run frontend:
```bash
cd frontend
bun install
bun dev
```

4) Health checks:
- Backend: `http://localhost:8081/actuator/health`
- Frontend: `http://localhost:3000`

## Environment Variables

### Backend
| Name | Required | Example / Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | `jdbc:postgresql://HOST:5432/postgres?sslmode=require` |
| `DATABASE_USERNAME` | Yes | `postgres` |
| `DATABASE_PASSWORD` | Yes | `your-db-password` |
| `SUPABASE_URL` | Yes | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Required for uploads |
| `SUPABASE_STORAGE_BUCKET` | Yes | e.g. `stageway-assets` |
| `CORS_ALLOWED_ORIGINS` | Yes | `https://your-frontend-domain` |
| `QR_SECRET` | Yes | 32+ chars |
| `APP_SECURITY_ADMIN_EMAILS` | No | Comma-separated admin emails |
| `APP_SECURITY_ALLOW_SELF_UPGRADE` | No | `true` only for staging |
| `SPRING_MAIN_LAZY_INITIALIZATION` | No | `true` for faster boot |

### Frontend
| Name | Required | Example / Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | `https://your-render-domain` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `NEXT_PUBLIC_FILE_API_BASE_URL` | No | Defaults to API base URL |

## Scripts

### Backend
```bash
./mvnw -DskipTests package
./mvnw test
```

### Frontend
```bash
bun run dev
bun run build
bun run lint
bun run typecheck
bun run verify
```

## Deployment
Use the step-by-step guide:
- `docs/DEPLOYMENT_RENDER_VERCEL_GUIDE.md`

Key notes:
- Backend is Docker-only on Render.
- Frontend is deployed on Vercel.
- Supabase OAuth redirect URLs must include your Vercel domain.

## About This Project
StageWay is a full-stack demonstration of building a production-grade system with Spring Boot and modern React. The goal is to show clean architecture, practical security decisions, and real-world deployment readiness.

If you are reviewing this as a hiring signal: I intentionally focused on clarity, stability, and scalable patterns over quick hacks.
