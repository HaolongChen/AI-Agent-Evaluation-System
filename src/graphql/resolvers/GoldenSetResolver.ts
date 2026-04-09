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
import { goldenSetService } from "../../services/GoldenSetService.ts";
import { projectService } from "../../services/ProjectService.ts";
import { REVERSE_COPILOT_TYPES } from "../../config/constants.ts";


export const goldenSetResolver = {
	Query: {
		getGoldenSetById: async (
			_: unknown,
			arguments_: QueryGetGoldenSetByIdArguments,
		): Promise<GoldenSet | null> => {
			try {
				const res = await goldenSetService.getGoldenSetById(arguments_.id);
				if (!res) return null;
				return {
					...res,
					copilotType: REVERSE_COPILOT_TYPES[
						res.copilotType as keyof typeof REVERSE_COPILOT_TYPES
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
				const res = await goldenSetService.getGoldenSets(
					arguments_.filters ?? undefined,
				);
				return res.map((gs) => ({
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
				const res = await goldenSetService.createGoldenSet(
					arguments_.input.schemaId,
					arguments_.input.copilotType,
					arguments_.input.modelName ?? "undefined",
				);
				return {
					...res,
					copilotType: REVERSE_COPILOT_TYPES[
						res.copilotType as keyof typeof REVERSE_COPILOT_TYPES
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
				const res = await goldenSetService.createUserInput(
					arguments_.input.description ?? "",
					arguments_.input.query,
					arguments_.input.createdBy ?? "",
				);
				return { ...res, createdAt: res.createdAt.toISOString() };
			} catch (error) {
				console.error("Error creating user input:", error);
				throw new Error("Failed to create user input");
			}
		},
		linkGoldenSetToUserInput: async (
			_: unknown,
			arguments_: MutationLinkGoldenSetToUserInputArguments,
		): Promise<GoldenSet> => {
			try {
				const res = await goldenSetService.linkGoldenSetToUserInput(
					arguments_.context.goldenSetId,
					arguments_.context.userInputId,
				);
				return {
					...res,
					copilotType: REVERSE_COPILOT_TYPES[
						res.copilotType as keyof typeof REVERSE_COPILOT_TYPES
					] as CopilotType,
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
