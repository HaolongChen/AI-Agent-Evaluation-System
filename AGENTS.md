# AGENTS.md - AI Agent Evaluation System

> **Generated:** 2025-12-29 | **Commit:** d18422b | **Branch:** refactor-prisma-schema

Guidelines for agentic coding systems operating in this repository.

## Project Overview

AI Agent Evaluation System - An end-to-end evaluation framework for Copilot-style agents. It orchestrates Human-in-the-Loop (HITL) workflows with LangGraph, stores structured results in PostgreSQL via Prisma, and exposes a GraphQL API for golden set management, evaluations, and analytics.

**Tech Stack**: TypeScript (ESM), Node.js 18+, GraphQL (Apollo Server), LangGraph + LangChain, Prisma, PostgreSQL, Kubernetes (optional)

## Where to Look

| Task | Location | Notes |
|------|----------|-------|
| Add evaluation workflow node | `src/langGraph/nodes/` | Pure functions, see `RubricDrafterAgent.ts` |
| Add GraphQL mutation/query | `src/graphql/resolvers/` | Thin resolvers → delegate to services |
| Add business logic | `src/services/` | Singleton pattern, handles DB operations |
| Modify evaluation state | `src/langGraph/state/state.ts` | Uses LangGraph Annotation system |
| Add CLI job runner | `src/jobs/` | Embedded CLI parsing, start/wait/stop pattern |
| Change database schema | `prisma/schema.prisma` | Run `pnpm db:generate` after |
| Add utility function | `src/utils/` | Pure functions, no side effects |
| Run evaluations | `src/jobs/EvaluationJobRunner.ts` | Entry point for eval jobs |
| Configure LLM providers | `src/langGraph/llm/` | Azure OpenAI, Gemini support |

**See also**: `src/langGraph/AGENTS.md` for HITL workflow architecture details.

## Build, Test, and Lint Commands

### Build Commands
```bash
# Development build
pnpm build

# Production bundle (preferred for deployment)
pnpm build:bundle

# Development server with hot reload
pnpm dev

# Production start
pnpm start

# Debug mode
pnpm debug
```

### Test Commands
```bash
# Run all test suites
pnpm test:lg          # LangGraph workflow tests
pnpm test:graphql     # GraphQL API tests
pnpm test:fetch       # Fetch tests
pnpm test:introspection  # Introspection tests
pnpm test:tools       # Tools tests

# Run a single test file
pnpm ts-node ./tests/<filename>.ts
# Example: pnpm ts-node ./tests/langgraph-test.ts
```

### Linting
```bash
# Check for lint errors
pnpm lint

# Auto-fix lint errors
pnpm lint:fix
```

### Type Checking
```bash
# Type check without emitting files
pnpm tsc --noEmit
```

### Database Commands
```bash
pnpm db:setup      # Initial database setup
pnpm db:seed       # Seed golden set data
pnpm db:push       # Push schema changes
pnpm db:generate   # Generate Prisma client
pnpm db:migrate    # Run migrations
pnpm db:studio     # Open Prisma Studio
pnpm db:reset      # Reset database (CAUTION)
```

## Code Style Guidelines

### Import Organization
- **Order**: External packages → Internal modules → Type-only imports
- **Style**: Use named imports; `import type` for type-only imports
- **Paths**: Relative imports only (e.g., `../utils/logger.ts`)
- **File Extensions**: Always include `.ts` extension in imports

**Example:**
```typescript
import { prisma } from '../config/prisma.ts';
import { REVIEW_STATUS } from '../config/constants.ts';
import type { Rubric, FinalReport } from '../langGraph/state/state.ts';
import { CopilotType } from '../../build/generated/prisma/enums.ts';
import { logger } from '../utils/logger.ts';
```

### TypeScript Usage

#### Type vs Interface
- **Interface**: For data shapes and object structures
  ```typescript
  interface Rubric {
    id: string;
    version: string;
    criteria: RubricCriterion[];
  }
  ```
- **Type**: For unions, aliases, and computed types
  ```typescript
  type CopilotType = "dataModel" | "uiBuilder" | "actionflow";
  ```

#### Type Annotations
- **Always** explicitly type function parameters and return values
- **Prefer** explicit types over inference for public APIs
- **Never** use `any` - use `unknown` or proper types
- **Use** `as const` for literal constant objects

