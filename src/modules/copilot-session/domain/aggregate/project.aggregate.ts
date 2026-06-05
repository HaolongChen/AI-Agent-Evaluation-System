import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import { ProjectEntity } from "../entity/project.entity.ts";
import { projectSchema } from "../schema/project.schema.ts";
import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../../dataset/domain/entity/copilot-server.entity.ts";
import type { z } from "zod";
import { copilotOutputSchema } from "../schema/copilot-output.schema.ts";
import type {
  Entity,
  EntityMetadata,
  OneOrMany,
} from "../../../shared/domain/entity/entity.ts";
import type { GoldenSetEntity } from "../../../dataset/domain/entity/golden-set.entity.ts";
import type { UserInputEntity } from "../../../dataset/domain/entity/user-input.entity.ts";
import { CopilotOutputEntity } from "../entity/copilot-output.entity.ts";

export type CopilotExecutionLogs = {
  [K in keyof Omit<
    z.infer<typeof copilotOutputSchema>,
    "copilotSessionExId"
  >]: z.infer<typeof copilotOutputSchema>[K] extends string
    ? z.infer<typeof copilotOutputSchema>[K] | undefined
    : z.infer<typeof copilotOutputSchema>[K];
};
export type ProjectToSessionDetails = {
  copilotSessionExId: string;
  copilotServerData: ReturnType<CopilotServerEntity["getData"]>;
  copilotInputData: {
    goldenSetData: ReturnType<GoldenSetEntity["getData"]>;
    userInputData: ReturnType<UserInputEntity["getData"]>;
  };
};

export type ProjectAggregateMetadata = EntityMetadata & {
  copilotInputId: string;
  copilotServerId: string;
};

export class ProjectAggregate<
  E extends ProjectAggregateMetadata = ProjectAggregateMetadata,
  T extends Record<string, OneOrMany<Entity>> = Record<
    string,
    OneOrMany<Entity>
  >,
> extends AggregateRoot<typeof projectSchema, E, T> {
  constructor(
    rawProject: ProjectEntity,
    metadata: Omit<E, keyof EntityMetadata>,
    aggregateEntities: T,
  ) {
    const project = new ProjectEntity<E>(
      rawProject.getData(),
      { ...metadata },
      rawProject.getData("id"),
    );
    super(project, aggregateEntities);
  }
}

// responsible for copilot execution
export class ProjectBeforeCopilotSession extends ProjectAggregate<
  ProjectAggregateMetadata & { copilotSessionExId?: string }
> {
  private copilotInputData: {
    goldenSetData: ReturnType<GoldenSetEntity["getData"]>;
    userInputData: ReturnType<UserInputEntity["getData"]>;
  };

  get userInput(): string {
    return this.copilotInputData.userInputData.content;
  }

  constructor(
    copilotInputAggregate: CopilotInputAggregate,
    copilotServer: CopilotServerEntity,
    projectEntity: ProjectEntity,
  ) {
    super(
      projectEntity,
      {
        copilotInputId: copilotInputAggregate.getData("id"),
        copilotServerId: copilotServer.getData("id"),
      },
      {},
    );
    this.copilotInputData = {
      goldenSetData: copilotInputAggregate.getEntity("goldenSet").getData(),
      userInputData: copilotInputAggregate.getEntity("userInput").getData(),
    };
  }
}

export class ProjectWithCopilotSession extends AggregateRoot<
  typeof projectSchema,
  ProjectToSessionDetails & EntityMetadata
> {
  constructor(rawProject: ProjectEntity, metadata: ProjectToSessionDetails) {
    const project = new ProjectEntity<ProjectToSessionDetails & EntityMetadata>(
      rawProject.getData(),
      { ...rawProject.getData(), ...metadata },
    );
    super(project, {});
  }
  protected executionLogs: CopilotExecutionLogs = {} as CopilotExecutionLogs;

  setAiResponse(aiResponse: string) {
    if (this.executionLogs.aiResponse) {
      throw new Error(
        "AI response has already been set for this project aggregate.",
      );
    }
    this.executionLogs.aiResponse = aiResponse;
  }

  setEditableText(editableText: string) {
    if (this.executionLogs.editableText) {
      throw new Error(
        "Editable text has already been set for this project aggregate.",
      );
    }
    this.executionLogs.editableText = editableText;
  }

  pushTask(task: unknown) {
    if (this.executionLogs.tasks) {
      this.executionLogs.tasks.push(task);
    } else {
      this.executionLogs.tasks = [task];
    }
  }
  buildCopilotOutput(): CopilotOutputEntity {
    const { aiResponse, editableText, tasks } = this.executionLogs;
    if (!aiResponse || !editableText) {
      throw new Error("Missing execution logs to build CopilotOutputEntity.");
    }
    return new CopilotOutputEntity({
      aiResponse,
      editableText,
      tasks,
      copilotSessionExId: super.getData("copilotSessionExId"),
    });
  }
}

export class ProjectAfterSession extends ProjectAggregate<
  ProjectAggregateMetadata,
  {
    copilotOutput: CopilotOutputEntity;
  }
> {}
