import type { IGQLClient } from "../../../account/domain/interface/graphql-client.interface.ts";
import type { IWebSocketClient } from "../../../account/domain/interface/websocket-client.interface.ts";
import { ProjectEntity } from "../entity/project.entity.ts";
import { ZionProjectEntity } from "../entity/zion-project.entity.ts";
import type { ICrdtSchemaService } from "../interface/crdt-schema.interface.ts";
import type { IZionProjectService } from "../interface/project-service.interface.ts";
import type { CrdtSchemaHandler } from "./crdt-schema-handler.ts";

export class ProjectService {
	constructor(private readonly zionProjectService: IZionProjectService, private readonly crdtSchemaHandler: CrdtSchemaHandler) {}

	async createZionProject(
		projectName: string,
		gqlClient: IGQLClient,
		wsClient: IWebSocketClient,
		organizationExId: string,
	): Promise<ProjectEntity> {
		const projectExId = await this.zionProjectService.createProjectInZion(
			new ZionProjectEntity({ projectName }),
			gqlClient,
			wsClient,
			organizationExId,
		);
		const project = new ProjectEntity({ projectExId, projectName }, {});
		return project;
  }

	async deleteZionProject(project: ProjectEntity, gqlClient: IGQLClient) {
		await this.zionProjectService.deleteProjectInZion(project, gqlClient);
	}
}
