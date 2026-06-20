import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import { ProjectAggregate } from "../../domain/aggregate/project.aggregate.ts";
import type { ProjectCreatedEvent } from "../../domain/event/project-created.event.ts";
import type { IProjectRepository } from "../../domain/interface/project-repository.interface.ts";
import type { IZionProjectService } from "../../domain/interface/project-service.interface.ts";

export class ProjectHandler {
  constructor(
    private readonly projectService: IZionProjectService,
    private readonly dangerousNetworkClient: NetworkClient,
    private readonly projectRepository: IProjectRepository,
  ) {}
  async onProjectCreated(event: ProjectCreatedEvent) {
    const projectExId = await this.projectService.createProjectInZion(
      event.zionProject,
      event.account,
      event.projectNetwork,
    );
    const schemaId = event.zionProject.getData("schemaId");
    if (schemaId) {
      await this.projectService.importSchemaById(
        schemaId,
        projectExId,
        this.dangerousNetworkClient,
      );
    }
    const createdProject = ProjectAggregate.complete(
      projectExId,
      event.zionProject.getData("id"),
      event.copilotInput,
      event.account,
    );
    return this.projectRepository.save(createdProject);
  }
}
