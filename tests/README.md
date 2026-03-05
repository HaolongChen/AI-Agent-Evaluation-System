# Testing Guide

This directory contains the test suite for the AI Agent Evaluation System.

## Structure

```
tests/
├── setup.ts                    # Global test setup
├── helpers/
│   └── mockRepositories.ts     # Mock implementations
├── unit/                       # Unit tests
│   ├── errors/
│   ├── resilience/
│   └── repositories/
├── integration/                # Integration tests (TODO)
└── e2e/                       # E2E tests (existing)
```

## Running Tests

### Basic Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test tests/unit/errors/BaseError.test.ts

# Run tests matching pattern
pnpm test --grep "CircuitBreaker"
```

### Test UI

```bash
# Open interactive test UI
pnpm test:ui
```

The UI provides:
- Visual test runner
- Real-time test execution
- Code coverage visualization
- Test debugging tools

### Coverage

```bash
# Generate coverage report
pnpm test:coverage
```

Coverage reports are generated in:
- `coverage/index.html` - HTML report
- `coverage/lcov.info` - LCOV format
- Console output

**Coverage Thresholds:**
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

## Writing Tests

### Unit Tests

Unit tests should be fast, isolated, and test a single unit of code.

**Example:**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { MyClass } from '../../../src/path/to/MyClass.ts';

describe('MyClass', () => {
  let instance: MyClass;

  beforeEach(() => {
    instance = new MyClass();
  });

  describe('myMethod', () => {
    it('should do something', () => {
      const result = instance.myMethod('input');
      expect(result).toBe('expected');
    });

    it('should handle errors', () => {
      expect(() => instance.myMethod(null)).toThrow();
    });
  });
});
```

### Using Mocks

#### Repository Mocks

```typescript
import { MockEvaluationRepository } from '../../helpers/mockRepositories.ts';

describe('MyService', () => {
  let repository: MockEvaluationRepository;
  let service: MyService;

  beforeEach(() => {
    repository = new MockEvaluationRepository();
    service = new MyService(repository);
  });

  it('should use repository', async () => {
    // Seed test data
    repository.seed([
      { id: 1, /* ... */ }
    ]);

    const result = await service.doSomething(1);
    
    expect(repository.findById).toHaveBeenCalledWith(1);
    expect(result).toBeDefined();
  });
});
```

#### Vitest Spies

```typescript
import { vi } from 'vitest';

it('should call function', () => {
  const spy = vi.fn(() => 'result');
  
  const result = spy('arg');
  
  expect(spy).toHaveBeenCalledWith('arg');
  expect(result).toBe('result');
});
```

### Testing Errors

```typescript
import { NotFoundError } from '../../../src/shared/errors/index.ts';

it('should throw NotFoundError', () => {
  expect(() => {
    throw new NotFoundError('User', 123);
  }).toThrow(NotFoundError);
});

it('should include error context', () => {
  try {
    throw new NotFoundError('User', 123, { userId: 'abc' });
  } catch (error) {
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.context.resource).toBe('User');
    expect(error.context.identifier).toBe(123);
    expect(error.context.userId).toBe('abc');
  }
});
```

### Testing Async Code

```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBe('success');
});

it('should handle async errors', async () => {
  await expect(asyncFunction()).rejects.toThrow('Error message');
});
```

### Testing Circuit Breakers

```typescript
import { CircuitBreaker, CircuitState } from '../../../src/shared/resilience/CircuitBreaker.ts';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      name: 'test',
      failureThreshold: 3,
      failureTimeWindow: 10000,
      resetTimeout: 5000,
      successThreshold: 2,
    });
  });

  it('should track failures', async () => {
    const fn = vi.fn(async () => {
      throw new Error('Failure');
    });

    // Trigger failures
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(fn)).rejects.toThrow();
    }

    expect(breaker.getState()).toBe(CircuitState.OPEN);
  });
});
```

## Test Helpers

### Mock Repositories

Located in `tests/helpers/mockRepositories.ts`:

- `MockEvaluationRepository` - In-memory evaluation repository
- Implements full `IEvaluationRepository` interface
- Provides test helpers (`reset()`, `seed()`)
- All methods are Vitest spies

**Methods:**
```typescript
repository.reset();              // Clear all data
repository.seed([...sessions]);  // Add test data
expect(repository.findById).toHaveBeenCalledWith(1);
```

### Setup File

`tests/setup.ts` configures:
- Environment variables for testing
- Global before/after hooks
- Mock initialization

## Best Practices

### 1. Test Organization

```typescript
describe('Component', () => {
  describe('Feature', () => {
    it('should behavior', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = doSomething(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### 2. Use beforeEach for Setup

```typescript
describe('MyClass', () => {
  let instance: MyClass;

  beforeEach(() => {
    instance = new MyClass();
  });

  // Tests use instance
});
```

### 3. Test Edge Cases

```typescript
it('should handle null', () => {
  expect(fn(null)).toBe(null);
});

it('should handle empty array', () => {
  expect(fn([])).toEqual([]);
});

it('should handle large numbers', () => {
  expect(fn(Number.MAX_SAFE_INTEGER)).toBeDefined();
});
```

### 4. Use Descriptive Names

```typescript
// Good
it('should return null when user is not found', () => {});

// Bad
it('works', () => {});
```

### 5. Keep Tests Focused

```typescript
// Good - tests one thing
it('should validate email format', () => {});
it('should validate email domain', () => {});

// Bad - tests multiple things
it('should validate email', () => {
  // Tests format, domain, length, etc.
});
```

### 6. Mock External Dependencies

```typescript
import { vi } from 'vitest';

// Mock external module
vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} }))
  }
}));
```

### 7. Clean Up After Tests

```typescript
afterEach(() => {
  vi.clearAllMocks();  // Clear mock calls
  repository.reset();   // Reset test data
});
```

## Debugging Tests

### Using Console

```typescript
it('should debug', () => {
  console.log('Debug info:', variable);
  expect(variable).toBe('value');
});
```

### Using Debugger

```typescript
it('should debug with breakpoint', () => {
  debugger; // Breakpoint
  expect(value).toBe('expected');
});
```

Run with Node inspector:
```bash
node --inspect-brk node_modules/.bin/vitest run
```

### Using Test UI

1. Run `pnpm test:ui`
2. Click on failing test
3. View error details and stack trace
4. Re-run individual tests

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Troubleshooting

### Tests Hanging

- Check for missing `await` on promises
- Verify no infinite loops
- Use test timeout: `it('test', async () => {}, { timeout: 5000 })`

### Import Errors

- Verify path aliases in `vitest.config.ts`
- Check file extensions (.ts)
- Ensure `setup.ts` is loaded

### Coverage Issues

- Exclude test files in `vitest.config.ts`
- Check coverage thresholds
- View HTML report for uncovered lines

### Mock Not Working

- Ensure `vi.mock()` is hoisted (top-level)
- Clear mocks between tests with `beforeEach(() => vi.clearAllMocks())`
- Verify mock implementation

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Mock Service Worker](https://mswjs.io/) for API mocking
- [Testing Library](https://testing-library.com/) for component testing
