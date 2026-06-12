import type { z } from "zod";
import { crdtSchemaSchema } from "../schema/crdt-schema.schema.ts";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import type { ProjectEntity } from "../entity/project.entity.ts";

export class CrdtSchemaAggregate extends AggregateRoot<
  typeof crdtSchemaSchema
> {
  constructor(data: z.input<typeof crdtSchemaSchema>, project: ProjectEntity) {
    super(
      new Entity(data, crdtSchemaSchema, { id: project.getData("id") }),
      {},
    );
  }

  get schemaId(): string {
    return new URL(this.getData("crdtModelUrl")).pathname.split("/")[2];
  }
}
