import { repository } from "../../DI/repository.ts";
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
  type MutationCreateUserInputArgs as MutationCreateUserInputArguments,
  type MutationInitializeGoldenSetArgs as MutationInitializeGoldenSetArguments,
  type MutationLinkGoldenSetToUserInputArgs as MutationLinkGoldenSetToUserInputArguments,
  type QueryGetGoldenSetByIdArgs as QueryGetGoldenSetByIdArguments,
  type QueryGetGoldenSetsArgs as QueryGetGoldenSetsArguments,
  type UserInput,
} from "../generated/resolvers-types.ts";
import { GraphQLError } from "graphql";

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
      return { ...userInput, createdAt: userInput.createdAt!.toISOString() };
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
      arguments_: { projectName: string },
    ): Promise<string> => {
      return await projectService.createProject(arguments_.projectName);
    },
    deleteProject: async (
      _: unknown,
      arguments_: { projectExId: string },
    ): Promise<boolean> => {
      await projectService.deleteProject(arguments_.projectExId);
      return true;
    },
  },
};
