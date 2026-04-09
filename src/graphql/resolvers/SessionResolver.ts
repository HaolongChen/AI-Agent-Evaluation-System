import { analyticsService } from "../../services/AnalyticsService.ts";
import {
	EvaluatorType,
	type EvaluationResult,
	type EvaluationSession,
	type MutationSubmitHumanEvaluationArgs as MutationSubmitHumanEvaluationArguments,
	type QueryGetEvaluationResultByIdArgs as QueryGetEvaluationResultByIdArguments,
	type QueryGetEvaluationResultsArgs as QueryGetEvaluationResultsArguments,
	type QueryGetEvaluationSessionByIdArgs as QueryGetEvaluationSessionByIdArguments,
	type QueryGetEvaluationSessionsArgs as QueryGetEvaluationSessionsArguments,
} from "../generated/resolvers-types.ts";


export const sessionResolver = {
	Query: {
		getEvaluationSessionById: async (
			_: unknown,
			arguments_: QueryGetEvaluationSessionByIdArguments,
		): Promise<EvaluationSession | null> => {
			try {
				return await analyticsService.getEvaluationSessionById(arguments_.id);
			} catch (error) {
				console.error("Error fetching evaluation session by id:", error);
				throw new Error("Failed to fetch evaluation session by id");
			}
		},
		getEvaluationSessions: async (
			_: unknown,
			arguments_: QueryGetEvaluationSessionsArguments,
		): Promise<EvaluationSession[] | null> => {
			try {
				return await analyticsService.getEvaluationSessions(
					arguments_.filters ?? undefined,
				);
			} catch (error) {
				console.error("Error fetching evaluation sessions:", error);
				throw new Error("Failed to fetch evaluation sessions");
			}
		},
		getEvaluationResultById: async (
			_: unknown,
			arguments_: QueryGetEvaluationResultByIdArguments,
		): Promise<EvaluationResult | null> => {
			try {
				return await analyticsService.getEvaluationResultById(arguments_.id);
			} catch (error) {
				console.error("Error fetching evaluation result by id:", error);
				throw new Error("Failed to fetch evaluation result by id");
			}
		},
		getEvaluationResults: async (
			_: unknown,
			arguments_: QueryGetEvaluationResultsArguments,
		): Promise<EvaluationResult[] | null> => {
			try {
				return await analyticsService.getEvaluationResults(
					arguments_.filters ?? undefined,
				);
			} catch (error) {
				console.error("Error fetching evaluation results:", error);
				throw new Error("Failed to fetch evaluation results");
			}
		},
	},

	Mutation: {
		submitHumanEvaluation: async (
			_: unknown,
			arguments_: MutationSubmitHumanEvaluationArguments,
		): Promise<EvaluationSession> => {
			try {
				return await analyticsService.createEvaluationSession(
					arguments_.input.copilotOutputId,
					arguments_.input.evaluatorId,
					EvaluatorType.Human,
					arguments_.input.rubricId,
					arguments_.input.evaluations,
				);
			} catch (error) {
				console.error("Error submitting human evaluation:", error);
				throw new Error("Failed to submit human evaluation");
			}
		},
	},
};
