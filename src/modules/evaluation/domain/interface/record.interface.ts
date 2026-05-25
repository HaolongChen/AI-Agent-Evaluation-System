import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { EvaluationRecordEntity } from "../entity/record.entity.ts";
import type {
	EvaluationSessionOptions,
	EvaluationSessionReturnType,
} from "./session.interface.ts";

export type EvaluationRecordOptions = {
	name: "evaluationRecord";
	options: {
		evaluationSession:
			| ExcludeOptions<EvaluationSessionOptions, "evaluationRecord">
			| boolean;
	};
};

export type EvaluationRecordReturnType<T> =
	T extends Partial<EvaluationRecordOptions> ?
		{
			entity: EvaluationRecordEntity;
			evaluationSession: ExcludeOptions<
				EvaluationSessionReturnType<T["evaluationSession"]>,
				"evaluationRecord"
			>;
		}
	: T extends true ? { entity: EvaluationRecordEntity }
	: never;

export interface IEvaluationRecordRepository extends IRepository<EvaluationRecordEntity> {
	getByEvaluationSessionId(
		evaluationSessionId: string,
	): Promise<Array<EvaluationRecordEntity>>;
}
