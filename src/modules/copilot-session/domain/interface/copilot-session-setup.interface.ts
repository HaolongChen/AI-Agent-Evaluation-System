import type { ProjectEntity } from "../entity/project.entity.ts";
import type { ICopilotNetworkService } from "./copilot-network.interface.ts";

export interface ICopilotSessionSetup {
  createNewSession(project: ProjectEntity): Promise<ICopilotNetworkService>;
}
