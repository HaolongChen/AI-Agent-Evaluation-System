import { prisma } from "../../../../config/prisma.ts";
import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../../dataset/domain/entity/copilot-server.entity.ts";
import type { Project } from "../../domain/aggregate/project.aggregate.ts";
import { ProjectEntity } from "../../domain/entity/project.entity.ts";
import { type IProjectRepository } from "../../domain/interface/project-repository.interface.ts";
import {
	projectWithCopilotSessionDataMapper,
	rawProjectDataMapper,
} from "./project.dto.ts";

export type ProjectRepositoryType = {
	id: string;
	copilotInputId: string;
	copilotServerId: string;
	projectExId: string;
	projectName: string;
	createdAt: Date;
	createdBy: string;
	copilotOutput: CopilotOutputRepositoryType;
};

export type CopilotOutputRepositoryType = {
	id: string;
	editableText: string;
	copilotSessionExId: string;
	tasks: unknown[];
	aiResponse: string;
	createdAt: Date;
};

export type ProjectDataMapperParameters = {
	aggregate?: ProjectAggregate;
};

export class ProjectRepository implements IProjectRepository {
	async getByCopilotServer(
		copilotServer: CopilotServerEntity,
	): Promise<Array<ProjectEntity>> {
		const projects = await prisma.project.findMany({
			where: {
				copilotServerId: copilotServer.getData("id"),
			},
			include: {
				copilotOutput: true,
			},
		});
		return projects.map((project) => {
			return project.copilotOutput ?
					projectWithCopilotSessionDataMapper(project)
				:	rawProjectDataMapper(project);
		});
	}
	async getByCopilotInput(
		copilotInput: CopilotInputAggregate,
	): Promise<Array<ProjectEntity>> {
		const projects = await prisma.project.findMany({
			where: {
				copilotInputId: copilotInput.getData("id"),
			},
			include: {
				copilotOutput: true,
			},
		});
		return projects.map((project) =>
			projectWithCopilotSessionDataMapper(project),
		);
	}
	async deleteById(id: string): Promise<void> {
		await prisma.project.delete({ where: { id } });
	}
	async save(data: Project): Promise<void> {
		await prisma.project.upsert({
			where: { projectExId: data.getData("projectExId") },
			update: {
				projectName: data.getData("projectName"),
			},
			create: {
				...data.getData(),
			},
		});
	}

	async getExIdById(id: string): Promise<string> {
		const project = await prisma.project.findUniqueOrThrow({
			where: { id },
		});
		return project.projectExId;
	}
}
