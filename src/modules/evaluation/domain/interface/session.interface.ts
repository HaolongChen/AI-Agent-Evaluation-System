import type {
	CopilotOutputOptions,
	CopilotOutputReturnType,
} from "../../../copilot-output/domain/interface/copilot-output.interface.ts";
import type {
	RubricOptions,
	RubricReturnType,
} from "../../../rubrics/domain/interface/rubric.interface.ts";
import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { EvaluationSessionEntity } from "../entity/session.entity.ts";
import type {
	EvaluationRecordOptions,
	EvaluationRecordReturnType,
} from "./record.interface.ts";
import type {
	EvaluationResultOptions,
	EvaluationResultReturnType,
} from "./result.interface.ts";

export type EvaluationSetOptions = {
	name: "evaluationSet";
	options: {
		evaluationSession:
			| ExcludeOptions<EvaluationSessionOptions, "evaluationSet">
			| boolean;
		copilotOutput:
			| ExcludeOptions<CopilotOutputOptions, "evaluationSet">
			| boolean;
		rubric: ExcludeOptions<RubricOptions, "evaluationSet"> | boolean;
	};
};

export type EvaluationSessionOptions = {
	name: "evaluationSession";
	options: {
		evaluationSet:
			| ExcludeOptions<EvaluationSetOptions, "evaluationSession">
			| boolean;
		evaluationRecord:
			| ExcludeOptions<EvaluationRecordOptions, "evaluationSession">
			| boolean;
		evaluationResult:
			| ExcludeOptions<EvaluationResultOptions, "evaluationSession">
			| boolean;
	};
};

export type EvaluationSetReturnType<T> =
	T extends Partial<EvaluationSetOptions> ?
		{
			evaluationSession: ExcludeOptions<
				EvaluationSessionReturnType<T["evaluationSession"]>,
				"evaluationSet"
			>[];
			copilotOutput: ExcludeOptions<
				CopilotOutputReturnType<T["copilotOutput"]>,
				"evaluationSet"
			>;
			rubric: ExcludeOptions<RubricReturnType<T["rubric"]>, "evaluationSet">;
		}
	:	never;

export type EvaluationSessionReturnType<T> =
	T extends Partial<EvaluationSessionOptions> ?
		{
			entity: EvaluationSessionEntity;
			evaluationRecordEntity: ExcludeOptions<
				EvaluationRecordReturnType<T["evaluationRecord"]>,
				"evaluationSession"
			>[];
			evaluationResultEntity: ExcludeOptions<
				EvaluationResultReturnType<T["evaluationResult"]>,
				"evaluationSession"
			>;
			evaluationSet: ExcludeOptions<
				EvaluationSetReturnType<T["evaluationSet"]>,
				"evaluationSession"
			>;
		}
	: T extends true ? { entity: EvaluationSessionEntity }
	: never;

export interface IEvaluationSessionRepository extends IRepository<EvaluationSessionEntity> {
	getByCopilotOutputId(
		copilotOutputId: string,
	): Promise<Array<EvaluationSessionEntity>>;
	getByRubricId(rubricId: string): Promise<Array<EvaluationSessionEntity>>;
	getByCopilotOutputIdAndRubricId(
		copilotOutputId: string,
		rubricId: string,
	): Promise<Array<EvaluationSessionEntity>>;
}
