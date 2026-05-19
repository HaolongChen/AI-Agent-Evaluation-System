import { prisma } from "../../../../config/prisma.ts";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import { UserInputEntity } from "../../domain/entity/user-input.entity.js";
import type { IUserInputRepository } from "../../domain/interface/user-input.interface.ts";

export class UserInputRepository implements IUserInputRepository {
  async getByGoldenSetId(goldenSetId: string): Promise<Array<UserInputEntity>> {
    const goldenSets = await prisma.goldenSet_userInput.findMany({
      where: { goldenSetId },
      include: { userInput: true },
    });
    return goldenSets.map(({ userInput }) =>
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

  async addGoldenSetAssociation(
    userInputId: string,
    goldenSetId: string,
  ): Promise<void> {
    await prisma.goldenSet_userInput.create({
      data: {
        goldenSetId,
        userInputId,
      },
    });
  }
  async save(entity: UserInputEntity): Promise<void> {
    const userInput = await prisma.userInput.create({
      data: { ...entity.data, id: entity.id },
    });
    repositoryDateMapper(userInput, entity);
  }
  async findById(id: string): Promise<UserInputEntity> {
    const userInput = await prisma.userInput.findUnique({
      where: { id },
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
