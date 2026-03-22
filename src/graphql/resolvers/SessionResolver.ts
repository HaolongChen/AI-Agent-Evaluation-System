import { analyticsService } from "../../services/AnalyticsService.ts";
import {
	EvaluatorType,
	type EvaluationResult,
	type EvaluationSession,
	type QuestionAnswerInput,
	type ResultFilters,
	type SessionFilters,
} from "../generated/resolvers-types.ts";

export const sessionResolver = {
	Query: {
		getEvaluationSessionById: async (
			_: unknown,
			args: { id: string },
		): Promise<EvaluationSession | null> => {
			const res = await analyticsService.getEvaluationSessionById(args.id);
			return res;
		},
		getEvaluationSessions: async (_: unknown, args: SessionFilters): Promise<EvaluationSession[] | null> => {
			const res = await analyticsService.getEvaluationSessions(args);
			return res;
		},
		getEvaluationResultById: async (_: unknown, args: { id: number }): Promise<EvaluationResult | null> => {
			const res = await analyticsService.getEvaluationResultById(args.id);
			return res;
		},
		getEvaluationResults: async (_: unknown, args: ResultFilters): Promise<EvaluationResult[] | null> => {
			const res = await analyticsService.getEvaluationResults(args);
			return res;
		},
	},

	Mutation: {
		submitHumanEvaluation: async (
			_: unknown,
			args: {
				evaluatorId: string;
				copilotOutputId: number;
				questionSetId: string;
				answers: QuestionAnswerInput[];
			},
		): Promise<EvaluationSession> => {
			const res = await analyticsService.createEvaluationSession(
				args.copilotOutputId,
				args.evaluatorId,
				EvaluatorType.Human,
				args.questionSetId,
				args.answers,
			);
			return res;
		},
	},
};
