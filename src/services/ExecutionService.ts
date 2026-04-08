import { logger } from "../external/logger.ts";
import { buildWsUrl } from "../config/env.ts";
import { EvaluationJobRunner } from "../jobs/EvaluationJobRunner.ts";
import { TypeSystemStore } from "../external/zed/TypeSystemStore.ts";
import { projectService } from "./ProjectService.ts";
import type { CopilotOutput } from "../graphql/generated/resolvers-types.ts";
import { CopilotOutputInterface } from "@src/interface/copilotOutputInterface";
import { GoldenSetInterface } from "@src/interface/goldenSetInterface";
import { RubricInterface } from "@src/interface/rubricInterface";

export class ExecutionService {
	async getCopilotOutputs(goldenSetId: string, userInputId: string) {
		try {
			const copilotOutputInterface = new CopilotOutputInterface("findMany");
			return await copilotOutputInterface.getCopilotOutputAdapter({
				where: {
					goldenSetId,
					userInputId,
				},
			});
		} catch (error) {
			logger.error("Error fetching copilot outputs:", error);
			throw new Error("Failed to fetch copilot outputs");
		}
	}

	async executeCopilot(
		goldenSetId: string,
		userInputId: string,
	): Promise<CopilotOutput> {
		try {
			const goldenSetInterface = new GoldenSetInterface("findUnique");
			const copilotInput = (await goldenSetInterface.getGoldenSetAdapter({
				where: { id: goldenSetId },
				include: {
					userInputs: {
						where: { id: userInputId },
					},
				},
			})) as {
				schemaId: string;
				userInputs: Array<{ content: string }>;
			} | null;

			if (
				!copilotInput ||
				!copilotInput.userInputs ||
				copilotInput.userInputs.length !== 1 ||
				!copilotInput.userInputs[0]?.content
			) {
				throw new Error(
					"No user input found for the given golden set and user input IDs",
				);
			}

			const typeSystemStore = new TypeSystemStore();
			const results = await Promise.allSettled([
				typeSystemStore.getAFCustomCodeTemplates(),
				typeSystemStore.getSupportedCustomModelDescriptor(),
			]);
			if (results.some((r) => r.status === "rejected")) {
				logger.error(
					"Error initializing type system store:",
					results
						.filter((r) => r.status === "rejected")
						.map((r) => (r as PromiseRejectedResult).reason),
				);
				throw new Error("Failed to initialize type system store");
			}

			await typeSystemStore.rehydrate(copilotInput.schemaId);

			const projectName = `temp-project-${goldenSetId}-${userInputId}-${Date.now()}`;
			const projectExId = await projectService.createProject(projectName);
			const wsUrl = buildWsUrl(projectExId);

			const evalJobRunner = new EvaluationJobRunner(
				projectExId,
				wsUrl,
				copilotInput.userInputs[0].content,
				typeSystemStore.schemaGraph,
			);
			evalJobRunner.startJob();
			const { editableText } = await evalJobRunner.waitForCompletion();

			await projectService.deleteProject(projectExId);

			const copilotOutput = await this.saveCopilotOutput(
				goldenSetId,
				userInputId,
				editableText,
			);

			return {
				id: copilotOutput.id,
				content: copilotOutput.content,
				createdAt: copilotOutput.createdAt.toISOString(),
				goldenSetId: copilotOutput.goldenSetId,
				userInputId: copilotOutput.userInputId,
			};
		} catch (error) {
			logger.error("Error executing copilot:", error);
			throw new Error("Failed to execute copilot");
		}
	}

	async saveCopilotOutput(
		goldenSetId: string,
		userInputId: string,
		content: string,
	) {
		try {
			const rubricInterface = new RubricInterface("findMany");
			const rubrics = await rubricInterface.getRubricAdapter({
				where: {
					goldenSetId,
					userInputId,
				},
				select: {
					id: true,
				},
			});

			const copilotOutputInterface = new CopilotOutputInterface("create");
			if (rubrics.length === 0) {
				return await copilotOutputInterface.getCopilotOutputAdapter({
					data: {
						goldenSetId,
						userInputId,
						content,
					},
				});
			}

			return await copilotOutputInterface.getCopilotOutputAdapter({
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
			logger.error("Error saving copilot output:", error);
			throw new Error("Failed to save copilot output");
		}
	}
}

export const executionService = new ExecutionService();
