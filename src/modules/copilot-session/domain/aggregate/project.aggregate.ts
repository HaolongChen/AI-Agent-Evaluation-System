import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import { ProjectEntity } from "../entity/project.entity.ts";
import {
  projectSchema,
  type CopilotExecutionLogs,
  type ProjectAggregateMetadata,
} from "../schema/project.schema.ts";
import type {
  Entity,
  EntityMetadata,
  OneOrMany,
} from "../../../shared/domain/entity/entity.ts";
import { CopilotOutputEntity } from "../entity/copilot-output.entity.ts";
import { copilotOutputSchema } from "../schema/copilot-output.schema.ts";

export type ProjectToSessionDetails = {
  copilotSessionExId: string;
};

export class BaseProjectAggregate<
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
export class ProjectAggregate extends BaseProjectAggregate<
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

export class CopilotExecutionLogManager {
  constructor(private copilotSessionExId: string) {}

  private executionLogs: CopilotExecutionLogs = {} as CopilotExecutionLogs;

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

  produceCopilotOutputEntity() {
    const { aiResponse, editableText, tasks } = this.executionLogs;
    if (!aiResponse || !editableText) {
      throw new Error("Missing execution logs to build CopilotOutputEntity.");
    }
    return new CopilotOutputEntity(
      {
        aiResponse,
        editableText,
        tasks,
        copilotSessionExId: this.copilotSessionExId,
      },
      {},
    );
  }
}

export class ProjectAfterSession extends BaseProjectAggregate<
  ProjectAggregateMetadata,
  {
    copilotOutput: CopilotOutputEntity;
  }
> {}

export class CopilotOutputAggregate extends AggregateRoot<
  typeof copilotOutputSchema,
  { projectId: string } & EntityMetadata
> {
  constructor(copilotOutputEntity: CopilotOutputEntity, projectId: string) {
    const newEntity = new CopilotOutputEntity<
      EntityMetadata & { projectId: string }
    >(copilotOutputEntity.getData(), {
      ...copilotOutputEntity.getData(),
      projectId,
    });
    super(newEntity, {});
  }
}
