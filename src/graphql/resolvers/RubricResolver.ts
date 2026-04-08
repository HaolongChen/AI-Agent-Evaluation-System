import { executionService } from "../../services/ExecutionService.ts";
import { rubricService } from "../../services/RubricService.ts";
import { logger } from "../../external/logger.ts";
import type {
	CopilotOutput,
	MutationExecuteCopilotArgs,
	MutationGenerateRubricArgs,
	QueryGetRubricByContextArgs,
	QueryGetRubricByIdArgs,
	Rubric,
} from "../generated/resolvers-types.ts";

export const rubricResolver = {
	Query: {
		getRubricById: async (
			_: unknown,
			args: QueryGetRubricByIdArgs,
		): Promise<Rubric | null> => {
			try {
				return await rubricService.getRubricById(args.id);
			} catch (error) {
				logger.error("Error fetching rubric by id:", error);
				throw new Error("Failed to fetch rubric by id");
			}
		},
		getRubricByContext: async (
			_: unknown,
			args: QueryGetRubricByContextArgs,
		): Promise<Rubric[] | null> => {
			try {
				return await rubricService.getRubrics(
					args.context.goldenSetId,
					args.context.userInputId,
				);
			} catch (error) {
				logger.error("Error fetching rubrics by context:", error);
				throw new Error("Failed to fetch rubrics by context");
			}
		},
	},

	Mutation: {
		executeCopilot: async (
			_: unknown,
			args: MutationExecuteCopilotArgs,
		): Promise<CopilotOutput> => {
			try {
				return await executionService.executeCopilot(
					args.context.goldenSetId,
					args.context.userInputId,
				);
			} catch (error) {
				logger.error("Error executing copilot:", error);
				throw new Error("Failed to execute copilot");
			}
		},
		generateRubric: async (
			_: unknown,
			args: MutationGenerateRubricArgs,
		): Promise<Rubric> => {
			try {
				return await rubricService.generateRubric(
					args.context.goldenSetId,
					args.context.userInputId,
				);
			} catch (error) {
				logger.error("Error generating rubric:", error);
				throw new Error("Failed to generate rubric");
			}
		},
	},
};
