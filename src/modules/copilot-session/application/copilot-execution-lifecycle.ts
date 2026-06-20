import type { Account } from "../../account/domain/entity/account.entity.ts";
import type { CopilotInputAggregate } from "../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../dataset/domain/entity/copilot-server.entity.ts";
import type { ProjectNameServiceFactory } from "../../dataset/domain/service/generate-project-name.service.ts";
import { CopilotExecutionAggregate } from "../domain/aggregate/copilot-execution.aggregate.ts";
import { ProjectAggregate } from "../domain/aggregate/project.aggregate.ts";
import type { ICopilotRepository } from "../domain/interface/copilot-repository.interface.ts";
import type { IProjectRepository } from "../domain/interface/project-repository.interface.ts";
import type { IZionProjectService } from "../domain/interface/project-service.interface.ts";
import type { CreateProjectUseCase } from "./create-project.ts";
import type { DeleteZionProjectUseCase } from "./delete-zion-project.ts";
import type { ExecuteCopilotUseCase } from "./execution-service.ts";

export class CopilotExecutionLifecycle {
	constructor(
		private createProjectUseCase: CreateProjectUseCase,
		private executeCopilotUseCase: ExecuteCopilotUseCase,
		private deleteZionProjectUseCase: DeleteZionProjectUseCase,
	) {}

	async execute(
		copilotInput: CopilotInputAggregate,
		copilotServer: CopilotServerEntity,
	) {
		try {
			const projectEntity =
				await this.createProjectUseCase.execute(copilotInput);
			const projectAggregate = new ProjectAggregate(
				copilotInput,
				copilotServer,
				projectEntity,
			);
			this.executeCopilotUseCase.setProject(projectAggregate);
			await this.executeCopilotUseCase.executeV2();
			await this.deleteZionProjectUseCase.execute(projectAggregate);
			return projectAggregate;
		} catch (error) {
			console.error("Error in CopilotExecutionLifecycle:", error);
			throw error;
		}
	}
}

export class CopilotExecutionUseCase {
	constructor(
		private readonly projectService: IZionProjectService,
		private readonly projectRepository: IProjectRepository,
		private readonly copilotRepository: ICopilotRepository,
	) {}

	async execute(
		copilotInput: CopilotInputAggregate,
		copilotServer: CopilotServerEntity,
		account: Account,
	) {
		const buildCopilotExecutionAggregate = (projectId: string) => {
			return new CopilotExecutionAggregate(copilotServer, projectId);
		};
		const activeProjects =
			await this.projectRepository.getExistingProjectsOfCopilotInput(
				copilotInput.getData("id"),
			);
		if (activeProjects.length > 0) {
			const activeProject = activeProjects[0];
			const projectAggregate = ProjectAggregate.complete(
				activeProject.projectExId,
				activeProject.id,
				copilotInput,
				account,
			);
			const copilotSessionExId = await this.projectService.createCopilotSession(
				activeProject.projectExId,
				projectAggregate.network,
			);
			const copilotExecutionAggregate = buildCopilotExecutionAggregate(activeProject.id);
			copilotExecutionAggregate.start(projectAggregate, copilotSessionExId);
			return this.copilotRepository.save(copilotExecutionAggregate);
		} else {
			const projectAggregate = new ProjectAggregate(copilotInput, account);
      projectAggregate.createProject( {} );
      const copilotExecutionAggregate = buildCopilotExecutionAggregate(projectAggregate.getData("id"));
			await this.projectRepository.save(projectAggregate);
		}
	}
}
