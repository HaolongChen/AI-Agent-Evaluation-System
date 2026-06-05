import {
  ProjectWithCopilotSession,
  type ProjectBeforeCopilotSession,
} from "../aggregate/project.aggregate.ts";

export const projectSessionBridge = (
  project: ProjectBeforeCopilotSession,
  schemaId: string,
  userInput: string,
) => {
  const copilotSessionExId = project.getData("copilotSessionExId");
  if (!copilotSessionExId) {
    throw new Error(
      "Copilot Session ExId is missing in the project aggregate.",
    );
  }
  return new ProjectWithCopilotSession(project, {
    schemaId,
    userInput,
    copilotSessionExId,
  });
};
