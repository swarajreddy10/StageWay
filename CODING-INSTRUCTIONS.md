# Full-Stack Engineering Standards

> **Mission**: Build production systems through disciplined problem-solving, tech-agnostic principles, and modern tooling patterns.

---

## 0. Development Philosophy

### Core Principles

**Problem-First, Not Solution-First**
- Understand the problem deeply before coding
- Question assumptions and requirements
- Validate solutions before implementation

**Tech-Agnostic Thinking**
- Principles transcend specific technologies
- Choose tools that fit the problem, not trends
- Maintain portability across ecosystems

**Modern Tooling Patterns**
- Unified toolchains (Bun for JS, similar patterns elsewhere)
- Plug-and-play architecture (shadcn/ui model)
- Minimal configuration, maximum productivity

**Balanced Verbosity**
- Write enough code to be clear, not more
- Optimize for understanding, not brevity
- Complete implementations, no shortcuts

---

## 1. Problem-Solving Methodology

### Phase 1: Understanding

**Ask Before You Code**
```
1. What problem are we solving?
2. Who has this problem?
3. What's the impact if unsolved?
4. What constraints exist?
5. What does success look like?
```

**Requirements Gathering**
- Functional: What must the system do?
- Non-functional: Performance, security, scalability
- Business: Cost, timeline, resources
- Technical: Existing systems, data, APIs

**Anti-patterns**
- ❌ Starting to code immediately
- ❌ Assuming you understand without asking
- ❌ Skipping edge cases
- ❌ Ignoring non-functional requirements

---

### Phase 2: Brainstorming

**Generate Multiple Solutions**

For each approach, document:
```markdown
## Approach [N]: [Name]

**How it works**: [Brief explanation]

**Pros**:
- [Advantage 1]
- [Advantage 2]

**Cons**:
- [Disadvantage 1]
- [Disadvantage 2]

**Complexity**: [Low/Medium/High]
**Risk**: [Low/Medium/High]
**Time**: [Estimate]
```

**Evaluation Criteria**
- Simplicity vs Flexibility
- Performance vs Maintainability
- Time to market vs Long-term cost
- Build vs Buy
- Vendor lock-in risk

**Decision Making**
- Choose the simplest solution that meets requirements
- Document why alternatives were rejected
- Make trade-offs explicit

---

### Phase 3: Validation

**Before Writing Code**

1. **Design Review**
   - Sketch architecture diagrams
   - Define data models
   - Map API contracts
   - Identify integration points

2. **Prototype (if needed)**
   - Build throwaway spike for risky parts
   - Validate assumptions
   - Measure performance
   - Don't ship prototype code

3. **Peer Review**
   - Present design to team
   - Get feedback on approach
   - Identify blind spots
   - Refine based on input

4. **Break Down Work**
   - Split into small, testable units
   - Define acceptance criteria
   - Estimate effort
   - Identify dependencies

---

### Phase 4: Implementation

**Coding Principles**

**Start Simple**
```
1. Make it work (correctness)
2. Make it right (clean code)
3. Make it fast (optimization)
```

**Incremental Development**
- Build smallest working slice
- Test immediately
- Get feedback early
- Iterate based on learnings

**Code Quality Checklist**
- [ ] Follows language conventions
- [ ] Self-documenting (clear names)
- [ ] Single responsibility
- [ ] No duplication
- [ ] Handles errors gracefully
- [ ] Includes tests

---

### Phase 5: Testing

**Test Pyramid**
```
        ┌─────────┐
        │   E2E   │  ← Few, critical user journeys
        ├─────────┤
        │Integration│ ← Moderate, API contracts
        ├─────────┤
        │  Unit   │  ← Many, business logic
        └─────────┘
```

**Unit Testing**
- Test business logic in isolation
- Mock external dependencies
- Cover edge cases and error paths
- Fast execution (< 1s for entire suite)

**Integration Testing**
- Test API contracts
- Verify database interactions
- Check external service integration
- Use test databases/containers

**E2E Testing (Playwright)**
- Test critical user flows
- Verify UI interactions
- Check cross-browser compatibility
- Run in CI/CD pipeline

