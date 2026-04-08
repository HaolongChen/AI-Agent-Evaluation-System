import { analyticsService } from "../../services/AnalyticsService.ts";
import {
	EvaluatorType,
	type EvaluationResult,
	type EvaluationSession,
	type MutationSubmitHumanEvaluationArgs,
	type QueryGetEvaluationResultByIdArgs,
	type QueryGetEvaluationResultsArgs,
	type QueryGetEvaluationSessionByIdArgs,
	type QueryGetEvaluationSessionsArgs,
} from "../generated/resolvers-types.ts";
import { logger } from "../../external/logger.ts";

export const sessionResolver = {
	Query: {
		getEvaluationSessionById: async (
			_: unknown,
			args: QueryGetEvaluationSessionByIdArgs,
		): Promise<EvaluationSession | null> => {
			try {
				return await analyticsService.getEvaluationSessionById(args.id);
			} catch (error) {
				logger.error("Error fetching evaluation session by id:", error);
				throw new Error("Failed to fetch evaluation session by id");
			}
		},
		getEvaluationSessions: async (
			_: unknown,
			args: QueryGetEvaluationSessionsArgs,
		): Promise<EvaluationSession[] | null> => {
			try {
				return await analyticsService.getEvaluationSessions(
					args.filters ?? undefined,
				);
			} catch (error) {
				logger.error("Error fetching evaluation sessions:", error);
				throw new Error("Failed to fetch evaluation sessions");
			}
		},
		getEvaluationResultById: async (
			_: unknown,
			args: QueryGetEvaluationResultByIdArgs,
		): Promise<EvaluationResult | null> => {
			try {
				return await analyticsService.getEvaluationResultById(args.id);
			} catch (error) {
				logger.error("Error fetching evaluation result by id:", error);
				throw new Error("Failed to fetch evaluation result by id");
			}
		},
		getEvaluationResults: async (
			_: unknown,
			args: QueryGetEvaluationResultsArgs,
		): Promise<EvaluationResult[] | null> => {
			try {
				return await analyticsService.getEvaluationResults(
					args.filters ?? undefined,
				);
			} catch (error) {
				logger.error("Error fetching evaluation results:", error);
				throw new Error("Failed to fetch evaluation results");
			}
		},
	},

	Mutation: {
		submitHumanEvaluation: async (
			_: unknown,
			args: MutationSubmitHumanEvaluationArgs,
		): Promise<EvaluationSession> => {
			try {
				return await analyticsService.createEvaluationSession(
					args.input.copilotOutputId,
					args.input.evaluatorId,
					EvaluatorType.Human,
					args.input.rubricId,
					args.input.evaluations,
				);
			} catch (error) {
				logger.error("Error submitting human evaluation:", error);
				throw new Error("Failed to submit human evaluation");
			}
		},
	},
};
