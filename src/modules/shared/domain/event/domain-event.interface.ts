export interface IDomainEvent {
  readonly name: string;
  readonly createdAt: Date;
}