**Test Coverage Goals**
- 80%+ for business logic
- 100% for critical paths
- Don't test framework code
- Focus on behavior, not implementation

---

## 2. Tech-Agnostic Principles

### 2.1 Ecosystem Patterns

**Every ecosystem has these components:**

| Component | Purpose | Examples |
|-----------|---------|----------|
| **Runtime** | Execute code | Node.js, Bun, JVM, Python |
| **Package Manager** | Dependency management | npm, bun, Maven, pip |
| **Build Tool** | Compile/bundle | Webpack, Vite, Maven, Gradle |
| **Test Framework** | Run tests | Jest, Vitest, JUnit, pytest |
| **Linter** | Code quality | ESLint, Checkstyle, pylint |
| **Formatter** | Code style | Prettier, google-java-format, black |

**Modern Unified Approach**

**JavaScript/TypeScript: Bun Ecosystem**
```json
{
  "runtime": "bun",
  "packageManager": "bun",
  "testRunner": "bun test",
  "bundler": "built-in"
}
```

**Benefits**:
- Single tool, consistent experience
- Faster than separate tools
- Less configuration
- Better DX (developer experience)

**Apply Same Pattern Elsewhere**
- Java: Use Gradle with built-in test runner
- Python: Use Poetry for deps + pytest
- Go: Use built-in toolchain (go mod, go test)

---

### 2.2 Plug-and-Play Architecture

**shadcn/ui Model**

**Principles**:
- Copy code into your project (not npm package)
- Full control and customization
- No version lock-in
- Understand what you're using

**Apply to Everything**

**UI Components** (shadcn/ui)
```bash
bunx shadcn@latest add button
```

**Data Fetching** (TanStack Query)
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['events'],
  queryFn: fetchEvents
});
```

**Forms** (React Hook Form + Zod)
```typescript
const form = useForm({
  resolver: zodResolver(eventSchema)
});
```

**State** (Zustand)
```typescript
const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user })
}));
```

**Backend Patterns**
- Spring Boot starters (plug-and-play modules)
- Django apps (reusable components)
- Express middleware (composable functions)

---

### 2.3 Single Source of Truth (SSOT)

**Universal Principle**

Define once, reference everywhere:
- Data schemas
- Business rules
- Configuration
- API contracts
- Constants

**Implementation Patterns**

**Shared Types (Monorepo)**
```
packages/
  shared/
    schemas/
      event.schema.ts
    types/
      event.types.ts
  frontend/
  backend/
```

**Schema-First Development**
```typescript
// Define once
export const eventSchema = z.object({
  name: z.string().min(3).max(100),
  capacity: z.number().int().positive(),
  startDate: z.date()
});

// Generate types
export type Event = z.infer<typeof eventSchema>;

// Use everywhere
- Frontend validation
- Backend validation
- API documentation
- Database schema
- Test fixtures
```

---

### 2.4 Configuration Management

**Environment-Based Config**

**Hierarchy** (lowest to highest priority):
1. Defaults (in code)
2. Config files (config.yml)
3. Environment variables
4. CLI arguments

**Example Structure**
```
config/
  default.yml      # Base config
  development.yml  # Dev overrides
  production.yml   # Prod overrides
```

**Environment Variables**
```bash
# .env.example (committed)
DATABASE_URL=postgresql://localhost:5432/db
REDIS_URL=redis://localhost:6379
API_KEY=your_key_here

# .env (gitignored)
DATABASE_URL=postgresql://prod:5432/db
API_KEY=actual_secret_key
```

**Feature Flags**
```typescript
const features = {
  newDashboard: process.env.FEATURE_NEW_DASHBOARD === 'true',
  analytics: process.env.FEATURE_ANALYTICS === 'true'
};

