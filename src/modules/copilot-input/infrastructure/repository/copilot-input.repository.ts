import { prisma } from "../../../../config/prisma.ts";
import {
  optionsToInclude,
  repositoryDateMapper,
} from "../../../shared/infrastructure/repository.ts";
import { GoldenSetEntity } from "../../domain/entity/golden-set.entity.js";
import { UserInputEntity } from "../../domain/entity/user-input.entity.js";

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

  async getByUserInputId(userInputId: string): Promise<Array<GoldenSetEntity>> {
    const records = await prisma.goldenSet_userInput.findMany({
      where: { userInputId },
      include: { goldenSet: true, copilotOutput: true },
    });
    return records.map(({ goldenSet }) =>
      repositoryDateMapper(
        goldenSet,
        new GoldenSetEntity(goldenSet, goldenSet.id),
      ),
    );
  }

  async getByGoldenSetId(goldenSetId: string): Promise<Array<UserInputEntity>> {
    const records = await prisma.goldenSet_userInput.findMany({
      where: { goldenSetId },
      include: { userInput: true, copilotOutput: true },
    });
    return records.map(({ userInput }) =>
      repositoryDateMapper(
        userInput,
        new UserInputEntity(userInput, userInput.id),
      ),
    );
  }

  async addGoldenSetAssociation(
    userInputId: string,
    goldenSetId: string,
  ): Promise<{
    goldenSetEntity: GoldenSetEntity;
    userInputEntity: UserInputEntity;
  }> {
    const result = await prisma.goldenSet_userInput.create({
      data: {
        goldenSetId,
        userInputId,
      },
      include: { goldenSet: true, userInput: true, copilotOutput: true },
    });
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
