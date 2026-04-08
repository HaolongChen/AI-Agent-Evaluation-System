import { Decimal } from "@prisma/client/runtime/client";
import { logger } from "../external/logger.ts";
import { generateRubrics } from "../deep-agents/rubricsGenerator/rubricsGenerator.ts";
import type { Criteria, Rubric } from "../graphql/generated/resolvers-types.ts";
import type {
	agentFeedbacks,
	criteria,
	rubric,
} from "../prisma/build/generated/prisma/client.ts";
import { AgentFeedbacksInterface } from "@src/interface/agentFeedbacksInterface";
import { GoldenSetInterface } from "@src/interface/goldenSetInterface";
import { RubricInterface } from "@src/interface/rubricInterface";

type RubricWithCriteria = rubric & {
	criterion: criteria[];
};

type RubricCriterionInput = {
	title: string;
	content: string;
	expectedAnswer: boolean;
	weight: Decimal;
	version?: string;
};

export class RubricService {
	private toGraphqlCriteria(criteriaItem: criteria): Criteria {
		return {
			id: criteriaItem.id,
			rubricId: criteriaItem.rubricId,
			version: criteriaItem.version,
			title: criteriaItem.title,
			content: criteriaItem.content,
			expectedEvaluation: criteriaItem.expectedAnswer,
			weight: Number(criteriaItem.weight),
		};
	}

	private toGraphqlRubric(rubricItem: RubricWithCriteria): Rubric {
		return {
			id: rubricItem.id,
			goldenSetId: rubricItem.goldenSetId,
			userInputId: rubricItem.userInputId,
			criterion: rubricItem.criterion.map((item) =>
				this.toGraphqlCriteria(item),
			),
		};
	}

	async getRubrics(
		goldenSetId: string,
		userInputId: string,
	): Promise<Rubric[]> {
		try {
			const rubricInterface = new RubricInterface("findMany");
			const rubrics = (await rubricInterface.getRubricAdapter({
				where: {
					goldenSetId,
					userInputId,
				},
				include: {
					criterion: true,
				},
				orderBy: { createdAt: "asc" },
			})) as RubricWithCriteria[];
			return rubrics.map((item) => this.toGraphqlRubric(item));
		} catch (error) {
			logger.error("Error fetching rubrics:", error);
			throw new Error("Failed to fetch rubrics");
		}
	}

	async getRubricById(id: string): Promise<Rubric | null> {
		try {
			const rubricInterface = new RubricInterface("findUnique");
			const rubricItem = (await rubricInterface.getRubricAdapter({
				where: { id },
				include: {
					criterion: true,
				},
			})) as RubricWithCriteria | null;
			if (!rubricItem) {
				return null;
			}
			return this.toGraphqlRubric(rubricItem);
		} catch (error) {
			logger.error("Error fetching rubric by id:", error);
			throw new Error("Failed to fetch rubric by id");
		}
	}

	async generateRubric(
		goldenSetId: string,
		userInputId: string,
	): Promise<Rubric> {
		try {
			const goldenSetInterface = new GoldenSetInterface("findUnique");
			const copilotInput = (await goldenSetInterface.getGoldenSetAdapter({
				where: { id: goldenSetId },
				select: {
					schemaId: true,
					userInputs: {
						where: {
							id: userInputId,
						},
						select: {
							content: true,
						},
					},
				},
			})) as {
				schemaId: string;
				userInputs: Array<{ content: string }>;
			} | null;

			if (
				!copilotInput ||
				!copilotInput.userInputs ||
				!copilotInput.userInputs[0]?.content
			) {
				throw new Error(
					"No user input found for the given goldenSetId and userInputId",
				);
			}

			const { rubrics, feedbacks } = await generateRubrics(
				copilotInput.schemaId,
				copilotInput.userInputs[0].content,
			);
			const overallWeight = rubrics.rubrics.reduce(
				(sum, item) => sum + item.weight,
				0,
			);
			if (overallWeight === 0) {
				throw new Error("Total weight of rubrics cannot be zero");
			}

			const savedRubric = await this.saveRubric(
				goldenSetId,
				userInputId,
				rubrics.rubrics.map((item) => ({
					title: item.title,
					content: item.content,
					expectedAnswer: item.expectedAnswer,
					weight: new Decimal(item.weight / overallWeight),
				})),
			);

			await Promise.allSettled(feedbacks(savedRubric.id));
			return this.toGraphqlRubric(savedRubric);
		} catch (error) {
			logger.error("Error generating rubric:", error);
			throw new Error("Failed to generate rubric");
		}
	}

	async saveRubric(
		goldenSetId: string,
		userInputId: string,
		criteriaItems: RubricCriterionInput[],
	): Promise<RubricWithCriteria> {
		try {
			const rubricInterface = new RubricInterface("create");
			return (await rubricInterface.getRubricAdapter({
				data: {
					goldenSetId,
					userInputId,
					criterion: {
						create: criteriaItems.map((item) => ({
							version: item.version || "1.0",
							title: item.title,
							content: item.content,
							expectedAnswer: item.expectedAnswer,
							weight: item.weight,
						})),
					},
				},
				include: {
					criterion: true,
				},
			})) as RubricWithCriteria;
		} catch (error) {
			logger.error("Error saving rubric:", error);
			throw new Error("Failed to save rubric");
		}
	}

	async saveAgentFeedbacks(
		rubricId: string,
		agentName: string,
		feedbacks: string[],
	): Promise<agentFeedbacks | undefined> {
		try {
			if (feedbacks.length === 0) {
				return undefined;
			}

			const rubricInterface = new RubricInterface("findUnique");
			const rubricItem = await rubricInterface.getRubricAdapter({
				where: { id: rubricId },
				select: { id: true },
			});
			if (!rubricItem) {
				throw new Error("Rubric not found for the given id");
			}

			const agentFeedbacksInterface = new AgentFeedbacksInterface("create");
			return await agentFeedbacksInterface.getAgentFeedbacksAdapter({
				data: {
					rubricId,
					agentName,
					feedback: feedbacks,
				},
			});
		} catch (error) {
			logger.error("Error saving agent feedbacks:", error);
			throw new Error("Failed to save agent feedbacks");
		}
	}
}

export const rubricService = new RubricService();
