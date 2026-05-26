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
    goldenSetEntity: GoldenSetEntity,
    userInputEntity: UserInputEntity,
  ): Promise<void> {
    const result = await prisma.goldenSet_userInput.create({
      data: {
        goldenSetId: goldenSetEntity.getData("id"),
        userInputId: userInputEntity.getData("id"),
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
    repositoryDateMapper(result.goldenSet, goldenSetEntity);
    repositoryDateMapper(result.userInput, userInputEntity);
  }

  async getByFilters(filters: CopilotInputFilters): Promise<{
    goldenSetEntity: GoldenSetEntity[];
    userInputEntity: UserInputEntity[];
  }> {
    const results = await prisma.goldenSet_userInput.findMany({
      where: filters,
      include: {
        goldenSet: true,
        userInput: true,
      },
    });
    return {
      goldenSetEntity: results.map(({ goldenSet }) => {
        return repositoryDateMapper(
          goldenSet,
          new GoldenSetEntity(goldenSet, goldenSet.id),
        );
      }),
      userInputEntity: results.map(({ userInput }) => {
        return repositoryDateMapper(
          userInput,
          new UserInputEntity(userInput, userInput.id),
        );
      }),
    };
  }

  async getCopilotInputByGoldenSetIdAndUserInputId(
    goldenSetId: string,
    userInputId: string,
  ): Promise<{
    goldenSetEntity: GoldenSetEntity;
    userInputEntity: UserInputEntity;
  }> {
    const result = await prisma.goldenSet_userInput.findUnique({
      where: { goldenSetId_userInputId: { goldenSetId, userInputId } },
      include: { goldenSet: true, userInput: true, copilotOutput: true },
    });
    if (!result) {
      throw new Error(
        `No association found for GoldenSet ID ${goldenSetId} and UserInput ID ${userInputId}`,
      );
    }
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
  }
}
