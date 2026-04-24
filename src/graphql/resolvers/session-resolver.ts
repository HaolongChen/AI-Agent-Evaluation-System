import { EVALUATOR, REVERSE_EVALUATOR } from "../../config/constants.ts";
import { analyticsService } from "../../applications/usecases/analytics.usecase.ts";
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

const toGraphqlSession = (session: {
  id: string;
  copilotOutputId: string;
  rubricId: string;
  evaluatorId: string;
  evaluatorType: string;
  startedAt: Date;
  completedAt: Date | null;
  modelName: string | null;
}): EvaluationSession => {
  return {
    ...session,
    evaluatorType: REVERSE_EVALUATOR[
      session.evaluatorType as keyof typeof REVERSE_EVALUATOR
    ] as EvaluatorType,
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt?.toISOString() ?? undefined,
    modelName: session.modelName ?? undefined,
  };
};

export const sessionResolver = {
  Query: {
    getEvaluationSessionById: async (
      _: unknown,
      arguments_: QueryGetEvaluationSessionByIdArguments,
    ): Promise<EvaluationSession> => {
      try {
        const session = await analyticsService.getEvaluationSessionById(
          arguments_.id,
        );
        return toGraphqlSession(session);
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
        if (!arguments_.filters) {
          throw new Error("Filters are required");
        }
        const sessions = await analyticsService.getEvaluationSessions({
          ...arguments_.filters,
          evaluatorType: arguments_.filters.evaluatorType
            ? EVALUATOR[arguments_.filters.evaluatorType]
            : undefined,
        });
        return sessions.map((session) => toGraphqlSession(session));
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
        const result = await analyticsService.getEvaluationResultById(
          arguments_.id,
        );
        return { ...result, overallScore: Number(result.overallScore) };
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
        const results = await analyticsService.getEvaluationResults(
          arguments_.filters,
        );
        return results.map((result) => ({
          ...result,
          overallScore: Number(result.overallScore),
        }));
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
        const session = await analyticsService.createEvaluationSession({
          copilotOutputId: arguments_.input.copilotOutputId,
          evaluatorId: arguments_.input.evaluatorId,
          evaluatorType: EVALUATOR.HUMAN,
          rubricId: arguments_.input.rubricId,
          evaluationRecords: arguments_.input.evaluations.map((item) => ({
            copilotOutputId: arguments_.input.copilotOutputId,
            evaluatorType: EVALUATOR.HUMAN,
            rubricId: arguments_.input.rubricId,
            criteriaId: item.criteriaId,
            evaluatorId: arguments_.input.evaluatorId,
            evaluation: item.evaluation,
            feedback: item.feedback ?? undefined,
          })),
        });
        return toGraphqlSession(session);
      } catch (error) {
        console.error("Error submitting human evaluation:", error);
        throw new Error("Failed to submit human evaluation");
      }
    },
  },
};
