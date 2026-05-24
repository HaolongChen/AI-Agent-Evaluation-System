import type { evaluationSessionSchema } from "../schema/session.schema.ts";
import type { EvaluationSessionEntity } from "../entity/session.entity.ts";
import type { EvaluationRecordEntity } from "../entity/record.entity.ts";
import type { EvaluationResultEntity } from "../entity/result.entity.ts";
import { BaseSessionAggregateRoot } from "./base.aggregate.ts";

export class EvaluationSessionAggregate extends BaseSessionAggregateRoot<
	typeof evaluationSessionSchema,
	{ recordEntity: EvaluationRecordEntity; resultEntity: EvaluationResultEntity }
> {
	constructor(data: EvaluationSessionEntity) {
		super(data);
	}

	private validateExternalEntity(
		entity: EvaluationRecordEntity | EvaluationResultEntity,
	): boolean {
		// Object.keys returns string[] which may not match the expected typed keys for getData.
		// Use a cast and structural comparison to avoid type incompatibilities while
		// preserving the intent of verifying the external entity belongs to this session.
		return this.identifier == entity.identifier; // Assuming both entities have an 'identifier' property that can be compared for equality.
	}

	public addRecordEntity(recordEntity: EvaluationRecordEntity): void {
		if (!this.validateExternalEntity(recordEntity)) {
			throw new Error("The record entity does not belong to this session.");
		}
		this.self("pushEntity", ["recordEntity", recordEntity]);
	}

	public set resultEntity(resultEntity: EvaluationResultEntity) {
		if (!this.validateExternalEntity(resultEntity)) {
			throw new Error("The result entity does not belong to this session.");
		}
		this.self("setEntity", ["resultEntity", resultEntity]);
	}

	public get recordsEntities(): EvaluationRecordEntity[] {
		return this.self("getEntity", ["recordEntity"]);
	}

	public get resultEntity(): EvaluationResultEntity | undefined {
		const results = this.self("getEntity", ["resultEntity"]);
		return results ? results[0] : undefined;
	}
}
