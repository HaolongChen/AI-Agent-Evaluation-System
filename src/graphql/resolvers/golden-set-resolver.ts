import { Client } from "pg";
import { CreateGoldenSetUseCase } from "../../modules/dataset/application/create-golden-set.ts";
import { CreateUserInputUseCase } from "../../modules/dataset/application/create-user-input.ts";
import {
  BuildCopilotInputUseCase,
  GetCopilotInputByFiltersUseCase,
} from "../../modules/dataset/application/copilot-input.ts";
import {
  type CopilotInput,
  // CopilotType,
  type GoldenSet,
  type MutationCreateUserInputArgs as MutationCreateUserInputArguments,
  type MutationCreateGoldenSetWithSchemaIdArgs as MutationCreateGoldenSetWithSchemaIdArguments,
  type MutationCreateGoldenSetWithProjectExIdArgs as MutationCreateGoldenSetWithProjectExIdArguments,
  type MutationLinkGoldenSetToUserInputArgs as MutationLinkGoldenSetToUserInputArguments,
  type QueryGetCopilotInputArgs as QueryGetCopilotInputArguments,
  type QueryGetGoldenSetBySchemaIdArgs as QueryGetGoldenSetBySchemaIdArguments,
  type QueryGetGoldenSetByIdArgs as QueryGetGoldenSetByIdArguments,
  type QueryGetUserInputByIdArgs as QueryGetUserInputByIdArguments,
  type UserInput,
  type CopilotInputWithCopilotSessions,
  type CopilotSession,
} from "../generated/resolvers-types.ts";
import { GraphQLError } from "graphql";
import { GQL_FIX_ALIPAY_DATA_BINDING } from "../../modules/copilot-session/infrastructure/project/project-manager.ts";
import type {
  FixAliPayDataBindingMutation,
  FixAliPayDataBindingMutationVariables,
} from "../generated/types.ts";
import { logger } from "../../modules/shared/infrastructure/logger.ts";
import type { GoldenSetEntity } from "../../modules/dataset/domain/entity/golden-set.entity.ts";
import type { UserInputEntity } from "../../modules/dataset/domain/entity/user-input.entity.ts";
import type { CopilotInputAggregate } from "../../modules/dataset/domain/aggregate/copilot-input.aggregate.ts";
import { GetCopilotSessionUseCase } from "../../modules/copilot-session/application/get-copilot-session.ts";
import { toGraphqlCopilotOutput } from "./rubric-resolver.ts";
import type { CopilotOutputEntity } from "../../modules/copilot-session/domain/entity/copilot-output.entity.ts";
import type { GraphQLContext } from "../../config/graphql.ts";

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
    updatedAt: data.updatedAt!.toISOString(),
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

export const copilotSessionDataMapper = (
  data: CopilotOutputEntity,
): CopilotSession => {
  return {
    copilotOutput: toGraphqlCopilotOutput(data),
    id: data.getData("copilotSessionExId"),
    rubrics: [],
    __typename: "CopilotSession",
  };
};

export const copilotInputWithSessionDataMapper = (data: {
  copilotInput: ReturnType<CopilotInputAggregate["getAllData"]>;
  copilotOutputs: CopilotOutputEntity[];
}): CopilotInputWithCopilotSessions => {
  return {
    copilotInput: copilotInputDataMapper(data.copilotInput),
    copilotSessions: data.copilotOutputs.map((output) =>
      copilotSessionDataMapper(output),
    ),
    __typename: "CopilotInputWithCopilotSessions",
  };
};

export const copilotInputDataMapper = (
  data: ReturnType<CopilotInputAggregate["getAllData"]>,
): CopilotInput => {
  return {
    goldenSet: goldenSetDataMapper(data.entities.goldenSet.getData()),
    userInput: userInputDataMapper(data.entities.userInput.getData()),
    copilotInputId: data.aggregator.id,
    createdAt: data.aggregator.createdAt!.toISOString(),
    __typename: "CopilotInput",
  };
};

