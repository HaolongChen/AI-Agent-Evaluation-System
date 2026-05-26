import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { UserInputEntity } from "../entity/user-input.entity.ts";

export interface IUserInputRepository extends IRepository<UserInputEntity> {
  findById(id: string): Promise<UserInputEntity>;

  getAll(): Promise<Array<UserInputEntity>>;

  // getByGoldenSetId(goldenSetId: string): Promise<Array<UserInputEntity>>;

  // addGoldenSetAssociation(
  //   userInputId: string,
  //   goldenSetId: string,
  // ): Promise<{
  //   goldenSetEntity: GoldenSetEntity;
  //   userInputEntity: UserInputEntity;
  // }>;
}
