import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { CopilotInputAggregate } from "../aggregate/copilot-input.aggregate.ts";

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
}
