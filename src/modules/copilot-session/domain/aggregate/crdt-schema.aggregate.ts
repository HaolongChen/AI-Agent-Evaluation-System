import type { z } from "zod";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import { crdtSchemaSchema } from "../schema/crdt-schema.schema.ts";
import { Entity } from "../../../shared/domain/entity/entity.ts";

export class CrdtSchemaAggregate extends AggregateRoot<
	typeof crdtSchemaSchema
> {
	constructor(data: z.input<typeof crdtSchemaSchema>, id?: string) {
		super(new Entity(data, crdtSchemaSchema, { id }), {});
	}

	get schemaId(): string {
		return new URL(this.getData("crdtModelUrl")).pathname.split("/")[2];
  }


}