if (features.newDashboard) {
  return <NewDashboard />;
}
```

---

## 3. Modern Tooling Standards

### 3.1 JavaScript/TypeScript Stack

**Unified Toolchain: Bun**

```json
{
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "build": "bun build src/index.ts --outdir dist",
    "test": "bun test",
    "lint": "eslint .",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit"
  }
}
```

**Benefits**:
- Fast package installation
- Built-in test runner
- Native TypeScript support
- Single tool for multiple tasks

**Data Fetching: TanStack Query**

```typescript
// Server state management
const { data, isLoading, error } = useQuery({
  queryKey: ['events', filters],
  queryFn: () => fetchEvents(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Mutations
const mutation = useMutation({
  mutationFn: createEvent,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['events'] });
  }
});
```

**Benefits**:
- Automatic caching
- Background refetching
- Optimistic updates
- Error handling built-in

---

### 3.2 Testing Standards

**Unit Tests: Bun Test / Vitest**

```typescript
import { describe, test, expect } from 'bun:test';

describe('Event Registration', () => {
  test('should register user for event', () => {
    const event = createEvent({ capacity: 100 });
    const result = registerUser(event, user);
    
    expect(result.success).toBe(true);
    expect(event.registrations).toBe(1);
  });

  test('should reject when event is full', () => {
    const event = createEvent({ capacity: 1, registrations: 1 });
    
    expect(() => registerUser(event, user))
      .toThrow('Event is full');
  });
});
```

**E2E Tests: Playwright**

```typescript
import { test, expect } from '@playwright/test';

test('user can register for event', async ({ page }) => {
  await page.goto('/events/123');
  
  await page.click('button:has-text("Register")');
  await page.fill('input[name="name"]', 'John Doe');
  await page.fill('input[name="email"]', 'john@example.com');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('.success-message'))
    .toContainText('Registration successful');
});

test('shows error when event is full', async ({ page }) => {
  await page.goto('/events/full-event');
  
  await expect(page.locator('button:has-text("Register")'))
    .toBeDisabled();
  await expect(page.locator('.alert'))
    .toContainText('Event is full');
});
```

**Test Organization**
```
tests/
  unit/
    services/
      event.test.ts
    utils/
      validation.test.ts
  integration/
    api/
      events.test.ts
  e2e/
    user-flows/
      registration.spec.ts
      check-in.spec.ts
```

---

### 3.3 Code Quality Tools

**Linting: ESLint**

```javascript
// eslint.config.js
export default {
  extends: ['next/core-web-vitals', 'prettier'],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'error'
  }
};
```

**Formatting: Prettier**

```javascript
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**Type Checking: TypeScript**

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Pre-commit Hooks: Husky + lint-staged**

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

---

## 4. Architecture Patterns

### 4.1 Frontend Architecture

**Directory Structure**
```
src/
  app/                 # Next.js pages (App Router)
    (auth)/
      login/
    (dashboard)/
      events/
    api/               # API routes
  components/
    ui/                # shadcn/ui primitives
    features/          # Feature-specific components
    layouts/           # Layout components
  lib/
    api/               # API client functions
    utils/             # Utility functions
    validations/       # Zod schemas
  hooks/               # Custom React hooks
  stores/              # Zustand stores
  types/               # TypeScript types
```

**Component Patterns**

**Primitives** (from shadcn/ui)
```typescript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
```

**Composites** (domain-specific)
```typescript
export function EventCard({ event }: { event: Event }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{event.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{event.description}</p>
      </CardContent>
      <CardFooter>
        <Button>Register</Button>
      </CardFooter>
    </Card>
  );
}
```

**Features** (business logic)
```typescript
export function EventList() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents
  });

  if (isLoading) return <Skeleton />;

  return (
    <div className="grid gap-4">
      {events?.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
```

---

### 4.2 Backend Architecture

**Layered Structure**
```
src/
  main/
    java/com/app/
      controller/      # HTTP endpoints
      service/         # Business logic
      repository/      # Data access
      model/           # Domain entities
      dto/             # Data transfer objects
      config/          # Configuration
      security/        # Auth & authorization
      exception/       # Custom exceptions
    resources/
      db/migration/    # Flyway migrations
      application.yml  # Configuration
```

**Layer Responsibilities**

**Controllers** (API Layer)
- Handle HTTP requests/responses
- Validate input (schema)
- Serialize/deserialize
- No business logic

