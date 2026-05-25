import type {
	EvaluationSetOptions,
	EvaluationSetReturnType,
} from "../../../evaluation/domain/interface/session.interface.ts";
import type { ExcludeOptions, IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { CopilotOutputEntity } from "../entity/copilot-output.entity.ts";

export type CopilotOutputOptions = {
	name: "copilotOutput";
	options: {
		evaluationSet:
			| ExcludeOptions<EvaluationSetOptions, "copilotOutput">
			| boolean;
	};
};

export type CopilotOutputReturnType<T> =
	T extends Partial<CopilotOutputOptions> ?
		{
			entity: CopilotOutputEntity;
			evaluationSet: EvaluationSetReturnType<T["evaluationSet"]>[];
		}
	: T extends true ? { entity: CopilotOutputEntity }
	: never;

export interface ICopilotOutputRepository extends IRepository<CopilotOutputEntity> {
	getByGoldenSetIdAndUserInputId(
		goldenSetId: string,
		userInputId: string,
	): Promise<CopilotOutputEntity[]>;
}
