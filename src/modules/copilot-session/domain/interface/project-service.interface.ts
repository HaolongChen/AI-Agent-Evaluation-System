import type { ProjectEntity } from "../entity/project.entity.ts";
import type { ICopilotNetworkService } from "./copilot-network.interface.ts";
import type { ICrdtSchemaLifecycle } from "./crdt-schema-lifecycle.interface.ts";

export interface IProjectService
{
  getCrdtSchemaLifecycle ( projectEntity: ProjectEntity ): ICrdtSchemaLifecycle;
  createCopilotSession ( projectEntity: ProjectEntity ): Promise<ICopilotNetworkService>

  deleteProjectInZion ( projectEntity: ProjectEntity ): Promise<void>;
}