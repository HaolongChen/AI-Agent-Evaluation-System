import type { Account } from "../../account/domain/aggregate/account.aggregate.ts";
import type { NetworkAccount } from "../../account/domain/service/account.service.ts";
import { UserInputEntity } from "../domain/entity/user-input.entity.ts";
import type { IUserInputRepository } from "../domain/interface/user-input.interface.ts";

export class CreateUserInputUseCase {
  constructor(
    private readonly repository: IUserInputRepository,
    private readonly networkAccountService: NetworkAccount,
  ) {}

  async execute(content: string, account: Account) {
    const userInputEntity = new UserInputEntity({
      content,
      createdBy: account.getData("username"),
    });
    await this.repository.save(userInputEntity);
    return userInputEntity.getData();
  }
}
