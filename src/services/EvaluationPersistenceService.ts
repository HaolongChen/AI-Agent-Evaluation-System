import { prisma } from '../config/prisma.ts';
import { REVIEW_STATUS } from '../config/constants.ts';
import type {
  QuestionSet,
  QuestionEvaluation,
  FinalReport,
  EvaluationQuestion,
} from '../langGraph/state/state.ts';
import { CopilotType } from '../../build/generated/prisma/enums.ts';
import { logger } from '../utils/logger.ts';
import type { adaptiveRubricJudgeRecord } from '../../build/generated/prisma/client.ts';

export class EvaluationPersistenceService {
  async saveQuestions(sessionId: number, questionSet: QuestionSet, isReviewSkipped: boolean): Promise<void> {
    try {
      // Delete any existing questions for this session before saving the new draft.
      // This handles re-draft scenarios where the composite PK [id, sessionId] would
      // otherwise conflict with previously saved question IDs.
      await prisma.adaptiveRubric.deleteMany({
        where: { sessionId },
      });

      const res = await Promise.allSettled(
        questionSet.questions.map((question) =>
          prisma.adaptiveRubric.create({
            data: {
              id: question.id, // use provided ID to ensure it matches the question answer mapping, will throw error if ID is not provided
              sessionId,
              version: questionSet.version,
              title: question.title,
              content: question.content,
              expectedAnswer: question.expectedAnswer,
              weight: question.weight,
              reviewStatus: isReviewSkipped ? REVIEW_STATUS.APPROVED : REVIEW_STATUS.PENDING,
            },
          }),
        ),
      );

      if (res.some((r) => r.status === 'rejected')) {
        logger.error(
          'Error saving some questions to database:',
          res.filter((r) => r.status === 'rejected'),
        );
        throw new Error('Failed to save some questions');
      }
    } catch (error) {
      logger.error('Error saving questions to database:', error);
      throw new Error('Failed to save questions');
    }
  }

  async saveAgentEvaluationAnswers(
    sessionId: number,
    agentEvaluation: QuestionEvaluation,
  ): Promise<void> {
    try {
      const res = await Promise.allSettled(
        agentEvaluation.answers.map((answer) =>
          prisma.adaptiveRubricJudgeRecord.create({
            data: {
              sessionId,
              id: answer.questionId, // use questionId as ID to ensure it matches the question mapping, will throw error if questionId is not provided
              answer: answer.answer,
              comment: answer.explanation,
            },
          }),
        ),
      );

      if (res.some((r) => r.status === 'rejected')) {
        logger.error(
          'Error saving some agent evaluation answers to database:',
          res.filter((r) => r.status === 'rejected'),
        );
        throw new Error('Failed to save some agent evaluation answers');
      }
    } catch (error) {
      logger.error('Error saving agent evaluation answers:', error);
      throw new Error('Failed to save agent evaluation answers');
    }
  }

  async overrideEvaluationAnswer(
    id: number,
    sessionId: number,
    answer?: boolean,
    comment?: string,
    accountId?: string,
  ): Promise<void> {
    try {
      await prisma.adaptiveRubricJudgeRecord.update({
        where: { id_sessionId: {id, sessionId} },
        data: {
          ...(answer !== undefined ? { answer } : {}),
          ...(comment !== undefined ? { comment } : {}),
          ...(accountId !== undefined ? { accountId } : {}),
          timestamp: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error overriding evaluation answer:', error);
      throw new Error('Failed to override evaluation answer');
    }
  }

  async updateRubricQuestions(
    sessionId: number,
    questions: EvaluationQuestion[],
  ): Promise<void> {
    try {
      await Promise.all(
        questions.map((question) =>
          prisma.adaptiveRubric.update({
            where: { id_sessionId: { id: question.id, sessionId } },
            data: {
              title: question.title,
              content: question.content,
              expectedAnswer: question.expectedAnswer,
              weight: question.weight,
              updatedAt: new Date(),
            },
          })
        )
      );

      logger.info('Rubric questions updated successfully', {
        sessionId,
        questionCount: questions.length,
      });
    } catch (error) {
      logger.error('Error updating rubric questions:', error);
      throw new Error('Failed to update rubric questions');
    }
  }

  async saveFinalReport(
    sessionId: number,
    copilotType: CopilotType | undefined,
    modelName: string,
    finalReport: FinalReport,
  ): Promise<void> {
    try {
      await prisma.evaluationResult.create({
        data: {
          sessionId,
          copilotType: copilotType ?? CopilotType.dataModel,
          modelName: modelName,
          evaluationStatus: 'completed',
          overallScore: finalReport.overallScore,
          summary: finalReport.summary,
          detailedAnalysis: finalReport.detailedAnalysis,
          auditTrace: finalReport.auditTrace,
          generatedAt: new Date(finalReport.generatedAt),
        },
      });
    } catch (error) {
      logger.error('Error saving final report:', error);
      throw new Error('Failed to save final report');
    }
  }

  async getQuestionsBySessionId(sessionId: number): Promise<
    | {
        id: number;
        title: string;
        content: string;
        expectedAnswer: boolean;
        weight: number;
        reviewStatus: string;
        judgeRecord?: adaptiveRubricJudgeRecord | null;
      }[]
    | null
  > {
    try {
      const rubrics = await prisma.adaptiveRubric.findMany({
        where: { sessionId },
        orderBy: { id: 'asc' },
        select: {
          id: true,
          title: true,
          content: true,
          expectedAnswer: true,
          weight: true,
          reviewStatus: true,
          judgeRecord: true,
        },
      });

      if (rubrics.length === 0) return null;

      return rubrics.map((r) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        expectedAnswer: r.expectedAnswer,
        weight: Number(r.weight),
        reviewStatus: r.reviewStatus,
        judgeRecord: r.judgeRecord,
      }));
    } catch (error) {
      logger.error('Error getting questions by session ID:', error);
      return null;
    }
  }
}

export const evaluationPersistenceService = new EvaluationPersistenceService();
