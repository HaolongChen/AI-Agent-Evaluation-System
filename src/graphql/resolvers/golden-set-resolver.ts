import { Client } from "pg";
import { repository } from "../../DI/repository.ts";
import { CreateGoldenSetUseCase } from "../../modules/copilot-input/application/create-golden-set.ts";
import { CreateUserInputUseCase } from "../../modules/copilot-input/application/create-user-input.ts";
import { FormCopilotInputUseCase } from "../../modules/copilot-input/application/form-copilot-input.ts";
import {
  CopilotType,
  type CopilotInputOutput,
  type GoldenSet,
  type MutationCreateProjectArgs as MutationCreateProjectArguments,
  type MutationCreateUserInputArgs as MutationCreateUserInputArguments,
  type MutationDeleteProjectArgs as MutationDeleteProjectArguments,
  type MutationInitializeGoldenSetArgs as MutationInitializeGoldenSetArguments,
  type MutationLinkGoldenSetToUserInputArgs as MutationLinkGoldenSetToUserInputArguments,
  type QueryGetGoldenSetByIdArgs as QueryGetGoldenSetByIdArguments,
  type QueryGetGoldenSetsArgs as QueryGetGoldenSetsArguments,
  type QueryGetUserInputByIdArgs as QueryGetUserInputByIdArguments,
  type QueryGetLinkedGoldenSetsByUserInputIdArgs as QueryGetLinkedGoldenSetsByUserInputIdArguments,
  type QueryGetLinkedUserInputsByGoldenSetIdArgs as QueryGetLinkedUserInputsByGoldenSetIdArguments,
  type UserInput,
} from "../generated/resolvers-types.ts";
import { GraphQLError } from "graphql";
import { GQL_FIX_ALIPAY_DATA_BINDING } from "../../modules/copilot-input/infrastructure/project-manager.ts";
import { NetworkClient } from "../../modules/shared/application/graphql-client.ts";
import type {
  FixAliPayDataBindingMutation,
  FixAliPayDataBindingMutationVariables,
} from "../generated/types.ts";
import { logger } from "../../modules/shared/infrastructure/logger.ts";
import { ProjectLifecycleAdapter } from "../../modules/copilot-input/infrastructure/project-lifecycle-adapter.ts";
import { getMyAccount } from "../../DI/account.ts";
import type { UserInputEntity } from "../../modules/copilot-input/domain/entity/user-input.entity.ts";
import type { GoldenSetEntity } from "../../modules/copilot-input/domain/entity/golden-set.entity.ts";

const copilotTypeMapper = {
  dataModelBuilder: CopilotType.DataModelBuilder,
  uiBuilder: CopilotType.UiBuilder,
  actionFlowBuilder: CopilotType.ActionFlowBuilder,
  logAnalyzer: CopilotType.LogAnalyzer,
  agentBuilder: CopilotType.AgentBuilder,
};

const userInputMapper = (
  userInput: ReturnType<UserInputEntity["getData"]>,
): UserInput => {
  return {
    ...userInput,
    createdAt: userInput.createdAt!.toISOString(),
    __typename: "UserInput",
  };
};

const goldenSetMapper = (
  goldenSet: ReturnType<GoldenSetEntity["getData"]>,
): GoldenSet => {
  return {
    ...goldenSet,
    copilotType: copilotTypeMapper[goldenSet.copilotType],
    __typename: "GoldenSet",
  };
};

export const goldenSetResolver = {
  Query: {
    getLinkedGoldenSetsByUserInputId: async (
      _: unknown,
      arguments_: QueryGetLinkedGoldenSetsByUserInputIdArguments,
    ): Promise<GoldenSet[]> => {
      const goldenSets =
        await repository.copilotInputRepository.getByUserInputId(
          arguments_.userInputId,
        );
      return goldenSets.map((goldenSet) => {
        const json = goldenSet.getData();
        return goldenSetMapper(json);
      });
    },

    getLinkedUserInputsByGoldenSetId: async (
      _: unknown,
      arguments_: QueryGetLinkedUserInputsByGoldenSetIdArguments,
    ): Promise<UserInput[]> => {
      const userInputs =
        await repository.copilotInputRepository.getByGoldenSetId(
          arguments_.goldenSetId,
        );
      return userInputs.map((userInput) => {
        const json = userInput.getData();
        return userInputMapper(json);
      });
    },

    getUserInputById: async (
      _: unknown,
      arguments_: QueryGetUserInputByIdArguments,
    ): Promise<UserInput> => {
      const userInput = await repository.userInputRepository.findById(
        arguments_.id,
      );

      const json = userInput.getData();
      return userInputMapper(json);
    },

    getUserInputs: async (): Promise<UserInput[]> => {
      const userInputs = await repository.userInputRepository.getAll();
      return userInputs.map((userInput) => {
        const json = userInput.getData();
        return userInputMapper(json);
      });
    },

    getGoldenSetById: async (
      _: unknown,
      arguments_: QueryGetGoldenSetByIdArguments,
    ): Promise<GoldenSet> => {
      const goldenSet = await repository.goldenSetRepository.findById(
        arguments_.id,
      );
      const json = goldenSet.getData();
      return goldenSetMapper(json);
    },
    getGoldenSets: async (
      _: unknown,
      arguments_: QueryGetGoldenSetsArguments,
    ): Promise<GoldenSet[]> => {
      const goldenSets = await repository.goldenSetRepository.getByFilters(
        arguments_.filters ?? {},
      );
      return goldenSets.map((goldenSet) => {
        const json = goldenSet.getData();
        return goldenSetMapper(json);
      });
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
        arguments_.input.copilotType,
        arguments_.input.modelName,
      );
      return goldenSetMapper(goldenSet);
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
      return userInputMapper(userInput);
    },
    linkGoldenSetToUserInput: async (
      _: unknown,
      arguments_: MutationLinkGoldenSetToUserInputArguments,
    ): Promise<CopilotInputOutput> => {
      const formCopilotInputUseCase = new FormCopilotInputUseCase({
        copilotInputRepository: repository.copilotInputRepository,
      });
      const copilotInput = await formCopilotInputUseCase.execute(
        arguments_.context.goldenSetId,
        arguments_.context.userInputId,
      );
      return {
        __typename: "CopilotInputOutput",
        goldenSet: goldenSetMapper(copilotInput.goldenSetEntity.getData()),
        userInput: userInputMapper(copilotInput.userInputEntity.getData()),
      };
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
      const projectName = schemaManager?.getProjectName();
      const projectExId = schemaManager?.getProjectExId();

      const createGoldenSetUseCase = new CreateGoldenSetUseCase(
        repository.goldenSetRepository,
      );
      const goldenSet = await createGoldenSetUseCase.execute(
        schemaId,
        CopilotType.DataModelBuilder,
        "unknown",
        projectExId,
        projectName,
      );
      return goldenSetMapper(goldenSet);
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
