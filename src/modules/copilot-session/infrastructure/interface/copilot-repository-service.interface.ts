import type { CopilotExecutionLog } from "../../domain/value-object/copilot-execution-log.ts";

export interface ICopilotRepositoryService {
  addProject(projectExId: string, id: string): Promise<void>;
  saveSession(copilotSessionExId: string, id: string): Promise<void>;
  saveLog(copilotSessionExId: string, log: CopilotExecutionLog): Promise<void>;
}
