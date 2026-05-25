import type {
  ExcludeOptions,
  IRepository,
} from "../../../shared/domain/interface/repository.interface.ts";
import type { GoldenSetEntity } from "../entity/golden-set.entity.ts";
import type { UserInputEntity } from "../entity/user-input.entity.ts";
import type {
  CopilotInputOptions,
  CopilotInputReturnType,
} from "./copilot-input.interface.ts";

export type UserInputOptions = {
  name: "userInput";
  options: {
    copilotInput: ExcludeOptions<CopilotInputOptions, "userInput"> | boolean;
  };
};

export type UserInputReturnType<T> = T extends {
  options: { copilotInput: infer CI };
}
  ? {
      entity: UserInputEntity;
      copilotInput: CopilotInputReturnType<CI>[];
    }
  : T extends true
    ? { entity: UserInputEntity }
    : never;

export interface IUserInputRepository extends IRepository<UserInputEntity> {
  findById(id: string): Promise<UserInputEntity>;

  getAll(): Promise<Array<UserInputEntity>>;

  getByGoldenSetId(goldenSetId: string): Promise<Array<UserInputEntity>>;

  addGoldenSetAssociation(
    userInputId: string,
    goldenSetId: string,
  ): Promise<{
    goldenSetEntity: GoldenSetEntity;
    userInputEntity: UserInputEntity;
  }>;
}
