import { prisma } from "../../../../config/prisma.ts";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import { UserInputEntity } from "../../domain/entity/user-input.entity.js";
import type { IUserInputRepository } from "../../domain/interface/user-input.interface.ts";

export type UserInputRepositoryType = {
  id: string;
  content: string;
  createdAt: Date;
  createdBy: string;
};

export const userInputDataMapper = (
  data: UserInputRepositoryType,
  entity?: UserInputEntity,
): UserInputEntity => {
  return repositoryDateMapper(
    data,
    entity || new UserInputEntity(data, data.id),
  );
};

export class UserInputRepository implements IUserInputRepository {
  async getAll(): Promise<Array<UserInputEntity>> {
    const userInputs = await prisma.userInput.findMany();
    return userInputs.map((element) => userInputDataMapper(element));
  }
  async save(entity: UserInputEntity): Promise<void> {
    const userInput = await prisma.userInput.create({
      data: entity.getData(),
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
    return userInputDataMapper(userInput);
  }
}
