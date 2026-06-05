import type { ProjectEntity } from "../entity/project.entity.ts";

export interface ICopilotSessionSetup {
  createNewSession(project: ProjectEntity): Promise<string>;

  getLatestSession(project: ProjectEntity): Promise<string | null>;
}
