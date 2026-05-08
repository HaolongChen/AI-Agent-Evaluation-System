import type z from "zod";
import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { GoldenSetEntity } from "../entity/golden-set.entity.ts";
import type { goldenSetFiltersSchema } from "../schema/golden-set.schema.ts";
import type { UserInputEntity } from "../entity/user-input.entity.ts";

export interface IGoldenSetRepository extends IRepository<GoldenSetEntity> {
  getByUserInputId(userInputId: string): Promise<Array<GoldenSetEntity>>;

  getByFilters(
    filters: z.infer<typeof goldenSetFiltersSchema>,
  ): Promise<Array<GoldenSetEntity>>;

  addUserInputAssociation(
    goldenSetId: string,
    userInputId: string,
  ): Promise<void>;

  getCopilotInputByGoldenSetIdAndUserInputId(
    goldenSetId: string,
    userInputId: string,
  ): Promise<{
    goldenSetEntity: GoldenSetEntity;
    userInputEntity: UserInputEntity;
  }>;
}
