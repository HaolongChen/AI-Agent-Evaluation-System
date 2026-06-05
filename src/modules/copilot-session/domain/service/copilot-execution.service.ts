import { EventTarget } from "ts-event-target";
import type { CopilotExecutionLogs } from "../aggregate/project.aggregate.ts";
import type { ICopilotNetworkService } from "../interface/copilot-network.interface.ts";
import type { CopilotEventType } from "../entity/copilot-job.entity.ts";
import type { TypeNameList } from "../schema/copilot.schema.ts";

export class CopilotExecutionService {
  private copilotEvent: EventTarget<CopilotEventType> = new EventTarget();
  constructor(private copilotNetworkService: ICopilotNetworkService) {
    this.copilotEvent.addEventListener("");
  }
  protected executionLogs: CopilotExecutionLogs = {} as CopilotExecutionLogs;

  register<T extends keyof TypeNameList>(
    type: T,
    listener: (event: Extract<CopilotEventType[number], { type: T }>) => void,
  ) {
    this.copilotEvent.addEventListener(type, (event) => {
      listener(event);
    });
  }

  execute() {
    return this.copilotNetworkService.subscribeToSessionUpdates(
      this.copilotEvent.dispatchEvent.bind(this.copilotEvent),
    );
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
}
