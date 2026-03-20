
// import type { EvaluatorType } from "../../../build/generated/prisma/enums.ts";
import { EvaluatorType } from "../../../build/generated/prisma/enums.ts";
import { analyticsService } from "../../services/AnalyticsService.ts";
import type { QuestionAnswerInput, ResultFilters, SessionFilters } from "../generated/resolvers-types.ts";

export const sessionResolver = {
	Query: {
		getEvaluationSessionById: async (_: unknown, args: { id: string }) => {
			const res = await analyticsService.getEvaluationSessionById(args.id);
      return res;
		},
		getEvaluationSessions: async (_: unknown, args: SessionFilters) => {
			const res = await analyticsService.getEvaluationSessions(args);
      return res;
		},
		getEvaluationResultById: async (_: unknown, args: { id: number }) => {
			const res = await analyticsService.getEvaluationResultById(args.id);
      return res;
		},
		getEvaluationResults: async (_: unknown, args: ResultFilters) => {
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
		) => {
			const res = await analyticsService.createEvaluationSession(
        args.copilotOutputId,
        args.evaluatorId,
        EvaluatorType.human,
        args.questionSetId,
        args.answers,
      );
      return res;
		},
	},
};
