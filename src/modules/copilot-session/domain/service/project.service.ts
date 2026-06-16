import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { ProjectNameServiceFactory } from "../../../dataset/domain/service/generate-project-name.service.ts";
import { ProjectAggregate } from "../aggregate/project.aggregate.ts";
import { ZionProject } from "../entity/zion-project.entity.ts";
import type { IProjectManager } from "../interface/project-manager.interface.ts";

export class ProjectManager implements IProjectManager {
	constructor(private readonly projectNameFactory: ProjectNameServiceFactory) {}
	buildZionProject(
		copilotInput: CopilotInputAggregate,
		projectId: string,
	): ZionProject {
		const nameService =
			this.projectNameFactory.initializeByCopilotInput(copilotInput);
		const projectName = nameService.generateProjectName();
		return new ZionProject({ projectName }, projectId);
  }

  saveProject ( zionProject: ZionProject, projectExId: string )
  {
    const project = new ProjectAggregate( projectExId, zionProject );
    project.commit();
  }
}
