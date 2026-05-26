import { prisma } from "../../../../config/prisma.ts";
import {
  repositoryDateMapper,
} from "../../../shared/infrastructure/repository.ts";
import { UserInputEntity } from "../../domain/entity/user-input.entity.js";
import type {
  IUserInputRepository,
  UserInputOptions,
} from "../../domain/interface/user-input.interface.ts";

export class UserInputRepository implements IUserInputRepository {
  // async getByGoldenSetId(goldenSetId: string): Promise<Array<UserInputEntity>> {
  //   const goldenSets = await prisma.goldenSet_userInput.findMany({
  //     where: { goldenSetId },
  //     include: { userInput: true, copilotOutput: true },
  //   });
  //   return goldenSets.map(({ userInput }) =>
  //     repositoryDateMapper(
  //       userInput,
  //       new UserInputEntity(userInput, userInput.id),
  //     ),
  //   );
  // }

  async getAll(): Promise<Array<UserInputEntity>> {
    const userInputs = await prisma.userInput.findMany();
    return userInputs.map((userInput) =>
      repositoryDateMapper(
        userInput,
        new UserInputEntity(userInput, userInput.id),
      ),
    );
  }
  async getAll(): Promise<Array<UserInputEntity>> {
    const userInputs = await prisma.userInput.findMany();
    return userInputs.map((userInput) =>
      repositoryDateMapper(
        userInput,
        new UserInputEntity(userInput, userInput.id),
      ),
    );
  }

  // async addGoldenSetAssociation(
  //   userInputId: string,
  //   goldenSetId: string,
  // ): Promise<{
  //   goldenSetEntity: GoldenSetEntity;
  //   userInputEntity: UserInputEntity;
  // }> {
  //   const result = await prisma.goldenSet_userInput.create({
  //     data: {
  //       goldenSetId,
  //       userInputId,
  //     },
  //     include: { goldenSet: true, userInput: true, copilotOutput: true },
  //   });
  //   return {
  //     goldenSetEntity: repositoryDateMapper(
  //       result.goldenSet,
  //       new GoldenSetEntity(result.goldenSet, result.goldenSet.id),
  //     ),
  //     userInputEntity: repositoryDateMapper(
  //       result.userInput,
  //       new UserInputEntity(result.userInput, result.userInput.id),
  //     ),
  //   };
  // }
  async save(entity: UserInputEntity): Promise<void> {
    const userInput = await prisma.userInput.create({
      data: entity.getData(),
    });
    repositoryDateMapper(userInput, entity);
  }
  async findById(
    id: string,
    options?: UserInputOptions,
  ): Promise<UserInputEntity> {
    const userInput = await prisma.userInput.findUnique({
      where: { id },
      include: options
        ? optionsToInclude(
            options as unknown as Parameters<typeof optionsToInclude>[0],
          )
        : undefined,
    });
    if (!userInput) {
      throw new Error(`UserInput with ID ${id} not found`);
    }
    return repositoryDateMapper(
      userInput,
      new UserInputEntity(userInput, userInput.id),
    );
  }
}
