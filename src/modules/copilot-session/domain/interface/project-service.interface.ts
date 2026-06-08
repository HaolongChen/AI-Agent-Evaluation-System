import type { IGQLClient } from "../../../account/domain/interface/graphql-client.interface.ts";
import type { IWebSocketClient } from "../../../account/domain/interface/websocket-client.interface.ts";
import type { OpaqueSchemaGraph } from "../../../shared/domain/interface/type-system.ts";
import type { ProjectEntity } from "../entity/project.entity.ts";
import type { ZionProjectEntity } from "../entity/zion-project.entity.ts";
import type { ICopilotNetworkService } from "./copilot-network.interface.ts";

export interface IZionProjectService {
	createProjectInZion(
		zionProject: ZionProjectEntity,
    gqlClient: IGQLClient,
    wsClient: IWebSocketClient,
    organizationExId: string,
	): Promise<string>;

	deleteProjectInZion(
		projectEntity: ProjectEntity,
		gqlClient: IGQLClient,
	): Promise<void>;
}
