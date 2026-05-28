import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { CopilotInputAggregate } from "../aggregate/copilot-input.aggregate.ts";
import type { GoldenSetEntity } from "../entity/golden-set.entity.ts";
import type { UserInputEntity } from "../entity/user-input.entity.ts";

export type CopilotInputFilters = {
  goldenSetId: string;
  userInputId: string;
};

export interface ICopilotInputRepository extends IRepository<CopilotInputAggregate> {
  getByFilters<T extends Partial<CopilotInputFilters> | undefined>(
    filters: T,
  ): Promise<
    T extends Required<CopilotInputFilters>
      ? CopilotInputAggregate
      : CopilotInputAggregate[]
		>;

	addUserInput(goldenSet: GoldenSetEntity, userInputs: UserInputEntity[]): Promise<CopilotInputAggregate[]>
}
