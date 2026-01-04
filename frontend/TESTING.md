# Frontend Testing Guide

## Overview

This project uses **Bun's built-in test runner** for fast, Jest-compatible testing with TypeScript support.

## Test Structure

```
src/
└── __tests__/
    ├── setup.ts              # Global test configuration
    ├── validation.test.ts    # Validation utilities tests
    ├── utils.test.ts         # Utility functions tests
    ├── api.test.ts          # API client tests
    ├── auth-storage.test.ts # Auth storage tests
    └── types.test.ts        # TypeScript type tests
```

## Running Tests

### Run all tests
```bash
bun test
```

### Watch mode (re-run on file changes)
```bash
bun test --watch
```

### Run specific test file
```bash
bun test validation
```

### Run with coverage
```bash
bun test --coverage
```

### Run tests matching pattern
```bash
bun test --test-name-pattern "validation"
```

## Test Coverage

### ✅ Implemented Tests

1. **Validation Tests** (`validation.test.ts`)
   - Input sanitization
   - URL validation
   - Email validation
   - Phone number validation
   - Tag sanitization
   - Date range validation
   - Capacity validation
   - Price validation

2. **Utils Tests** (`utils.test.ts`)
   - Class name merging (cn utility)
   - Conditional class handling
   - Tailwind class merging

3. **API Client Tests** (`api.test.ts`)
   - GET requests
   - POST requests
   - PUT requests
   - DELETE requests
   - Authentication headers
   - Error handling (4xx, 5xx)

4. **Auth Storage Tests** (`auth-storage.test.ts`)
   - Session saving
   - Session retrieval
   - Session clearing
   - Token management

5. **Type Tests** (`types.test.ts`)
   - User type structure
   - AuthResponse type structure
   - Event type structure
   - Registration type structure

## Writing New Tests

### Basic Test Structure

```typescript
import { describe, test, expect } from "bun:test";

describe("Feature Name", () => {
  test("should do something", () => {
    const result = myFunction();
    expect(result).toBe(expected);
  });
});
```

### Async Tests

```typescript
test("async operation", async () => {
  const result = await fetchData();
  expect(result).toBeDefined();
});
```

### Mocking

```typescript
import { mock } from "bun:test";

test("with mock", () => {
  const mockFn = mock(() => "mocked");
  expect(mockFn()).toBe("mocked");
  expect(mockFn).toHaveBeenCalled();
});
```

### Setup and Teardown

```typescript
import { beforeEach, afterEach } from "bun:test";

beforeEach(() => {
  // Setup before each test
});

afterEach(() => {
  // Cleanup after each test
});
```

## Best Practices

1. **Descriptive Test Names**: Use clear, descriptive names that explain what is being tested
2. **Arrange-Act-Assert**: Structure tests with setup, execution, and verification
3. **Test One Thing**: Each test should verify a single behavior
4. **Mock External Dependencies**: Mock API calls, localStorage, etc.
5. **Clean Up**: Reset mocks and state after each test

## Common Matchers

```typescript
// Equality
expect(value).toBe(expected);
expect(value).toEqual(expected);
expect(value).toStrictEqual(expected);

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThan(5);
expect(value).toBeCloseTo(0.3, 1);

// Strings
expect(string).toContain("substring");
expect(string).toMatch(/pattern/);

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Objects
expect(object).toHaveProperty("key");
expect(object).toMatchObject({ key: "value" });

// Functions
expect(fn).toThrow();
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith(arg);

// Promises
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();
```

## CI/CD Integration

Tests are automatically run in the `verify` script:

```bash
bun run verify
```

This runs:
1. ESLint (linting)
2. TypeScript type checking
3. Prettier format checking
4. All tests

## Future Test Additions

### Recommended Tests to Add

1. **Component Tests**
   - EventCard rendering
   - RegistrationForm validation
   - LoginForm submission
   - NavBar navigation

2. **Store Tests**
   - authStore actions
   - eventStore state management

3. **Hook Tests**
   - useDebounce behavior
   - useEvents data fetching
   - useRegistrations CRUD operations

4. **Integration Tests**
   - Complete registration flow
   - Authentication flow
   - Event creation flow

5. **E2E Tests** (Consider Playwright)
   - User registration → login → event registration
   - Event creation → editing → deletion
   - QR code generation → check-in

## Troubleshooting

### Tests not running
- Ensure Bun is installed: `bun --version`
- Check test file naming: `*.test.ts` or `*.spec.ts`

### Mock not working
- Import `mock` from `bun:test`
- Reset mocks in `afterEach` hook

### Type errors in tests
- Run `bun run typecheck` to verify TypeScript
- Ensure test setup imports types correctly

## Resources

- [Bun Test Documentation](https://bun.sh/docs/cli/test)
- [Jest Matchers Reference](https://jestjs.io/docs/expect)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
