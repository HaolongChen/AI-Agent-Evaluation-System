import { repository } from "../../DI/repository.ts";
import { ExecuteCopilotUseCase } from "../../modules/copilot-output/application/execution-service.ts";
import type { CopilotOutputEntity } from "../../modules/copilot-output/domain/entity/copilot-output.entity.ts";
import { GenerateRubricUseCase } from "../../modules/rubrics/application/generate-rubric.ts";
import { GetRubricsByCopilotInputUseCase } from "../../modules/rubrics/application/get-by-copilot-intput.ts";
import { GetRubricByIdUseCase } from "../../modules/rubrics/application/get-by-id.ts";
import type { RubricAggregate } from "../../modules/rubrics/domain/aggregate/rubric.aggregate.ts";

import type {
  CopilotOutput,
  MutationExecuteCopilotArgs as MutationExecuteCopilotArguments,
  MutationGenerateRubricArgs as MutationGenerateRubricArguments,
  QueryGetRubricByContextArgs as QueryGetRubricByContextArguments,
  QueryGetRubricByIdArgs as QueryGetRubricByIdArguments,
  Rubric,
} from "../generated/resolvers-types.ts";

const toGraphqlRubric = (
  rubric: ReturnType<RubricAggregate["toJSON"]>,
): Rubric => {
  return {
    id: rubric.id,
    goldenSetId: rubric.goldenSetId,
    userInputId: rubric.userInputId,
    criterion: rubric.criterion.map((item) => ({
      id: item.id,
      rubricId: item.rubricId,
      content: item.content,
      expectation: item.expectedAnswer,
      weight: Number(item.weight),
      createdAt: item.createdAt!.toISOString(),
    })),
  };
};

const toGraphqlCopilotOutput = (
  output: ReturnType<CopilotOutputEntity["toJSON"]>,
): CopilotOutput => {
  return {
    ...output,
    createdAt: output.createdAt!.toISOString(),
  };
};

export const rubricResolver = {
  Query: {
    getRubricById: async (
      _: unknown,
      arguments_: QueryGetRubricByIdArguments,
    ): Promise<Rubric> => {
      const getRubricByIdUseCase = new GetRubricByIdUseCase(
        repository.rubricRepository,
      );
      const rubric = await getRubricByIdUseCase.execute(arguments_.id);
      return toGraphqlRubric(rubric);
    },
    getRubricByContext: async (
      _: unknown,
      arguments_: QueryGetRubricByContextArguments,
    ): Promise<Rubric[]> => {
      const getRubricsByCopilotInputUseCase =
        new GetRubricsByCopilotInputUseCase(repository.rubricRepository);
      const rubrics = await getRubricsByCopilotInputUseCase.execute(
        arguments_.context.goldenSetId,
        arguments_.context.userInputId,
      );
      return rubrics.map((rubric) => toGraphqlRubric(rubric));
    },
  },

  Mutation: {
    executeCopilot: async (
      _: unknown,
      arguments_: MutationExecuteCopilotArguments,
    ): Promise<CopilotOutput> => {
      const executeCopilotUseCase = new ExecuteCopilotUseCase({
        copilotOutputRepository: repository.copilotOutputRepository,
        goldenSetRepository: repository.goldenSetRepository,
      });
      const copilotOutput = await executeCopilotUseCase.execute(
        arguments_.context.goldenSetId,
        arguments_.context.userInputId,
      );
      return toGraphqlCopilotOutput(copilotOutput);
    },
    generateRubric: async (
      _: unknown,
      arguments_: MutationGenerateRubricArguments,
    ): Promise<Rubric> => {
      const generateRubricUseCase = new GenerateRubricUseCase(repository);
      const rubricAggregate = await generateRubricUseCase.execute(
        arguments_.context.goldenSetId,
        arguments_.context.userInputId,
      );
      return toGraphqlRubric(rubricAggregate);
    },
  },
};
