import { prisma } from "../config/prisma.ts";
// import { SESSION_STATUS } from "../config/constants.ts";
// import type { CopilotType } from "../../build/generated/prisma/enums.ts";
import { logger } from "../external/logger.ts";
// import { goldenSetService } from "./GoldenSetService.ts";
import {
	// AZURE_OPENAI_DEPLOYMENT,
	// GEMINI_API_KEY,
	// GEMINI_MODEL,
	// OPENAI_MODEL,
	// USES_AZURE_OPENAI,
	buildWsUrl,
} from "../config/env.ts";
import { EvaluationJobRunner } from "../jobs/EvaluationJobRunner.ts";
// import { RubricGenerationJobRunner } from "../jobs/RubricGenerationJobRunner.ts";
import { TypeSystemStore } from "../external/zed/TypeSystemStore.ts";
import { projectService } from "./ProjectService.ts";
import { rubricService } from "./RubricService.ts";
import type { CopilotOutput } from "../graphql/generated/resolvers-types.ts";

// const resolveDefaultModelName = (): string => {
// 	// Prefer Azure deployment when Azure is configured; otherwise fall back to Gemini if available.
// 	if (USES_AZURE_OPENAI) return AZURE_OPENAI_DEPLOYMENT || OPENAI_MODEL;
// 	if (GEMINI_API_KEY) return GEMINI_MODEL;
// 	// Last resort: still prefer OpenAI model string (will require Azure env in LangGraph).
// 	return AZURE_OPENAI_DEPLOYMENT || OPENAI_MODEL;
// };

// const normalizeRequestedModelName = (modelName: string | undefined): string => {
// 	if (!modelName) return resolveDefaultModelName();
// 	// Historical alias used in some call sites; not a real Azure deployment name.
// 	if (modelName === "copilot-latest") return resolveDefaultModelName();
// 	return modelName;
// };

export class ExecutionService {
	async getCopilotOutputs(goldenSetId: number, userInputId: number) {
		try {
			const copilotOutputs = await prisma.copilotOutput.findMany({
				where: {
					goldenSetId,
					userInputId,
				},
			});
			return copilotOutputs;
		} catch (error) {
			logger.error("Error fetching copilot outputs:", error);
			throw new Error("Failed to fetch copilot outputs");
		}
	}

	async executeCopilot(
		goldenSetId: number,
		userInputId: number,
	): Promise<CopilotOutput> {
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

			// Clean up the temporary project after execution
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
		goldenSetId: number,
		userInputId: number,
		content: string,
	) {
		try {
			const questionSets = await rubricService.getQuestionSets(
				goldenSetId,
				userInputId,
			);
			if (questionSets.length === 0) {
				const copilotOutput = await prisma.copilotOutput.create({
					data: {
						goldenSetId,
						userInputId,
						content,
					},
				});
				return copilotOutput;
			} else {
				const questionSetIds = questionSets.map((qs) => qs.id);
				const copilotOutput = await prisma.copilotOutput.create({
					data: {
						goldenSetId,
						userInputId,
						content,
						questionSets: {
							create: questionSetIds.map((id) => ({ questionSetId: id })),
						},
					},
				});
				return copilotOutput;
			}
		} catch (error) {
			logger.error("Error saving copilot output:", error);
			throw new Error("Failed to save copilot output");
		}
	}

	// async createEvaluationSessionsX(
	// 	goldenSetId: number,
	// 	options?: {
	// 		skipHumanReview?: boolean;
	// 		skipHumanEvaluation?: boolean;
	// 	},
	// ) {
	// 	// Bulk execution defaults to fully automated evaluation
	// 	const skipHumanReview = options?.skipHumanReview ?? true;
	// 	const skipHumanEvaluation = options?.skipHumanEvaluation ?? true;
	// 	const resolvedModelName = normalizeRequestedModelName(undefined);

	// 	const goldenSet = await goldenSetService.getGoldenSet(goldenSetId);
	// 	if (!goldenSet) {
	// 		throw new Error("No golden set found");
	// 	}

	// 	if (!goldenSet.userInput || goldenSet.userInput.length === 0) {
	// 		logger.warn(`Golden set ${goldenSet.id} has no user input`);
	// 		throw new Error("Golden set has no user input");
	// 	}

	// 	const originalProjectExId: string =
	// 		goldenSet.isProjectExisting ?
	// 			goldenSet.projectExId
	// 		:	await projectService.createProject(
	// 				`golden-set-project-${goldenSet.id}-${Date.now()}`,
	// 			);

	// 	if (!originalProjectExId) {
	// 		throw new Error("Failed to create project for golden set");
	// 	}

	// 	try {
	// 		const typeSystemStore = new TypeSystemStore();
	// 		const res = await Promise.allSettled([
	// 			typeSystemStore.getAFCustomCodeTemplates(),
	// 			typeSystemStore.getSupportedCustomModelDescriptor(),
	// 			typeSystemStore.rehydrate(originalProjectExId),
	// 		]);

	// 		if (res.some((r) => r.status === "rejected")) {
	// 			logger.error(
	// 				"Error rehydrating type system store:",
	// 				res
	// 					.filter((r) => r.status === "rejected")
	// 					.map((r) => (r as PromiseRejectedResult).reason),
	// 			);
	// 			throw new Error("Failed to rehydrate type system store");
	// 		}

	// 		logger.info(
	// 			`Creating ${goldenSet.userInput.length - goldenSet.copilotOutput.length} evaluation sessions concurrently`,
	// 		);

