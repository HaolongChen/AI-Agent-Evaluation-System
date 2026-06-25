export interface IDomainEvent<T extends string = string> {
  readonly name: T;
  readonly createdAt: Date;
}

export type EventMap<E extends readonly [...IDomainEvent[]] = IDomainEvent[]> =
  Exclude<
    {
      [K in E[number]["name"]]: Extract<E[number], IDomainEvent<K>>;
    },
    never
  >;
