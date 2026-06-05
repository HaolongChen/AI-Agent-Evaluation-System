import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import { ProjectEntity } from "../entity/project.entity.ts";
import {
  projectSchema,
  type CopilotExecutionLogs,
  type ProjectAggregateMetadata,
} from "../schema/project.schema.ts";
import type { CopilotServerEntity } from "../../../dataset/domain/entity/copilot-server.entity.ts";
import type {
  Entity,
  EntityMetadata,
  OneOrMany,
} from "../../../shared/domain/entity/entity.ts";
import { CopilotOutputEntity } from "../entity/copilot-output.entity.ts";

export type ProjectToSessionDetails = {
  copilotSessionExId: string;
  schemaId: string;
  userInput: string;
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
  constructor(
    copilotInputId: string,
    copilotServerId: string,
    projectEntity: ProjectEntity,
  ) {
    super(
      projectEntity,
      {
        copilotInputId,
        copilotServerId,
      },
      {},
    );
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
  public executionLogs: CopilotExecutionLogs = {} as CopilotExecutionLogs;

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
}

export class ProjectAfterSession extends ProjectAggregate<
  ProjectAggregateMetadata,
  {
    copilotOutput: CopilotOutputEntity;
  }
> {}
