/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IDomainEvent<T extends string = string> {
  readonly name: T;
  readonly createdAt: Date;
  readonly data: any;
}
