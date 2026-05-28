import { Client } from "pg";
import { repository } from "../../DI/repository.ts";
import { CreateGoldenSetUseCase } from "../../modules/dataset/application/create-golden-set.ts";
import { CreateUserInputUseCase } from "../../modules/dataset/application/create-user-input.ts";
import {
  FormCopilotInputUseCase,
  GetCopilotInputByFiltersUseCase,
} from "../../modules/dataset/application/form-copilot-input.ts";
import {
  type CopilotInput,
  // CopilotType,
  type GoldenSet,
  type MutationCreateProjectArgs as MutationCreateProjectArguments,
  type MutationCreateUserInputArgs as MutationCreateUserInputArguments,
  type MutationDeleteProjectArgs as MutationDeleteProjectArguments,
  type MutationInitializeGoldenSetArgs as MutationInitializeGoldenSetArguments,
  type MutationLinkGoldenSetToUserInputArgs as MutationLinkGoldenSetToUserInputArguments,
  type QueryGetCopilotInputArgs as QueryGetCopilotInputArguments,
  type QueryGetGoldenSetBySchemaIdArgs as QueryGetGoldenSetBySchemaIdArguments,
  type QueryGetGoldenSetByIdArgs as QueryGetGoldenSetByIdArguments,
  type QueryGetUserInputByIdArgs as QueryGetUserInputByIdArguments,
  type UserInput,
} from "../generated/resolvers-types.ts";
import { GraphQLError } from "graphql";
import { GQL_FIX_ALIPAY_DATA_BINDING } from "../../modules/dataset/infrastructure/project-manager.ts";
import { NetworkClient } from "../../modules/shared/application/graphql-client.ts";
import type {
  FixAliPayDataBindingMutation,
  FixAliPayDataBindingMutationVariables,
} from "../generated/types.ts";
import { logger } from "../../modules/shared/infrastructure/logger.ts";
import { ProjectLifecycleAdapter } from "../../modules/dataset/application/project-lifecycle.ts";
import { getMyAccount } from "../../DI/account.ts";
import type { GoldenSetEntity } from "../../modules/dataset/domain/entity/golden-set.entity.ts";
import type { UserInputEntity } from "../../modules/dataset/domain/entity/user-input.entity.ts";
import type { CopilotInputAggregate } from "../../modules/dataset/domain/aggregate/copilot-input.aggregate.ts";

// const copilotTypeMapper = {
//   dataModelBuilder: CopilotType.DataModelBuilder,
//   uiBuilder: CopilotType.UiBuilder,
//   actionFlowBuilder: CopilotType.ActionFlowBuilder,
//   logAnalyzer: CopilotType.LogAnalyzer,
//   agentBuilder: CopilotType.AgentBuilder,
// };

export const goldenSetDataMapper = (
  data: ReturnType<GoldenSetEntity["getData"]>,
): GoldenSet => {
  return {
    ...data,
    // copilotType: copilotTypeMapper[data.copilotType],
    __typename: "GoldenSet",
  };
};

export const userInputDataMapper = (
  data: ReturnType<UserInputEntity["getData"]>,
): UserInput => {
  return {
    ...data,
    createdAt: data.createdAt!.toISOString(),
    __typename: "UserInput",
  };
};

export const copilotInputDataMapper = (
  data: ReturnType<CopilotInputAggregate["getAllData"]>,
): CopilotInput => {
  return {
    goldenSet: goldenSetDataMapper(data.entities.goldenSet[0].getData()),
    userInput: userInputDataMapper(data.entities.userInput[0].getData()),
    copilotSessions: [],
    __typename: "CopilotInput",
  };
};

