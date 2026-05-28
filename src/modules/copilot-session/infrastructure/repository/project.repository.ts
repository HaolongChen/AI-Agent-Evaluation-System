import { prisma } from "../../../../config/prisma.ts";
import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../../dataset/domain/entity/copilot-server.entity.ts";
import {
	copilotInputDataMapper,
	type CopilotInputDataMapperParameter,
	type CopilotInputRepositoryType,
} from "../../../dataset/infrastructure/repository/copilot-input.repository.ts";
import {
	copilotServerDataMapper,
	type CopilotServerRepositoryType,
} from "../../../dataset/infrastructure/repository/copilot-server.repository.ts";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import { ProjectAggregate } from "../../domain/aggregate/project.aggregate.ts";
import { ProjectEntity } from "../../domain/entity/project.entity.ts";
import { type IProjectRepository } from "../../domain/interface/project.interface.ts";

export type ProjectRepositoryType = {
	id: string;
	copilotInputId: string;
	copilotServerId: string;
  projectExId: string;
  schemaId: string;
	name: string;
	createdAt: Date;
	createdBy: string;
	copilotInput?: CopilotInputRepositoryType;
	copilotServer?: CopilotServerRepositoryType;
};

export type ProjectDataMapperParameters = {
	copilotInput?: {
		aggregate?: CopilotInputAggregate;
		entity?: CopilotInputDataMapperParameter;
	};
	copilotServer?: CopilotServerEntity;
};

export const projectDataMapper = (
	data: ProjectRepositoryType,
	entity?: ProjectDataMapperParameters,
): ProjectAggregate => {
	const copilotInput =
		entity?.copilotInput?.aggregate ??
		(data.copilotInput ?
			copilotInputDataMapper(data.copilotInput, entity?.copilotInput?.entity)
		:	undefined);
	const copilotServer =
		entity?.copilotServer ??
		(data.copilotServer ?
			copilotServerDataMapper(data.copilotServer)
		:	undefined);
	if (!copilotInput || !copilotServer) {
		throw new Error("Missing required data for CopilotSessionAggregate");
	}
	return repositoryDateMapper(
		data,
		new ProjectAggregate(copilotInput, copilotServer, new ProjectEntity(data, data.id)),
	);
};

export class ProjectRepository implements IProjectRepository {
	async getByCopilotServer(
		copilotServer: CopilotServerEntity,
	): Promise<Array<ProjectAggregate>> {
		const projects = await prisma.project.findMany({
			where: {
				copilotServerId: copilotServer.getData("id"),
			},
			include: {
				copilotInput: { include: { goldenSet: true, userInput: true } },
			},
		});
		return projects.map((project) =>
			projectDataMapper(project, { copilotServer }),
		);
	}
	async getByCopilotInput(
		copilotInput: CopilotInputAggregate,
	): Promise<Array<ProjectAggregate>> {
		const projects = await prisma.project.findMany({
			where: {
				copilotInputId: copilotInput.getData("id"),
			},
			include: {
				copilotServer: true,
			},
		});
		return projects.map((project) =>
			projectDataMapper(project, { copilotInput: { aggregate: copilotInput } }),
		);
	}
	async deleteById(id: string): Promise<void> {
		await prisma.project.delete({ where: { id } });
	}
	async save(data: ProjectAggregate): Promise<void> {
		const project = await prisma.project.upsert({
			where: { id: data.getData("id") },
			update: {},
			create: {
				...data.getData(),
				copilotInputId: data.getEntity("copilotInput").getData("id"),
				copilotServerId: data.getEntity("copilotServer").getData("id"),
			},
		});
		projectDataMapper(project, {
			copilotInput: { aggregate: data.getEntity("copilotInput") },
			copilotServer: data.getEntity("copilotServer"),
		});
	}

	async findById(id: string): Promise<ProjectAggregate> {
		const project = await prisma.project.findUnique({
			where: { id },
			include: {
				copilotInput: {
					include: {
						goldenSet: true,
						userInput: true,
					},
				},
				copilotServer: true,
			},
		});
		if (!project) {
			throw new Error(`Project with ID ${id} not found`);
		}
		return projectDataMapper(project);
	}
}
