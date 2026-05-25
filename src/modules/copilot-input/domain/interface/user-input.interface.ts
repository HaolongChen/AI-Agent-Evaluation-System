import type {
	ExcludeOptions,
	IRepository,
} from "../../../shared/domain/interface/repository.interface.ts";
import type { UserInputEntity } from "../entity/user-input.entity.ts";
import type {
	CopilotInputOptions,
	CopilotInputReturnType,
} from "./copilot-input.interface.ts";

export type UserInputOptions = {
	name: "userInput";
	options: {
		copilotInput: ExcludeOptions<CopilotInputOptions, "userInput"> | boolean;
	};
};

export type UserInputReturnType<T> =
	T extends Partial<UserInputOptions> ?
		{
			entity: UserInputEntity;
			copilotInput: ExcludeOptions<
				CopilotInputReturnType<T["copilotInput"]>,
				"userInputEntity"
			>[];
		}
	: T extends true ? { entity: UserInputEntity }
	: never;

export interface IUserInputRepository extends IRepository<UserInputEntity> {
	getAll<T extends UserInputOptions>(
		options: T,
	): Promise<Array<UserInputReturnType<T>>>;
}
