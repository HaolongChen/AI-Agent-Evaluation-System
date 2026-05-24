# Shared DDD Module

## OVERVIEW

Foundational DDD building blocks (Entity, AggregateRoot, ValueObject, IRepository) + cross-cutting infrastructure (GraphQL client, LLM providers, logger, Ali OSS).

**Note**: No `src/external/` directory exists on disk — previously documented as utility location but never created.

## ENTITY BASE

`Entity<T, M>` (in `domain/entity/entity.ts`) provides UUID, createdAt/updatedAt tracking, Zod schema validation, and metadata management. Refactored post 2026-05-22 with:

- **Generic metadata type**: `EntityMetadata` (`id`, `createdAt`, `updatedAt`) as second generic param
- **Constructor overloading**: Can clone from existing entity (`new Entity<T, M>(existingEntity)`) or construct from raw data
- **`getData()` accessor**: Replaced direct `.data` property — returns typed projection of all fields including metadata
- **`schema` made public**: Schema now accessible as public field for external validation
- **Cross-layer violation**: Imports `logger` from `shared/infrastructure/logger.ts` (domain→infrastructure — known)

### Base Class Usage

```typescript
import { Entity } from "./entity/entity.ts";

class User extends Entity<typeof UserSchema> {
  constructor(data: z.infer<typeof UserSchema>, id?: string) {
    super(data, UserSchema, id);
  }
}
```

## AGGREGATE ROOT

`AggregateRoot<T, M>` (in `domain/aggregate/aggregate-root.ts`) wraps an Entity for consistency boundaries. Refactored to support generic metadata type and dynamic child entity management with `getData()` method.

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

- **type-system.service.ts** (`domain/service/`): Manages Functorz Zed type system. Contains 2 `any` type violations (lines 215, 238) and 3 additional type-level `any` usages (lines 49, 65, 81) — known technical debt.

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
