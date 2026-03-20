// import { prisma } from '../config/prisma.ts';
// import { SESSION_STATUS, REVIEW_STATUS } from '../config/constants.ts';
// import type { Prisma } from '../../build/generated/prisma/client.ts';
// import { logger } from '../utils/logger.ts';
// import type {
//   QuestionSet,
//   QuestionEvaluation,
//   FinalReport,
// } from '../langGraph/state/state.ts';
// import { HumanEvaluationJobRunner } from '../jobs/HumanEvaluationJobRunner.ts';
// import { RubricReviewJobRunner } from '../jobs/RubricReviewJobRunner.ts';
// import { evaluationPersistenceService } from './EvaluationPersistenceService.ts';

// export type GraphSessionStatus =
//   | 'pending'
//   | 'awaiting_rubric_review'
//   | 'awaiting_human_evaluation'
//   | 'completed'
//   | 'failed';

// interface SessionMetadata {
//   threadId: string;
//   goldenSetId?: number;
//   skipHumanReview?: boolean;
//   skipHumanEvaluation?: boolean;
// }

// export interface StartSessionResult {
//   sessionId: number;
//   threadId: string;
//   status: GraphSessionStatus;
//   questionSetDraft?: QuestionSet | null | undefined;
//   message: string;
// }

// export interface RubricReviewResult {
//   sessionId: number;
//   threadId: string;
//   status: GraphSessionStatus;
//   questionSetFinal?: QuestionSet | null | undefined;
//   message: string;
// }

// export interface HumanEvaluationResult {
//   sessionId: number;
//   threadId: string;
//   status: GraphSessionStatus;
//   finalReport?: FinalReport | null | undefined;
//   message: string;
// }

// /**
//  * GraphExecutionService
//  *
//  * Manages LangGraph execution with Human-in-the-Loop (HITL) support.
//  * Uses callbacks pattern where mutations return immediately after starting or resuming,
//  * and the graph pauses at interrupt points waiting for human input.
//  */
// export class GraphExecutionService {
//   // async submitRubricReview(
//   //   sessionId: number,
//   //   threadId: string,
//   //   approved: boolean,
//   //   modifiedQuestionSet: QuestionSet | undefined,
//   //   questionPatches:
//   //     | Array<{
//   //         questionId: number;
//   //         title?: string;
//   //         content?: string;
//   //         expectedAnswer?: boolean;
//   //         weight?: number;
//   //       }>
//   //     | undefined,
//   //   feedback: string | undefined,
//   //   reviewerAccountId: string,
//   // ): Promise<RubricReviewResult> {
//   //   try {
//   //     let finalQuestionSet: QuestionSet | undefined;

//   //     // Handle partial updates via questionPatches
//   //     if (questionPatches && questionPatches.length > 0) {
//   //       logger.info('Applying question patches', {
//   //         sessionId,
//   //         patchCount: questionPatches.length,
//   //       });

//   //       // Fetch existing questions from database
//   //       const session = await prisma.evaluationSession.findUnique({
//   //         where: { id: sessionId },
//   //         include: {
//   //           rubrics: {
//   //             where: { isActive: true },
//   //             orderBy: { id: 'asc' },
//   //           },
//   //         },
//   //       });

//   //       if (!session || session.rubrics.length === 0) {
//   //         throw new Error('No questions found for session');
//   //       }

//   //       // Build question map for efficient lookup
//   //       const questionMap = new Map(
//   //         session.rubrics.map((r) => [
//   //           r.id,
//   //           {
//   //             id: r.id,
//   //             title: r.title,
//   //             content: r.content,
//   //             expectedAnswer: r.expectedAnswer,
//   //             weight: Number(r.weight),
//   //           },
//   //         ]),
//   //       );

//   //       const questionsUpdating = [];

//   //       // Apply patches
//   //       for (const patch of questionPatches) {
//   //         const question = questionMap.get(patch.questionId);
//   //         if (!question) {
//   //           throw new Error(`Question ID ${patch.questionId} not found`);
//   //         }

