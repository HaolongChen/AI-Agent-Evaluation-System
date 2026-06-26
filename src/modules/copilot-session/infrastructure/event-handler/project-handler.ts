import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import { ProjectAggregate } from "../../domain/aggregate/project.aggregate.ts";
import type { CopilotSessionEventConsumer } from "../../domain/event/event-map.ts";
import type { ProjectCreationTaskCreated } from "../../domain/event/project-created.event.ts";
import type { ProjectDeletedEvent } from "../../domain/event/project-deleted.event.ts";
import type { IProjectRepository } from "../../domain/interface/project-repository.interface.ts";
import type { IZionProjectService } from "../../domain/interface/project-service.interface.ts";

export class ProjectCreationTaskCreatedEventConsumer implements CopilotSessionEventConsumer<"zionProject.creationTask.created"> {
  isActive: boolean = true;
  constructor(
    private readonly projectService: IZionProjectService,
    private readonly dangerousNetworkClient: NetworkClient,
    private readonly projectRepository: IProjectRepository,
  ) {}
  eventName = "zionProject.creationTask.created" as const;
  handler = async (event: ProjectCreationTaskCreated) => {
    const projectExId = await this.projectService.createProjectInZion(
      event.data.zionProject,
      event.data.account,
      event.data.projectNetwork,
    );
    const schemaId = event.data.zionProject.getData("schemaId");
    if (schemaId) {
      await this.projectService.importSchemaById(
        schemaId,
        projectExId,
        this.dangerousNetworkClient,
      );
    }
    const createdProject = ProjectAggregate.complete(
      projectExId,
      event.data.zionProject.getData("id"),
      event.data.copilotInput,
      event.data.account,
    );
    return this.projectRepository.save(createdProject);
  };
}

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
