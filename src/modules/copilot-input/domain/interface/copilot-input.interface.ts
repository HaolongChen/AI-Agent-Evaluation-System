import type {
	CopilotOutputOptions,
	CopilotOutputReturnType,
} from "../../../copilot-output/domain/interface/copilot-output.interface.ts";
import type {
	RubricOptions,
	RubricReturnType,
} from "../../../rubrics/domain/interface/rubric.interface.ts";
import type { ExcludeOptions } from "../../../shared/domain/interface/repository.interface.ts";
import type { GoldenSetEntity } from "../entity/golden-set.entity.ts";
import type { UserInputEntity } from "../entity/user-input.entity.ts";
import type { GoldenSetOptions } from "./golden-set.interface.ts";
import type { UserInputOptions } from "./user-input.interface.ts";

export type CopilotInputOptions = {
	name: "copilotInput";
	options: {
		goldenSet: ExcludeOptions<GoldenSetOptions, "copilotInput"> | boolean;
		userInput: ExcludeOptions<UserInputOptions, "copilotInput"> | boolean;
		copilotOutput:
			| ExcludeOptions<CopilotOutputOptions, "copilotInput">
			| boolean;
		rubric: ExcludeOptions<RubricOptions, "evaluationSet"> | boolean;
	};
};

export type CopilotInputReturnType<T> =
	T extends Partial<CopilotInputOptions> ?
		{
			goldenSetEntity: ExcludeOptions<GoldenSetEntity, "copilotInput">;
			userInputEntity: ExcludeOptions<UserInputEntity, "copilotInput">;
			copilotOutput: ExcludeOptions<
				CopilotOutputReturnType<T["copilotOutput"]>,
				"copilotInput"
			>[];
			rubric: ExcludeOptions<RubricReturnType<T["rubric"]>, "evaluationSet">[];
		}
	:	never;

export type CopilotInputFilters = {
	goldenSetId?: string;
	userInputId?: string;
};

export interface ICopilotInputRepository {
	create<T extends CopilotInputOptions>(
		goldenSetEntity: GoldenSetEntity,
		userInputEntity: UserInputEntity,
		options: T,
	): Promise<CopilotInputReturnType<T>>;

	getByFilters<T extends CopilotInputOptions>(
		filters: CopilotInputFilters,
		options: T,
	): Promise<Array<CopilotInputReturnType<T>>>;
}