export const goldenSetResolver = {
  Query: {
    getCopilotInput: async (
      _: unknown,
      arguments_: QueryGetCopilotInputArguments,
    ): Promise<CopilotInput[]> => {
      const getCopilotInputByFiltersUseCase =
        new GetCopilotInputByFiltersUseCase({
          copilotInputRepository: repository.copilotInputRepository,
        });
      const copilotInputs =
        await getCopilotInputByFiltersUseCase.execute(arguments_);
      return copilotInputs.map((copilotInput) => {
        return copilotInputDataMapper(copilotInput.getAllData());
      });
    },

    getUserInputById: async (
      _: unknown,
      arguments_: QueryGetUserInputByIdArguments,
    ): Promise<UserInput> => {
      const userInput = await repository.userInputRepository.findById(
        arguments_.id,
      );
      return userInputDataMapper(userInput.getData());
    },

    getUserInputs: async (): Promise<UserInput[]> => {
      const userInputs = await repository.userInputRepository.getAll();
      return userInputs.map((userInput) => {
        return userInputDataMapper(userInput.getData());
      });
    },

    getGoldenSetById: async (
      _: unknown,
      arguments_: QueryGetGoldenSetByIdArguments,
    ): Promise<GoldenSet> => {
      const goldenSet = await repository.goldenSetRepository.findById(
        arguments_.id,
      );
      return goldenSetDataMapper(goldenSet.getData());
    },
    getGoldenSetBySchemaId: async (
      _: unknown,
      arguments_: QueryGetGoldenSetBySchemaIdArguments,
    ): Promise<GoldenSet[]> => {
      const goldenSet = await repository.goldenSetRepository.findBySchemaId(
        arguments_.schemaId,
      );
      return [goldenSetDataMapper(goldenSet.getData())];
    },
  },

  Mutation: {
    initializeGoldenSet: async (
      _: unknown,
      arguments_: MutationInitializeGoldenSetArguments,
    ): Promise<GoldenSet> => {
      const createGoldenSetUseCase = new CreateGoldenSetUseCase(
        repository.goldenSetRepository,
      );
      const goldenSet = await createGoldenSetUseCase.execute(
        arguments_.input.schemaId,
      );
      return goldenSetDataMapper(goldenSet);
    },
    createUserInput: async (
      _: unknown,
      arguments_: MutationCreateUserInputArguments,
    ): Promise<UserInput> => {
      const createUserInputUseCase = new CreateUserInputUseCase(
        repository.userInputRepository,
        await getMyAccount(),
      );
      const userInput = await createUserInputUseCase.execute(
        arguments_.input.content,
      );
      return userInputDataMapper(userInput);
    },
    linkGoldenSetToUserInput: async (
      _: unknown,
      arguments_: MutationLinkGoldenSetToUserInputArguments,
    ): Promise<boolean> => {
      const formCopilotInputUseCase = new FormCopilotInputUseCase({
        copilotInputRepository: repository.copilotInputRepository,
        goldenSetRepository: repository.goldenSetRepository,
        userInputRepository: repository.userInputRepository,
      });
      await formCopilotInputUseCase.execute(
        arguments_.context.goldenSetId,
        arguments_.context.userInputId,
      );
      return true;
    },

    createProject: async (
      _: unknown,
      arguments_: MutationCreateProjectArguments,
    ): Promise<GoldenSet> => {
      const projectLifecycle = new ProjectLifecycleAdapter(
        await getMyAccount(),
        repository.projectRepository,
      );
      await projectLifecycle.createTemporaryProject(
        arguments_.projectName ?? `temp-project-${Date.now()}`,
      );
      const projectService = projectLifecycle.projectService;
      const schemaManager = projectService?.getSchemaManager();
      const schemaId = schemaManager?.getSchemaId();
      if (!schemaId) {
        throw new Error("Failed to create project: schema ID is undefined");
      }
      const createGoldenSetUseCase = new CreateGoldenSetUseCase(
        repository.goldenSetRepository,
      );
      const goldenSet = await createGoldenSetUseCase.execute(schemaId);
      return goldenSetDataMapper(goldenSet);
    },
    deleteProject: async (
      _: unknown,
      arguments_: MutationDeleteProjectArguments,
    ): Promise<boolean> => {
      const projectLifecycle = new ProjectLifecycleAdapter(
        await getMyAccount(),
        repository.projectRepository,
      );
      await projectLifecycle.importExistingProject(arguments_.projectExId);
      await projectLifecycle.deleteTemporaryProject();
      return true;
    },
    runCrdtTest: async (
      _: unknown,
      arguments_: { number: number },
    ): Promise<string> => {
      try {
        const zionDatabase = new Client({
          connectionString: process.env.DATABASE_URL_PRODUCTION,
        });
        await zionDatabase.connect();
        const fetchProjectId = {
          name: "fetch-project-ids",
          text: `SELECT id FROM project ORDER BY id DESC LIMIT ${arguments_.number}`,
        };
        const dangerousNetworkClient = new NetworkClient();
        dangerousNetworkClient.setHeader(
          "Authorization",
          `Bearer ${process.env.DANGEROUS_TOKEN}`,
        );
        const gqlClient = dangerousNetworkClient.buildGQLClient();
        const result = await zionDatabase.query(fetchProjectId);
        const results = await Promise.allSettled(
          result.rows.map(async ({ id }) => {
            const response = await gqlClient.gqlRequest<
              FixAliPayDataBindingMutation,
              FixAliPayDataBindingMutationVariables
            >(GQL_FIX_ALIPAY_DATA_BINDING, {
              projectId: id,
            });
            return `Project ID: ${id}, Response: ${JSON.stringify(response)}`;
          }),
        );

        await zionDatabase.end();
        return results.join("\n");
      } catch (error) {
        logger.error("Error in runCrdtTest:", error);
        throw new GraphQLError(`Error in runCrdtTest: ${error}`);
      }
    },
  },
};
