import { BaseSessionEntity } from "../entity/session.entity.ts";
import type { sessionIdentifierSchema } from "../schema/session.schema.ts";

export class BaseSessionAggregateRoot<
  T extends typeof sessionIdentifierSchema,
> extends BaseSessionEntity<T> {
  constructor(entity: BaseSessionEntity<T>) {
    super(entity);
  }
}
