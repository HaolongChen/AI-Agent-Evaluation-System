import type { ProjectApplicationService } from "../../application/project-service.ts";
import type { CopilotExecutionTaskCreatedEvent } from "../../domain/event/copilot-execution-task-created.event.ts";
import type { CopilotSessionEventConsumer } from "../../domain/event/event-map.ts";
import type { ProjectCreatedEvent } from "../../domain/event/project-created.event.ts";
import type { ProjectDeletedEvent } from "../../domain/event/project-deleted.event.ts";
import type { IZionProjectService } from "../../domain/interface/project-service.interface.ts";

export class ProjectDeletedEventConsumer implements CopilotSessionEventConsumer<"zionProject.deleted"> {
  isActive: boolean = true;
  constructor(private readonly projectService: IZionProjectService) {}
  eventName = "zionProject.deleted" as const;
  handler = async (event: ProjectDeletedEvent) => {
    return this.projectService.deleteProjectInZion(
      event.data.projectExId,
      event.data.network,
    );
  };
}

export class ProjectCreatedEventConsumer implements CopilotSessionEventConsumer<"zionProject.created"> {
  isActive: boolean = true;
  eventName = "zionProject.created" as const;
  constructor(
    private readonly context: CopilotExecutionTaskCreatedEvent,
    private readonly projectApplicationService: ProjectApplicationService,
  ) {}
  handler = async (event: ProjectCreatedEvent) => {
    if (
      this.context.data.getData("copilotInputId") !== event.data.copilotInputId
    ) {
      return;
    }
    await this.projectApplicationService.createCopilotSession(
      this.context.data,
      event.data,
    );
    this.isActive = false;
  };
}