//   //         // Merge patch fields into existing question
//   //         if (patch.title !== undefined) question.title = patch.title;
//   //         if (patch.content !== undefined) question.content = patch.content;
//   //         if (patch.expectedAnswer !== undefined) {
//   //           question.expectedAnswer = patch.expectedAnswer;
//   //         }
//   //         if (patch.weight !== undefined) question.weight = patch.weight;
//   //         questionsUpdating.push(question);
//   //       }

//   //       // Reconstruct full QuestionSet with patches applied
//   //       const questions = Array.from(questionMap.values());
//   //       const totalWeight = questions.reduce((sum, q) => sum + q.weight, 0);
//   //       finalQuestionSet = {
//   //         version: session.rubrics[0]!.version,
//   //         questions,
//   //         totalWeight,
//   //         createdAt: session.rubrics[0]!.createdAt.toISOString(),
//   //         updatedAt: new Date().toISOString(),
//   //       };

//   //       await evaluationPersistenceService.updateRubricQuestions(
//   //         sessionId,
//   //         questionsUpdating,
//   //       );

//   //       logger.info('Question patches applied successfully', {
//   //         sessionId,
//   //         totalQuestions: questions.length,
//   //         totalWeight,
//   //       });
//   //     } else if (modifiedQuestionSet) {
//   //       // Human provided a full replacement set (approved=false path).
//   //       // Persist the human-provided questions to DB for audit and state consistency.
//   //       // These serve as authoritative examples for the LLM on the next draft attempt.
//   //       finalQuestionSet = modifiedQuestionSet;
//   //       await evaluationPersistenceService.updateRubricQuestions(
//   //         sessionId,
//   //         modifiedQuestionSet.questions,
//   //       );
//   //       logger.info('Human-provided example questions saved to DB (approved=false)', {
//   //         sessionId,
//   //         questionCount: modifiedQuestionSet.questions.length,
//   //       });
//   //     } else if (!approved) {
//   //       finalQuestionSet = undefined;
//   //     }

//   //     const reviewJobRunner = new RubricReviewJobRunner(
//   //       sessionId,
//   //       threadId,
//   //       approved,
//   //       reviewerAccountId,
//   //       finalQuestionSet,
//   //       feedback,
//   //     );
//   //     reviewJobRunner.startJob();
//   //     const result = await reviewJobRunner.waitForCompletion();
//   //     logger.info('Question set review completed:', result);
//   //     return {
//   //       sessionId,
//   //       threadId,
//   //       status: 'completed',
//   //       questionSetFinal: result.questionSetFinal ?? null,
//   //       message:
//   //         result.message || 'Question set review completed successfully',
//   //     };
//   //   } catch (error) {
//   //     logger.error('Error submitting question set review:', error);
//   //     throw new Error(
//   //       `Failed to submit question set review: ${
//   //         error instanceof Error ? error.message : 'Unknown error'
//   //       }`,
//   //     );
//   //   }
//   // }

//   // async submitHumanEvaluation(
//   //   sessionId: number,
//   //   threadId: string,
//   //   answers:
//   //     | Array<{
//   //         id: number;
//   //         answer?: boolean;
//   //         explanation?: string;
//   //       }>
//   //     | undefined,
//   //   overallAssessment: string,
//   //   evaluatorAccountId: string,
//   // ): Promise<HumanEvaluationResult> {
//   //   try {
//   //     const state = await this.getSessionState(sessionId);

//   //     if (!state.evaluation || !state.questionSetFinal) {
//   //       throw new Error(
//   //         'Cannot apply answer patches: no agent evaluation or question set found',
//   //       );
//   //     }

//   //     let counter = 0;

//   //     const updatedAnswers = state.evaluation.answers.map((a) => {
//   //       const answer = answers?.find((ans) => ans.id === a.questionId);
//   //       if (answer) {
//   //         counter++;
//   //         return {
//   //           id: a.questionId,
//   //           answer: answer.answer ?? a.answer,
//   //           explanation: answer.explanation ?? a.explanation,
//   //         };
//   //       } else {
//   //         return {
//   //           answer: a.answer,
//   //           explanation: a.explanation,
//   //           id: a.questionId,
//   //         };
//   //       }
//   //     });

