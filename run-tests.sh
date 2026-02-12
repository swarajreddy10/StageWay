#!/bin/bash

echo "🚀 Running StageWay Test Suite"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if servers are running
echo "📡 Checking server status..."

# Check backend
if curl -s http://localhost:8081/actuator/health > /dev/null; then
    echo -e "${GREEN}✅ Backend server running on :8081${NC}"
else
    echo -e "${RED}❌ Backend server not running. Start with: cd backend && ./mvnw spring-boot:run${NC}"
    exit 1
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend server running on :3000${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend server not running. Start with: cd frontend && bun dev${NC}"
fi

echo ""
echo "🧪 Running Backend Tests..."
echo "============================"

cd backend

# Run the critical tests that would catch our bugs
echo "Testing RegistrationService (infinite recursion fix)..."
./mvnw test -Dtest=RegistrationServiceTest#saveRegistration_shouldNotRecurseInfinitely

echo "Testing Connection Pool (auto-scaling)..."
./mvnw test -Dtest=ConnectionPoolLoadTest#connectionPool_shouldScaleUnderLoad

echo "Testing Concurrent Registrations..."
./mvnw test -Dtest=RegistrationServiceTest#registerForEvent_shouldHandleConcurrentRegistrations

echo "Running all backend tests..."
./mvnw test

BACKEND_EXIT_CODE=$?

cd ..

echo ""
echo "🌐 Running Frontend Tests..."
echo "============================="

cd frontend

echo "Running integration tests..."
bun test src/__tests__/integration.test.ts

echo "Running all frontend tests..."
bun test

FRONTEND_EXIT_CODE=$?

cd ..

echo ""
echo "📊 Test Results Summary"
echo "======================="

if [ $BACKEND_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Backend Tests: PASSED${NC}"
else
    echo -e "${RED}❌ Backend Tests: FAILED${NC}"
fi

if [ $FRONTEND_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend Tests: PASSED${NC}"
else
    echo -e "${RED}❌ Frontend Tests: FAILED${NC}"
fi

echo ""
echo "🔍 Connection Pool Health Check..."
curl -s http://localhost:8081/api/health/database | jq '.'

echo ""
if [ $BACKEND_EXIT_CODE -eq 0 ] && [ $FRONTEND_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Your fixes are working correctly.${NC}"
    echo -e "${GREEN}✅ Infinite recursion bug: FIXED${NC}"
    echo -e "${GREEN}✅ Connection pool auto-scaling: WORKING${NC}"
    echo -e "${GREEN}✅ Concurrent registrations: HANDLED${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Check the output above for details.${NC}"
    exit 1
fi