	// 		const results = await Promise.allSettled(
	// 			goldenSet.userInput.map(async (userInput, index) => {
	// 				// Create a fresh project for each user input
	// 				const evalProjectName = `eval-${goldenSetId}-${index}-${Date.now()}`;
	// 				logger.info("Creating evaluation project", {
	// 					evalProjectName,
	// 					goldenSetId,
	// 					index,
	// 				});
	// 				const evalProjectExId =
	// 					await projectService.createProject(evalProjectName);
	// 				const evalWsUrl = buildWsUrl(evalProjectExId);
	// 				logger.info("Evaluation project created", { evalProjectExId, index });

	// 				try {
	// 					const evalJobRunner = new EvaluationJobRunner(
	// 						evalProjectExId,
	// 						evalWsUrl,
	// 						userInput.content,
	// 						typeSystemStore.supportedCustomModelDescriptor,
	// 						typeSystemStore.afCustomCodeTemplates,
	// 						typeSystemStore.schemaGraph,
	// 					);
	// 					const startTime = new Date();
	// 					evalJobRunner.startJob();
	// 					const { editableText } = await evalJobRunner.waitForCompletion();
	// 					const endTime = new Date();

	// 					const rubricJobRunner = new RubricGenerationJobRunner(
	// 						goldenSet.id,
	// 						originalProjectExId,
	// 						goldenSet.copilotType,
	// 						userInput.content,
	// 						"",
	// 						editableText,
	// 						endTime.getTime() - startTime.getTime(),
	// 						resolvedModelName,
	// 						skipHumanReview,
	// 						skipHumanEvaluation,
	// 					);
	// 					rubricJobRunner.startJob();
	// 					const rubricResult = await rubricJobRunner.waitForCompletion();
	// 					logger.info(
	// 						`Rubric generation job for golden set ${goldenSet.id} (input ${index}) completed with response:`,
	// 						rubricResult,
	// 					);
	// 					return rubricResult;
	// 				} finally {
	// 					try {
	// 						await projectService.deleteProject(evalProjectExId);
	// 					} catch (deleteErr) {
	// 						logger.error("Failed to delete evaluation project", {
	// 							evalProjectExId,
	// 							deleteErr,
	// 						});
	// 					}
	// 				}
	// 			}),
	// 		);

	// 		const successful = results.filter((r) => r.status === "fulfilled");
	// 		const failed = results.filter((r) => r.status === "rejected");

	// 		logger.info(
	// 			`Local evaluation jobs completed: ${successful.length} successful, ${failed.length} failed`,
	// 		);

	// 		if (failed.length > 0) {
	// 			failed.forEach((result, index) => {
	// 				if (result.status === "rejected") {
	// 					logger.error(`Local job ${index + 1} failed:`, result.reason);
	// 				}
	// 			});
	// 		}
	// 		if (!goldenSet.isProjectExisting) {
	// 			await projectService.deleteProject(originalProjectExId);
	// 		}
	// 		return results
	// 			.filter((r) => r.status === "fulfilled")
	// 			.map((r) => r.value.sessionId);
	// 	} catch (error) {
	// 		logger.error("Error creating evaluation sessions:", error);
	// 		throw new Error("Failed to create evaluation sessions");
	// 	}
	// }

	// async getSessionX(id: string) {
	// 	try {
	// 		return prisma.evaluationSession.findUnique({
	// 			where: { id: parseInt(id) },
	// 			include: {
	// 				rubrics: {
	// 					include: {
	// 						judgeRecord: true,
	// 					},
	// 				},
	// 				result: true,
	// 			},
	// 		});
	// 	} catch (error) {
	// 		logger.error("Error fetching evaluation session:", error);
	// 		throw new Error("Failed to fetch evaluation session");
	// 	}
	// }

	// async getSessionsX(filters: {
	// 	copilotType?: CopilotType;
	// 	modelName?: string;
	// 	status?: (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];
	// }) {
	// 	try {
	// 		return prisma.evaluationSession.findMany({
	// 			where: {
	// 				...(filters.copilotType && { copilotType: filters.copilotType }),
	// 				...(filters.modelName && { modelName: filters.modelName }),
	// 				...(filters.status && { status: filters.status }),
	// 			},
	// 			include: {
	// 				rubrics: {
	// 					include: {
	// 						judgeRecord: true,
	// 					},
	// 					orderBy: { id: "asc" },
	// 				},
	// 				result: true,
	// 			},
	// 			orderBy: { startedAt: "desc" },
	// 		});
	// 	} catch (error) {
	// 		logger.error("Error fetching evaluation sessions:", error);
	// 		throw new Error("Failed to fetch evaluation sessions");
	// 	}
	// }

	// async getSessionWithRubricsX(sessionId: number) {
	// 	try {
	// 		return prisma.evaluationSession.findUnique({
	// 			where: { id: sessionId },
	// 			include: { rubrics: true },
	// 		});
	// 	} catch (error) {
	// 		logger.error("Error fetching session with rubrics:", error);
	// 		throw new Error("Failed to fetch session with rubrics");
	// 	}
	// }

	// async updateSessionStatusX(
	// 	sessionId: number,
	// 	status: (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS],
	// 	completedAt?: Date,
	// ) {
	// 	try {
	// 		return prisma.evaluationSession.update({
	// 			where: { id: sessionId },
	// 			data: {
	// 				status,
	// 				...(completedAt && { completedAt }),
	// 			},
	// 		});
	// 	} catch (error) {
	// 		logger.error("Error updating session status:", error);
	// 		throw new Error("Failed to update session status");
	// 	}
	// }

	// async setGoldenSetActiveX(goldenSetId: number, isActive: boolean) {
	// 	try {
	// 		return prisma.goldenSet.update({
	// 			where: { id: goldenSetId },
	// 			data: { isActive },
	// 		});
	// 	} catch (error) {
	// 		logger.error("Error setting golden set active status:", error);
	// 		throw new Error("Failed to set golden set active status");
	// 	}
	// }
}

export const executionService = new ExecutionService();