**Services** (Business Layer)
- Implement business rules
- Orchestrate operations
- Handle transactions
- No database queries

**Repositories** (Data Layer)
- Execute database queries
- Map entities
- No business logic

**Example**
```java
@RestController
@RequestMapping("/api/events")
public class EventController {
    private final EventService eventService;

    @PostMapping
    public ResponseEntity<EventDTO> create(
        @Valid @RequestBody CreateEventRequest request
    ) {
        Event event = eventService.createEvent(request);
        return ResponseEntity.ok(EventDTO.from(event));
    }
}

@Service
public class EventService {
    private final EventRepository eventRepository;

    @Transactional
    public Event createEvent(CreateEventRequest request) {
        validateBusinessRules(request);
        Event event = new Event(request);
        return eventRepository.save(event);
    }
}
```

---

### 4.3 API Design

**RESTful Conventions**
```
GET    /api/events           # List
POST   /api/events           # Create
GET    /api/events/:id       # Read
PUT    /api/events/:id       # Update (full)
PATCH  /api/events/:id       # Update (partial)
DELETE /api/events/:id       # Delete
```

**Response Format**
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

**Error Format**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

**Pagination**
```
GET /api/events?page=1&pageSize=20&sort=startDate:desc
```

**Filtering**
```
GET /api/events?category=music&city=NYC&minPrice=0&maxPrice=100
```

---

## 5. Data Management

### 5.1 Schema Design

**Database Schema**
```sql
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  capacity INTEGER NOT NULL,
  price DECIMAL(10,2),
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_status ON events(status);
```

**Validation Schema (Zod)**
```typescript
export const eventSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  startDate: z.date(),
  endDate: z.date(),
  capacity: z.number().int().positive(),
  price: z.number().nonnegative().optional()
}).refine(
  data => data.endDate > data.startDate,
  { message: 'End date must be after start date' }
);
```

**Type Generation**
```typescript
export type Event = z.infer<typeof eventSchema>;
export type CreateEventInput = z.input<typeof eventSchema>;
```

---

### 5.2 Migrations

**Flyway (Java)**
```sql
-- V1__create_events_table.sql
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- V2__add_capacity_to_events.sql
ALTER TABLE events ADD COLUMN capacity INTEGER NOT NULL DEFAULT 100;
```

**Prisma (TypeScript)**
```prisma
model Event {
  id          Int      @id @default(autoincrement())
  name        String   @db.VarChar(100)
  capacity    Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Migration Best Practices**
- Never modify existing migrations
- Always backward compatible
- Test rollback scenarios
- Include data migrations if needed

---

## 6. Security Standards

### 6.1 Authentication

**JWT Pattern**
```typescript
// Generate token
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

**Refresh Tokens**
```typescript
// Short-lived access token (15 min)
const accessToken = generateToken(user, '15m');

// Long-lived refresh token (7 days)
const refreshToken = generateToken(user, '7d');

// Store refresh token in httpOnly cookie
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});
```

---

### 6.2 Authorization

**Role-Based Access Control (RBAC)**
```typescript
enum Role {
  USER = 'USER',
  HOST = 'HOST',
  ADMIN = 'ADMIN'
}

function requireRole(role: Role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Usage
app.post('/api/events', requireRole(Role.HOST), createEvent);
```

**Resource-Based Access**
```typescript
function canEditEvent(user: User, event: Event): boolean {
  return user.role === Role.ADMIN || event.hostId === user.id;
}
```

---

### 6.3 Input Validation

**Always Validate**
- Client-side (UX)
- Server-side (security)
- Database constraints (integrity)

**Sanitization**
```typescript
import DOMPurify from 'isomorphic-dompurify';

function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input.trim());
}
```

**SQL Injection Prevention**
```java
// ✅ Good: Parameterized query
@Query("SELECT e FROM Event e WHERE e.name = :name")
Event findByName(@Param("name") String name);

// ❌ Bad: String concatenation
String query = "SELECT * FROM events WHERE name = '" + name + "'";
```

---

## 7. Performance Optimization

### 7.1 Frontend Performance

**Code Splitting**
```typescript
const Analytics = dynamic(() => import('./Analytics'), {
  loading: () => <Skeleton />
});
```

