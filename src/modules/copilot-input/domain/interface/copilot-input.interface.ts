import type {
  CopilotOutputOptions,
  CopilotOutputReturnType,
} from "../../../copilot-output/domain/interface/copilot-output.interface.ts";
import type {
  RubricOptions,
  RubricReturnType,
} from "../../../rubrics/domain/interface/rubric.interface.ts";
import type { ExcludeOptions } from "../../../shared/domain/interface/repository.interface.ts";
import type { GoldenSetEntity } from "../entity/golden-set.entity.js";
import type { UserInputEntity } from "../entity/user-input.entity.js";
import type {
  GoldenSetOptions,
  GoldenSetReturnType,
} from "./golden-set.interface.ts";
import type {
  UserInputOptions,
  UserInputReturnType,
} from "./user-input.interface.ts";


export type CopilotInputOptions = {
  name: "copilotInput";
  options: {
    goldenSet: ExcludeOptions<GoldenSetOptions, "copilotInput"> | boolean;
    userInput: ExcludeOptions<UserInputOptions, "copilotInput"> | boolean;
    copilotOutput:
      | ExcludeOptions<CopilotOutputOptions, "copilotInput">
      | boolean;
    rubric: ExcludeOptions<RubricOptions, "evaluationSet"> | boolean;
  };
};

export type CopilotInputReturnType<T> = {
  goldenSetEntity: T extends { options: { goldenSet: infer GS } }
    ? GoldenSetReturnType<GS>
    : never;
  userInputEntity: T extends { options: { userInput: infer UI } }
    ? UserInputReturnType<UI>
    : never;
  copilotOutput: T extends { options: { copilotOutput: infer CO } }
    ? CopilotOutputReturnType<CO>[]
    : never;
  rubric: T extends { options: { rubric: infer R } }
    ? RubricReturnType<R>[]
    : never;
};

export type CopilotInputFilters = {
  goldenSetId?: string;
  userInputId?: string;
};

export interface ICopilotInputRepository {
  create<T extends CopilotInputOptions>(
    goldenSetEntity: GoldenSetEntity,
    userInputEntity: UserInputEntity,
    options: T,
  ): Promise<CopilotInputReturnType<T>>;

  getByFilters<T extends CopilotInputOptions>(
    filters: CopilotInputFilters,
    options: T,
  ): Promise<Array<CopilotInputReturnType<T>>>;

  getByUserInputId(userInputId: string): Promise<Array<GoldenSetEntity>>;

  getByGoldenSetId(goldenSetId: string): Promise<Array<UserInputEntity>>;

  getCopilotInputByGoldenSetIdAndUserInputId(
    goldenSetId: string,
    userInputId: string,
  ): Promise<{
    goldenSetEntity: GoldenSetEntity;
    userInputEntity: UserInputEntity;
  }>;

  addGoldenSetAssociation(
    userInputId: string,
    goldenSetId: string,
  ): Promise<{
    goldenSetEntity: GoldenSetEntity;
    userInputEntity: UserInputEntity;
  }>;
}
