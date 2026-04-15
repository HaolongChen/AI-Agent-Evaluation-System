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
import { REVERSE_COPILOT_TYPES } from "../../config/constants.ts";

export const goldenSetResolver = {
	Query: {
		getGoldenSetById: async (
			_: unknown,
			arguments_: QueryGetGoldenSetByIdArguments,
		): Promise<GoldenSet> => {
			try {
				const result = await goldenSetService.getGoldenSetById(arguments_.id);
				return {
					...result,
					copilotType: REVERSE_COPILOT_TYPES[
						result.copilotType as keyof typeof REVERSE_COPILOT_TYPES
					] as CopilotType,
				};
			} catch (error) {
				console.error("Error fetching golden set by id:", error);
				throw new Error("Failed to fetch golden set by id");
			}
		},
		getGoldenSets: async (
			_: unknown,
			arguments_: QueryGetGoldenSetsArguments,
		): Promise<GoldenSet[]> => {
			try {
				const result = await goldenSetService.getGoldenSets(arguments_.filters);
				return result.map((gs) => ({
					...gs,
					copilotType: REVERSE_COPILOT_TYPES[
						gs.copilotType as keyof typeof REVERSE_COPILOT_TYPES
					] as CopilotType,
				}));
			} catch (error) {
				console.error("Error fetching golden sets:", error);
				throw new Error("Failed to fetch golden sets");
			}
		},
	},

	Mutation: {
		initializeGoldenSet: async (
			_: unknown,
			arguments_: MutationInitializeGoldenSetArguments,
		): Promise<GoldenSet> => {
			try {
				const result = await goldenSetService.createGoldenSet(
					arguments_.input.schemaId,
					arguments_.input.copilotType,
					arguments_.input.modelName ?? "undefined",
				);
				return {
					...result,
					copilotType: REVERSE_COPILOT_TYPES[
						result.copilotType as keyof typeof REVERSE_COPILOT_TYPES
					] as CopilotType,
				};
			} catch (error) {
				console.error("Error initializing golden set:", error);
				throw new Error("Failed to initialize golden set");
			}
		},
		createUserInput: async (
			_: unknown,
			arguments_: MutationCreateUserInputArguments,
		): Promise<UserInput> => {
			try {
				const result = await goldenSetService.createUserInput(arguments_.input);
				return {
					...result,
					createdAt: result.createdAt.toISOString(),
					description: result.description ?? undefined,
					createdBy: result.createdBy ?? undefined,
				};
			} catch (error) {
				console.error("Error creating user input:", error);
				throw new Error("Failed to create user input");
			}
		},
		linkGoldenSetToUserInput: async (
			_: unknown,
			arguments_: MutationLinkGoldenSetToUserInputArguments,
		): Promise<GoldenSetWithInputs> => {
			try {
				const result = await goldenSetService.linkGoldenSetToUserInput(
					arguments_.context,
				);
				return {
					...result,
					copilotType: REVERSE_COPILOT_TYPES[
						result.copilotType as keyof typeof REVERSE_COPILOT_TYPES
					] as CopilotType,
					userInputs: result.userInputs.map((ui) => ({
						...ui,
						createdAt: ui.createdAt.toISOString(),
						description: ui.description ?? undefined,
						createdBy: ui.createdBy ?? undefined,
					})),
				};
			} catch (error) {
				console.error("Error linking golden set to user input:", error);
				throw new Error("Failed to link golden set to user input");
			}
		},

		createProject: async (
			_: unknown,
			arguments_: { projectName: string },
		): Promise<string> => {
			try {
				return await projectService.createProject(arguments_.projectName);
			} catch (error) {
				console.error("Error creating project:", error);
				throw new Error("Failed to create project");
			}
		},
		deleteProject: async (
			_: unknown,
			arguments_: { projectExId: string },
		): Promise<boolean> => {
			try {
				await projectService.deleteProject(arguments_.projectExId);
				return true;
			} catch (error) {
				console.error("Error deleting project:", error);
				throw new Error("Failed to delete project");
			}
		},
	},
};
