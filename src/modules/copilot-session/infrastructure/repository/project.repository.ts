import { prisma } from "../../../../config/prisma.ts";
import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../../dataset/domain/entity/copilot-server.entity.ts";
import {
	copilotInputDataMapper,
	type CopilotInputDataMapperParameter,
	type CopilotInputRepositoryType,
} from "../../../dataset/infrastructure/repository/copilot-input.repository.ts";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import { ProjectAggregate } from "../../domain/aggregate/project.aggregate.ts";
import { ProjectEntity } from "../../domain/entity/project.entity.ts";
import { type IProjectRepository } from "../../domain/interface/project.interface.ts";
import { copilotOutputDataMapper } from "./copilot-output.repository.ts";
import { copilotSessionDataMapper } from "./copilot-session.repository.ts";

export type ProjectRepositoryType = {
	id: string;
	copilotInputId: string;
	copilotServerId: string;
	projectExId: string;
	projectName: string;
	createdAt: Date;
	createdBy: string;
	copilotInput?: CopilotInputRepositoryType;
};

export type ProjectDataMapperParameters = {
	copilotInput?: {
		aggregate?: CopilotInputAggregate;
		entity?: CopilotInputDataMapperParameter;
	};
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
	if (!copilotInput) {
		throw new Error("Missing required data for CopilotSessionAggregate");
	}
	return repositoryDateMapper(
		data,
		new ProjectAggregate(
			copilotInput,
			data.copilotServerId,
			new ProjectEntity(data, data.id),
		),
	);
};

export class ProjectRepository implements IProjectRepository {
	async getProjectsWithCopilotOutput(
		number: number,
	): Promise<Array<ProjectAggregate>> {
		await prisma.copilotOutput.findMany({
			orderBy: {
				copilotSession: {
					rubric: {
						_count: "asc",
					},
				},
      },
      include: {
        copilotSession: {
          include: {
            project: true,
          }
        }
      }
		});
	}
	async saveCopilotSession(project: ProjectAggregate): Promise<void> {
		const session = project.getEntity("copilotSession");
		if (!session) {
			throw new Error("No copilot session found in project aggregate");
		}
		const result = await prisma.copilotSession.upsert({
			where: { id: session.getData("id") },
			create: {
				...session.getData(),
				projectId: project.getData("id"),
			},
			update: {},
		});
		copilotSessionDataMapper(result, { project: { aggregate: project } });
	}
	async saveCopilotOutput(project: ProjectAggregate): Promise<void> {
		const session = project.getEntity("copilotSession");
		const output = project.getEntity("copilotOutput");
		if (!session || !output) {
			throw new Error("Missing copilot session or output in project aggregate");
		}
		const result = await prisma.copilotOutput.upsert({
			where: { copilotSessionExId: session.getData("id") },
			update: {},
			create: {
				...output.getData(),
				copilotSessionExId: session.getData("id"),
			},
		});
		copilotOutputDataMapper(result);
	}
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
		return projects.map((project) => projectDataMapper(project));
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
				copilotServerId: data.copilotServerId,
			},
		});
		projectDataMapper(project, {
			copilotInput: { aggregate: data.getEntity("copilotInput") },
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
