import { Client } from "pg";
import { repository } from "../../DI/repository.ts";
import { TypeSystemStore } from "../../external/zed/TypeSystemStore.ts";
import { CreateGoldenSetUseCase } from "../../modules/copilot-input/application/create-golden-set.ts";
import { CreateUserInputUseCase } from "../../modules/copilot-input/application/create-user-input.ts";
import { FormCopilotInputUseCase } from "../../modules/copilot-input/application/form-copilot-input.ts";
import {
  GetGoldenSetByIdUseCase,
  GetGoldenSetsByFilterUseCase,
} from "../../modules/copilot-input/application/get-golden-set.ts";
import { projectService } from "../../modules/copilot-input/application/project-service.ts";
import {
  CopilotType,
  type GoldenSet,
  type Mutation,
  type MutationCreateUserInputArgs as MutationCreateUserInputArguments,
  type MutationDeleteProjectByIdsArgs as MutationDeleteProjectByIdsArguments,
  type MutationFixAliPayDataBindingArgs as MutationFixAliPayDataBindingArguments,
  type MutationInitializeGoldenSetArgs as MutationInitializeGoldenSetArguments,
  type MutationLinkGoldenSetToUserInputArgs as MutationLinkGoldenSetToUserInputArguments,
  type QueryGetGoldenSetByIdArgs as QueryGetGoldenSetByIdArguments,
  type QueryGetGoldenSetsArgs as QueryGetGoldenSetsArguments,
  type UserInput,
} from "../generated/resolvers-types.ts";
import { GraphQLError } from "graphql";
import { prisma } from "../../config/prisma.ts";
import {
  dangerousBackendClient,
  gqlRequest,
} from "../../external/graphql-client.ts";
import {
  GQL_DELETE_PROJECT_BY_IDS,
  GQL_FIX_ALIPAY_DATA_BINDING,
} from "../../external/zed/createProject.ts";

const copilotTypeMapper = {
  dataModelBuilder: CopilotType.DataModelBuilder,
  uiBuilder: CopilotType.UiBuilder,
  actionFlowBuilder: CopilotType.ActionFlowBuilder,
  logAnalyzer: CopilotType.LogAnalyzer,
  agentBuilder: CopilotType.AgentBuilder,
};

export const goldenSetResolver = {
  Query: {
    getGoldenSetById: async (
      _: unknown,
      arguments_: QueryGetGoldenSetByIdArguments,
    ): Promise<GoldenSet> => {
      const getGoldenSetByIdUseCase = new GetGoldenSetByIdUseCase(
        repository.goldenSetRepository,
      );
      const goldenSet = await getGoldenSetByIdUseCase.execute(arguments_.id);
      if (!goldenSet) {
        throw new GraphQLError(`GoldenSet with id ${arguments_.id} not found`);
      }
      return {
        ...goldenSet,
        copilotType: copilotTypeMapper[goldenSet.copilotType],
        __typename: "GoldenSet",
      };
    },
    getGoldenSets: async (
      _: unknown,
      arguments_: QueryGetGoldenSetsArguments,
    ): Promise<GoldenSet[]> => {
      const getGoldenSetsByFilterUseCase = new GetGoldenSetsByFilterUseCase(
        repository.goldenSetRepository,
      );
      const goldenSets = await getGoldenSetsByFilterUseCase.execute(
        arguments_.filters ?? {},
      );
      return goldenSets.map((goldenSet) => ({
        ...goldenSet,
        copilotType: copilotTypeMapper[goldenSet.copilotType],
        __typename: "GoldenSet",
      }));
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
      return {
        ...goldenSet,
        copilotType: copilotTypeMapper[goldenSet.copilotType],
        __typename: "GoldenSet",
      };
    },
    createUserInput: async (
      _: unknown,
      arguments_: MutationCreateUserInputArguments,
    ): Promise<UserInput> => {
      const createUserInputUseCase = new CreateUserInputUseCase(
        repository.userInputRepository,
      );
      const userInput = await createUserInputUseCase.execute(
        arguments_.input.content,
        arguments_.input.createdBy,
      );
      return {
        ...userInput,
        createdAt: userInput.createdAt!.toISOString(),
        __typename: "UserInput",
      };
    },
    linkGoldenSetToUserInput: async (
      _: unknown,
      arguments_: MutationLinkGoldenSetToUserInputArguments,
    ): Promise<boolean> => {
      const formCopilotInputUseCase = new FormCopilotInputUseCase({
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
      arguments_: { number: number },
    ): Promise<string> => {
      let results: string = "";
      const projectNames: string[] = [];
      for (let index = 0; index < arguments_.number; index++) {
        projectNames.push("CRDT-Evaluation-" + Date.now());
      }
      const typeSystemStore = new TypeSystemStore();
      await Promise.all(
        projectNames.map(async (projectName) => {
          const projectExId = await projectService.createProject(projectName);
          const schema =
            await typeSystemStore.fetchAppDetailByExId(projectExId);
          if (!schema?.crdtModelUrl) {
            throw new GraphQLError(
              `Failed to create project with name ${projectName}`,
            );
          }
          const path = new URL(schema.crdtModelUrl).pathname.split("/");
          results += await prisma.goldenSet.create({
            data: { schemaId: path[2], projectExId: projectExId },
          });
        }),
      );
      return JSON.stringify(results);
    },
    deleteProject: async (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _: unknown,
    ): Promise<boolean> => {
      const zionDatabase = new Client({
        connectionString: process.env.DATABASE_URL_PRODUCTION,
      });
      await zionDatabase.connect();
      const fetchProjectId = {
        name: "delete-projects",
        text: `SELECT id FROM project where project_name LIKE 'temp-project-1a91a63a-3bde-4cea%'`,
      };
      const result = await zionDatabase.query(fetchProjectId);
      await zionDatabase.end();
      const ids = result.rows.map(({ id }) => id);
      const response = await gqlRequest<
        Mutation["deleteProjectByIds"],
        MutationDeleteProjectByIdsArguments
      >(dangerousBackendClient, GQL_DELETE_PROJECT_BY_IDS, { ids });

      return response;
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
        const result = await zionDatabase.query(fetchProjectId);
        const results = await Promise.allSettled(
          result.rows.map(async ({ id }) => {
            const response = await gqlRequest<
              Mutation["fixAliPayDataBinding"],
              MutationFixAliPayDataBindingArguments
            >(dangerousBackendClient, GQL_FIX_ALIPAY_DATA_BINDING, {
              projectId: id,
            });
            return `Project ID: ${id}, Response: ${JSON.stringify(response)}`;
          }),
        );

        await zionDatabase.end();
        return results.join("\n");
      } catch (error) {
        console.error("Error in runCrdtTest:", error);
        throw new GraphQLError(`Error in runCrdtTest: ${error}`);
      }
    },
  },
};
