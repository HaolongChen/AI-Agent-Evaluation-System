import type { ProjectBeforeCopilotSession } from "../aggregate/project.aggregate.ts";
import type { ProjectEntity } from "../entity/project.entity.ts";
import type { ZionProjectEntity } from "../entity/zion-project.entity.ts";
import type { ICopilotNetworkService } from "./copilot-network.interface.ts";
import type { ICrdtSchemaLifecycle } from "./crdt-schema-lifecycle.interface.ts";

export interface IProjectService {
  getCrdtSchemaLifecycle(projectEntity: ProjectEntity): ICrdtSchemaLifecycle;
  createCopilotSession(
    projectEntity: ProjectBeforeCopilotSession,
    userInput: string,
  ): Promise<ICopilotNetworkService>;

  createProjectInZion(zionProject: ZionProjectEntity): Promise<ProjectEntity>;

  deleteProjectInZion(projectEntity: ProjectEntity): Promise<void>;
}
