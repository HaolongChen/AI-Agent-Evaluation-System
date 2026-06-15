import { prisma } from "../../../../config/prisma.ts";
import type { CopilotExecutionAggregate } from "../../domain/aggregate/copilot-execution.aggregate.ts";
import type { ICopilotRepository } from "../../domain/interface/copilot-repository.interface.ts";

export class CopilotRepository implements ICopilotRepository {
	private async saveProject(
		projectId: string,
		copilotInputId: string,
		copilotServerId: string,
	) {
		await prisma.project.update({
			where: { id: projectId },
			data: { copilotInputId, copilotServerId },
		});
	}
	private async saveCopilotSession(
		copilotSessionExId: string,
		projectId: string,
		id: string,
	) {
		await prisma.project.update({
			where: { id: projectId },
			data: {
				copilotOutput: {
					create: {
						copilotSessionExId,
						projectId,
						id,
					},
				},
			},
		});
	}
	async save(entity: CopilotExecutionAggregate): Promise<void> {
		await prisma.copilotOutput.upsert({
			where: {
				projectId: entity.getData("projectId"),
			},
			update: {
				...entity.executionLogs,
				copilotSessionExId: entity.getData("copilotSessionExId"),
			},
			create: {
				...entity.executionLogs,
				projectId: entity.getData("projectId"),
				copilotSessionExId: entity.getData("copilotSessionExId"),
			},
		});
	}
	async findById(id: string): Promise<CopilotExecutionAggregate> {
		throw new Error("Method not implemented.");
	}
}
