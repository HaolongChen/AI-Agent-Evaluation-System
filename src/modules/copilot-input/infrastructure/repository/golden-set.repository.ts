import type { output } from "zod";
import { GoldenSetEntity } from "../../domain/entity/golden-set.entity.js";
import type { IGoldenSetRepository } from "../../domain/interface/golden-set.interface.ts";
import type { goldenSetFiltersSchema } from "../../domain/schema/golden-set.schema.ts";
import { prisma } from "../../../../config/prisma.ts";
import { UserInputEntity } from "../../domain/entity/user-input.entity.js";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";

export class GoldenSetRepository implements IGoldenSetRepository {
  async getCopilotInputByGoldenSetIdAndUserInputId(
    goldenSetId: string,
    userInputId: string,
  ): Promise<{
    goldenSetEntity: GoldenSetEntity;
    userInputEntity: UserInputEntity;
  }> {
    const goldenSetUserInput = await prisma.goldenSet_userInput.findUnique({
      where: { goldenSetId_userInputId: { goldenSetId, userInputId } },
      include: { goldenSet: true, userInput: true },
    });
    if (!goldenSetUserInput) {
      throw new Error(
        `No association found for GoldenSet ID ${goldenSetId} and UserInput ID ${userInputId}`,
      );
    }
    return {
      goldenSetEntity: repositoryDateMapper(
        goldenSetUserInput.goldenSet,
        new GoldenSetEntity(
          goldenSetUserInput.goldenSet,
          goldenSetUserInput.goldenSet.id,
        ),
      ),
      userInputEntity: repositoryDateMapper(
        goldenSetUserInput.userInput,
        new UserInputEntity(
          goldenSetUserInput.userInput,
          goldenSetUserInput.userInput.id,
        ),
      ),
    };
  }
  async getByUserInputId(userInputId: string): Promise<Array<GoldenSetEntity>> {
    const userInputs = await prisma.goldenSet_userInput.findMany({
      where: { userInputId },
      include: { goldenSet: true },
    });
    return userInputs.map(({ goldenSet }) =>
      repositoryDateMapper(
        goldenSet,
        new GoldenSetEntity(goldenSet, goldenSet.id),
      ),
    );
  }
  async getByFilters(
    filters: output<typeof goldenSetFiltersSchema>,
  ): Promise<Array<GoldenSetEntity>> {
    const goldenSets = await prisma.goldenSet.findMany({
      where: { ...filters },
    });
    return goldenSets.map((goldenSet) =>
      repositoryDateMapper(
        goldenSet,
        new GoldenSetEntity(goldenSet, goldenSet.id),
      ),
    );
  }
  async addUserInputAssociation(
    goldenSetId: string,
    userInputId: string,
  ): Promise<void> {
    await prisma.goldenSet_userInput.create({
      data: {
        goldenSetId,
        userInputId,
      },
    });
  }
  async save(entity: GoldenSetEntity): Promise<void> {
    const goldenSet = await prisma.goldenSet.create({
      data: { ...entity.data, id: entity.id },
    });
    repositoryDateMapper(goldenSet, entity);
  }
  async findById(id: string): Promise<GoldenSetEntity> {
    const goldenSet = await prisma.goldenSet.findUnique({ where: { id } });
    if (!goldenSet) {
      throw new Error(`GoldenSet with ID ${id} not found`);
    }
    return repositoryDateMapper(
      goldenSet,
      new GoldenSetEntity(goldenSet, goldenSet.id),
    );
  }
}
