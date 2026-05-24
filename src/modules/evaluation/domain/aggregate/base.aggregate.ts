import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type {
  Entity,
  EntityMetadata,
} from "../../../shared/domain/entity/entity.ts";
import { BaseSessionEntity } from "../entity/session.entity.ts";
import type { sessionIdentifierSchema } from "../schema/session.schema.ts";

export type PickMethodNames<T> = {
  [K in keyof T]: T[K] extends (...arguments_: unknown[]) => unknown
    ? K
    : never;
}[keyof T];

export class BaseSessionAggregateRoot<
  T extends typeof sessionIdentifierSchema,
  AEP extends Record<string, Entity> = Record<string, Entity>,
> extends BaseSessionEntity<T> {
  private baseAggregate: AggregateRoot<T, EntityMetadata, AEP>;
  constructor(entity: BaseSessionEntity<T>) {
    super(entity);
    this.baseAggregate = new AggregateRoot<T, EntityMetadata, AEP>(entity);
  }

  self<K extends keyof AEP>(method: "getEntity", arguments_: [K]): AEP[K][];
  self<K extends keyof AEP>(
    method: "pushEntity" | "setEntity",
    arguments_: [K, AEP[K] | AEP[K][]],
  ): void;
  self<K extends PickMethodNames<AggregateRoot<T, EntityMetadata, AEP>>>(
    method: K,
    arguments_: AggregateRoot<T, EntityMetadata, AEP>[K] extends (
      ...arguments__: infer A
    ) => unknown
      ? A
      : never,
  ): AggregateRoot<T, EntityMetadata, AEP>[K] extends (
    ...arguments__: unknown[]
  ) => infer R
    ? R
    : never;
  self(method: string, arguments__: unknown[]): unknown {
    const callable = this.baseAggregate[
      method as keyof typeof this.baseAggregate
    ] as (...arguments_: unknown[]) => unknown;
    return callable(...arguments__);
  }
}
