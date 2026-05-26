import { prisma } from "../../../../config/prisma.ts";
import { optionsToInclude } from "../../../shared/infrastructure/repository.ts";
import type { GoldenSetEntity } from "../../domain/entity/golden-set.entity.ts";
import type { UserInputEntity } from "../../domain/entity/user-input.entity.ts";

import type {
	CopilotInputFilters,
	CopilotInputOptions,
	CopilotInputReturnType,
	ICopilotInputRepository,
} from "../../domain/interface/copilot-input.interface.ts";

export const copilotInputOptionsToInclude = (options: CopilotInputOptions) => {
	return optionsToInclude(
		options as unknown as Parameters<typeof optionsToInclude>[0],
	);
};

export class CopilotInputRepository implements ICopilotInputRepository {
	async create<T extends CopilotInputOptions>(
		goldenSetEntity: GoldenSetEntity,
		userInputEntity: UserInputEntity,
		options: T,
	): Promise<CopilotInputReturnType<T>> {
		const result = await prisma.goldenSet_userInput.create({
			data: {
				goldenSetId: goldenSetEntity.getData("id"),
				userInputId: userInputEntity.getData("id"),
			},
			include: copilotInputOptionsToInclude(options),
		});

		return result as unknown as CopilotInputReturnType<T>;
	}

	async getByFilters<T extends CopilotInputOptions>(
		filters: CopilotInputFilters,
		options: T,
	): Promise<Array<CopilotInputReturnType<T>>> {
		const results = await prisma.goldenSet_userInput.findMany({
			where: filters,
			include: copilotInputOptionsToInclude(options),
		});
		return results as unknown as Array<CopilotInputReturnType<T>>;
	}
}
