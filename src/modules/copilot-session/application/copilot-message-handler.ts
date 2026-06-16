import type { IDomainEventBus } from "../../shared/domain/event/domain-event.bus.ts";
import type { CopilotEvent } from "../domain/entity/copilot-job.entity.ts";
import { CopilotResponseMessageBuiltEvent } from "../domain/event/copilot-response-message-built.ts";
import type { IZionProjectService } from "../domain/interface/project-service.interface.ts";
import type { CopilotExecutionService } from "../domain/service/copilot-execution.service.ts";

export class CopilotMessageHandler {
	constructor(
		private readonly eventBus: IDomainEventBus,
    private readonly copilotExecutionService: CopilotExecutionService,
    private readonly projectService: IZionProjectService,
	) {}

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

  async onToolCallMessageReceived ( event: CopilotEvent<"CopilotToolCallBatchMessage"> )
  {
    const schemaGraph = await this.projectService.
  }
}
