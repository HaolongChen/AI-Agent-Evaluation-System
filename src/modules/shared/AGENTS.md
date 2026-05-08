# Shared DDD Module

## OVERVIEW

Foundational DDD building blocks (Entity, AggregateRoot, ValueObject, Repository interface) used by all other modules.

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
  constructor(entity: User) { super(entity); }
}
```

## REPOSITORY INTERFACE

`IRepository<T>` defines save/findById contract.

```typescript
import { IRepository } from "./interface/repository.interface.ts";

class UserRepository implements IRepository<User> {
  async save(entity: User): Promise<void> { /* ... */ }
  async findById(id: string): Promise<User> { /* ... */ }
}
```

## VALUE OBJECTS

`ValueObject<T>` wraps immutable concepts with validation.

```typescript
import { ValueObject } from "./value-object/base.vo.ts";

const EmailVO = z.object({ value: z.string().email() });
class Email extends ValueObject<typeof EmailVO> {
  constructor(email: string) { super({ value: email }, EmailVO); }
}
```

## INFRASTRUCTURE

`repositoryDateMapper()` hydrates timestamps from DB records.

```typescript
import { repositoryDateMapper } from "./infrastructure/repository.ts";

const dbUser = await prisma.user.findUnique({ where: { id } });
repositoryDateMapper(dbUser, new User({ email: "a@b.com", name: "A" }));
```

## USAGE

All domain entities extend Entity. Each module defines its own schemas and implements IRepository.