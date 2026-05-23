import { UserInputEntity } from "../domain/entity/user-input.entity.ts";
import type { IUserInputRepository } from "../domain/interface/user-input.interface.ts";

export class CreateUserInputUseCase {
  constructor(private readonly repository: IUserInputRepository) {}

  async execute(content: string, createdBy?: string) {
    const userInputEntity = new UserInputEntity({
      content,
      createdBy: createdBy ?? "unknown",
    });
    await this.repository.save(userInputEntity);
    return userInputEntity.getData();
  }
}
