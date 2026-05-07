import {
  CopilotType,
  type GoldenSet,
  type GoldenSetWithInputs,
  type MutationCreateUserInputArgs as MutationCreateUserInputArguments,
  type MutationInitializeGoldenSetArgs as MutationInitializeGoldenSetArguments,
  type MutationLinkGoldenSetToUserInputArgs as MutationLinkGoldenSetToUserInputArguments,
  type QueryGetGoldenSetByIdArgs as QueryGetGoldenSetByIdArguments,
  type QueryGetGoldenSetsArgs as QueryGetGoldenSetsArguments,
  type UserInput,
} from "../generated/resolvers-types.ts";
import { goldenSetService } from "../../services/golden-set-service.ts";
import { projectService } from "../../services/project-service.ts";

export const goldenSetResolver = {
  Query: {
    getGoldenSetById: async (
      _: unknown,
      arguments_: QueryGetGoldenSetByIdArguments,
    ): Promise<GoldenSet> => {
      throw new Error("Method not implemented.");
    },
    getGoldenSets: async (
      _: unknown,
      arguments_: QueryGetGoldenSetsArguments,
    ): Promise<GoldenSet[]> => {
      throw new Error("Method not implemented.");
    },
  },

  Mutation: {
    initializeGoldenSet: async (
      _: unknown,
      arguments_: MutationInitializeGoldenSetArguments,
    ): Promise<GoldenSet> => {
      throw new Error("Method not implemented.");
    },
    createUserInput: async (
      _: unknown,
      arguments_: MutationCreateUserInputArguments,
    ): Promise<UserInput> => {
      throw new Error("Method not implemented.");
    },
    linkGoldenSetToUserInput: async (
      _: unknown,
      arguments_: MutationLinkGoldenSetToUserInputArguments,
    ): Promise<GoldenSetWithInputs> => {
      throw new Error("Method not implemented.");
    },

    createProject: async (
      _: unknown,
      arguments_: { projectName: string },
    ): Promise<string> => {
      throw new Error("Method not implemented.");
    },
    deleteProject: async (
      _: unknown,
      arguments_: { projectExId: string },
    ): Promise<boolean> => {
      throw new Error("Method not implemented.");
    },
  },
};
