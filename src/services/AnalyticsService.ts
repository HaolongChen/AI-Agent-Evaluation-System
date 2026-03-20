import { prisma } from "../config/prisma.ts";
import { logger } from "../utils/logger.ts";
// import { COPILOT_TYPES } from "../config/constants.ts";
import {
	EvaluatorType,
	// type Prisma,
} from "../../build/generated/prisma/client.ts";
// import { goldenSetService } from "./GoldenSetService.ts";
import {
	type QuestionAnswerInput,
	type ResultFilters,
	type SessionFilters,
} from "../graphql/generated/resolvers-types.ts";

export class AnalyticsService {
	async getEvaluationSessions(filters?: SessionFilters) {
		try {
			const sessions = await prisma.evaluationSession.findMany({
				where: {
					...(filters?.copilotOutputId &&
						filters.copilotOutputId && {
							copilotOutputId: filters.copilotOutputId,
						}),
					...(filters?.evaluatorId &&
						filters.evaluatorId && {
							evaluatorId: filters.evaluatorId,
						}),
					...(filters?.evaluatorType && {
						evaluatorType: filters.evaluatorType.toLowerCase() as EvaluatorType,
					}),
				},
				include: {
					result: true,
					evaluationRecords: true,
					questionSet: true,
				},
				orderBy: {
					startedAt: "desc",
				},
			});
			return sessions;
		} catch (error) {
			logger.error("Error fetching evaluation sessions:", error);
			throw new Error("Failed to fetch evaluation sessions");
		}
	}

	async getEvaluationSessionById(id: string) {
		try {
			const session = await prisma.evaluationSession.findUnique({
				where: { id },
				include: {
					result: true,
					evaluationRecords: true,
					questionSet: true,
				},
			});
			return session;
		} catch (error) {
			logger.error("Error fetching evaluation session by ID:", error);
			throw new Error("Failed to fetch evaluation session by ID");
		}
	}

	async getEvaluationResultById(id: number) {
		try {
			return prisma.evaluationResult.findUnique({
				where: { id },
			});
		} catch (error) {
			logger.error("Error fetching evaluation result:", error);
			throw new Error("Failed to fetch evaluation result");
		}
	}

	async getEvaluationResults(filters?: ResultFilters) {
		try {
			const results = await prisma.evaluationResult.findMany({
				where: {
					...(filters?.copilotOutputId && {
						copilotOutputId: filters.copilotOutputId,
					}),
					...(filters?.evaluatorId && { evaluatorId: filters.evaluatorId }),
					...(filters?.questionSetId && {
						questionSetId: filters.questionSetId,
					}),
				},
			});
			return results;
		} catch (error) {
			logger.error("Error fetching evaluation results:", error);
			throw new Error("Failed to fetch evaluation results");
		}
	}

	async createEvaluationRecord(
		copilotOutputId: number,
		evaluatorId: string,
		evaluatorType: EvaluatorType,
		questionId: string,
		questionSetId: string,
		answer: boolean,
	) {
		try {
			return await prisma.evaluationRecord.create({
				data: {
					copilotOutputId,
					evaluatorId,
					evaluatorType,
					questionId,
					questionSetId,
					evaluatorAnswer: answer,
				},
			});
		} catch (error) {
			logger.error("Error creating evaluation record:", error);
			throw new Error("Failed to create evaluation record");
		}
	}

	async createEvaluationSession(
		copilotOutputId: number,
		evaluatorId: string,
		evaluatorType: EvaluatorType,
		questionSetId: string,
		answers: QuestionAnswerInput[],
	) {
		try {
			const session = await prisma.evaluationSession.create({
				data: {
					copilotOutputId,
					evaluatorId,
					evaluatorType,
					questionSetId,
					evaluationRecords: {
						create: answers.map((answer) => ({
							questionId: answer.questionId,
							evaluatorAnswer: answer.answer,
							...(answer.feedback && { feedback: answer.feedback }),
						})),
					},
				},
			});
			return session;
		} catch (error) {
			logger.error("Error creating evaluation session:", error);
			throw new Error("Failed to create evaluation session");
		}
	}

	// async createEvaluationResult(
	// 	sessionId: string,
	// 	copilotType: (typeof COPILOT_TYPES)[keyof typeof COPILOT_TYPES],
	// 	modelName: string,
	// 	reportData: {
	// 		summary?: string;
	// 		detailedAnalysis?: string;
	// 		auditTrace?: string[];
	// 	},
	// 	overallScore: number,
	// ) {
	// 	try {
	// 		return prisma.evaluationResult.create({
	// 			data: {
	// 				sessionId: parseInt(sessionId),
	// 				copilotType: copilotType,
	// 				modelName: modelName,
	// 				overallScore: overallScore,
	// 				summary: reportData.summary ?? "",
	// 				detailedAnalysis: reportData.detailedAnalysis ?? "",
	// 				auditTrace: reportData.auditTrace ?? [],
	// 			},
	// 		});
	// 	} catch (error) {
	// 		logger.error("Error creating evaluation result:", error);
	// 		throw new Error("Failed to create evaluation result");
	// 	}
	// }

	// async createEvaluationSession(
	// 	goldenSetId: number,
	// 	modelName: string,
	// 	duration: number,
	// 	candidateOutput: string,
	// 	status: "pending" | "running" | "completed" | "failed",
	// 	metadata: Prisma.InputJsonValue,
	// ) {
	// 	try {
	// 		const goldenSet =
	// 			await goldenSetService.updateGoldenSetOutputAndInitSession(
	// 				goldenSetId,
	// 				candidateOutput,
	// 				duration,
	// 				modelName,
	// 				status,
	// 				metadata,
	// 			);
	// 		const session = goldenSet.evaluationSessions?.at(-1);
	// 		if (!session) {
	// 			throw new Error("Failed to create evaluation session");
	// 		}
	// 		return session;
	// 	} catch (error) {
	// 		logger.error("Error creating evaluation session:", error);
	// 		throw new Error("Failed to create evaluation session");
	// 	}
	// }
}

export const analyticsService = new AnalyticsService();
