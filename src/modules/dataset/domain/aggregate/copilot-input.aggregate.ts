import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";
import { CopilotInputEntity } from "../entity/copilot-input.entity.ts";
import type { GoldenSetEntity } from "../entity/golden-set.entity.ts";
import type { UserInputEntity } from "../entity/user-input.entity.ts";
import { copilotInputSchema } from "../schema/copilot-input.schema.ts";

export class CopilotInputAggregate extends AggregateRoot<
  typeof copilotInputSchema,
  EntityMetadata,
  { goldenSet: GoldenSetEntity; userInput: UserInputEntity }
> {
  constructor(data: CopilotInputAggregate);
  constructor(
    goldenSetEntity: GoldenSetEntity,
    userInputEntity: UserInputEntity,
    id?: string,
  );
  constructor(
    argument1: CopilotInputAggregate | GoldenSetEntity,
    argument2?: UserInputEntity,
    argument3?: string,
  ) {
    if (argument1 instanceof CopilotInputAggregate) {
      super(argument1);
      this.setEntity("goldenSet", argument1.getEntity("goldenSet"));
      this.setEntity("userInput", argument1.getEntity("userInput"));
    } else {
      super(new CopilotInputEntity(argument3));
      this.setEntity("goldenSet", argument1);
      this.setEntity("userInput", argument2!);
    }
  }
}
