import { prisma } from "../../../../config/prisma.ts";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import { CopilotInputAggregate } from "../../domain/aggregate/copilot-input.aggregate.ts";
import { GoldenSetEntity } from "../../domain/entity/golden-set.entity.ts";
import { UserInputEntity } from "../../domain/entity/user-input.entity.ts";
import type { ICopilotInputRepository } from "../../domain/interface/copilot-input.interface.ts";

export class CopilotInputRepository implements ICopilotInputRepository {
  async findById(id: string): Promise<CopilotInputAggregate> {
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
    const goldenSetEntity = repositoryDateMapper(
      result.goldenSet,
      new GoldenSetEntity(result.goldenSet, result.goldenSet.id),
    );
    const userInputEntity = repositoryDateMapper(
      result.userInput,
      new UserInputEntity(result.userInput, result.userInputId),
    );
    const copilotInputAggregate = new CopilotInputAggregate(
      goldenSetEntity,
      userInputEntity,
      result.id,
    );

    return repositoryDateMapper(result, copilotInputAggregate);
  }
  async save(data: CopilotInputAggregate): Promise<void> {
    const result = await prisma.copilotInput.create({
      data: {
        id: data.getData("id"),
        goldenSetId: data.getEntity("goldenSet")[0].getData("id"),
        userInputId: data.getEntity("userInput")[0].getData("id"),
      },
      // include: { userInput: true, goldenSet: true },
    });
    repositoryDateMapper(result, data);
  }
}
