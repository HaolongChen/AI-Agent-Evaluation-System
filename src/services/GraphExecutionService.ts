import { prisma } from '../config/prisma.ts';
import { SESSION_STATUS, REVIEW_STATUS } from '../config/constants.ts';
import type { Prisma } from '../../build/generated/prisma/client.ts';
import { logger } from '../utils/logger.ts';
import type {
  QuestionSet,
  QuestionEvaluation,
  QuestionAnswer,
  FinalReport,
} from '../langGraph/state/state.ts';
import { RUN_KUBERNETES_JOBS } from '../config/env.ts';
import {
  applyAndWatchJob,
  type HumanEvaluationK8sJobResult,
  type RubricReviewK8sJobResult,
} from '../kubernetes/utils/apply-from-file.ts';
import { HumanEvaluationJobRunner } from '../jobs/HumanEvaluationJobRunner.ts';
import { RubricReviewJobRunner } from '../jobs/RubricReviewJobRunner.ts';

export type GraphSessionStatus =
  | 'pending'
  | 'awaiting_rubric_review'
  | 'awaiting_human_evaluation'
  | 'completed'
  | 'failed';

interface SessionMetadata {
  threadId: string;
  goldenSetId?: number;
  skipHumanReview?: boolean;
  skipHumanEvaluation?: boolean;
}

export interface StartSessionResult {
  sessionId: number;
  threadId: string;
  status: GraphSessionStatus;
  questionSetDraft?: QuestionSet | null | undefined;
  message: string;
}

export interface RubricReviewResult {
  sessionId: number;
  threadId: string;
  status: GraphSessionStatus;
  questionSetFinal?: QuestionSet | null | undefined;
  message: string;
}

export interface HumanEvaluationResult {
  sessionId: number;
  threadId: string;
  status: GraphSessionStatus;
  finalReport?: FinalReport | null | undefined;
  message: string;
}

/**
 * GraphExecutionService
 *
 * Manages LangGraph execution with Human-in-the-Loop (HITL) support.
 * Uses callbacks pattern where mutations return immediately after starting or resuming,
 * and the graph pauses at interrupt points waiting for human input.
 */
export class GraphExecutionService {

