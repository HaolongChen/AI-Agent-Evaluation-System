import type { IDomainEventBus } from "../../shared/domain/event/domain-event.bus.ts";
import type { CopilotApiResultJs } from "../../shared/domain/interface/type-system.ts";
import type { CopilotEvent } from "../domain/entity/copilot-job.entity.ts";
import { CopilotResponseMessageBuiltEvent } from "../domain/event/copilot-response-message-built.ts";
import type { IZionProjectService } from "../domain/interface/project-service.interface.ts";
import type { CopilotExecutionService } from "../domain/service/copilot-execution.service.ts";
import { runCopilotToolCalls } from "../infrastructure/copilot/copilot-tool-call-handler.ts";

export class CopilotMessageHandler {
  constructor(
    private readonly eventBus: IDomainEventBus,
    private readonly copilotExecutionService: CopilotExecutionService,
    private readonly projectService: IZionProjectService,
  ) {}

  private toolCallResponseTransform(results: CopilotApiResultJs): {
    responseByToolCallId: unknown;
    schemaDiff?: unknown;
  } {
    return {
      schemaDiff: results.schemaDiff,
      responseByToolCallId: JSON.parse(results.data ?? "{}"),
    };
  }

  async onCopilotStateChanged(
    event: CopilotEvent<"CopilotStateChangeMessage">,
  ) {
    const log = event.data.log;
    return this.eventBus.publish(
      new CopilotResponseMessageBuiltEvent(
        this.copilotExecutionService.responseToSend(log).data,
      ),
    );
  }

  async onToolCallMessageReceived(
    event: CopilotEvent<"CopilotToolCallBatchMessage">,
  ) {
    const schemaGraph = await this.projectService.getSchemaGraph(
      event.data.log.projectExId,
      event.projectNetwork,
    );
    const results = runCopilotToolCalls(event.data.toolCalls, schemaGraph);
    return this.eventBus.publish(
      new CopilotResponseMessageBuiltEvent<"TOOL_CALL_BATCH_RESPONSE">({
        toolCallBatchId: event.data.toolCallBatchId,
        log: event.data.log,
        ...this.toolCallResponseTransform(results),
      }),
    );
  }
}
