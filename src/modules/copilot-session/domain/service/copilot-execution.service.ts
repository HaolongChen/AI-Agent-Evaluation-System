import { EventTarget } from "ts-event-target";
import type { ProjectWithCopilotSession } from "../aggregate/project.aggregate.ts";
import type {
  CopilotEventsList,
  CopilotEventType,
} from "../entity/copilot-job.entity.ts";
import type { TypeNameList } from "../schema/copilot.schema.ts";

export class CopilotExecutionService {
  private copilotEvent: EventTarget<CopilotEventType> = new EventTarget();

  constructor(private project: ProjectWithCopilotSession) {
    this.copilotEvent.addEventListener("CopilotAiResponseMessage", (event) => {
      project.setAiResponse(event.data.content);
    });
    this.copilotEvent.addEventListener(
      "CopilotEditableTextMessage",
      (event) => {
        project.setEditableText(event.data.content);
      },
    );
    this.copilotEvent.addEventListener("CopilotTaskMessage", (event) => {
      project.pushTask(event.data);
    });
  }

  register<T extends keyof TypeNameList>(
    type: T,
    callback: (event: Extract<CopilotEventType[number], { type: T }>) => void,
  ) {
    this.copilotEvent.addEventListener(type, (event) => {
      callback(event);
    });
  }

  get publisher(): (event: CopilotEventsList[keyof CopilotEventsList]) => void {
    return this.copilotEvent.dispatchEvent.bind(this.copilotEvent);
  }
}
