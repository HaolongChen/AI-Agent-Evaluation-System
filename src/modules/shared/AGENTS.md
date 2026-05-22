# Shared DDD Module

## OVERVIEW

Foundational DDD building blocks (Entity, AggregateRoot, ValueObject, IRepository) + cross-cutting infrastructure (GraphQL client, LLM providers, logger, Ali OSS).

**Note**: No `src/external/` directory exists on disk — previously documented as utility location but never created.

## ENTITY BASE

`Entity<T>` (in `domain/entity/entity.ts`) provides UUID, createdAt/updatedAt tracking, and Zod schema validation.

```typescript
import { Entity } from "./entity/entity.ts";

class User extends Entity<typeof UserSchema> {
  constructor(data: z.infer<typeof UserSchema>, id?: string) {
    super(data, UserSchema, id);
  }
}
```

## AGGREGATE ROOT

`AggregateRoot<T>` (in `domain/aggregate/aggregate-root.ts`) wraps an Entity for consistency boundaries.

```typescript
class UserAggregate extends AggregateRoot<typeof UserSchema> {
  constructor(entity: User) {
    super(entity);
  }
}
```

## REPOSITORY INTERFACE

`IRepository<T>` (in `domain/interface/repository.interface.ts`) defines the `save`/`findById` contract. All module repositories implement this interface.

## VALUE OBJECTS

`ValueObject<T>` (in `domain/value-object/base.vo.ts`) wraps immutable concepts with Zod validation.

```typescript
import { ValueObject } from "./value-object/base.vo.ts";

class Email extends ValueObject<typeof EmailVO> {
  constructor(email: string) {
    super({ value: email }, EmailVO);
  }
}
```

## DOMAIN SERVICES

- **type-system.service.ts** (`domain/service/`): Manages Functorz Zed type system. Contains 2 `any` type violations (lines 215, 238) — known technical debt.

## DOMAIN INTERFACES

- **graph-states.ts** (`domain/interface/`): LangGraph state types (`JobState`, `RuntimeContext`, `Task`, etc.) importing from `@langchain/core/messages`. **Misplaced in domain layer** — LangGraph is an application/external concern, not domain logic. Should be migrated out of the domain layer.
- **type-system.ts** (`domain/interface/`): Re-exports types from `@functorz/ztype` (134-line barrel file).

## APPLICATION LAYER

- **graphql-client.ts** (`application/`): `NetworkClient`, `GQLClient`, `WebSocketClient` classes + `publicNetworkClient` singleton. Used by the account module (`login.ts`, `account-handler.ts`) for Functorz backend GraphQL/WS communication.

## INFRASTRUCTURE

- **repository.ts** (`infrastructure/`): `repositoryDateMapper()` hydrates timestamps from DB records.
- **logger.ts** (`infrastructure/`): Structured logger (tslog). Most cross-cutting utility — used across all modules.
- **ali-oss.ts** (`infrastructure/`): Aliyun OSS client for cloud storage operations.
- **llm-providers.ts** (`infrastructure/`): LLM provider abstraction (OpenAI, Gemini, Azure OpenAI).

## USAGE

All domain entities extend Entity from `shared/`. Each module defines its own Zod schemas and implements IRepository.
