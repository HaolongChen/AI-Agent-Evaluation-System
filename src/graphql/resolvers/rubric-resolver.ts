import { executionService } from "../../services/execution-service.ts";
import { rubricService } from "../../services/rubric-service.ts";

import type {
	CopilotOutput,
	MutationExecuteCopilotArgs as MutationExecuteCopilotArguments,
	MutationGenerateRubricArgs as MutationGenerateRubricArguments,
	QueryGetRubricByContextArgs as QueryGetRubricByContextArguments,
	QueryGetRubricByIdArgs as QueryGetRubricByIdArguments,
	Rubric,
} from "../generated/resolvers-types.ts";

export const rubricResolver = {
	Query: {
		getRubricById: async (
			_: unknown,
			arguments_: QueryGetRubricByIdArguments,
		): Promise<Rubric | null> => {
			try {
				return await rubricService.getRubricById(arguments_.id);
			} catch (error) {
				console.error("Error fetching rubric by id:", error);
				throw new Error("Failed to fetch rubric by id");
			}
		},
		getRubricByContext: async (
			_: unknown,
			arguments_: QueryGetRubricByContextArguments,
		): Promise<Rubric[] | null> => {
			try {
				return await rubricService.getRubrics(
					arguments_.context.goldenSetId,
					arguments_.context.userInputId,
				);
			} catch (error) {
				console.error("Error fetching rubrics by context:", error);
				throw new Error("Failed to fetch rubrics by context");
			}
		},
	},

	Mutation: {
		executeCopilot: async (
			_: unknown,
			arguments_: MutationExecuteCopilotArguments,
		): Promise<CopilotOutput> => {
			try {
				return await executionService.executeCopilot(
					arguments_.context.goldenSetId,
					arguments_.context.userInputId,
				);
			} catch (error) {
				console.error("Error executing copilot:", error);
				throw new Error("Failed to execute copilot");
			}
		},
		generateRubric: async (
			_: unknown,
			arguments_: MutationGenerateRubricArguments,
		): Promise<Rubric> => {
			try {
				return await rubricService.generateRubric(
					arguments_.context.goldenSetId,
					arguments_.context.userInputId,
				);
			} catch (error) {
				console.error("Error generating rubric:", error);
				throw new Error("Failed to generate rubric");
			}
		},
	},
};
