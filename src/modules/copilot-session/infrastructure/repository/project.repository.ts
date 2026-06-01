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
import { CopilotOutputEntity } from "../../domain/entity/copilot-output.entity.ts";
import { ProjectEntity } from "../../domain/entity/project.entity.ts";
import { type IProjectRepository } from "../../domain/interface/project.interface.ts";

export type ProjectRepositoryType = {
	id: string;
	copilotInputId: string;
	copilotServerId: string;
	projectExId: string;
	projectName: string;
	createdAt: Date;
	createdBy: string;
	copilotInput?: CopilotInputRepositoryType;
	copilotSession: {
		id: string;
		copilotOutput: {
			id: string;
			editableText: string;
			aiResponse: string;
			createdAt: Date;
		} | null;
	} | null;
};

export type ProjectDataMapperParameters = {
	copilotInput?: {
		aggregate?: CopilotInputAggregate;
		entity?: CopilotInputDataMapperParameter;
	};
	aggregate?: ProjectAggregate;
};

export const projectDataMapper = (
	data: ProjectRepositoryType,
	entity?: ProjectDataMapperParameters,
): ProjectAggregate => {
	const copilotInput =
		entity?.aggregate?.getEntity("copilotInput") ??
		(data.copilotInput ?
			copilotInputDataMapper(
				data.copilotInput,
				entity?.copilotInput?.entity,
				entity?.copilotInput?.aggregate,
			)
		:	undefined);
	if (!copilotInput) {
		throw new Error("Missing required data for CopilotSessionAggregate");
	}
	const projectAggregate =
		entity?.aggregate ??
		new ProjectAggregate(
			copilotInput,
			data.copilotServerId,
			new ProjectEntity(data, data.id),
		);
	if (data.copilotSession?.id) {
		projectAggregate.copilotSessionExId = data.copilotSession.id;
	}
	if (data.copilotSession?.copilotOutput) {
		projectAggregate.setEntity(
			"copilotOutput",
			repositoryDateMapper(
				data.copilotSession.copilotOutput,
				projectAggregate.getEntity("copilotOutput") ??
					new CopilotOutputEntity(
						data.copilotSession.copilotOutput,
						data.copilotSession.copilotOutput.id,
					),
			),
		);
	}
	return repositoryDateMapper(data, projectAggregate);
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
				copilotSession: {
					include: {
						copilotOutput: true,
					},
				},
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
				copilotSession: {
					include: {
						copilotOutput: true,
					},
				},
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
		const sessionId = data.copilotSessionExId;
		const output = data.getEntity("copilotOutput");
		const project = await prisma.project.upsert({
			where: { id: data.getData("id") },
			include: {
				copilotSession: {
					include: { copilotOutput: true },
				},
			},
			update: {
				...(sessionId ?
					{
						copilotSession: {
							upsert: {
								where: { id: sessionId },
								update: {
									...(output ?
										{
											copilotOutput: {
												upsert: {
													where: { copilotSessionExId: sessionId },
													update: { ...output.getData() },
													create: { ...output.getData() },
												},
											},
										}
									:	{}),
								},
								create: {
									...(output ?
										{
											copilotOutput: {
												create: {
													...output.getData(),
												},
											},
										}
									:	{}),
								},
							},
						},
					}
				:	{}),
			},
			create: {
				...data.getData(),
				copilotInputId: data.getEntity("copilotInput").getData("id"),
				copilotServerId: data.copilotServerId,
				...(sessionId ?
					{
						copilotSession: {
							create: {
								id: sessionId,
								...(output ?
									{
										copilotOutput: {
											create: {
												...output.getData(),
											},
										},
									}
								:	{}),
							},
						},
					}
				:	{}),
			},
		});
		projectDataMapper(project, { aggregate: data });
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
				copilotSession: {
					include: {
						copilotOutput: true,
					},
				},
			},
		});
		if (!project) {
			throw new Error(`Project with ID ${id} not found`);
		}
		return projectDataMapper(project);
	}
}
