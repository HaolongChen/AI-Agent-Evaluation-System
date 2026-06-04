import type { AccountService } from "../../account/domain/service/online-account.service.ts";
import { UserInputEntity } from "../domain/entity/user-input.entity.ts";
import type { IUserInputRepository } from "../domain/interface/user-input.interface.ts";

export class CreateUserInputUseCase {
  constructor(
    private repository: IUserInputRepository,
    private account: AccountService,
  ) {}

  async execute(content: string) {
    const userInputEntity = new UserInputEntity({
      content,
      createdBy: this.account.account.getUsername(),
    });
    await this.repository.save(userInputEntity);
    return userInputEntity.getData();
  }
}
