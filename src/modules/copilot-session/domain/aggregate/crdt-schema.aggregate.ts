import type { z } from "zod";
import { crdtSchemaSchema } from "../schema/crdt-schema.schema.ts";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import {
  Entity,
  type EntityMetadata,
} from "../../../shared/domain/entity/entity.ts";
import type { ProjectAggregate } from "./project.aggregate.ts";

export class CrdtSchemaAggregate extends AggregateRoot<
  typeof crdtSchemaSchema,
  EntityMetadata & { copilotInputId: string; copilotServerId: string }
> {
  constructor(
    data: z.input<typeof crdtSchemaSchema>,
    project: ProjectAggregate,
  ) {
    super(
      new Entity(data, crdtSchemaSchema, {
        id: project.getData("id"),
        copilotInputId: project.getData("copilotInputId"),
        copilotServerId: project.getData("copilotServerId"),
      }),
      {},
    );
  }

  get schemaId(): string {
    return new URL(this.getData("crdtModelUrl")).pathname.split("/")[2];
  }
}
