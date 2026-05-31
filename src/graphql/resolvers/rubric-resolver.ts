import { repository } from "../../DI/repository.ts";
import { ExecuteCopilotUseCase } from "../../modules/copilot-session/application/execution-service.ts";
import type { CopilotOutputEntity } from "../../modules/copilot-session/domain/entity/copilot-output.entity.ts";
import { GenerateRubricUseCase } from "../../modules/rubrics/application/generate-rubric.ts";
import type { RubricAggregate } from "../../modules/rubrics/domain/aggregate/rubric.aggregate.ts";

import type {
  CopilotOutput,
  MutationExecuteCopilotArgs as MutationExecuteCopilotArguments,
  MutationGenerateRubricArgs as MutationGenerateRubricArguments,
  QueryGetRubricByIdArgs as QueryGetRubricByIdArguments,
  Rubric,
} from "../generated/resolvers-types.ts";
import { getDangerousAccount, getMyAccount } from "../../DI/account.ts";
import { CreateProjectUseCase } from "../../modules/copilot-session/application/create-project.ts";
import { GetCopilotInputByFiltersUseCase } from "../../modules/dataset/application/copilot-input.ts";
import { GetCopilotServerUseCase } from "../../modules/dataset/application/copilot-server.ts";

const toGraphqlRubric = (
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
    evaluationSessions: [],
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
    executeCopilot: async (
      _: unknown,
      arguments_: MutationExecuteCopilotArguments,
    ): Promise<CopilotOutput> => {
      const [myAccount, dangerousAccount] = await Promise.all([
        getMyAccount(),
        getDangerousAccount(),
      ]);
      const copilotInputUseCase = new GetCopilotInputByFiltersUseCase({
        copilotInputRepository: repository.copilotInputRepository,
      });
      const copilotInput = await copilotInputUseCase.execute(
        arguments_.context.copilotInputId,
      );
      const copilotServerUseCase = new GetCopilotServerUseCase(
        repository.copilotServerRepository,
      );
      const copilotServer = await copilotServerUseCase.execute();
      const createProjectUseCase = new CreateProjectUseCase(
        {
          projectRepository: repository.projectRepository,
          zionProjectRepository: repository.zionProjectRepository(
            myAccount,
            dangerousAccount,
          ),
        },
        myAccount,
      );
      const project = await createProjectUseCase.execute(
        copilotInput,
        copilotServer,
      );
      const executeCopilotUseCase = new ExecuteCopilotUseCase(
        {
          copilotSessionRepository: repository.copilotSessionRepository,
          copilotServerRepository: repository.copilotServerRepository,
          copilotInputRepository: repository.copilotInputRepository,
        },
        myAccount,
      );
      const copilotOutput = await executeCopilotUseCase.executeV2(project);
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
          arguments_.context.copilotSessionId,
        );
      return toGraphqlRubric(rubricAggregate);
    },
  },
};
