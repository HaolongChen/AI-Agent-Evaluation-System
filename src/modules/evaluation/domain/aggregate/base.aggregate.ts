import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type { BaseSessionEntity } from "../entity/session.entity.ts";
import type { sessionIdentifierSchema } from "../schema/session.schema.ts";

export class BaseSessionAggregateRoot<
  T extends typeof sessionIdentifierSchema,
> extends AggregateRoot<T, BaseSessionEntity<T>> {}
