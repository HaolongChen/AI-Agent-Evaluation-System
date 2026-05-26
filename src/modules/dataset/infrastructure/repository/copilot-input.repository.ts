import { prisma } from "../../../../config/prisma.ts";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import { GoldenSetEntity } from "../../domain/entity/golden-set.entity.js";
import { UserInputEntity } from "../../domain/entity/user-input.entity.js";

import type {
  CopilotInputFilters,
  ICopilotInputRepository,
} from "../../domain/interface/copilot-input.interface.ts";

export class CopilotInputRepository implements ICopilotInputRepository {
  async create(
    data: CopilotInputEntity
  ): Promise<CopilotInputEntity> {
    const result = await prisma.goldenSet_userInput.create({
      data: {
        goldenSetId: data.goldenSet.getData("id"),
        userInputId: data.userInput.getData("id"),
      },
      include: {
        goldenSet: true,
        userInput: true,
      },
    });
    if (!result) {
      throw new Error(
        `Failed to create association between GoldenSet ID ${goldenSetEntity.getData("id")} and UserInput ID ${userInputEntity.getData("id")}`,
      );
    }
    return repositoryDateMapper(result, data)
  }

  async getByFilters(filters: CopilotInputFilters): Promise<
    Array<{
      goldenSetEntity: GoldenSetEntity;
      userInputEntity: UserInputEntity;
    }>
  > {
    const results = await prisma.goldenSet_userInput.findMany({
      where: filters,
      include: {
        goldenSet: true,
        userInput: true,
      },
    });
    return results.map((result) => {
      return {
        goldenSetEntity: repositoryDateMapper(
          result.goldenSet,
          new GoldenSetEntity(result.goldenSet, result.goldenSet.id),
        ),
        userInputEntity: repositoryDateMapper(
          result.userInput,
          new UserInputEntity(result.userInput, result.userInput.id),
        ),
      };
    });
  }
}
