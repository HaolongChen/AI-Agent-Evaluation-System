import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { ProjectAggregate } from "../aggregate/project.aggregate.ts";

export type ResumeProjectInfo = {
	id: string;
	projectExId?: string;
	copilotOutputs: {
		id: string;
		copilotSessionExId?: string;
		copilotServerId: string;
	}[];
};

export interface IProjectRepository extends IRepository<ProjectAggregate> {
	getExistingProjectsOfCopilotInput(
		copilotInputId: string,
	): Promise<ResumeProjectInfo[]>;
	getAllProjectsOfCopilotInput(
		copilotInputId: string,
	): Promise<ResumeProjectInfo[]>;
	getProjectsByCopilotInputAndCopilotServer(
		copilotInputId: string,
		copilotServerId: string,
	): Promise<ResumeProjectInfo[]>;
}
