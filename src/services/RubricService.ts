import { prisma } from "../config/prisma.ts";
// import { REVIEW_STATUS } from "../config/constants.ts";
import { logger } from "../external/logger.ts";
import type { question } from "../prisma/build/generated/prisma/client.ts";
import { executionService } from "./ExecutionService.ts";
import { generateRubrics } from "../deep-agents/rubricsGenerator/rubricsGenerator.ts";
import { Decimal } from "@prisma/client/runtime/client";
import type { QuestionSet } from "../graphql/generated/resolvers-types.ts";

export class RubricService {
	async initializeQuestionSetWithRubrics(
		goldenSetId: number,
		userInputId: number,
		rubrics: Array<question>,
	) {
		try {
			const copilotOutputs = await executionService.getCopilotOutputs(
				goldenSetId,
				userInputId,
			);
			const questionSet = await prisma.$transaction(async (tx) => {
				const newQuestionSet = await tx.questionSet.create({
					data: {
						goldenSetId,
						userInputId,
						copilotOutputs: {
							create: copilotOutputs.map((output) => ({
								copilotOutputId: output.id,
							})),
						},
					},
				});

				const rubricData = rubrics.map((rubric) => ({
					...rubric,
					questionSetId: newQuestionSet.id,
				}));

				await tx.question.createMany({
					data: rubricData,
				});

				return newQuestionSet;
			});
			return questionSet;
		} catch (error) {
			logger.error("Error initializing question set:", error);
			throw new Error("Failed to initialize question set");
		}
	}

	async getQuestionSets(
		goldenSetId: number,
		userInputId: number,
		viewQuestions: boolean = false,
	): Promise<Array<QuestionSet>> {
		try {
			const questionSets = await prisma.questionSet.findMany({
				where: {
					goldenSetId,
					userInputId,
				},
				include: {
					questions: viewQuestions,
				},
				orderBy: { id: "asc" },
			});
			if (!questionSets || questionSets.length === 0) {
				return [];
			}
			return questionSets.map((qs) => ({
				...qs,
				questions:
					qs.questions ?
						qs.questions.map((q) => ({
							...q,
							weight: Number(q.weight),
						}))
					:	[],
			}));
		} catch (error) {
			logger.error("Error fetching question sets:", error);
			throw new Error("Failed to fetch question sets");
		}
	}

	async getQuestionSetById(id: string): Promise<QuestionSet | null> {
		try {
			const questionSet = await prisma.questionSet.findUnique({
				where: { id },
				include: {
					questions: true,
				},
			});
			if (!questionSet) {
				return null;
			}
			return {
				...questionSet,
				questions: questionSet.questions.map((q) => ({
					...q,
					weight: Number(q.weight),
				})),
			};
		} catch (error) {
			logger.error("Error fetching question set by id:", error);
			throw new Error("Failed to fetch question set by id");
		}
	}

