import {
	CopilotType,
	type GoldenSet,
	type MutationCreateUserInputArgs,
	type MutationInitializeGoldenSetArgs,
	type MutationLinkGoldenSetToUserInputArgs,
	type QueryGetGoldenSetByIdArgs,
	type QueryGetGoldenSetsArgs,
	type UserInput,
} from "../generated/resolvers-types.ts";
import { goldenSetService } from "../../services/GoldenSetService.ts";
import { projectService } from "../../services/ProjectService.ts";
import { REVERSE_COPILOT_TYPES } from "../../config/constants.ts";
import { logger } from "../../external/logger.ts";

export const goldenSetResolver = {
	Query: {
		getGoldenSetById: async (
			_: unknown,
			args: QueryGetGoldenSetByIdArgs,
		): Promise<GoldenSet | null> => {
			try {
				const res = await goldenSetService.getGoldenSetById(args.id);
				if (!res) return null;
				return {
					...res,
					copilotType: REVERSE_COPILOT_TYPES[
						res.copilotType as keyof typeof REVERSE_COPILOT_TYPES
					] as CopilotType,
				};
			} catch (error) {
				logger.error("Error fetching golden set by id:", error);
				throw new Error("Failed to fetch golden set by id");
			}
		},
		getGoldenSets: async (
			_: unknown,
			args: QueryGetGoldenSetsArgs,
		): Promise<GoldenSet[]> => {
			try {
				const res = await goldenSetService.getGoldenSets(
					args.filters ?? undefined,
				);
				return res.map((gs) => ({
					...gs,
					copilotType: REVERSE_COPILOT_TYPES[
						gs.copilotType as keyof typeof REVERSE_COPILOT_TYPES
					] as CopilotType,
				}));
			} catch (error) {
				logger.error("Error fetching golden sets:", error);
				throw new Error("Failed to fetch golden sets");
			}
		},
	},

	Mutation: {
		initializeGoldenSet: async (
			_: unknown,
			args: MutationInitializeGoldenSetArgs,
		): Promise<GoldenSet> => {
			try {
				const res = await goldenSetService.createGoldenSet(
					args.input.schemaId,
					args.input.copilotType,
					args.input.modelName ?? "undefined",
				);
				return {
					...res,
					copilotType: REVERSE_COPILOT_TYPES[
						res.copilotType as keyof typeof REVERSE_COPILOT_TYPES
					] as CopilotType,
				};
			} catch (error) {
				logger.error("Error initializing golden set:", error);
				throw new Error("Failed to initialize golden set");
			}
		},
		createUserInput: async (
			_: unknown,
			args: MutationCreateUserInputArgs,
		): Promise<UserInput> => {
			try {
				const res = await goldenSetService.createUserInput(
					args.input.description ?? "",
					args.input.query,
					args.input.createdBy ?? "",
				);
				return { ...res, createdAt: res.createdAt.toISOString() };
			} catch (error) {
				logger.error("Error creating user input:", error);
				throw new Error("Failed to create user input");
			}
		},
		linkGoldenSetToUserInput: async (
			_: unknown,
			args: MutationLinkGoldenSetToUserInputArgs,
		): Promise<GoldenSet> => {
			try {
				const res = await goldenSetService.linkGoldenSetToUserInput(
					args.context.goldenSetId,
					args.context.userInputId,
				);
				return {
					...res,
					copilotType: REVERSE_COPILOT_TYPES[
						res.copilotType as keyof typeof REVERSE_COPILOT_TYPES
					] as CopilotType,
				};
			} catch (error) {
				logger.error("Error linking golden set to user input:", error);
				throw new Error("Failed to link golden set to user input");
			}
		},

		createProject: async (
			_: unknown,
			args: { projectName: string },
		): Promise<string> => {
			try {
				return await projectService.createProject(args.projectName);
			} catch (error) {
				logger.error("Error creating project:", error);
				throw new Error("Failed to create project");
			}
		},
		deleteProject: async (
			_: unknown,
			args: { projectExId: string },
		): Promise<boolean> => {
			try {
				await projectService.deleteProject(args.projectExId);
				return true;
			} catch (error) {
				logger.error("Error deleting project:", error);
				throw new Error("Failed to delete project");
			}
		},
	},
};
