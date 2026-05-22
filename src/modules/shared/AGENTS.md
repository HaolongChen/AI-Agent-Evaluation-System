# Shared DDD Module

## OVERVIEW

Foundational DDD building blocks (Entity, AggregateRoot, ValueObject, Repository interface) + cross-cutting infrastructure (GraphQL client, LLM providers, Ali OSS).

## ENTITY BASE

`Entity<T>` provides UUID, createdAt/updatedAt tracking, and Zod validation.

```typescript
import { Entity } from "./entity/entity.ts";
import * as z from "zod";

const UserSchema = z.object({ email: z.string().email(), name: z.string() });

class User extends Entity<typeof UserSchema> {
  constructor(data: z.infer<typeof UserSchema>, id?: string) {
    super(data, UserSchema, id);
  }
}
```

## AGGREGATE ROOT

`AggregateRoot<T>` wraps an Entity for consistency boundaries.

```typescript
import { AggregateRoot } from "./aggregate/aggregate-root.ts";

class UserAggregate extends AggregateRoot<typeof UserSchema> {
  constructor(entity: User) {
    super(entity);
  }
}
```

## REPOSITORY INTERFACE

`IRepository<T>` defines save/findById contract.

```typescript
import { IRepository } from "./interface/repository.interface.ts";

class UserRepository implements IRepository<User> {
  async save(entity: User): Promise<void> {
    /* ... */
  }
  async findById(id: string): Promise<User> {
    /* ... */
  }
}
```

## VALUE OBJECTS

`ValueObject<T>` wraps immutable concepts with validation.

```typescript
import { ValueObject } from "./value-object/base.vo.ts";

const EmailVO = z.object({ value: z.string().email() });
class Email extends ValueObject<typeof EmailVO> {
  constructor(email: string) {
    super({ value: email }, EmailVO);
  }
}
```

## DOMAIN SERVICES

- **type-system.service.ts**: Manages Functorz Zed type system. Contains 2 `any` type violations (lines 215, 238) — technical debt.

## DOMAIN INTERFACES

- **graph-states.ts**: LangGraph state types (misplaced in domain layer — should be in application or external)
- **type-system.ts**: Re-exports types from `@functorz/ztype` (134-line barrel file)

## APPLICATION LAYER

- **graphql-client.ts**: NetworkClient, GQLClient, WebSocketClient classes + publicNetworkClient singleton. Used by account module for backend communication.

## INFRASTRUCTURE

- **repository.ts**: `repositoryDateMapper()` hydrates timestamps from DB records.
- **ali-oss.ts**: Aliyun OSS client for cloud storage operations.
- **llm-providers.ts**: LLM provider abstraction (OpenAI, Gemini, Azure OpenAI).

## USAGE

All domain entities extend Entity. Each module defines its own schemas and implements IRepository.