  async submitRubricReview(
    sessionId: number,
    threadId: string,
    approved: boolean,
    modifiedQuestionSet: QuestionSet | undefined,
    questionPatches:
      | Array<{
          questionId: number;
          title?: string;
          content?: string;
          expectedAnswer?: boolean;
          weight?: number;
        }>
      | undefined,
    feedback: string | undefined,
    reviewerAccountId: string
  ): Promise<RubricReviewResult> {
    try {
      let finalQuestionSet: QuestionSet | undefined;

      // Handle partial updates via questionPatches
      if (questionPatches && questionPatches.length > 0) {
        logger.info('Applying question patches', { 
          sessionId, 
          patchCount: questionPatches.length 
        });

        // Fetch existing questions from database
        const session = await prisma.evaluationSession.findUnique({
          where: { id: sessionId },
          include: {
            rubrics: {
              where: { isActive: true },
              orderBy: { id: 'asc' },
            },
          },
        });

        if (!session || session.rubrics.length === 0) {
          throw new Error('No questions found for session');
        }

        // Build question map for efficient lookup
        const questionMap = new Map(
          session.rubrics.map((r) => [
            r.id,
            {
              id: r.id,
              title: r.title,
              content: r.content,
              expectedAnswer: r.expectedAnswer,
              weight: Number(r.weight),
            },
          ])
        );

        // Apply patches
        for (const patch of questionPatches) {
          const question = questionMap.get(patch.questionId);
          if (!question) {
            throw new Error(`Question ID ${patch.questionId} not found`);
          }

          // Merge patch fields into existing question
          if (patch.title !== undefined) question.title = patch.title;
          if (patch.content !== undefined) question.content = patch.content;
          if (patch.expectedAnswer !== undefined) {
            question.expectedAnswer = patch.expectedAnswer;
          }
          if (patch.weight !== undefined) question.weight = patch.weight;
        }

        // Reconstruct full QuestionSet with patches applied
        const questions = Array.from(questionMap.values());
        const totalWeight = questions.reduce((sum, q) => sum + q.weight, 0);

        finalQuestionSet = {
          version: session.rubrics[0]!.version,
          questions,
          totalWeight,
          createdAt: session.rubrics[0]!.createdAt.toISOString(),
          updatedAt: new Date().toISOString(),
        };

        logger.info('Question patches applied successfully', {
          sessionId,
          totalQuestions: questions.length,
          totalWeight,
        });
      } else if (modifiedQuestionSet) {
        finalQuestionSet = modifiedQuestionSet;
      } else if (!approved) {
        finalQuestionSet = undefined;
      }

      if (RUN_KUBERNETES_JOBS) {
        const args = [
          String(sessionId),
          threadId,
          String(approved),
          reviewerAccountId,
          finalQuestionSet ? JSON.stringify(finalQuestionSet) : '',
          feedback ?? '',
        ];

        const reviewJobResult = (await applyAndWatchJob(
          `graph-rubric-review-${sessionId}-${Date.now()}`,
          'default',
          './src/jobs/RubricReviewJobRunner.ts',
          300000,
          'rubric-review',
          ...args
        )) as unknown as RubricReviewK8sJobResult;

        logger.info('Question set review job completed:', reviewJobResult);

        if (reviewJobResult.status !== 'succeeded') {
          throw new Error(
            reviewJobResult.reason ||
              reviewJobResult.error ||
              'Question set review Kubernetes job failed'
          );
        }

        return {
          sessionId,
          threadId,
          status: 'completed',
          questionSetFinal: reviewJobResult.questionSetFinal ?? null,
          message: reviewJobResult.message || 'Question set review completed successfully',
        };
      } else {
        const reviewJobRunner = new RubricReviewJobRunner(
          sessionId,
          threadId,
          approved,
          reviewerAccountId,
          finalQuestionSet,
          feedback
        );
        reviewJobRunner.startJob();
        const result = await reviewJobRunner.waitForCompletion();
        logger.info('Question set review completed:', result);
        return {
          sessionId,
          threadId,
          status: 'completed',
          questionSetFinal: result.questionSetFinal ?? null,
          message: result.message || 'Question set review completed successfully',
        };
      }
    } catch (error) {
      logger.error('Error submitting question set review:', error);
      throw new Error(
        `Failed to submit question set review: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  async submitHumanEvaluation(
    sessionId: number,
    threadId: string,
    answers:
      | Array<{ questionId: number; answer: boolean; explanation: string; evidence?: string[] }>
      | undefined,
    answerPatches:
      | Array<{
          questionId: number;
          answer?: boolean;
          explanation?: string;
          evidence?: string[];
        }>
      | undefined,
    overallAssessment: string,
    evaluatorAccountId: string
  ): Promise<HumanEvaluationResult> {
    try {
      let finalAnswers: Array<{
        questionId: number;
        answer: boolean;
        explanation: string;
        evidence?: string[] | undefined;
      }>;

      if (answerPatches && answerPatches.length > 0) {
        logger.info('Applying answer patches', {
          sessionId,
          patchCount: answerPatches.length,
        });

        const state = await this.getSessionState(sessionId);

        if (!state.agentEvaluation || !state.questionSetFinal) {
          throw new Error(
            'Cannot apply answer patches: no agent evaluation or question set found'
          );
        }

        const answerMap = new Map(
          state.agentEvaluation.answers.map((a) => [
            a.questionId,
            {
              questionId: a.questionId,
              answer: a.answer,
              explanation: a.explanation,
              evidence: a.evidence,
            },
          ])
        );

        for (const patch of answerPatches) {
          let answer = answerMap.get(patch.questionId);

          if (!answer) {
            const question = state.questionSetFinal.questions.find(
              (q) => q.id === patch.questionId
            );
            if (!question) {
              throw new Error(`Question ID ${patch.questionId} not found`);
            }

            answer = {
              questionId: patch.questionId,
              answer: patch.answer ?? question.expectedAnswer,
              explanation: patch.explanation ?? '',
              evidence: patch.evidence,
            };
            answerMap.set(patch.questionId, answer);
          } else {
            if (patch.answer !== undefined) answer.answer = patch.answer;
            if (patch.explanation !== undefined) {
              answer.explanation = patch.explanation;
            }
            if (patch.evidence !== undefined) answer.evidence = patch.evidence;
          }
        }

        const allQuestionIds = new Set(
          state.questionSetFinal.questions.map((q) => q.id)
        );
        for (const qid of allQuestionIds) {
          if (!answerMap.has(qid)) {
            const agentAnswer = state.agentEvaluation.answers.find(
              (a) => a.questionId === qid
            );
            if (agentAnswer) {
              answerMap.set(qid, {
                questionId: agentAnswer.questionId,
                answer: agentAnswer.answer,
                explanation: agentAnswer.explanation,
                evidence: agentAnswer.evidence,
              });
            }
          }
        }

        finalAnswers = Array.from(answerMap.values());

        logger.info('Answer patches applied successfully', {
          sessionId,
          totalAnswers: finalAnswers.length,
        });
      } else if (answers) {
        finalAnswers = answers;
      } else {
        throw new Error('Either answers or answerPatches must be provided');
      }

      if (RUN_KUBERNETES_JOBS) {
        const evaluationJobResult = (await applyAndWatchJob(
          `graph-human-eval-${sessionId}-${Date.now()}`,
          'default',
          './src/jobs/HumanEvaluationJobRunner.ts',
          300000,
          'human-evaluation',
          String(sessionId),
          threadId,
          JSON.stringify(finalAnswers),
          overallAssessment,
          evaluatorAccountId
        )) as unknown as HumanEvaluationK8sJobResult;

        logger.info('Human evaluation job completed:', evaluationJobResult);

        if (evaluationJobResult.status !== 'succeeded') {
          throw new Error(
            evaluationJobResult.reason ||
              evaluationJobResult.error ||
              'Human evaluation Kubernetes job failed'
          );
        }

        return {
          sessionId,
          threadId,
          status: 'completed',
          finalReport: evaluationJobResult.finalReport ?? null,
          message:
            evaluationJobResult.message || 'Evaluation completed successfully',
        };
      } else {
        const evaluationJobRunner = new HumanEvaluationJobRunner(
          sessionId,
          threadId,
          finalAnswers,
          overallAssessment,
          evaluatorAccountId
        );
        evaluationJobRunner.startJob();
        const result = await evaluationJobRunner.waitForCompletion();
        logger.info('Human evaluation completed:', result);
        return {
          sessionId,
          threadId,
          status: 'completed',
          finalReport: result.finalReport ?? null,
          message: result.message || 'Evaluation completed successfully',
        };
      }
    } catch (error) {
      logger.error('Error submitting human evaluation:', error);
      throw new Error(
        `Failed to submit human evaluation: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  async getSessionState(sessionId: number): Promise<{
    sessionId: number;
    status: GraphSessionStatus;
    threadId: string | null;
    questionSetDraft: QuestionSet | null;
    questionSetFinal: QuestionSet | null;
    agentEvaluation: QuestionEvaluation | null;
    humanEvaluation: QuestionEvaluation | null;
    finalReport: FinalReport | null;
  }> {
    const session = await prisma.evaluationSession.findUnique({
      where: { id: sessionId },
      include: {
        rubrics: {
          include: { judgeRecord: true },
        },
        result: true,
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const metadata = session.metadata as SessionMetadata | null;
    const rubrics = session.rubrics;

    let status: GraphSessionStatus = 'pending';
    if (session.status === SESSION_STATUS.COMPLETED) {
      status = 'completed';
    } else if (session.status === SESSION_STATUS.FAILED) {
      status = 'failed';
    } else if (rubrics.length > 0) {
      const allApproved = rubrics.every(
        (r) => r.reviewStatus === REVIEW_STATUS.APPROVED
      );
      const anyPending = rubrics.some(
        (r) => r.reviewStatus === REVIEW_STATUS.PENDING
      );
      const hasHumanEval = rubrics.some(
        (r) => r.judgeRecord?.evaluatorType === 'human'
      );

      if (anyPending) {
        status = 'awaiting_rubric_review';
      } else if (allApproved && hasHumanEval) {
        status = 'completed';
      } else if (allApproved) {
        status = 'awaiting_human_evaluation';
      }
    }

    const questionSet =
      rubrics.length > 0 ? this.transformRubricsToQuestionSet(rubrics) : null;
    const isApproved = rubrics.every(
      (r) => r.reviewStatus === REVIEW_STATUS.APPROVED
    );

    return {
      sessionId,
      status,
      threadId: metadata?.threadId ?? null,
      questionSetDraft: questionSet,
      questionSetFinal: isApproved ? questionSet : null,
      agentEvaluation: this.extractQuestionEvaluation(rubrics, 'agent'),
      humanEvaluation: this.extractQuestionEvaluation(rubrics, 'human'),
      finalReport: session.result
        ? this.transformResultToFinalReport(session.result)
        : null,
    };
  }

  private transformRubricsToQuestionSet(
    rubrics: Array<{
      id: number;
      version: string;
      title: string;
      content: string;
      expectedAnswer: boolean;
      weight: Prisma.Decimal;
      createdAt: Date;
      updatedAt: Date;
    }>
  ): QuestionSet {
    const [firstRubric, ...rest] = rubrics;
    if (!firstRubric) {
      throw new Error('Cannot transform empty rubrics array to QuestionSet');
    }

    const allRubrics = [firstRubric, ...rest];
    const totalWeight = allRubrics.reduce((sum, r) => sum + Number(r.weight), 0);

    return {
      version: firstRubric.version,
      questions: allRubrics.map((r) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        expectedAnswer: r.expectedAnswer,
        weight: Number(r.weight),
      })),
      totalWeight,
      createdAt: firstRubric.createdAt.toISOString(),
      updatedAt: firstRubric.updatedAt.toISOString(),
    };
  }

  private extractQuestionEvaluation(
    rubrics: Array<{
      id: number;
      title: string;
      judgeRecord: {
        evaluatorType: string;
        answer: boolean;
        comment: string | null;
        overallScore: Prisma.Decimal;
        timestamp: Date;
      } | null;
    }>,
    type: 'agent' | 'human'
  ): QuestionEvaluation | null {
    const matchingRecords = rubrics
      .filter((r) => r.judgeRecord?.evaluatorType === type)
      .map((r) => r.judgeRecord!);

    if (matchingRecords.length === 0) return null;

    const answers: QuestionAnswer[] = rubrics
      .filter((r) => r.judgeRecord?.evaluatorType === type)
      .map((r) => ({
        questionId: r.id,
        answer: r.judgeRecord!.answer,
        explanation: r.judgeRecord!.comment ?? '',
      }));

    const firstRecord = matchingRecords[0];
    if (!firstRecord) return null;

    return {
      evaluatorType: type,
      answers,
      overallScore: Number(firstRecord.overallScore),
      summary: '',
      timestamp: firstRecord.timestamp.toISOString(),
    };
  }

  private transformResultToFinalReport(result: {
    verdict: string;
    overallScore: Prisma.Decimal;
    summary: string;
    detailedAnalysis: string;
    discrepancies: string[];
    auditTrace: string[];
    generatedAt: Date;
  }): FinalReport {
    return {
      verdict: result.verdict as FinalReport['verdict'],
      overallScore: Number(result.overallScore),
      summary: result.summary,
      detailedAnalysis: result.detailedAnalysis,
      agentEvaluation: null,
      humanEvaluation: null,
      discrepancies: result.discrepancies,
      auditTrace: result.auditTrace,
      generatedAt: result.generatedAt.toISOString(),
    };
  }
}

export const graphExecutionService = new GraphExecutionService();
