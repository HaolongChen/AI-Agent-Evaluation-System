import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import type { IDomainEventConsumer } from "../../../shared/domain/event/domain-event.handler.ts";
import { ProjectAggregate } from "../../domain/aggregate/project.aggregate.ts";
import type { ProjectCreationTaskCreated } from "../../domain/event/project-created.event.ts";
import type { IProjectRepository } from "../../domain/interface/project-repository.interface.ts";
import type { IZionProjectService } from "../../domain/interface/project-service.interface.ts";

export class ProjectCreationTaskCreatedEventConsumer implements IDomainEventConsumer<ProjectCreationTaskCreated> {
  isActive: boolean = true;
  constructor(
    private readonly projectService: IZionProjectService,
    private readonly dangerousNetworkClient: NetworkClient,
    private readonly projectRepository: IProjectRepository,
  ) {}
  handler = async (event: ProjectCreationTaskCreated) => {
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
  };
}
