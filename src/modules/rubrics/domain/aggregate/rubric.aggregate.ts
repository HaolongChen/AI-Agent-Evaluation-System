import type { z } from "zod";
import { ProjectAggregate } from "../../../copilot-session/domain/aggregate/project.aggregate.ts";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";
import { CriteriaEntity, RubricEntity } from "../entity/rubric.entity.ts";
import { criteriaSchema, type rubricSchema } from "../schema/rubric.schema.ts";
import type { GoldenSetEntity } from "../../../dataset/domain/entity/golden-set.entity.ts";
import type { UserInputEntity } from "../../../dataset/domain/entity/user-input.entity.ts";
import type { CopilotOutputEntity } from "../../../copilot-session/domain/entity/copilot-output.entity.ts";

/**
 * knowledge needed from other modules:
 * 1. What common users actually hold (e.g. schema model)
 * 2. What users exactly produce (e.g. user input, context, etc.)
 * 3. What users expect to get (e.g. copilot output)
 */

export class RubricAggregate extends AggregateRoot<
  typeof rubricSchema,
  EntityMetadata,
  {
    goldenSet: GoldenSetEntity;
    userInput: UserInputEntity;
    copilotOutput: CopilotOutputEntity;
    criterion: CriteriaEntity[];
  }
> {
  constructor(projectAggregate: ProjectAggregate, id?: string);
  constructor(
    entity: {
      goldenSet: GoldenSetEntity;
      userInput: UserInputEntity;
      copilotOutput: CopilotOutputEntity;
    },
    id?: string,
  );
  constructor(
    argument1:
      | ProjectAggregate
      | {
          goldenSet: GoldenSetEntity;
          userInput: UserInputEntity;
          copilotOutput: CopilotOutputEntity;
        },
    id?: string,
  ) {
    const initialCriterion: CriteriaEntity[] = [];
    if (argument1 instanceof ProjectAggregate) {
      if (!argument1.getEntity("copilotOutput")) {
        throw new Error("Copilot output is required to create a rubric.");
      }
      super(new RubricEntity(id), {
        goldenSet: argument1.getEntity("copilotInput").getEntity("goldenSet"),
        userInput: argument1.getEntity("copilotInput").getEntity("userInput"),
        copilotOutput: argument1.getEntity("copilotOutput")!,
        criterion: initialCriterion,
      });
    } else {
      super(new RubricEntity(id), {
        ...argument1,
        criterion: initialCriterion,
      });
    }
  }

  addCriteria(data: z.infer<typeof criteriaSchema>, id?: string): void;
  addCriteria(data: CriteriaEntity): void;
  addCriteria(
    data: z.infer<typeof criteriaSchema> | CriteriaEntity,
    id?: string,
  ): void {
    if (data instanceof CriteriaEntity) {
      if (!data.getData("isSaved")) {
        throw new Error("Only saved criteria can be added to the rubric.");
      }
      this.getEntity("criterion").push(data);
    } else {
      this.pushEntity("criterion", new CriteriaEntity(data, id));
    }
  }

  get totalWeight(): number {
    return this.getEntity("criterion").reduce(
      (total, criterion) => total + criterion.getData().weight,
      0,
    );
  }
}
