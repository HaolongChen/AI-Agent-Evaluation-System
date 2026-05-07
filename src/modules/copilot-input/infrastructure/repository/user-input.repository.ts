import { prisma } from "../../../../config/prisma.ts";
import { UserInputEntity } from "../../domain/entity/user-input.entity.js";
import type { IUserInputRepository } from "../../domain/interface/user-input.interface.ts";

export class UserInputRepository implements IUserInputRepository {
  async getByGoldenSetId(goldenSetId: string): Promise<Array<UserInputEntity>> {
    const goldenSet = await prisma.goldenSet.findUnique({
      where: { id: goldenSetId },
      include: { userInputs: true },
    });
    if (!goldenSet) {
      throw new Error(`GoldenSet with ID ${goldenSetId} not found`);
    }
    return goldenSet.userInputs.map((userInput) => {
      const userInputEntity = new UserInputEntity(userInput, userInput.id);
      userInputEntity.createdAt = userInput.createdAt;
      return userInputEntity;
    });
  }
  async addGoldenSetAssociation(
    userInputId: string,
    goldenSetId: string,
  ): Promise<void> {
    await prisma.userInput.update({
      where: { id: userInputId },
      data: {
        goldenSets: {
          connect: { id: goldenSetId },
        },
      },
    });
  }
  async save(entity: UserInputEntity): Promise<void> {
    await prisma.userInput.create({ data: { ...entity.data, id: entity.id } });
  }
  async findById(id: string): Promise<UserInputEntity> {
    const userInput = await prisma.userInput.findUnique({
      where: { id },
    });
    if (!userInput) {
      throw new Error(`UserInput with ID ${id} not found`);
    }
    const userInputEntity = new UserInputEntity(userInput, userInput.id);
    userInputEntity.createdAt = userInput.createdAt;
    return userInputEntity;
  }
}
