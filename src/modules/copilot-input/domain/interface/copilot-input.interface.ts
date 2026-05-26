import type { GoldenSetEntity } from "../entity/golden-set.entity.js";
import type { UserInputEntity } from "../entity/user-input.entity.js";

export type CopilotInputFilters = {
  goldenSetId?: string;
  userInputId?: string;
};

export interface ICopilotInputRepository {
  create(
    goldenSetEntity: GoldenSetEntity,
    userInputEntity: UserInputEntity,
  ): Promise<void>;

  getByFilters(filters: CopilotInputFilters): Promise<
    Array<{
      goldenSetEntity: GoldenSetEntity;
      userInputEntity: UserInputEntity;
    }>
  >;
}