	async generateQuestionSet(
		goldenSetId: number,
		userInputId: number,
	): Promise<QuestionSet> {
		try {
			const copilotInput = await prisma.goldenSet.findUnique({
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
			});
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
				(sum, r) => sum + r.weight,
				0,
			);
			if (overallWeight === 0) {
				throw new Error("Total weight of rubrics cannot be zero");
			}
			const questionSet = await this.saveQuestionSet(
				goldenSetId,
				userInputId,
				rubrics.rubrics.map((r) => ({
					...r,
					weight: Decimal(r.weight / overallWeight), // Normalize weights to sum up to 1
				})),
			);

			await Promise.allSettled(feedbacks(questionSet.id));

			return {
				...questionSet,
				questions: questionSet.questions.map((q) => ({
					...q,
					weight: Number(q.weight),
				})),
			};
		} catch (error) {
			logger.error("Error generating question set:", error);
			throw new Error("Failed to generate question set");
		}
	}

	async saveQuestionSet(
		goldenSetId: number,
		userInputId: number,
		questions: Array<{
			title: string;
			content: string;
			expectedAnswer: boolean;
			weight: Decimal;
			version?: string;
		}>,
	) {
		try {
			const questionSet = await prisma.questionSet.create({
				data: {
					goldenSetId,
					userInputId,
					questions: {
						create: questions.map((question) => ({
							version: question?.version || "1.0",
							title: question.title,
							content: question.content,
							expectedAnswer: question.expectedAnswer,
							weight: question.weight,
						})),
					},
				},
				include: {
					questions: true,
				},
			});
			return questionSet;
		} catch (error) {
			logger.error("Error saving question set:", error);
			throw new Error("Failed to save question set");
		}
	}

	async saveAgentFeedbacks(
		questionSetId: string,
		agentName: string,
		feedbacks: string[],
	) {
		try {
			if (feedbacks.length === 0) {
				return;
			}
			// save agents feedbacks for development use
			const questionSet = await prisma.questionSet.findUnique({
				where: { id: questionSetId },
			});
			if (!questionSet) {
				throw new Error("Question set not found for the given id");
			}
			const agentFeedback = await prisma.agentFeedbacks.create({
				data: {
					questionSetId,
					agentName,
					feedback: feedbacks,
				},
			});
			return agentFeedback;
		} catch (error) {
			logger.error("Error saving agent feedbacks:", error);
			throw new Error("Failed to save agent feedbacks");
		}
	}

	// async getQuestionsBySessionX(sessionId: number) {
	// 	try {
	// 		return prisma.adaptiveRubric.findMany({
	// 			where: {
	// 				sessionId,
	// 				isActive: true,
	// 			},
	// 			include: {
	// 				judgeRecord: true,
	// 			},
	// 			orderBy: { id: "asc" },
	// 		});
	// 	} catch (error) {
	// 		logger.error("Error fetching questions by sessionId:", error);
	// 		throw new Error("Failed to fetch questions by sessionId");
	// 	}
	// }

	// async getQuestionsForReviewX(
	// 	sessionId?: number,
	// 	reviewStatus?: (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS],
	// ) {
	// 	try {
	// 		return prisma.adaptiveRubric.findMany({
	// 			where: {
	// 				isActive: true,
	// 				...(reviewStatus && { reviewStatus }),
	// 				...(sessionId && { sessionId }),
	// 			},
	// 			include: {
	// 				judgeRecord: true,
	// 				session: true,
	// 			},
	// 			orderBy: { createdAt: "desc" },
	// 		});
	// 	} catch (error) {
	// 		logger.error("Error fetching questions for review:", error);
	// 		throw new Error("Failed to fetch questions for review");
	// 	}
	// }

	// async getQuestionsTotalWeight(sessionId: number) {
	// 	try {
	// 		const questions = await prisma.adaptiveRubric.findMany({
	// 			where: { sessionId, isActive: true },
	// 			select: { id: true, weight: true },
	// 		});

	// 		return {
	// 			totalWeight: questions.reduce((sum, q) => sum + Number(q.weight), 0),
	// 		};
	// 	} catch (error) {
	// 		logger.error("Error getting total weight:", error);
	// 		throw new Error("Failed to get total weight");
	// 	}
	// }

	// async updateRubricsReviewStatusX(
	// 	sessionId: number,
	// 	reviewStatus: (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS],
	// 	reviewedBy: string,
	// ) {
	// 	try {
	// 		return prisma.adaptiveRubric.updateMany({
	// 			where: { sessionId },
	// 			data: {
	// 				reviewStatus,
	// 				reviewedAt: new Date(),
	// 				reviewedBy,
	// 			},
	// 		});
	// 	} catch (error) {
	// 		logger.error("Error updating rubrics review status:", error);
	// 		throw new Error("Failed to update rubrics review status");
	// 	}
	// }
}

export const rubricService = new RubricService();
