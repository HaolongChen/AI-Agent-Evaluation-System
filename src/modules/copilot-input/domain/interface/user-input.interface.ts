import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { UserInputEntity } from "../entity/user-input.entity.ts";

export interface IUserInputRepository extends IRepository<UserInputEntity> {
  getByGoldenSetId(goldenSetId: string): Promise<Array<UserInputEntity>>;

  addGoldenSetAssociation(
    userInputId: string,
    goldenSetId: string,
  ): Promise<void>;
}
