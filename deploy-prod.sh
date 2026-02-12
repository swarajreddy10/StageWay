#!/bin/bash

# 🚀 StageWay Production Deployment Script

set -e

echo "🎭 Deploying StageWay to Production (Supabase)..."

# Check if production environment is configured
if [ ! -f "backend/.env.prod" ]; then
    echo "❌ Production environment not configured!"
    echo "   Copy backend/.env.prod and configure with your Supabase details"
    exit 1
fi

# Load production environment
source backend/.env.prod

# Validate required environment variables
required_vars=("DATABASE_URL" "SUPABASE_URL" "SUPABASE_ANON_KEY" "QR_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Missing required environment variable: $var"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Build backend
echo "🔧 Building backend for production..."
cd backend
./mvnw clean package -Pprod -DskipTests

if [ $? -eq 0 ]; then
    echo "✅ Backend build successful"
else
    echo "❌ Backend build failed"
    exit 1
fi

# Build frontend
echo "🎨 Building frontend for production..."
cd ../frontend

# Check if bun is available
if command -v bun &> /dev/null; then
    bun run build
else
    npm run build
fi

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

cd ..

echo ""
echo "🎉 Build completed successfully!"
echo "================================"
echo "📦 Backend JAR: backend/target/backend-0.1.0.jar"
echo "📦 Frontend: frontend/.next/ or frontend/out/"
echo ""
echo "🚀 Deployment options:"
echo "1. Vercel (Frontend): vercel deploy --prod"
echo "2. Railway (Backend): railway deploy"
echo "3. Heroku (Backend): git push heroku main"
echo "4. Docker: docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "🔧 Environment setup:"
echo "   Backend profile: prod"
echo "   Database: Supabase PostgreSQL"
echo "   Auth: Supabase"
echo ""
echo "📊 Health check after deployment:"
echo "   curl https://your-backend-url/actuator/health"