export const goldenSetResolver = {
  Query: {
    getCopilotInput: async (
      _: unknown,
      arguments_: QueryGetCopilotInputArguments,
      context: GraphQLContext,
    ): Promise<CopilotInputWithCopilotSessions[]> => {
      const copilotInputs =
        await context.applicationServiceBundle.getCopilotInputByFiltersUseCase.execute(
          arguments_,
        );
      const copilotSessions = await Promise.all(
        copilotInputs.map(async (input) => {
          return {
            input: input,
            output:
              await context.applicationServiceBundle.getCopilotSessionUseCase.execute(
                input,
              ),
          };
        }),
      );
      return copilotSessions.map((value) => {
        return copilotInputWithSessionDataMapper({
          copilotInput: value.input.getAllData(),
          copilotOutputs: value.output,
        });
      });
    },

    getUserInputById: async (
      _: unknown,
      arguments_: QueryGetUserInputByIdArguments,
      context: GraphQLContext,
    ): Promise<UserInput> => {
      const userInput =
        await context.repositoryBundle.userInputRepository.findById(
          arguments_.id,
        );
      return userInputDataMapper(userInput.getData());
    },

    getUserInputs: async (context: GraphQLContext): Promise<UserInput[]> => {
      const userInputs =
        await context.repositoryBundle.userInputRepository.getAll();
      return userInputs.map((userInput) => {
        return userInputDataMapper(userInput.getData());
      });
    },

    getGoldenSetById: async (
      _: unknown,
      arguments_: QueryGetGoldenSetByIdArguments,
      context: GraphQLContext,
    ): Promise<GoldenSet> => {
      const goldenSet =
        await context.repositoryBundle.goldenSetRepository.findById(
          arguments_.id,
        );
      return goldenSetDataMapper(goldenSet.getData());
    },
    getGoldenSetBySchemaId: async (
      _: unknown,
      arguments_: QueryGetGoldenSetBySchemaIdArguments,
      context: GraphQLContext,
    ): Promise<GoldenSet[]> => {
      const goldenSet =
        await context.repositoryBundle.goldenSetRepository.findBySchemaId(
          arguments_.schemaId,
        );
      return [goldenSetDataMapper(goldenSet.getData())];
    },
  },

  Mutation: {
    createGoldenSetWithSchemaId: async (
      _: unknown,
      arguments_: MutationCreateGoldenSetWithSchemaIdArguments,
      context: GraphQLContext,
    ): Promise<GoldenSet> => {
      const createGoldenSetUseCase = new CreateGoldenSetUseCase(
        context.repositoryBundle.goldenSetRepository,
      );
      const goldenSet = await createGoldenSetUseCase.execute(
        arguments_.input.schemaId,
      );
      return goldenSetDataMapper(goldenSet);
    },

    createGoldenSetWithProjectExId: async (
      _: unknown,
      arguments_: MutationCreateGoldenSetWithProjectExIdArguments,
      context: GraphQLContext,
    ): Promise<GoldenSet> => {
      const zionInjection = await createZionInjectionBundle();
      const crdtSchemaLifecycle =
        zionInjection.crdtSchemaLifecycleFactory.create(arguments_.projectExId);
      const schemaId = await crdtSchemaLifecycle.getSchemaId();
      const createGoldenSetUseCase = new CreateGoldenSetUseCase(
        context.repositoryBundle.goldenSetRepository,
      );
      const goldenSet = await createGoldenSetUseCase.execute(schemaId);
      return goldenSetDataMapper(goldenSet);
    },

    createUserInput: async (
      _: unknown,
      arguments_: MutationCreateUserInputArguments,
      context: GraphQLContext,
    ): Promise<UserInput> => {
      const userInput =
        await context.applicationServiceBundle.createUserInputUseCase.execute(
          arguments_.input.content,
          context.account,
        );
      return userInputDataMapper(userInput);
    },
    linkGoldenSetToUserInput: async (
      _: unknown,
      arguments_: MutationLinkGoldenSetToUserInputArguments,
      context: GraphQLContext,
    ): Promise<CopilotInput[]> => {
      const copilotInputs =
        await context.applicationServiceBundle.buildCopilotInputUseCase.execute(
          arguments_.context.goldenSetId,
          arguments_.context.userInputId,
        );
      return copilotInputs.map((copilotInput) =>
        copilotInputDataMapper(copilotInput.getAllData()),
      );
    },

    runCrdtTest: async (
      _: unknown,
      arguments_: { number: number },
      context: GraphQLContext,
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
        const gqlClient = context.account.gqlClient;
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
