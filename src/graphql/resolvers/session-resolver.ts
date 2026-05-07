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
      throw new Error("Method not implemented.");
    },
    getEvaluationSessions: async (
      _: unknown,
      arguments_: QueryGetEvaluationSessionsArguments,
    ): Promise<EvaluationSession[]> => {
      throw new Error("Method not implemented.");
    },
    getEvaluationResultById: async (
      _: unknown,
      arguments_: QueryGetEvaluationResultByIdArguments,
    ): Promise<EvaluationResult> => {
      throw new Error("Method not implemented.");
    },
    getEvaluationResults: async (
      _: unknown,
      arguments_: QueryGetEvaluationResultsArguments,
    ): Promise<EvaluationResult[]> => {
      throw new Error("Method not implemented.");
    },
  },

  Mutation: {
    submitHumanEvaluation: async (
      _: unknown,
      arguments_: MutationSubmitHumanEvaluationArguments,
    ): Promise<EvaluationSession> => {
      throw new Error("Method not implemented.");
    },
  },
};
