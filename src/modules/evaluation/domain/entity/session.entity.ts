import type z from "zod";
import {
	Entity,
	type EntityMetadata,
} from "../../../shared/domain/entity/entity.ts";
import {
	evaluationSessionSchema,
	type sessionIdentifierSchema,
} from "../schema/session.schema.ts";
import type { evaluationRecordSchema } from "../schema/record.schema.ts";
import type { evaluationResultSchema } from "../schema/result.schema.ts";


export class BaseSessionEntity<
	T extends
		| typeof evaluationSessionSchema
		| typeof evaluationRecordSchema
		| typeof evaluationResultSchema
		| typeof sessionIdentifierSchema,
	M extends EntityMetadata = EntityMetadata,
> extends Entity<T, M> {
	public get identifier(): z.infer<typeof sessionIdentifierSchema> {
		return this.getData() as z.infer<T>;
	}
}

export class EvaluationSessionEntity extends BaseSessionEntity<
	typeof evaluationSessionSchema
> {
	constructor(data: z.infer<typeof evaluationSessionSchema>, id?: string) {
		super(data, evaluationSessionSchema, id);
	}
}
