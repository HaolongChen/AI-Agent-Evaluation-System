import type { IUserInputRepository } from "../domain/interface/user-input.interface.ts";

export class GetUserInputByIdUseCase {
  constructor(private readonly repository: IUserInputRepository) {}

  async execute(userInputId: string) {
    const userInputEntity = await this.repository.findById(userInputId);
    return userInputEntity.toJSON();
  }
}

export class GetUserInputsUseCase {
  constructor(private readonly repository: IUserInputRepository) {}

  async execute() {
    const userInputEntities = await this.repository.getAll();
    return userInputEntities.map((entity) => entity.toJSON());
  }
}
