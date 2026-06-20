import type { ResumeProjectInfo } from "../interface/project-repository.interface.ts";

export class DuplicatedExecutionService {
  extractRequestedCopilotOutputFromProjects(
    projects: ResumeProjectInfo[],
    copilotServerId: string,
  ): ResumeProjectInfo[] {
    return projects
      .map((project) => {
        const matchedOutputs = project.copilotOutputs.filter(
          (output) => output.copilotServerId === copilotServerId,
        );
        return { ...project, copilotOutputs: matchedOutputs };
      })
      .filter((project) => project.copilotOutputs.length > 0);
  }
}