**Example:**
```typescript
async saveRubric(
  sessionId: number,
  rubric: Rubric,
): Promise<{ id: number }> {
  // implementation
}
```

#### Enums and Constants
- **Prefer** `as const` objects over enums
- **Use** UPPER_SNAKE_CASE for exported constants
- **Use** camelCase for internal constants

**Example:**
```typescript
const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files | PascalCase for classes/services, camelCase for utilities | `EvaluationPersistenceService.ts`, `logger.ts` |
| Classes | PascalCase | `EvaluationPersistenceService` |
| Functions | camelCase | `saveRubric`, `getCallerInfo` |
| Variables | camelCase | `rubricId`, `sessionData` |
| Constants | UPPER_SNAKE_CASE | `REVIEW_STATUS`, `COPILOT_TYPES` |
| Types/Interfaces | PascalCase | `Rubric`, `FinalReport` |
| GraphQL Resolvers | camelCase with descriptive names | `getGoldenSets`, `updateGoldenSetInput` |

### Error Handling

**Pattern**: Try-catch with structured logging and user-friendly errors

```typescript
try {
  const result = await prisma.adaptiveRubric.create({
    data: { /* ... */ },
  });
  return result;
} catch (error) {
  logger.error('Error saving rubric to database:', error);
  throw new Error('Failed to save rubric');
}
```

**Rules**:
- Always log the original error with `logger.error()`
- Throw a new Error with a user-friendly message
- Never swallow errors silently
- Include context in error messages

### Async Patterns

**Prefer**: `async/await` over promise chaining

```typescript
// ✓ GOOD
async function processData() {
  const data = await fetchData();
  const processed = await processData(data);
  return processed;
}

// ✗ AVOID
function processData() {
  return fetchData()
    .then(data => processData(data))
    .then(result => result);
}
```

### Function Declarations

- **Standalone functions**: Use `function` keyword or `async function`
- **Object methods**: Use arrow functions
- **Exported utilities**: Use named `export function`

```typescript
// Standalone
function generateId(): string { /* ... */ }
async function rubricDrafterNode(...) { /* ... */ }

// Object methods
export const logger = {
  info: (message: string, ...args: unknown[]) => { /* ... */ },
  error: (message: string, ...args: unknown[]) => { /* ... */ },
};
```

### Export Patterns

- **Prefer** named exports over default exports
- **Export** singleton instances for services
- **Use** `export const` for utilities and constants

```typescript
// Service class with singleton
export class EvaluationPersistenceService { /* ... */ }
export const evaluationPersistenceService = new EvaluationPersistenceService();

// Utilities
export const logger = { /* ... */ };
export function formatArgs(args: unknown[]): string { /* ... */ }
```

## Architecture Patterns

### Service Layer
- Located in `src/services/`
- Encapsulate business logic and database operations
- Export singleton instances
- Use dependency injection via constructor when needed

### GraphQL Resolvers
- Located in `src/graphql/resolvers/`
- Keep resolvers thin - delegate to services
- Use consistent error handling
- Structure: `{ Query: {...}, Mutation: {...} }`

### LangGraph Nodes
- Located in `src/langGraph/nodes/`
- Pure functions that accept state and config
- Return partial state updates
- Use structured output with Zod schemas
- Include retry logic for LLM calls

### Utils
- Located in `src/utils/`
- Pure, reusable functions
- No side effects unless explicitly named (e.g., `logger`)
- Export individual functions as named exports

## Database and Prisma

### Schema Management
- Schema defined in `prisma/schema.prisma`
- Always run `pnpm db:generate` after schema changes
- Use migrations for production: `pnpm db:migrate`
- Use `db:push` for development rapid iteration

### Query Patterns
- Import prisma client from `src/config/prisma.ts`
- Use transactions for multi-table operations
- Always handle null/undefined returns
- Use `select` to limit returned fields when possible

```typescript
const rubric = await prisma.adaptiveRubric.findFirst({
  where: { sessionId },
  select: { id: true },
});
return rubric?.id ?? null;
```

## Environment Variables

Required variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `WS_URL` - Functorz Copilot WebSocket endpoint
- `userToken`, `projectExId` - Functorz credentials
- `OPENAI_API_KEY` or `GOOGLE_API_KEY` - LLM provider keys
- `NODE_ENV` - `development` or `production`

## Common Patterns

### Logger Usage
```typescript
import { logger } from '../utils/logger.ts';

