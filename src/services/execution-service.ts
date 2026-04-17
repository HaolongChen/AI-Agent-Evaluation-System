
import { EvaluationJobRunner } from "../jobs/evaluation-job.ts";
import { getTypeSystemStoreForCopilot } from "../external/zed/TypeSystemStore.ts";
import { projectService } from "./project-service.ts";
import { prisma } from "../config/prisma.ts";
import { assertNotNull } from "../external/zed/helpers.ts";
import type { copilotOutput } from "../prisma/build/generated/prisma/client.ts";
export class ExecutionService {
	async getCopilotOutputs(goldenSetId: string, userInputId: string) {
		try {
			return await prisma.copilotOutput.findMany({
				where: {
					goldenSetId,
					userInputId,
				},
			});
		} catch (error) {
			console.error("Error fetching copilot outputs:", error);
			throw new Error("Failed to fetch copilot outputs");
		}
	}

	async executeCopilot(
		goldenSetId: string,
		userInputId: string,
	): Promise<copilotOutput> {
		try {
			const copilotInput = await prisma.goldenSet.findUnique({
				where: { id: goldenSetId },
				include: {
					userInputs: {
						where: { id: userInputId },
					},
				},
			});
			if (
				!copilotInput ||
				!copilotInput.userInputs[0]?.content
			) {
				throw new Error(
					"No user input found for the given golden set and user input IDs",
				);
			}

			const typeSystemStore = await getTypeSystemStoreForCopilot(copilotInput.schemaId);
			const projectName = `temp-project-${goldenSetId}-${userInputId}-${Date.now()}`;
			const projectExId = await projectService.createProject(projectName);
			const wsUrl = `${process.env.BACKEND_WS_URL}projectExId=${projectExId}&userToken=${process.env.userToken}&clientType=${process.env.clientType}`;

			const evalJobRunner = new EvaluationJobRunner(
				projectExId,
				wsUrl,
				copilotInput.userInputs[0].content,
				assertNotNull(typeSystemStore.schemaGraph),
			);
			evalJobRunner.startJob();
			const { editableText } = await evalJobRunner.waitForCompletion();

			await projectService.deleteProject(projectExId);

			return await this.saveCopilotOutput(
				goldenSetId,
				userInputId,
				editableText,
			);
		} catch (error) {
			console.error("Error executing copilot:", error);
			throw new Error("Failed to execute copilot");
		}
	}

	async saveCopilotOutput(
		goldenSetId: string,
		userInputId: string,
		content: string,
	) {
		try {
			const rubrics = await prisma.rubric.findMany({
				where: {
					goldenSetId,
					userInputId,
				},
				select: {
					id: true,
				},
			});

			if (rubrics.length === 0) {
				return await prisma.copilotOutput.create({
					data: {
						goldenSetId,
						userInputId,
						content,
					},
				});
			}

			return await prisma.copilotOutput.create({
				data: {
					goldenSetId,
					userInputId,
					content,
					rubrics: {
						create: rubrics.map((rubric) => ({ rubricId: rubric.id })),
					},
				},
			});
		} catch (error) {
			console.error("Error saving copilot output:", error);
			throw new Error("Failed to save copilot output");
		}
	}
}

export const executionService = new ExecutionService();
