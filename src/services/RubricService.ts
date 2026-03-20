import { prisma } from "../config/prisma.ts";
// import { REVIEW_STATUS } from "../config/constants.ts";
import { logger } from "../utils/logger.ts";
import type { question, questionSet } from "../../build/generated/prisma/client.ts";
import { executionService } from "./ExecutionService.ts";

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
	) {
		try {
			const questionSets = await prisma.questionSet.findMany({
				where: {
					goldenSetId,
					userInputId,
				},
				include: {
					rubrics: viewQuestions,
				},
				orderBy: { id: "asc" },
			});
			return questionSets;
		} catch (error) {
			logger.error("Error fetching question sets:", error);
			throw new Error("Failed to fetch question sets");
		}
	}

  async getQuestionSetById(id: string): Promise<questionSet | null> {
    try {
      const questionSet = await prisma.questionSet.findUnique({
        where: { id },
        include: {
          rubrics: true,
        },
      });
      return questionSet;
    } catch (error) {
      logger.error("Error fetching question set by id:", error);
      throw new Error("Failed to fetch question set by id");
    }
  }

	async generateQuestionSet(goldenSetId: number, userInputId: number) {
		try {
			// Call copilot to generate questions based on goldenSetId and userInputId
			// const generatedQuestions = await executionService.generateQuestions(
			// 	goldenSetId,
			// 	userInputId,
			// );

			// Create a new question set and associate the generated questions
			const questionSet = await prisma.questionSet.create({
				data: {
					goldenSetId,
					userInputId,
					// rubrics: {
					// 	create: generatedQuestions.map((question) => ({
					// 		questionText: question.questionText,
					// 		weight: question.weight,
					// 	})),
					},
				})
				// include: {
				// 	rubrics: true,
				// },

			return questionSet;
		} catch (error) {
			logger.error("Error generating question set:", error);
			throw new Error("Failed to generate question set");
		}
	}

	async saveQuestionSet(
		goldenSetId: number,
		userInputId: number,
		questions: question[],
	) {
		try {
			const questionSet = await prisma.questionSet.create({
				data: {
					goldenSetId,
					userInputId,
					rubrics: {
						create: questions.map((question) => ({
							version: question.version,
							title: question.title,
							content: question.content,
							expectedAnswer: question.expectedAnswer,
							weight: question.weight,
						})),
					},
				},
				include: {
					rubrics: true,
				},
			});
			return questionSet;
		} catch (error) {
			logger.error("Error saving question set:", error);
			throw new Error("Failed to save question set");
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
