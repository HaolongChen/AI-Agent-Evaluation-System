import { prisma } from "../../../../config/prisma.ts";
import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import type { IDomainEventBus } from "../../../shared/domain/event/domain-event.bus.ts";
import type { ProjectCreatedEvent } from "../../domain/event/project-created.event.ts";
import type { IZionProjectService } from "../../domain/interface/project-service.interface.ts";

export class ProjectHandler {
	constructor(
		private readonly projectService: IZionProjectService,
    private readonly dangerousNetworkClient: NetworkClient,
    private readonly eventBus: IDomainEventBus,
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
		await prisma.project.update({
			where: { id: event.zionProject.getData("id") },
			data: { projectExId: projectExId },
    } );
	}
}