//   //     if (counter !== (answers?.length ?? 0)) {
//   //       logger.warn('Some provided answers did not match existing questions', {
//   //         sessionId,
//   //         threadId,
//   //         providedAnswerIds: answers?.map((a) => a.id) ?? [],
//   //         existingQuestionIds: state.evaluation.answers.map(
//   //           (a) => a.questionId,
//   //         ),
//   //       });
//   //     }

//   //     if (answers && answers.length > 0) {
//   //       const res = await Promise.allSettled(
//   //         answers.map((a) =>
//   //           evaluationPersistenceService.overrideEvaluationAnswer(
//   //             a.id,
//   //             sessionId,
//   //             a.answer,
//   //             a.explanation,
//   //             evaluatorAccountId
//   //           ),
//   //         ),
//   //       );
//   //       const failed = res.filter((r) => r.status === 'rejected');
//   //       if (failed.length > 0) {
//   //         logger.warn('Some evaluation answers failed to be overridden', {
//   //           sessionId,
//   //           failedCount: failed.length,
//   //         });
//   //       }
//   //     }

//   //     const evaluationJobRunner = new HumanEvaluationJobRunner(
//   //       sessionId,
//   //       threadId,
//   //       updatedAnswers,
//   //       overallAssessment,
//   //     );
//   //     evaluationJobRunner.startJob();
//   //     const result = await evaluationJobRunner.waitForCompletion();
//   //     logger.info('Human evaluation completed:', result);
//   //     return {
//   //       sessionId,
//   //       threadId,
//   //       status: 'completed',
//   //       finalReport: result.finalReport ?? null,
//   //       message: result.message || 'Evaluation completed successfully',
//   //     };
//   //   } catch (error) {
//   //     logger.error('Error submitting human evaluation:', error);
//   //     throw new Error(
//   //       `Failed to submit human evaluation: ${
//   //         error instanceof Error ? error.message : 'Unknown error'
//   //       }`,
//   //     );
//   //   }
//   // }

//   // async getSessionState(sessionId: number): Promise<{
//   //   sessionId: number;
//   //   status: GraphSessionStatus;
//   //   threadId: string | null;
//   //   questionSetDraft: QuestionSet | null;
//   //   questionSetFinal: QuestionSet | null;
//   //   evaluation: QuestionEvaluation | null;
//   //   finalReport: FinalReport | null;
//   // }> {
//   //   const session = await prisma.evaluationSession.findUnique({
//   //     where: { id: sessionId },
//   //     include: {
//   //       rubrics: {
//   //         include: { judgeRecord: true },
//   //         orderBy: { id: 'asc' },
//   //       },
//   //       result: true,
//   //     },
//   //   });

//   //   if (!session) {
//   //     throw new Error('Session not found');
//   //   }

//   //   const metadata = session.metadata as SessionMetadata | null;
//   //   const evaluatedRubrics = session.rubrics;

//   //   let status: GraphSessionStatus = 'pending';
//   //   if (session.status === SESSION_STATUS.COMPLETED) {
//   //     status = 'completed';
//   //   } else if (session.status === SESSION_STATUS.FAILED) {
//   //     status = 'failed';
//   //   } else if (evaluatedRubrics.length > 0) {
//   //     const allApproved = evaluatedRubrics.every(
//   //       (r) => r.reviewStatus === REVIEW_STATUS.APPROVED,
//   //     );
//   //     const anyPending = evaluatedRubrics.some(
//   //       (r) => r.reviewStatus === REVIEW_STATUS.PENDING,
//   //     );
//   //     if (anyPending) {
//   //       status = 'awaiting_rubric_review';
//   //     } else if (allApproved) {
//   //       status = 'awaiting_human_evaluation';
//   //     }
//   //   }

//   //   const questionSet =
//   //     evaluatedRubrics.length > 0
//   //       ? this.transformRubricsToQuestionSet(evaluatedRubrics)
//   //       : null;
//   //   const isApproved = evaluatedRubrics.every(
//   //     (r) => r.reviewStatus === REVIEW_STATUS.APPROVED,
//   //   );

