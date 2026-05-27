import { prisma } from "../../../../config/prisma.ts";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import { CopilotInputEntity } from "../../domain/entity/copilot-input.entity.ts";
import { GoldenSetEntity } from "../../domain/entity/golden-set.entity.ts";
import { UserInputEntity } from "../../domain/entity/user-input.entity.ts";
import type { ICopilotInputRepository } from "../../domain/interface/copilot-input.interface.ts";

export class CopilotInputRepository implements ICopilotInputRepository {
	async findById(id: string): Promise<CopilotInputEntity> {
		const result = await prisma.copilotInput.findUnique({
			where: { id },
			include: {
				goldenSet: true,
				userInput: true,
			},
		});
		if (!result) {
			throw new Error(`CopilotInput with ID ${id} not found`);
		}
		return repositoryDateMapper(
			result,
			new CopilotInputEntity(
				repositoryDateMapper(
					result.goldenSet,
					new GoldenSetEntity(result.goldenSet, result.id),
				),
				repositoryDateMapper(
					result.userInput,
					new UserInputEntity(result.userInput, result.userInputId),
				),
				result.id,
			),
		) as unknown as CopilotInputEntity;
	}
	async save(entity: CopilotInputEntity): Promise<void> {
		const result = await prisma.copilotInput.create({
			data: {
				goldenSetId: entity.goldenSetEntity.getData("id"),
				userInputId: entity.userInputEntity.getData("id"),
			},
			// include: { userInput: true, goldenSet: true },
		});
		repositoryDateMapper(result, entity);
	}
}
