import { repository } from "../../DI/repository.ts";
import { ExecuteCopilotUseCase } from "../../modules/copilot-session/application/execution-service.ts";
import { GenerateRubricUseCase } from "../../modules/rubrics/application/generate-rubric.ts";
import type { RubricAggregate } from "../../modules/rubrics/domain/aggregate/rubric.aggregate.ts";

import type {
  CopilotOutput,
  MutationExecuteCopilotArgs as MutationExecuteCopilotArguments,
  MutationGenerateRubricArgs as MutationGenerateRubricArguments,
  QueryGetRubricByIdArgs as QueryGetRubricByIdArguments,
  Rubric,
} from "../generated/resolvers-types.ts";
import { CreateProjectUseCase } from "../../modules/copilot-session/application/create-project.ts";
import { GetCopilotInputByFiltersUseCase } from "../../modules/dataset/application/copilot-input.ts";
import { GetCopilotServerUseCase } from "../../modules/dataset/application/copilot-server.ts";
import { createZionInjectionBundle } from "../../DI/zion.ts";
import type { ProjectAggregate } from "../../modules/copilot-session/domain/aggregate/project.aggregate.ts";
import { CopilotExecutionLifecycle } from "../../modules/copilot-session/application/copilot-execution-lifecycle.ts";
import { DeleteZionProjectUseCase } from "../../modules/copilot-session/application/delete-zion-project.ts";

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

const toGraphqlCopilotOutput = (project: ProjectAggregate): CopilotOutput => {
  const copilotOutput = project.getEntity("copilotOutput");
  if (!copilotOutput || !project.copilotSessionExId) {
    throw new Error("Copilot output or session ID not found");
  }
  return {
    ...copilotOutput.getData(),
    copilotSessionExId: project.copilotSessionExId,
    createdAt: copilotOutput.getData("createdAt")!.toISOString(),
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
      const zionInjection = await createZionInjectionBundle();
      const copilotInputUseCase = new GetCopilotInputByFiltersUseCase({
        copilotInputRepository: repository.copilotInputRepository,
      });
      const copilotServerUseCase = new GetCopilotServerUseCase(
        repository.copilotServerRepository,
        zionInjection.account,
      );
      const copilotInput = await copilotInputUseCase.execute(
        arguments_.context.copilotInputId,
      );
      const copilotServer = await copilotServerUseCase.execute();
      const copilotExecutionLifecycleUseCase = new CopilotExecutionLifecycle(
        new CreateProjectUseCase({
          projectRepository: repository.projectRepository,
          ZionProjectService: zionInjection.zionProjectService,
        }),
        new ExecuteCopilotUseCase({
          copilotSessionSetupFactory: zionInjection.copilotSessionSetupFactory,
          projectRepository: repository.projectRepository,
        }),
        new DeleteZionProjectUseCase(zionInjection.zionProjectService),
      );
      const project = await copilotExecutionLifecycleUseCase.execute(
        copilotInput,
        copilotServer.getData("id"),
      );
      return toGraphqlCopilotOutput(project);
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