//   //   return {
//   //     sessionId,
//   //     status,
//   //     threadId: metadata?.threadId ?? null,
//   //     questionSetDraft: questionSet,
//   //     questionSetFinal: isApproved ? questionSet : null,
//   //     evaluation: this.extractQuestionEvaluation(evaluatedRubrics),
//   //     finalReport: session.result
//   //       ? this.transformResultToFinalReport(session.result)
//   //       : null,
//   //   };
//   // }

//   // private transformRubricsToQuestionSet(
//   //   rubrics: Array<{
//   //     id: number;
//   //     version: string;
//   //     title: string;
//   //     content: string;
//   //     expectedAnswer: boolean;
//   //     weight: Prisma.Decimal;
//   //     createdAt: Date;
//   //     updatedAt: Date;
//   //   }>,
//   // ): QuestionSet {
//   //   const [firstRubric, ...rest] = rubrics;
//   //   if (!firstRubric) {
//   //     throw new Error('Cannot transform empty rubrics array to QuestionSet');
//   //   }

//   //   // Sort ascending by id for deterministic question-answer mapping
//   //   const allRubrics = [firstRubric, ...rest].sort((a, b) => a.id - b.id);
//   //   const totalWeight = allRubrics.reduce(
//   //     (sum, r) => sum + Number(r.weight),
//   //     0,
//   //   );

//   //   return {
//   //     version: firstRubric.version,
//   //     questions: allRubrics.map((r) => ({
//   //       id: r.id,
//   //       title: r.title,
//   //       content: r.content,
//   //       expectedAnswer: r.expectedAnswer,
//   //       weight: Number(r.weight),
//   //     })),
//   //     totalWeight,
//   //     createdAt: firstRubric.createdAt.toISOString(),
//   //     updatedAt: firstRubric.updatedAt.toISOString(),
//   //   };
//   // }

//   // private extractQuestionEvaluation(
//   //   rubrics: Array<{
//   //     judgeRecord: {
//   //       id: number;
//   //       sessionId: number;
//   //       answer: boolean;
//   //       comment: string | null;
//   //       timestamp: Date;
//   //     } | null;
//   //     id: number;
//   //     expectedAnswer: boolean;
//   //     weight: Prisma.Decimal;
//   //   }>,
//   // ): QuestionEvaluation | null {
//   //   const firstRecord = rubrics[0]?.judgeRecord;
//   //   if (!firstRecord) return null;

//   //   return {
//   //     answers: rubrics.map((r) => ({
//   //       questionId: r.id,
//   //       answer: r.judgeRecord?.answer ?? false,
//   //       explanation: r.judgeRecord?.comment ?? '',
//   //     })),
//   //     overallScore: (() => {
//   //       const totalWeight = rubrics.reduce((sum, r) => sum + Number(r.weight), 0);
//   //       const weightedSum = rubrics.reduce(
//   //         (sum, r) => sum + (r.expectedAnswer === r.judgeRecord?.answer ? Number(r.weight) : 0),
//   //         0,
//   //       );
//   //       return Number(totalWeight === 0 ? 0 : (weightedSum / totalWeight) * 100);
//   //     })(),
//   //     summary: '',
//   //     timestamp: firstRecord.timestamp.toISOString(),
//   //   };
//   // }

//   // private transformResultToFinalReport(result: {
//   //   overallScore: Prisma.Decimal;
//   //   summary: string;
//   //   detailedAnalysis: string;
//   //   auditTrace: string[];
//   //   generatedAt: Date;
//   // }): FinalReport {
//   //   return {
//   //     overallScore: Number(result.overallScore),
//   //     summary: result.summary,
//   //     detailedAnalysis: result.detailedAnalysis,
//   //     auditTrace: result.auditTrace,
//   //     generatedAt: result.generatedAt.toISOString(),
//   //   };
//   // }
// }

// export const graphExecutionService = new GraphExecutionService();
