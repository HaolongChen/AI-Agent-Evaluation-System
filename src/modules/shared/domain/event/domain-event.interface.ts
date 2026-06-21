export interface IDomainEvent<T extends string = string> {
  readonly name: T;
  readonly createdAt: Date;
}
