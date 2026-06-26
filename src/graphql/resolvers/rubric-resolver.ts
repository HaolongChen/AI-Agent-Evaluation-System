import { GenerateRubricUseCase } from "../../modules/rubrics/application/generate-rubric.ts";
import type { RubricAggregate } from "../../modules/rubrics/domain/aggregate/rubric.aggregate.ts";

import type {
  CopilotOutput,
  MutationExecuteCopilotArgs as MutationExecuteCopilotArguments,
  MutationExecuteCopilotByGoldenSetAndCopilotServerArgs as MutationExecuteCopilotByGoldenSetAndCopilotServerArguments,
  MutationGenerateRubricArgs as MutationGenerateRubricArguments,
  QueryGetRubricByIdArgs as QueryGetRubricByIdArguments,
  Rubric,
} from "../generated/resolvers-types.ts";
import { DeleteZionProjectUseCase } from "../../modules/copilot-session/application/delete-zion-project.ts";
import type { CopilotOutputEntity } from "../../modules/copilot-session/domain/entity/copilot-output.entity.ts";
import type { GraphQLContext } from "../../config/graphql.ts";

export const toGraphqlRubric = (
  rubric: ReturnType<RubricAggregate["getAllData"]>,
): Rubric => {
  return {
    __typename: "Rubric",
    ...rubric.aggregator,
    criterion: rubric.entities.criterion.map((item) => ({
      ...item.getData(),
      evaluation: item.getData("expectedAnswer"),
      rubricId: rubric.aggregator.id,
      __typename: "Criteria",
      reasoning: item.getData("reasoning") ?? "",
    })),
    createdAt: rubric.aggregator.createdAt!.toISOString(),
    evaluationSessions: [],
  };
};

export const toGraphqlCopilotOutput = (
  copilotOutput: CopilotOutputEntity,
): CopilotOutput => {
  return {
    ...copilotOutput.getData(),
    createdAt: copilotOutput.getData("createdAt")!.toISOString(),
    __typename: "CopilotOutput",
  };
};

export const rubricResolver = {
  Query: {
    getRubricById: async (
      _: unknown,
      arguments_: QueryGetRubricByIdArguments,
      context: GraphQLContext,
    ): Promise<Rubric> => {
      const rubric = await context.repositoryBundle.rubricRepository.findById(
        arguments_.id,
      );
      return toGraphqlRubric(rubric.getAllData());
    },
    //   getRubricByContext: async (
    //     _: unknown,
    //     arguments_: ,
    //   ): Promise<Rubric[][]> => {
    //     const getCopilotInputByFiltersUseCase =
    //       new GetCopilotInputByFiltersUseCase({
    //         copilotInputRepository: repository.copilotInputRepository,
    //       });
    //     const copilotInputs = await getCopilotInputByFiltersUseCase.execute({
    //       goldenSetId: arguments_.context.goldenSetId,
    //       userInputId: arguments_.context.userInputId,
    //     });
    //     const sessions =
    //       await repository.copilotSessionRepository.getByCopilotInput(
    //         copilotInputs[0],
    //       );
    //     const rubrics = await Promise.all(
    //       sessions.map((session) =>
    //         repository.rubricRepository.getByCopilotSession(session),
    //       ),
    //     );
    //     return rubrics.map((rubric) =>
    //       rubric.map((item) => toGraphqlRubric(item.getAllData())),
    //     );
    //   },
    // },
  },

  Mutation: {
    executeCopilotByGoldenSetAndCopilotServer: async (
      _: unknown,
      arguments_: MutationExecuteCopilotByGoldenSetAndCopilotServerArguments,
      context: GraphQLContext,
    ): Promise<CopilotOutput[]> => {
      const copilotInputs =
        await context.applicationServiceBundle.getCopilotInputByFiltersUseCase.execute(
          {
            goldenSetId: arguments_.goldenSetId,
          },
        );
      const copilotServer =
        await context.applicationServiceBundle.getCopilotServerUseCase.execute();
      const projects = await Promise.all(
        copilotInputs.map(async (copilotInput) =>
          context.applicationServiceBundle.copilotExecutionUseCase.execute(
            copilotInput,
            copilotServer,
            context.account,
          ),
        ),
      );
      return projects.map((project) =>
        toGraphqlCopilotOutput(project.getEntity("copilotOutput")!),
      );
    },

    executeCopilot: async (
      _: unknown,
      arguments_: MutationExecuteCopilotArguments,
      context: GraphQLContext,
    ): Promise<CopilotOutput> => {
      const copilotInput =
        await context.applicationServiceBundle.getCopilotInputByFiltersUseCase.execute(
          arguments_.context.copilotInputId,
        );
      const copilotServer =
        await context.applicationServiceBundle.getCopilotServerUseCase.execute();
      const project =
        await context.applicationServiceBundle.copilotExecutionUseCase.execute(
          copilotInput,
          copilotServer,
          context.account,
        );
      return toGraphqlCopilotOutput(project.getEntity("copilotOutput")!);
    },
    generateRubric: async (
      _: unknown,
      arguments_: MutationGenerateRubricArguments,
    ): Promise<Rubric> => {
      const generateRubricUseCase = new GenerateRubricUseCase(repository);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { feedbacks, ...rubricAggregate } =
        await generateRubricUseCase.execute(
          arguments_.context.copilotSessionId,
        );
      return toGraphqlRubric(rubricAggregate);
    },
  },
};
