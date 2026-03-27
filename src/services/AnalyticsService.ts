import { prisma } from "../config/prisma.ts";
import { logger } from "../utils/logger.ts";
// import { COPILOT_TYPES } from "../config/constants.ts";
import {} from // type Prisma,
"../prisma/build/generated/prisma/client.ts";
// import { goldenSetService } from "./GoldenSetService.ts";
import {
	EvaluatorType,
	type EvaluationResult,
	type EvaluationSession,
	type QuestionAnswerInput,
	type ResultFilters,
	type SessionFilters,
} from "../graphql/generated/resolvers-types.ts";
import { REVERSE_EVALUATOR, EVALUATOR } from "../config/constants.ts";

export class AnalyticsService {
	async getEvaluationSessions(
		filters?: SessionFilters,
	): Promise<Array<EvaluationSession> | null> {
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
						evaluatorType:
							filters.evaluatorType.toLowerCase() as (typeof EVALUATOR)[keyof typeof EVALUATOR],
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
			return sessions.map((session) => ({
				questionSetId: session.questionSetId,
				evaluatorId: session.evaluatorId,
				id: session.id,
				copilotOutputId: session.copilotOutputId,
				evaluatorType: REVERSE_EVALUATOR[
					session.evaluatorType as keyof typeof REVERSE_EVALUATOR
				] as EvaluatorType,
				completedAt:
					session.result?.generatedAt ?
						session.result.generatedAt.toISOString()
					:	null,
			}));
		} catch (error) {
			logger.error("Error fetching evaluation sessions:", error);
			throw new Error("Failed to fetch evaluation sessions");
		}
	}

	async getEvaluationSessionById(
		id: string,
	): Promise<EvaluationSession | null> {
		try {
			const session = await prisma.evaluationSession.findUnique({
				where: { id },
				include: {
					result: true,
					evaluationRecords: true,
					questionSet: true,
				},
			});
			if (!session) {
				return null;
			}
			return {
				questionSetId: session.questionSetId,
				evaluatorId: session.evaluatorId,
				id: session.id,
				copilotOutputId: session.copilotOutputId,
				evaluatorType: REVERSE_EVALUATOR[
					session.evaluatorType as keyof typeof REVERSE_EVALUATOR
				] as EvaluatorType,
				completedAt:
					session.result?.generatedAt ?
						session.result.generatedAt.toISOString()
					:	null,
			};
		} catch (error) {
			logger.error("Error fetching evaluation session by ID:", error);
			throw new Error("Failed to fetch evaluation session by ID");
		}
	}

	async getEvaluationResultById(id: number): Promise<EvaluationResult | null> {
		try {
			const result = await prisma.evaluationResult.findUnique({
				where: { id },
			});
			if (!result) {
				return null;
			}
			return {
				id: result.id,
				evaluatorId: result.evaluatorId,
				copilotOutputId: result.copilotOutputId,
				questionSetId: result.questionSetId,

				overallScore: Number(result.overallScore),
				summary: result.summary,
				detailedAnalysis: result.detailedAnalysis,
				auditTrace: result.auditTrace,
			};
		} catch (error) {
			logger.error("Error fetching evaluation result:", error);
			throw new Error("Failed to fetch evaluation result");
		}
	}

	async getEvaluationResults(
		filters?: ResultFilters,
	): Promise<Array<EvaluationResult> | null> {
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
			return results.map((result) => ({
				id: result.id,
				evaluatorId: result.evaluatorId,
				copilotOutputId: result.copilotOutputId,
				questionSetId: result.questionSetId,

				overallScore: Number(result.overallScore),
				summary: result.summary,
				detailedAnalysis: result.detailedAnalysis,
				auditTrace: result.auditTrace,
			}));
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
					evaluatorType: EVALUATOR[evaluatorType],
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
	): Promise<EvaluationSession> {
		try {
			const session = await prisma.evaluationSession.create({
				data: {
					copilotOutputId,
					evaluatorId,
					evaluatorType: EVALUATOR[evaluatorType],
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
			if(!session){
				logger.error("Failed to create evaluation session: No session returned from database");
				throw new Error("Failed to create evaluation session");
			}
			return {
				id: session.id,
				questionSetId,
				evaluatorId,
				copilotOutputId,
				evaluatorType,
				completedAt: session.completedAt?.toISOString() ?? null,
			};
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
