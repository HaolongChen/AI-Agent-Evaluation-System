import type { IDomainEvent } from "../../../shared/domain/event/domain-event.interface.ts";
import type { ProjectAggregate } from "../../domain/aggregate/project.aggregate.ts";

export class ProjectActivatedEvent implements IDomainEvent {
  readonly name = "project.activated";
  readonly createdAt = new Date();

  constructor(public readonly project: ProjectAggregate) {}
}
