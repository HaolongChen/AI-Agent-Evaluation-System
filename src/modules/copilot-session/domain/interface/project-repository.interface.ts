import type { z } from "zod";
import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { ProjectAggregate } from "../aggregate/project.aggregate.ts";
import type { ProjectMetadata } from "../schema/project.schema.ts";
import { copilotExecutionSchema } from "../schema/copilot.schema.ts";
import type { Account } from "../../../account/domain/entity/account.entity.ts";

type BaseResumeProjectInfo = {
	id: string;
	projectName: string;
	copilotOutputs: {
		id: string;
		copilotSessionExId?: string;
		copilotServerId: string;
		status: z.infer<typeof copilotExecutionSchema.shape.status>;
	}[];
};

export type ResumeProjectInfo<
	T extends ProjectMetadata["state"]["status"] =
		ProjectMetadata["state"]["status"],
> =
	T extends "pending" | "creating" ?
		{
			projectExId?: string;
			status: T;
		} & BaseResumeProjectInfo
	:	{
			projectExId: string;
			status: T;
		} & BaseResumeProjectInfo;

export interface IProjectRepository extends IRepository<ProjectAggregate> {
	getExistingIdleProjectsOfCopilotInput(
		copilotInputId: string,
	): Promise<ResumeProjectInfo<"active">[]>;
	findById(id: string, account: Account): Promise<ProjectAggregate>;
}
