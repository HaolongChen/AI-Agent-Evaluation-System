// import { prisma } from "../../config/prisma.ts";
// import { REVERSE_COPILOT_TYPES } from "../../config/constants.ts";
import type { CopilotType } from "../generated/resolvers-types.ts";
// import type { CopilotType } from "../../../build/generated/prisma/enums.ts";
import type { GoldenSetFilters } from "../generated/resolvers-types.ts";
import { goldenSetService } from "../../services/GoldenSetService.ts";
// import { rubricService } from "../../services/RubricService.ts";

export const goldenSetResolver = {
	Query: {
		getGoldenSetById: async (_: unknown, args: { id: number }) => {
			const res = await goldenSetService.getGoldenSetById(args.id);
			if (!res) return null;
			return res;
		},
		getGoldenSets: async (_: unknown, args: { filters?: GoldenSetFilters }) => {
			const res = await goldenSetService.getGoldenSets(args.filters);
			return res;
		},
		
	},

	Mutation: {
		initializeGoldenSet: async (
			_: unknown,
			args: { schemaId: string; copilotType: CopilotType; modelName: string },
		) => {
			const res = await goldenSetService.createGoldenSet(
				args.schemaId,
				args.copilotType,
				args.modelName,
			);
			return res;
		},
		createUserInput: async (
			_: unknown,
			args: { description?: string; query: string; createdBy?: string },
		) => {
			const res = await goldenSetService.createUserInput(
				args.description || "",
				args.query,
				args.createdBy || "",
			);
			return res;
		},
		linkGoldenSetToUserInput: async (
			_: unknown,
			args: { goldenSetId: number; userInputId: number },
		) => {
			const res = await goldenSetService.linkGoldenSetToUserInput(
				args.goldenSetId,
				args.userInputId,
			);
			return res;
		},
		
		
	},
};
