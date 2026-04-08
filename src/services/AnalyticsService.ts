import { logger } from "../external/logger.ts";
import {
	EvaluatorType,
	type EvaluationInput,
	type EvaluationRecord,
	type EvaluationResult,
	type EvaluationSession,
	type ResultFilters,
	type SessionFilters,
} from "../graphql/generated/resolvers-types.ts";
import { REVERSE_EVALUATOR, EVALUATOR } from "../config/constants.ts";
import { EvaluationRecordInterface } from "@src/interface/evaluationRecordInterface";
import { EvaluationResultInterface } from "@src/interface/evaluationResultInterface";
import { EvaluationSessionInterface } from "@src/interface/evaluationSessionInterface";
import type {
	evaluationRecord,
	evaluationSession,
} from "../prisma/build/generated/prisma/client.ts";

type EvaluationSessionWithRecords = evaluationSession & {
	evaluationRecords: evaluationRecord[];
};

export class AnalyticsService {
	private toGraphqlEvaluationRecord(
		record: evaluationRecord,
	): EvaluationRecord {
		return {
			id: record.id,
			copilotOutputId: record.copilotOutputId,
			rubricId: record.rubricId,
			criteriaId: record.criteriaId,
			evaluatorId: record.evaluatorId,
			evaluation: record.evaluation,
			feedback: record.feedback,
		};
	}

	async getEvaluationSessions(
		filters?: SessionFilters,
	): Promise<Array<EvaluationSession> | null> {
		try {
			const evaluationSessionInterface = new EvaluationSessionInterface(
				"findMany",
			);
			const sessions =
				(await evaluationSessionInterface.getEvaluationSessionAdapter({
					where: {
						...(filters?.copilotOutputId && {
							copilotOutputId: filters.copilotOutputId,
						}),
						...(filters?.rubricId && {
							rubricId: filters.rubricId,
						}),
						...(filters?.evaluatorId && {
							evaluatorId: filters.evaluatorId,
						}),
						...(filters?.evaluatorType && {
							evaluatorType:
								EVALUATOR[filters.evaluatorType as keyof typeof EVALUATOR],
						}),
					},
					include: {
						evaluationRecords: true,
					},
					orderBy: {
						startedAt: "desc",
					},
				})) as EvaluationSessionWithRecords[];

			return sessions.map((session) => ({
				id: session.id,
				copilotOutputId: session.copilotOutputId,
				rubricId: session.rubricId,
				evaluatorId: session.evaluatorId,
				evaluatorType: REVERSE_EVALUATOR[
					session.evaluatorType as keyof typeof REVERSE_EVALUATOR
				] as EvaluatorType,
				modelName: session.modelName,
				startedAt: session.startedAt.toISOString(),
				completedAt: session.completedAt?.toISOString() ?? null,
				evaluations: session.evaluationRecords.map((record) =>
					this.toGraphqlEvaluationRecord(record),
				),
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
			const evaluationSessionInterface = new EvaluationSessionInterface(
				"findUnique",
			);
			const session =
				(await evaluationSessionInterface.getEvaluationSessionAdapter({
					where: { id },
					include: {
						evaluationRecords: true,
					},
				})) as EvaluationSessionWithRecords | null;

			if (!session) {
				return null;
			}

			return {
				id: session.id,
				copilotOutputId: session.copilotOutputId,
				rubricId: session.rubricId,
				evaluatorId: session.evaluatorId,
				evaluatorType: REVERSE_EVALUATOR[
					session.evaluatorType as keyof typeof REVERSE_EVALUATOR
				] as EvaluatorType,
				modelName: session.modelName,
				startedAt: session.startedAt.toISOString(),
				completedAt: session.completedAt?.toISOString() ?? null,
				evaluations: session.evaluationRecords.map((record) =>
					this.toGraphqlEvaluationRecord(record),
				),
			};
		} catch (error) {
			logger.error("Error fetching evaluation session by ID:", error);
			throw new Error("Failed to fetch evaluation session by ID");
		}
	}

	async getEvaluationResultById(id: string): Promise<EvaluationResult | null> {
		try {
			const evaluationResultInterface = new EvaluationResultInterface(
				"findUnique",
			);
			const result = await evaluationResultInterface.getEvaluationResultAdapter(
				{
					where: { id },
				},
			);
			if (!result) {
				return null;
			}
			return {
				id: result.id,
				evaluatorId: result.evaluatorId,
				copilotOutputId: result.copilotOutputId,
				rubricId: result.rubricId,
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
			const evaluationResultInterface = new EvaluationResultInterface(
				"findMany",
			);
			const results =
				await evaluationResultInterface.getEvaluationResultAdapter({
					where: {
						...(filters?.copilotOutputId && {
							copilotOutputId: filters.copilotOutputId,
						}),
						...(filters?.evaluatorId && { evaluatorId: filters.evaluatorId }),
						...(filters?.rubricId && { rubricId: filters.rubricId }),
					},
				});
			return results.map((result) => ({
				id: result.id,
				evaluatorId: result.evaluatorId,
				copilotOutputId: result.copilotOutputId,
				rubricId: result.rubricId,
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
		copilotOutputId: string,
		evaluatorId: string,
		evaluatorType: EvaluatorType,
		rubricId: string,
		criteriaId: string,
		evaluation: boolean,
		feedback?: string,
	) {
		try {
			const evaluationRecordInterface = new EvaluationRecordInterface("create");
			return await evaluationRecordInterface.getEvaluationRecordAdapter({
				data: {
					copilotOutputId,
					evaluatorId,
					evaluatorType: EVALUATOR[evaluatorType],
					rubricId,
					criteriaId,
					evaluation,
					feedback,
				},
			});
		} catch (error) {
			logger.error("Error creating evaluation record:", error);
			throw new Error("Failed to create evaluation record");
		}
	}

	async createEvaluationSession(
		copilotOutputId: string,
		evaluatorId: string,
		evaluatorType: EvaluatorType,
		rubricId: string,
		evaluations: EvaluationInput[],
	): Promise<EvaluationSession> {
		try {
			const evaluationSessionInterface = new EvaluationSessionInterface(
				"create",
			);
			const session =
				(await evaluationSessionInterface.getEvaluationSessionAdapter({
					data: {
						copilotOutputId,
						evaluatorId,
						evaluatorType: EVALUATOR[evaluatorType],
						rubricId,
						evaluationRecords: {
							create: evaluations.map((answer) => ({
								criteriaId: answer.criteriaId,
								evaluation: answer.evaluation,
								feedback: answer.feedback ?? null,
							})),
						},
					},
					include: {
						evaluationRecords: true,
					},
				})) as EvaluationSessionWithRecords;

			return {
				id: session.id,
				copilotOutputId: session.copilotOutputId,
				rubricId: session.rubricId,
				evaluatorId: session.evaluatorId,
				evaluatorType,
				modelName: session.modelName,
				startedAt: session.startedAt.toISOString(),
				completedAt: session.completedAt?.toISOString() ?? null,
				evaluations: session.evaluationRecords.map((record) =>
					this.toGraphqlEvaluationRecord(record),
				),
			};
		} catch (error) {
			logger.error("Error creating evaluation session:", error);
			throw new Error("Failed to create evaluation session");
		}
	}
}

export const analyticsService = new AnalyticsService();
