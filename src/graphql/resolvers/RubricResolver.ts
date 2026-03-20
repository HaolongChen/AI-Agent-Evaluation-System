import { executionService } from "../../services/ExecutionService.ts";
import { rubricService } from "../../services/RubricService.ts";
// import { REVERSE_REVIEW_STATUS, REVIEW_STATUS } from '../../config/constants.ts';
import { logger } from "../../utils/logger.ts";

export const rubricResolver = {
	Query: {
		getQuestionSetById: async (_: unknown, args: { id: string }) => {
			try {
				const questionSet = await rubricService.getQuestionSetById(args.id);
				return questionSet;
			} catch (error) {
				logger.error("Error fetching rubrics by sessionId:", error);
				throw new Error("Failed to fetch rubrics by sessionId");
			}
		},
		getQuestionSetByContext: async (
			_: unknown,
			args: { goldenSetId: number; userInputId: number },
		) => {
			const res = await rubricService.getQuestionSets(
				args.goldenSetId,
				args.userInputId,
			);
			return res;
		},
	},

	Mutation: {
		executeCopilot: async (
			_: unknown,
			args: { goldenSetId: number; userInputId: number },
		) => {
      const res = await executionService.executeCopilot(
        args.goldenSetId,
        args.userInputId,
      );
      return res;
    },
		generateQuestionSet: async (
			_: unknown,
			args: { goldenSetId: number; userInputId: number },
		) => {
      const res = await rubricService.generateQuestionSet(
        args.goldenSetId,
        args.userInputId,
      );
      return res;
    },
	},
};
