import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import { ProjectEntity } from "../entity/project.entity.ts";
import {
  projectSchema,
  type ProjectEntityMetadata,
} from "../schema/project.schema.ts";
import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../../dataset/domain/entity/copilot-server.entity.ts";
import type { z } from "zod";
import { copilotOutputSchema } from "../schema/copilot-output.schema.ts";
import { CopilotOutputEntity } from "../entity/copilot-output.entity.ts";
import type { ICopilotNetworkService } from "../interface/copilot-network.interface.ts";

// responsible for copilot execution
export class ProjectAggregate extends AggregateRoot<
  typeof projectSchema,
  ProjectEntityMetadata
> {
  private copilotNetworkService: ICopilotNetworkService | undefined;
  private executionLogs: {
    [K in keyof Omit<
      z.infer<typeof copilotOutputSchema>,
      "copilotSessionExId"
    >]: z.infer<typeof copilotOutputSchema>[K] extends string
      ? z.infer<typeof copilotOutputSchema>[K] | undefined
      : z.infer<typeof copilotOutputSchema>[K];
  } = {} as {
    [K in keyof Omit<
      z.infer<typeof copilotOutputSchema>,
      "copilotSessionExId"
    >]: z.infer<typeof copilotOutputSchema>[K] extends string
      ? z.infer<typeof copilotOutputSchema>[K] | undefined
      : z.infer<typeof copilotOutputSchema>[K];
  };
  public copilotServerId: string;
  public copilotInputId: string;
  private userInput: string;

  constructor(
    copilotInputAggregate: CopilotInputAggregate,
    copilotServer: CopilotServerEntity,
    projectEntity: ProjectEntity,
  ) {
    super(projectEntity, {});
    this.copilotServerId = copilotServer.getData("id");
    this.copilotInputId = copilotInputAggregate.getData("id");
    this.userInput = copilotInputAggregate
      .getEntity("userInput")
      .getData("content");
  }

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
      copilotSessionExId: this.getData("copilotSessionExId"),
    });
  }
}
