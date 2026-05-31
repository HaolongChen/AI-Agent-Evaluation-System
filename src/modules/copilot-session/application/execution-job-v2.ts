import { Event, EventTarget } from "ts-event-target";
import { typeNameList } from "../domain/schema/copilot.schema.ts";
import {
  type CopilotEventType,
  type CopilotInputEventType,
} from "../domain/entity/copilot-job.entity.ts";
import type { ICopilotNetworkService } from "../domain/interface/copilot-network.interface.ts";
import type { OpaqueSchemaGraph } from "../../shared/domain/interface/type-system.ts";
export class ExecutionJobRunnerV2 {
  private copilotInputEvent: EventTarget<CopilotInputEventType> =
    new EventTarget();
  private copilotEvent: EventTarget<CopilotEventType> = new EventTarget();
  constructor(
    private sessionExId: string,
    private CopilotNetworkService: ICopilotNetworkService,
  ) {}

  execute(schemaGraph: OpaqueSchemaGraph) {
    this.copilotInputEvent.addEventListener("unsubscribe", () => {
      unsubscribe();
      for (const copilotEventName of typeNameList) {
        this.copilotEvent.removeAllEventListeners(copilotEventName);
      }
    });
    this.copilotInputEvent.addEventListener("TERMINATE", (event) => {
      this.CopilotNetworkService.sendMessageToSession(
        this.sessionExId,
        event.type,
        event.data,
      );
      this.copilotInputEvent.dispatchEvent(new Event("unsubscribe"));
    });
    this.copilotInputEvent.addEventListener(
      "TOOL_CALL_BATCH_RESPONSE",
      (event) => {
        this.CopilotNetworkService.sendMessageToSession(
          this.sessionExId,
          event.type,
          event.data,
        );
      },
    );

    this.copilotInputEvent.addEventListener("HUMAN_INPUT", (event) => {
      this.CopilotNetworkService.sendMessageToSession(
        this.sessionExId,
        event.type,
        event.data,
      );
    });
    this.copilotInputEvent.addEventListener("HUMAN_OPERATION", (event) => {
      this.CopilotNetworkService.sendMessageToSession(
        this.sessionExId,
        event.type,
        event.data,
      );
    });

    const unsubscribe = this.CopilotNetworkService.subscribeToSessionUpdates(
      this.sessionExId,
      schemaGraph,
      this.copilotEvent.dispatchEvent.bind(this.copilotEvent),
    );
    return {
      publish: this.copilotInputEvent.dispatchEvent.bind(
        this.copilotInputEvent,
      ),
      listen: this.copilotEvent.addEventListener.bind(this.copilotEvent),
    };
  }
}
