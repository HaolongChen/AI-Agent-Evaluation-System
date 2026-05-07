import { executionService } from "../../services/execution-service.ts";
import { rubricService } from "../../services/rubric-service.ts";

import type {
  CopilotOutput,
  MutationExecuteCopilotArgs as MutationExecuteCopilotArguments,
  MutationGenerateRubricArgs as MutationGenerateRubricArguments,
  QueryGetRubricByContextArgs as QueryGetRubricByContextArguments,
  QueryGetRubricByIdArgs as QueryGetRubricByIdArguments,
  Rubric,
} from "../generated/resolvers-types.ts";

type PrismCriteriaLike = {
  id: string;
  rubricId: string;
  version: string;
  title: string | null;
  content: string;
  expectedAnswer: boolean;
  weight: unknown;
};

type PrismRubricLike = {
  id: string;
  goldenSetId: string;
  userInputId: string;
  criterion: PrismCriteriaLike[];
};

type PrismaCopilotOutputLike = {
  id: string;
  goldenSetId: string;
  userInputId: string;
  content: string;
  createdAt: Date;
};

const toGraphqlRubric = (rubric: PrismRubricLike): Rubric => {
  return {
    id: rubric.id,
    goldenSetId: rubric.goldenSetId,
    userInputId: rubric.userInputId,
    criterion: rubric.criterion.map((item) => ({
      id: item.id,
      rubricId: item.rubricId,
      version: item.version,
      title: item.title ?? undefined,
      content: item.content,
      expectedEvaluation: item.expectedAnswer,
      weight: Number(item.weight),
    })),
  };
};

const toGraphqlCopilotOutput = (
  output: PrismaCopilotOutputLike,
): CopilotOutput => {
  return {
    ...output,
    createdAt: output.createdAt.toISOString(),
  };
};

export const rubricResolver = {
  Query: {
    getRubricById: async (
      _: unknown,
      arguments_: QueryGetRubricByIdArguments,
    ): Promise<Rubric> => {
      throw new Error("Method not implemented.");
    },
    getRubricByContext: async (
      _: unknown,
      arguments_: QueryGetRubricByContextArguments,
    ): Promise<Rubric[]> => {
      throw new Error("Method not implemented.");
    },
  },

  Mutation: {
    executeCopilot: async (
      _: unknown,
      arguments_: MutationExecuteCopilotArguments,
    ): Promise<CopilotOutput> => {
      throw new Error("Method not implemented.");
    },
    generateRubric: async (
      _: unknown,
      arguments_: MutationGenerateRubricArguments,
    ): Promise<Rubric> => {
      throw new Error("Method not implemented.");
    },
  },
};
