import type { EvaluationSessionAggregate } from "../../modules/evaluation/domain/aggregate/session.aggregate.ts";
import {
  type EvaluationSession,
  type EvaluatorType,
  type MutationSubmitHumanEvaluationArgs as MutationSubmitHumanEvaluationArguments,
  type QueryGetEvaluationSessionByIdArgs as QueryGetEvaluationSessionByIdArguments,
  type QueryGetEvaluationSessionsArgs as QueryGetEvaluationSessionsArguments,
} from "../generated/resolvers-types.ts";

const toGraphqlSession = (
  session: ReturnType<EvaluationSessionAggregate["getAllData"]>,
): EvaluationSession => {
  return {
    ...session.aggregator,
    rubricId: session.entities.rubric.getData("id"),
    __typename: "EvaluationSession",
    copilotOutputId: session.entities.rubric
      .getEntity("copilotSession")
      .getEntity("copilotOutput")
      .getData("id"),
    createdAt: session.aggregator.createdAt?.toISOString(),
    evaluatorType: session.aggregator.evaluatorType as EvaluatorType,
    evaluationRecords: session.entities.rubric
      .getEntity("criterion")
      .map((criteria) => {
        return {
          ...criteria.getEntity("evaluationRecord").getData(),
          rubricId: session.entities.rubric.getData("id"),
          __typename: "EvaluationRecord",
          copilotOutputId: session.entities.rubric
            .getEntity("copilotSession")
            .getEntity("copilotOutput")
            .getData("id"),
          evaluatorId: session.aggregator.evaluatorId,
          criteriaId: criteria.getData("id"),
          feedback:
            criteria.getEntity("evaluationRecord").getData("feedback") ??
            undefined,
        };
      }),
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
