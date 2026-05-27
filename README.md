
# 🎫 StageWay - Event Management Platform

A modern full-stack platform for creating, managing, and attending events with seamless registration and QR code check-in functionality.

---

## ✨ What's Built

### 🎯 **Core Event Management**
- **Event Creation & Editing**: Hosts can create events with details like name, description, dates, venue, capacity, and pricing
- **Event Discovery**: Browse and search events with filters for category, date range, location, and price
- **Event Status Management**: Draft, published, and completed event states
- **Venue Information**: Support for venue name, address, and city details

### 👥 **User Registration & Authentication**
- **Supabase Authentication**: Secure OAuth-based authentication system
- **Role-Based Access**: User, Host, and Admin roles with appropriate permissions
- **Profile Management**: User profile updates and authentication state management
- **Host Request System**: Users can request host privileges with admin approval workflow

### 📝 **Event Registration System**
- **Event Registration**: Users can register for events with attendee information
- **Registration Management**: View, manage, and cancel event registrations
- **Waitlist Support**: Automatic waitlist when events reach capacity
- **QR Code Generation**: Each registration gets a unique QR code for check-in

### 📱 **Check-In System**
- **QR Code Scanning**: Hosts can scan QR codes for quick check-in
- **Manual Check-In**: Backup manual check-in option for hosts
- **Check-In Tracking**: Complete audit trail of who checked in and when
- **Attendee Management**: Hosts can view event attendees and check-in status

### 📊 **Basic Analytics**
- **Event Analytics**: Hosts can view registration and check-in statistics for their events
- **Overview Dashboard**: Analytics overview for host users
- **Attendee Statistics**: Basic attendee demographics and engagement data

### 🔐 **Admin Features**
- **User Management**: Admins can update user roles
- **Host Request Approval**: Admin panel for reviewing and approving host access requests
- **System Administration**: Administrative oversight of platform users

---

## 🏗️ Technical Architecture

### **Backend Stack**
- **Java 21** with **Spring Boot 3.2.4** - Modern, performant backend framework
- **PostgreSQL 18.3** - Primary database with Flyway migrations
- **Redis 8.4.2** - Caching and session management
- **Spring Security** - Authentication and authorization with JWT
- **Supabase Integration** - OAuth authentication provider
- **ZXing Library** - QR code generation and processing

### **Frontend Stack**
- **Next.js 16.1.1** with App Router - Modern React framework
- **TypeScript** - Type-safe development
- **Tailwind CSS 4.1.18** - Utility-first styling
- **Radix UI + shadcn/ui** - Accessible UI components
- **Zustand** - Lightweight state management
- **React Hook Form + Zod** - Form handling and validation
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization for analytics

### **Infrastructure**
- **Docker & Docker Compose** - Containerized deployment
- **Cloudinary** - Image storage and CDN (configured)
- **RESTful API Design** - Clean, documented endpoints
- **Role-Based Security** - Method-level authorization

---

## 🚀 Quick Start

### **Prerequisites**
```bash
Docker & Docker Compose
Bun 1.3.4+ (or Node.js 18+)
```

### **Setup & Run**

1. **Clone the repository**
```bash
git clone <repository-url>
cd stageway
```

2. **Configure environment**
```bash
# Backend — copy and fill in your Supabase credentials
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env.local
```

