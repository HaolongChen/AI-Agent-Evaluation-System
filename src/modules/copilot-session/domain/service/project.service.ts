import type { ProjectNameServiceFactory } from "../../../dataset/domain/service/generate-project-name.service.ts";
import type { CopilotExecutionAggregate } from "../aggregate/copilot-execution.aggregate.ts";
import { ZionProject } from "../entity/zion-project.entity.ts";
import type { IProjectManager } from "../interface/project-manager.interface.ts";

export class ProjectManager implements IProjectManager {
	constructor(private readonly projectNameFactory: ProjectNameServiceFactory) {}
  createProject (
    copilotExecution: CopilotExecutionAggregate
  ): void
  {
    const copilotInput = copilotExecution.getEntity("copilotInput");
		const nameService =
			this.projectNameFactory.initializeByCopilotInput(copilotInput);
		const projectName = nameService.generateProjectName();
    const zionProject = new ZionProject( { projectName } );
    copilotExecution.createProject(zionProject);
	}
}
