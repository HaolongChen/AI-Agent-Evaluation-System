import type {
  CopilotExecutionLogs,
  ProjectWithCopilotSession,
} from "../aggregate/project.aggregate.ts";
import { CopilotOutputEntity } from "../entity/copilot-output.entity.ts";

export const extractCopilotOutput = (project: CopilotExecutionLogs) => {
  const { aiResponse, editableText, tasks } = project.executionLogs;
  if (!aiResponse || !editableText) {
    throw new Error("Missing execution logs to build CopilotOutputEntity.");
  }
  return new CopilotOutputEntity({
    aiResponse,
    editableText,
    tasks,
    copilotSessionExId: project.getData("copilotSessionExId"),
  });
};
