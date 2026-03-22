// import { prisma } from "../../config/prisma.ts";
// import { REVERSE_COPILOT_TYPES } from "../../config/constants.ts";
// import type { CopilotType } from "../../../build/generated/prisma/enums.ts";
import {
	CopilotType,
	type GoldenSet,
	type GoldenSetFilters,
	type UserInput,
} from "../generated/resolvers-types.ts";
import { goldenSetService } from "../../services/GoldenSetService.ts";
import { projectService } from "../../services/ProjectService.ts";
import {
	COPILOT_TYPES,
	REVERSE_COPILOT_TYPES,
} from "../../config/constants.ts";
// import { rubricService } from "../../services/RubricService.ts";

export const goldenSetResolver = {
	Query: {
		getGoldenSetById: async (
			_: unknown,
			args: { id: number },
		): Promise<GoldenSet | null> => {
			const res = await goldenSetService.getGoldenSetById(args.id);
			if (!res) return null;
			return {
				...res,
				copilotType: REVERSE_COPILOT_TYPES[
					res.copilotType as keyof typeof REVERSE_COPILOT_TYPES
				] as CopilotType,
			};
			// return res;
		},
		getGoldenSets: async (
			_: unknown,
			args: { filters?: GoldenSetFilters },
		): Promise<GoldenSet[]> => {
			const res = await goldenSetService.getGoldenSets(args.filters);
			return res.map((gs) => ({
				...gs,
				copilotType: REVERSE_COPILOT_TYPES[
					gs.copilotType as keyof typeof REVERSE_COPILOT_TYPES
				] as CopilotType,
			}));
			// return res;
		},
	},

	Mutation: {
		initializeGoldenSet: async (
			_: unknown,
			args: {
				schemaId: string;
				copilotType: keyof typeof COPILOT_TYPES;
				modelName: string;
			},
		): Promise<GoldenSet> => {
			const res = await goldenSetService.createGoldenSet(
				args.schemaId,
				args.copilotType,
				args.modelName,
			);
			return {
				...res,
				copilotType: REVERSE_COPILOT_TYPES[
					res.copilotType as keyof typeof REVERSE_COPILOT_TYPES
				] as CopilotType,
			};
			// return res;
		},
		createUserInput: async (
			_: unknown,
			args: { description?: string; query: string; createdBy?: string },
		): Promise<UserInput> => {
			const res = await goldenSetService.createUserInput(
				args.description || "",
				args.query,
				args.createdBy || "",
			);
			return { ...res, createdAt: res.createdAt.toISOString() };
		},
		linkGoldenSetToUserInput: async (
			_: unknown,
			args: { goldenSetId: number; userInputId: number },
		): Promise<GoldenSet> => {
			const res = await goldenSetService.linkGoldenSetToUserInput(
				args.goldenSetId,
				args.userInputId,
			);
			return {
				...res,
				copilotType: REVERSE_COPILOT_TYPES[
					res.copilotType as keyof typeof REVERSE_COPILOT_TYPES
				] as CopilotType,
			};
		},

		createProject: async (
			_: unknown,
			args: { projectName: string },
		): Promise<string> => {
			const res = await projectService.createProject(args.projectName);
			return res;
		},
		deleteProject: async (
			_: unknown,
			args: { projectExId: string },
		): Promise<boolean> => {
			await projectService.deleteProject(args.projectExId);
			return true;
		},
	},
};