**Image Optimization**
```typescript
import Image from 'next/image';

<Image
  src="/event.jpg"
  alt="Event"
  width={800}
  height={600}
  priority={false}
/>
```

**Memoization**
```typescript
const filteredEvents = useMemo(
  () => events.filter(e => e.category === category),
  [events, category]
);
```

---

### 7.2 Backend Performance

**Database Indexing**
```sql
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_registrations_event_user ON registrations(event_id, user_id);
```

**Query Optimization**
```java
// ✅ Good: Fetch join
@Query("SELECT e FROM Event e LEFT JOIN FETCH e.registrations WHERE e.id = :id")
Event findByIdWithRegistrations(@Param("id") Long id);

// ❌ Bad: N+1 queries
Event event = eventRepository.findById(id);
event.getRegistrations().size(); // Triggers N queries
```

**Caching**
```java
@Cacheable(value = "events", key = "#id")
public Event getEvent(Long id) {
    return eventRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("Event not found"));
}

@CacheEvict(value = "events", key = "#id")
public void updateEvent(Long id, UpdateEventRequest request) {
    // Update logic
}
```

---

## 8. Error Handling

### 8.1 Frontend Errors

**Error Boundaries**
```typescript
export class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

**API Error Handling**
```typescript
async function fetchEvents(): Promise<Event[]> {
  try {
    const response = await fetch('/api/events');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return response.json();
  } catch (error) {
    console.error('Failed to fetch events:', error);
    throw error;
  }
}
```

---

### 8.2 Backend Errors

**Exception Hierarchy**
```java
public class BusinessException extends RuntimeException {}
public class NotFoundException extends BusinessException {}
public class ValidationException extends BusinessException {}
public class ForbiddenException extends BusinessException {}
```

**Global Handler**
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException ex) {
        return ResponseEntity.status(404)
            .body(new ErrorResponse("NOT_FOUND", ex.getMessage()));
    }
}
```

---

## 9. Deployment Readiness

### 9.1 Environment Setup

**Development**
```bash
# .env.development
DATABASE_URL=postgresql://localhost:5432/dev
REDIS_URL=redis://localhost:6379
LOG_LEVEL=debug
```

**Production**
```bash
# .env.production
DATABASE_URL=${DATABASE_URL}
REDIS_URL=${REDIS_URL}
LOG_LEVEL=info
```

---

### 9.2 Health Checks

```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

---

### 9.3 Logging

**Structured Logging**
```typescript
logger.info('User registered for event', {
  userId: user.id,
  eventId: event.id,
  timestamp: new Date().toISOString()
});
```

---

## 10. Documentation Standards

### 10.1 Code Documentation

**Functions**
```typescript
/**
 * Registers a user for an event
 * @param eventId - The event to register for
 * @param userId - The user registering
 * @returns Registration object with QR code
 * @throws {EventFullError} When event is at capacity
 */
async function registerForEvent(
  eventId: string,
  userId: string
): Promise<Registration> {
  // Implementation
}
```

---

### 10.2 API Documentation

**OpenAPI/Swagger**
```yaml
paths:
  /api/events:
    post:
      summary: Create new event
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateEventRequest'
      responses:
        '200':
          description: Event created successfully
```

---

## 11. Quality Checklist

### Before Committing

- [ ] Code follows style guide
- [ ] Tests written and passing
- [ ] No console.log or debug code
- [ ] Error handling implemented
- [ ] Types/interfaces defined
- [ ] Documentation updated

### Before Deploying

- [ ] All tests pass (unit + integration + e2e)
- [ ] No security vulnerabilities
- [ ] Performance benchmarks met
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Monitoring/logging enabled
- [ ] Rollback plan documented

---

## 12. Remember

> "Understand the problem before solving it"

> "Choose the simplest solution that works"

> "Test everything that can break"

> "Document decisions, not just code"

> "Optimize for change, not perfection"

---

**Version**: 2.0  
**Philosophy**: Problem-first, tech-agnostic, modern tooling  
**Maintained By**: Engineering Team