3. **Start**
```bash
docker-compose up -d

# First run or after version upgrades — wipe volumes first:
docker-compose down -v && docker-compose up -d
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8081
- Health Check: http://localhost:8081/actuator/health

---

## 🚢 Deploy Backend on Render (Docker)

This repository now includes a production-ready Render Blueprint at `render.yaml` for the backend service.

### Important Free Tier Reality
- Render Free web services spin down after 15 minutes of inactivity and take about ~1 minute to spin up again.
- Free web services also use an ephemeral filesystem (local files are lost on restart/redeploy/spin-down).
- If you need truly always-on behavior, move the service to a paid Render plan.

### One-Time Setup
1. Push this repository to GitHub/GitLab.
2. In Render, create a new **Blueprint** and point it to this repo.
3. Render will read `render.yaml` and prompt for `sync: false` secrets.
4. Set all required backend env vars (database, Supabase, CORS, QR secret, admin emails).
5. Deploy.

### What `render.yaml` configures
- Docker runtime using `backend/Dockerfile`
- `healthCheckPath: /actuator/health`
- `SPRING_PROFILES_ACTIVE=prod`
- Free plan (`plan: free`)
- Graceful shutdown window (`maxShutdownDelaySeconds: 120`)
- Build filter so backend deploys are triggered only by `backend/**` changes

---

## 📚 API Overview

### **Authentication**
- `POST /api/auth/supabase` - Supabase OAuth authentication
- `GET /api/auth/user` - Get current user info
- `POST /api/auth/logout` - Logout user
- `PUT /api/users/profile` - Update user profile

### **Events**
- `GET /api/events` - List events with filtering and pagination
- `POST /api/events` - Create new event (Host only)
- `GET /api/events/{id}` - Get event details
- `PUT /api/events/{id}` - Update event (Host only)
- `DELETE /api/events/{id}` - Delete event (Host only)
- `GET /api/events/mine` - Get my events (Host only)

### **Registrations**
- `POST /api/registrations` - Register for event
- `GET /api/registrations/me` - Get my registrations
- `DELETE /api/registrations/{id}` - Cancel registration
- `GET /api/registrations/{id}/qr` - Get registration QR code
- `POST /api/registrations/check-in` - Check in by QR code (Host only)

### **Analytics**
- `GET /api/analytics/overview` - Get analytics overview (Host only)
- `GET /api/analytics/events/{id}` - Get event analytics (Host only)

### **Admin**
- `PUT /api/admin/users/{id}/role` - Update user role (Admin only)
- `GET /api/admin/host-requests` - List host requests (Admin only)
- `PUT /api/admin/host-requests/{id}` - Review host request (Admin only)

---

## 🛠️ Development

### **Backend Development**
```bash
# Start all services
docker-compose up -d

# Rebuild backend after code changes
docker-compose up -d --build stageway-api

# View logs
docker-compose logs -f stageway-api

# Run tests (inside container)
docker-compose exec stageway-api java -jar app.jar --spring.profiles.active=dev
```

**Test Coverage:**
- ✅ **9 tests passing** - All backend tests successful
- **Controller Tests** (3 tests)
  - `AuthControllerTest` - Supabase authentication flow
  - `EventControllerTest` - Event CRUD operations
- **Service Tests** (6 tests)
  - `AuthServiceTest` - User authentication, role management, admin privileges
  - `EventServiceTest` - Event creation, updates, and business logic

**Test Results:**
```
Tests run: 9, Failures: 0, Errors: 0, Skipped: 0
✅ BUILD SUCCESS
```

### **Frontend Development**
```bash
cd frontend
bun install                # Install dependencies
bun dev                    # Start dev server
bun verify                 # Run all checks (lint + typecheck + audit)
bun run lint               # ESLint check
bun run typecheck          # TypeScript check
bun audit                  # Security audit
```

**Verification Results:**
```
✅ ESLint: No errors or warnings
✅ TypeScript: Type checking passed
✅ Security: No vulnerabilities found
```

### **Database Management**
```bash
# Access database
docker-compose exec stageway-db psql -U postgres -d eventmanagement

# Flyway migrations run automatically on startup via application-dev.yml
```

---

## 🏛️ Project Structure

```
├── backend/
│   ├── src/main/java/com/eventmanagement/
│   │   ├── controller/     # REST API endpoints
│   │   ├── service/        # Business logic
│   │   ├── model/          # JPA entities
│   │   ├── dto/            # Data transfer objects
│   │   ├── repository/     # Data access layer
│   │   └── config/         # Configuration
│   └── src/main/resources/
│       ├── application.yml         # Shared base config
│       ├── application-dev.yml     # Docker dev profile (active by default)
│       ├── application-prod.yml    # Production profile
│       └── db/migration/           # Flyway migrations
├── frontend/
│   ├── src/app/            # Next.js App Router pages
│   ├── src/components/     # React components
│   ├── src/hooks/          # Custom React hooks
│   ├── src/lib/            # Utility functions
│   ├── src/stores/         # Zustand stores
│   └── src/types/          # TypeScript type definitions
└── docker-compose.yml      # Development environment
```

---

## 🔧 Configuration

### **Environment Profiles**
- `dev` — active in Docker via `SPRING_PROFILES_ACTIVE=dev`, connects to Supabase PostgreSQL, pool size 2-10, DEBUG logging
- `prod` — activate via `SPRING_PROFILES_ACTIVE=prod`, no defaults, all env vars required, Render-safe defaults for pool size and graceful shutdown

**Required env vars in `backend/.env`:**
```
CORS_ALLOWED_ORIGINS=
QR_SECRET=
SUPABASE_URL=
SUPABASE_ANON_KEY=
DATABASE_URL=
DATABASE_USERNAME=
DATABASE_PASSWORD=
```

**Additional production tuning vars (optional):**
```
DB_POOL_MIN_IDLE=1
DB_POOL_MAX_SIZE=8
APP_STORAGE_ALLOW_LOCAL_FALLBACK=false
```

### **Database Configuration**
- PostgreSQL (Supabase) with HikariCP connection pooling
- Flyway migrations run automatically on startup
- JPA/Hibernate with schema validation

### **Security Configuration**
- JWT-based authentication via Supabase
- Role-based authorization (USER, HOST, ADMIN)
- CORS configuration for frontend integration
- Input validation and SQL injection prevention

### **File Handling**
- Cloudinary integration for image storage
- Multipart file upload support (20MB limit)
- QR code generation using ZXing library

---

## 🎯 My Development Journey

### **Technical Challenges Solved**

**Authentication Architecture**
- Implemented Supabase OAuth integration with custom JWT validation
- Created role-based access control with method-level security
- Built secure token management and user session handling

**Event Management System**
- Designed comprehensive event data model with flexible pricing
- Implemented advanced filtering and search functionality
- Created pagination for large event lists

**Registration & Check-In Flow**
- Built complete registration lifecycle with waitlist support
- Implemented QR code generation and validation system
- Created efficient check-in process with audit trail

**Analytics Implementation**
- Developed real-time analytics for event performance
- Created data visualization components with Recharts
- Built role-based analytics access control

### **Key Learnings**

**Backend Development**
- Mastered Spring Boot ecosystem and dependency injection
- Learned advanced JPA patterns and database optimization
- Implemented security best practices with Spring Security

**Frontend Development**
- Became proficient with Next.js App Router and server components
- Mastered TypeScript for type-safe development
- Learned modern React patterns with hooks and state management

**Full-Stack Integration**
- Built seamless API integration between frontend and backend
- Implemented proper error handling and loading states
- Created responsive, accessible UI components

**DevOps & Deployment**
- Set up Docker containerization for development
- Configured database migrations and environment management
- Implemented proper logging and monitoring setup

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow existing code patterns and conventions
- Write tests for new functionality
- Update documentation as needed
- Ensure all tests pass before submitting

---

---

<div align="center">

**Built with ❤️ for the event community**

*Creating memorable experiences, one event at a time* 🎭

</div>
