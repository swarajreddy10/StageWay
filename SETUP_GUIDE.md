# 🚀 StageWay Setup Guide

## 📋 Prerequisites

### Required Software
```bash
# Backend
Java 21+
Maven 3.6+
PostgreSQL 15+ (for production/local dev)

# Frontend  
Node.js 18+ or Bun 1.3.4+

# Optional
Docker & Docker Compose
```

## 🏠 Local Development Setup

### Option 1: System PostgreSQL Setup (Recommended)

1. **Install & Setup PostgreSQL**
```bash
# Automated setup
chmod +x setup-postgres.sh
./setup-postgres.sh

# Manual setup (Ubuntu/Debian)
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb eventmanagement
sudo -u postgres psql -c "CREATE USER stageway WITH PASSWORD 'stageway123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE eventmanagement TO stageway;"

# Manual setup (macOS)
brew install postgresql@15
brew services start postgresql@15
createdb eventmanagement
psql postgres -c "CREATE USER stageway WITH PASSWORD 'stageway123';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE eventmanagement TO stageway;"

# Manual setup (Windows)
# Download from https://www.postgresql.org/download/windows/
# Or: choco install postgresql
```

2. **Start Backend**
```bash
cd backend
./mvnw spring-boot:run -Dspring.profiles.active=dev
```

### Option 2: Docker Setup (Easiest)

1. **Start Services**
```bash
# From project root
docker-compose up -d postgres redis
```

2. **Configure Backend**
```bash
# Use default Docker settings in backend/.env
DATABASE_URL=jdbc:postgresql://localhost:5432/postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
```

3. **Start Backend**
```bash
cd backend
./mvnw spring-boot:run
```

### Option 3: H2 Demo Mode (Testing Only)

Current setup - works but limited functionality.

## 🌐 Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
bun install  # or npm install
```

2. **Configure Environment**
```bash
# Copy template
cp .env.example .env.local

# Edit .env.local
NEXT_PUBLIC_API_URL=http://localhost:8081
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. **Start Frontend**
```bash
bun dev  # or npm run dev
```

## 🧪 Testing Setup

### Backend Tests

1. **Unit Tests (H2)**
```bash
cd backend
./mvnw test
```

2. **Integration Tests (PostgreSQL)**
```bash
# Requires PostgreSQL running
./mvnw test -Dspring.profiles.active=integration
```

3. **Load Tests**
```bash
# Only works with PostgreSQL (connection pooling)
./mvnw test -Dtest=ConnectionPoolLoadTest
```

### Frontend Tests

1. **Fix Test Environment**
```bash
# Install jsdom for window object
cd frontend
bun add -D jsdom @types/jsdom

# Update test setup
echo 'import "jsdom-global/register";' > src/test-setup.ts
```

2. **Run Tests**
```bash
bun test        # Unit tests
bun test:e2e    # Integration tests (requires backend running)
```

## 🏭 Production Setup (Supabase)

### Backend Production

1. **Get Supabase Connection Details**
```bash
# From Supabase Dashboard > Settings > Database
Host: db.your-project-ref.supabase.co
Database: postgres
Port: 5432
User: postgres
Password: [your-db-password]
```

2. **Configure Environment**
```bash
# Copy production template
cp backend/.env.prod backend/.env

# Edit with your Supabase details
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
# ... other Supabase keys
```

3. **Deploy Backend**
```bash
# Build for production
./mvnw clean package -Pprod

# Deploy to your platform
# Vercel: vercel deploy
# Railway: railway deploy
# Heroku: git push heroku main
# Docker: docker build -t stageway-backend .
```

### Supabase Database Setup

1. **Run Migrations**
```sql
-- In Supabase SQL Editor, run your Flyway migrations manually
-- Or enable Flyway in production (recommended)
```

2. **Connection Pool Optimization**
```yaml
# Supabase has connection limits:
# Free tier: 60 connections
# Pro tier: 200 connections
# Adjust hikari.maximum-pool-size accordingly
```

### Frontend Production

1. **Build Configuration**
```bash
# .env.production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
```

2. **Build & Deploy**
```bash
# Build
bun run build

# Deploy (various options)
# Vercel: vercel deploy
# Netlify: netlify deploy --prod
# Docker: docker build -t stageway-frontend .
```

## 🐳 Docker Production

1. **Complete Stack**
```bash
# Production docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

2. **Environment Setup**
```bash
# Create production .env files
cp backend/.env.example backend/.env.prod
cp frontend/.env.example frontend/.env.prod
# Edit with production values
```

## 🔧 Configuration Profiles

### Backend Profiles

- `default` - H2 demo mode
- `dev` - PostgreSQL development  
- `test` - H2 with test data
- `prod` - PostgreSQL production

### Usage
```bash
# Development
./mvnw spring-boot:run -Dspring.profiles.active=dev

# Testing
./mvnw test -Dspring.profiles.active=test

# Production
java -jar -Dspring.profiles.active=prod app.jar
```

## 📊 Monitoring & Health Checks

### Backend Health
```bash
curl http://localhost:8081/actuator/health
curl http://localhost:8081/actuator/info
```

### Database Health
```bash
# Connection pool metrics
curl http://localhost:8081/actuator/metrics/hikaricp.connections.active
```

### Frontend Health
```bash
curl http://localhost:3000/api/health
```

## 🚨 Troubleshooting

### Common Issues

1. **Connection Pool Exhaustion**
```bash
# Check active connections
curl http://localhost:8081/actuator/metrics/hikaricp.connections

# Increase pool size in application.yml
spring.datasource.hikari.maximum-pool-size: 200
```

2. **Database Migration Failures**
```bash
# Reset migrations (development only)
./mvnw flyway:clean flyway:migrate

# Check migration status
./mvnw flyway:info
```

3. **Frontend API Errors**
```bash
# Check CORS configuration
# Verify API_URL in .env.local
# Check network tab in browser dev tools
```

## 🎯 Quick Start Commands

### Quick Start Commands

### System PostgreSQL Setup (Best)
```bash
# 1. Setup PostgreSQL
./setup-postgres.sh

# 2. Start backend
cd backend && ./mvnw spring-boot:run -Dspring.profiles.active=dev

# 3. Start frontend  
cd frontend && bun dev

# 4. Run tests
./mvnw test -Dspring.profiles.active=dev
```

### Production Deployment
```bash
# 1. Build backend
cd backend && ./mvnw clean package -Pprod

# 2. Build frontend
cd frontend && bun run build

# 3. Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d
```

This setup ensures:
- ✅ Proper connection pooling with PostgreSQL
- ✅ Comprehensive testing capabilities  
- ✅ Production-ready configuration
- ✅ Easy local development
- ✅ Monitoring and health checks