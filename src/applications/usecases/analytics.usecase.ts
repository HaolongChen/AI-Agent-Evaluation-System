import type {
	evaluationRecord,
	evaluationResult,
	evaluationSession,
	EvaluatorType,
} from "../../prisma/build/generated/prisma/client.ts";
import { prisma } from "../../config/prisma.ts";
import type {
	evaluationRecordCreateInput,
	evaluationRecordCreateManyArgs as evaluationRecordCreateManyArguments,
	evaluationResultFindManyArgs as evaluationResultFindManyArguments,
	// evaluationSessionCreateArgs as evaluationSessionCreateArguments,
	evaluationSessionFindManyArgs as evaluationSessionFindManyArguments,
} from "../../prisma/build/generated/prisma/models.ts";

type EvaluationSessionWithRecords = evaluationSession & {
	evaluationRecords: evaluationRecord[];
};

export class AnalyticsService {
	async getEvaluationSessions(
		filters: evaluationSessionFindManyArguments["where"],
	): Promise<Array<evaluationSession>> {
		try {
			const sessions = await prisma.evaluationSession.findMany({
				where: filters,
				include: {
					evaluationRecords: true,
				},
				orderBy: {
					startedAt: "desc",
				},
			});
			return sessions;
		} catch (error) {
			console.error("Error fetching evaluation sessions:", error);
			throw new Error("Failed to fetch evaluation sessions");
		}
	}

	async getEvaluationSessionById(id: string): Promise<evaluationSession> {
		try {
			const session = await prisma.evaluationSession.findUnique({
				where: { id },
				include: {
					evaluationRecords: true,
				},
			});

			if (!session) {
				throw new Error(`Evaluation session with ID ${id} not found`);
			}
			return session;
		} catch (error) {
			console.error("Error fetching evaluation session by ID:", error);
			throw new Error("Failed to fetch evaluation session by ID");
		}
	}

	async getEvaluationResultById(id: string): Promise<evaluationResult> {
		try {
			const result = await prisma.evaluationResult.findUnique({
				where: { id },
			});
			if (!result) {
				throw new Error(`Evaluation result with ID ${id} not found`);
			}
			return result;
		} catch (error) {
			console.error("Error fetching evaluation result:", error);
			throw new Error("Failed to fetch evaluation result");
		}
	}

	async getEvaluationResults(
		filters: evaluationResultFindManyArguments["where"],
	): Promise<Array<evaluationResult>> {
		try {
			const results = await prisma.evaluationResult.findMany({
				where: filters,
			});
			return results;
		} catch (error) {
			console.error("Error fetching evaluation results:", error);
			throw new Error("Failed to fetch evaluation results");
		}
	}

	async createEvaluationRecord(recordInput: evaluationRecordCreateInput) {
		try {
			return await prisma.evaluationRecord.create({
				data: recordInput,
			});
		} catch (error) {
			console.error("Error creating evaluation record:", error);
			throw new Error("Failed to create evaluation record");
		}
	}

	async createEvaluationSession(sessionContext: {
		copilotOutputId: string;
		evaluatorId: string;
		evaluatorType: EvaluatorType;
		rubricId: string;
		evaluationRecords: evaluationRecordCreateManyArguments["data"];
	}): Promise<EvaluationSessionWithRecords> {
		try {
			const session = (await prisma.evaluationSession.create({
				data: {
					...sessionContext,
					evaluationRecords: {
						createMany: {
							data: sessionContext.evaluationRecords,
						},
					},
				},
				include: {
					evaluationRecords: true,
				},
			})) as EvaluationSessionWithRecords;

			return session;
		} catch (error) {
			console.error("Error creating evaluation session:", error);
			throw new Error("Failed to create evaluation session");
		}
	}
}

export const analyticsService = new AnalyticsService();
