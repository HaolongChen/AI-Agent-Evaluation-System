import { repository } from "../../DI/repository.ts";
import { ExecuteCopilotUseCase } from "../../modules/copilot-output/application/execution-service.ts";
import type { CopilotOutputEntity } from "../../modules/copilot-output/domain/entity/copilot-output.entity.ts";
import { GenerateRubricUseCase } from "../../modules/rubrics/application/generate-rubric.ts";
import { ProjectLifecycleAdapter } from "../../modules/copilot-input/application/project-lifecycle.ts";
import type { RubricAggregate } from "../../modules/rubrics/domain/aggregate/rubric.aggregate.ts";

import type {
  CopilotOutput,
  MutationExecuteCopilotArgs as MutationExecuteCopilotArguments,
  MutationGenerateRubricArgs as MutationGenerateRubricArguments,
  QueryGetRubricByContextArgs as QueryGetRubricByContextArguments,
  QueryGetRubricByIdArgs as QueryGetRubricByIdArguments,
  Rubric,
} from "../generated/resolvers-types.ts";
import { getMyAccount } from "../../DI/account.ts";

const toGraphqlRubric = (
  rubric: ReturnType<RubricAggregate["getAllData"]>,
): Rubric => {
  return {
    __typename: "Rubric",
    ...rubric,
    criterion: rubric.criterion.map((item) => ({
      id: item.id,
      rubricId: item.rubricId,
      content: item.content,
      expectation: item.expectedAnswer,
      weight: Number(item.weight),
      reasoning: item.reasoning,
      createdAt: item.createdAt!.toISOString(),
      __typename: "Criteria",
    })),
  };
};

const toGraphqlCopilotOutput = (
  output: ReturnType<CopilotOutputEntity["getData"]>,
): CopilotOutput => {
  return {
    ...output,
    editableText: output.editableText ?? undefined,
    createdAt: output.createdAt!.toISOString(),
    __typename: "CopilotOutput",
  };
};

export const rubricResolver = {
  Query: {
    getRubricById: async (
      _: unknown,
      arguments_: QueryGetRubricByIdArguments,
    ): Promise<Rubric> => {
      const rubric = await repository.rubricRepository.findById(arguments_.id);
      return toGraphqlRubric(rubric.getAllData());
    },
    getRubricByContext: async (
      _: unknown,
      arguments_: QueryGetRubricByContextArguments,
    ): Promise<Rubric[]> => {
      const rubrics =
        await repository.rubricRepository.getByGoldenSetIdAndUserInputId(
          arguments_.context.goldenSetId,
          arguments_.context.userInputId,
        );
      return rubrics.map((rubric) => toGraphqlRubric(rubric.getAllData()));
    },
  },

  Mutation: {
    executeCopilot: async (
      _: unknown,
      arguments_: MutationExecuteCopilotArguments,
    ): Promise<CopilotOutput> => {
      const myAccount = await getMyAccount();
      const projectLifecycle = new ProjectLifecycleAdapter(
        myAccount,
        repository.projectRepository,
      );
      const executeCopilotUseCase = new ExecuteCopilotUseCase(
        {
          copilotOutputRepository: repository.copilotOutputRepository,
          copilotInputRepository: repository.copilotInputRepository,
        },
        projectLifecycle,
        myAccount,
      );
      const copilotOutput = await executeCopilotUseCase.executeV2(
        arguments_.context,
      );
      return toGraphqlCopilotOutput(copilotOutput);
    },
    generateRubric: async (
      _: unknown,
      arguments_: MutationGenerateRubricArguments,
    ): Promise<Rubric> => {
      const generateRubricUseCase = new GenerateRubricUseCase(repository);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { feedbacks, ...rubricAggregate } =
        await generateRubricUseCase.execute(
          arguments_.context.goldenSetId,
          arguments_.context.userInputId,
        );
      return toGraphqlRubric(rubricAggregate);
    },
  },
};
