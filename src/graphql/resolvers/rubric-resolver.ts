import { executionService } from "../../applications/usecases/execution.usecase.ts";
import { rubricService } from "../../applications/usecases/rubric.usecase.ts";

import type {
	CopilotOutput,
	MutationExecuteCopilotArgs as MutationExecuteCopilotArguments,
	MutationGenerateRubricArgs as MutationGenerateRubricArguments,
	QueryGetRubricByContextArgs as QueryGetRubricByContextArguments,
	QueryGetRubricByIdArgs as QueryGetRubricByIdArguments,
	Rubric,
} from "../generated/resolvers-types.ts";

type PrismCriteriaLike = {
	id: string;
	rubricId: string;
	version: string;
	title: string | null;
	content: string;
	expectedAnswer: boolean;
	weight: unknown;
};

type PrismRubricLike = {
	id: string;
	goldenSetId: string;
	userInputId: string;
	criterion: PrismCriteriaLike[];
};

type PrismaCopilotOutputLike = {
	id: string;
	goldenSetId: string;
	userInputId: string;
	content: string;
	createdAt: Date;
};

const toGraphqlRubric = (rubric: PrismRubricLike): Rubric => {
	return {
		id: rubric.id,
		goldenSetId: rubric.goldenSetId,
		userInputId: rubric.userInputId,
		criterion: rubric.criterion.map((item) => ({
			id: item.id,
			rubricId: item.rubricId,
			version: item.version,
			title: item.title ?? undefined,
			content: item.content,
			expectedEvaluation: item.expectedAnswer,
			weight: Number(item.weight),
		})),
	};
};

const toGraphqlCopilotOutput = (
	output: PrismaCopilotOutputLike,
): CopilotOutput => {
	return {
		...output,
		createdAt: output.createdAt.toISOString(),
	};
};

export const rubricResolver = {
	Query: {
		getRubricById: async (
			_: unknown,
			arguments_: QueryGetRubricByIdArguments,
		): Promise<Rubric> => {
			try {
				const rubric = (await rubricService.getRubricById(
					arguments_.id,
				)) as unknown as PrismRubricLike;
				return toGraphqlRubric(rubric);
			} catch (error) {
				console.error("Error fetching rubric by id:", error);
				throw new Error("Failed to fetch rubric by id");
			}
		},
		getRubricByContext: async (
			_: unknown,
			arguments_: QueryGetRubricByContextArguments,
		): Promise<Rubric[]> => {
			try {
				const rubrics = (await rubricService.getRubrics(
					arguments_.context.goldenSetId,
					arguments_.context.userInputId,
				)) as unknown as PrismRubricLike[];
				return rubrics.map((item) => toGraphqlRubric(item));
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
				const output = (await executionService.executeCopilot(
					arguments_.context.goldenSetId,
					arguments_.context.userInputId,
				)) as PrismaCopilotOutputLike;
				return toGraphqlCopilotOutput(output);
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
				const rubric = (await rubricService.generateRubric(
					arguments_.context.goldenSetId,
					arguments_.context.userInputId,
				)) as unknown as PrismRubricLike;
				return toGraphqlRubric(rubric);
			} catch (error) {
				console.error("Error generating rubric:", error);
				throw new Error("Failed to generate rubric");
			}
		},
	},
};