logger.info('Processing evaluation', { sessionId });
logger.error('Failed to save rubric', error);
logger.warn('Deprecated function called');
logger.debug('Detailed debug info'); // Only in development
```

### LLM Calls with Retry
```typescript
import { getLLM, invokeWithRetry } from '../llm/index.ts';

const llm = getLLM({ provider: 'azure', model: 'gpt-4o' });
const response = await invokeWithRetry(
  () => llm.invoke([new HumanMessage(prompt)], config),
  'azure',
  { operationName: 'RubricDrafter.invoke' }
);
```

### GraphQL Resolver Pattern
```typescript
export const resolver = {
  Query: {
    getData: async (_: unknown, args: { id: number }) => {
      try {
        const result = await service.getData(args.id);
        if (!result) throw new Error('Data not found');
        return result;
      } catch (error) {
        logger.error('Error fetching data:', error);
        throw new Error('Failed to fetch data');
      }
    },
  },
};
```

### Partial Update Pattern (HITL)

**Problem**: Users shouldn't need to copy and resubmit entire objects when reviewing rubrics or evaluations.

**Solution**: Use `questionPatches` for rubric reviews and `answerPatches` for evaluations.

#### Rubric Review with Patches
```typescript
await graphExecutionService.submitRubricReview(
  sessionId,
  threadId,
  false, // Not fully approved - has modifications
  undefined, // No full rubric replacement
  [
    // Only specify questions that need changes
    {
      questionId: 123,
      weight: 0.6, // Update weight
      title: 'Correctness - Enhanced', // Update title
    },
    {
      questionId: 124,
      expectedAnswer: false, // Change expected answer
    },
  ],
  'Adjusted based on project priorities',
  'reviewer-123'
);
```

#### Human Evaluation with Patches
```typescript
await graphExecutionService.submitHumanEvaluation(
  sessionId,
  threadId,
  undefined, // No full answers array
  [
    // Only specify answers that differ from agent evaluation
    {
      questionId: 123,
      answer: true, // Override agent's answer
      explanation: 'Nearly perfect, minor edge case',
    },
    {
      questionId: 125,
      answer: false, // Override agent's answer
      explanation: 'Code quality needs improvement',
    },
  ],
  'Minor corrections to agent evaluation',
  'evaluator-456'
);
```

**Benefits**:
- Less data transfer (only changed fields)
- Clearer intent (explicit about what's changing)
- Automatic merging with existing data from database
- Validation (prevents invalid question IDs or values)

**Implementation Details**:
- **Questions**: Service layer fetches from `adaptiveRubric` table, applies patches, reconstructs full QuestionSet
- **Answers**: Service layer fetches agent evaluation from state/DB, applies patches to create full answers array
- Old parameters (`modifiedQuestionSet`, `answers`) still work for full replacement
- Patches are validated against existing questions before merging

## Testing Guidelines

- Place tests in `tests/` directory
- Name test files descriptively (e.g., `langgraph-test.ts`, `partial-update-test.ts`)
- Use `ts-node` to run tests
- Include both unit and integration tests
- Test error handling paths

**Run tests**:
```bash
pnpm test:lg              # LangGraph workflow tests
pnpm test:graphql         # GraphQL API tests
pnpm test:partial-update  # Partial update functionality
pnpm test:fetch           # Fetch tests
pnpm test:introspection   # Introspection tests
pnpm test:tools           # Tools tests
```

## Important Notes

1. **ESM Only**: This project uses ES modules (`"type": "module"`)
2. **Strict TypeScript**: All strict flags are enabled in `tsconfig.json`
3. **No Implicit Any**: Always provide explicit types
4. **File Extensions**: Always include `.ts` in import paths
5. **Prisma Generated**: Never edit files in `build/generated/prisma/`
6. **Logger Everywhere**: Use `logger` instead of `console.log`

## When Making Changes

1. ✓ Run `pnpm lint` before committing
2. ✓ Check types with `pnpm tsc --noEmit`
3. ✓ Test affected functionality
4. ✓ Update Prisma client if schema changed: `pnpm db:generate`
5. ✓ Follow existing patterns in similar files
6. ✓ Add proper error handling and logging
7. ✓ Use explicit types for all function signatures
