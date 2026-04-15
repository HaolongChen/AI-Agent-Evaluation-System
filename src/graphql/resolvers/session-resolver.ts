import { EVALUATOR } from "../../config/constants.ts";
import { analyticsService } from "../../services/analytics-service.ts";
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
		): Promise<EvaluationSession> => {
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
		): Promise<EvaluationSession[]> => {
			try {
				return await analyticsService.getEvaluationSessions(arguments_.filters);
			} catch (error) {
				console.error("Error fetching evaluation sessions:", error);
				throw new Error("Failed to fetch evaluation sessions");
			}
		},
		getEvaluationResultById: async (
			_: unknown,
			arguments_: QueryGetEvaluationResultByIdArguments,
		): Promise<EvaluationResult> => {
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
		): Promise<EvaluationResult[]> => {
			try {
				return await analyticsService.getEvaluationResults(arguments_.filters);
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
				const session = await analyticsService.createEvaluationSession(
					{...arguments_.input, evaluatorType: EvaluatorType.Human}
				);
				return session;
			} catch (error) {
				console.error("Error submitting human evaluation:", error);
				throw new Error("Failed to submit human evaluation");
			}
		},
	},
};
