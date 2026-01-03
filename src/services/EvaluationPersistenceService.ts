import { prisma } from '../config/prisma.ts';
import { REVIEW_STATUS } from '../config/constants.ts';
import type {
  QuestionSet,
  QuestionEvaluation,
  FinalReport,
} from '../langGraph/state/state.ts';
import { CopilotType } from '../../build/generated/prisma/enums.ts';
import { logger } from '../utils/logger.ts';
import type { adaptiveRubricJudgeRecord } from '../../build/generated/prisma/client.ts';

export class EvaluationPersistenceService {
  async saveQuestions(
    sessionId: number,
    questionSet: QuestionSet
  ): Promise<{ ids: number[] }> {
    try {
      const createdIds: number[] = [];

      for (const question of questionSet.questions) {
        const created = await prisma.adaptiveRubric.create({
          data: {
            sessionId,
            version: questionSet.version,
            title: question.title,
            content: question.content,
            expectedAnswer: question.expectedAnswer,
            weight: question.weight,
            reviewStatus: REVIEW_STATUS.PENDING,
          },
        });
        createdIds.push(created.id);
      }

      return { ids: createdIds };
    } catch (error) {
      logger.error('Error saving questions to database:', error);
      throw new Error('Failed to save questions');
    }
  }

  async saveJudgeRecordsFromFinalReport(
    sessionId: number,
    finalReport: FinalReport
  ): Promise<void> {
    try {
      const rubrics = await prisma.adaptiveRubric.findMany({
        where: { sessionId },
        select: { id: true, title: true },
      });

      if (rubrics.length === 0) {
        logger.warn(`No rubrics found for session ${sessionId}`);
        return;
      }

      const saveAnswers = async (
        evaluation: QuestionEvaluation | null,
        accountId: string | null
      ) => {
        if (!evaluation) return;

        for (const answer of evaluation.answers) {
          const rubric = rubrics.find((r) => r.id === answer.questionId);

          if (rubric) {
            const existing = await prisma.adaptiveRubricJudgeRecord.findUnique({
              where: { adaptiveRubricId: rubric.id },
            });

            if (existing) {
              await prisma.adaptiveRubricJudgeRecord.update({
                where: { id: existing.id },
                data: {
                  evaluatorType: evaluation.evaluatorType,
                  answer: answer.answer,
                  comment: answer.explanation,
                  overallScore: evaluation.overallScore,
                  accountId,
                },
              });
            } else {
              await prisma.adaptiveRubricJudgeRecord.create({
                data: {
                  adaptiveRubricId: rubric.id,
                  evaluatorType: evaluation.evaluatorType,
                  answer: answer.answer,
                  comment: answer.explanation,
                  overallScore: evaluation.overallScore,
                  accountId,
                },
              });
            }
          }
        }
      };

      await saveAnswers(finalReport.agentEvaluation, null);
      await saveAnswers(finalReport.humanEvaluation, null);
    } catch (error) {
      logger.error('Error saving judge records from final report:', error);
      throw new Error('Failed to save judge records');
    }
  }

  async saveAgentEvaluationAnswers(
    sessionId: number,
    agentEvaluation: QuestionEvaluation
  ): Promise<void> {
    try {
      const rubrics = await prisma.adaptiveRubric.findMany({
        where: { sessionId },
        select: { id: true },
      });

      if (rubrics.length === 0) {
        logger.warn(`No rubrics found for session ${sessionId}`);
        return;
      }

      for (const answer of agentEvaluation.answers) {
        const rubric = rubrics.find((r) => r.id === answer.questionId);

        if (rubric) {
          const existing = await prisma.adaptiveRubricJudgeRecord.findUnique({
            where: { adaptiveRubricId: rubric.id },
          });

          if (existing) {
            await prisma.adaptiveRubricJudgeRecord.update({
              where: { id: existing.id },
              data: {
                evaluatorType: agentEvaluation.evaluatorType,
                answer: answer.answer,
                comment: answer.explanation,
                overallScore: agentEvaluation.overallScore,
                accountId: null,
              },
            });
          } else {
            await prisma.adaptiveRubricJudgeRecord.create({
              data: {
                adaptiveRubricId: rubric.id,
                evaluatorType: agentEvaluation.evaluatorType,
                answer: answer.answer,
                comment: answer.explanation,
                overallScore: agentEvaluation.overallScore,
                accountId: null,
              },
            });
          }
        }
      }
    } catch (error) {
      logger.error('Error saving agent evaluation answers:', error);
      throw new Error('Failed to save agent evaluation answers');
    }
  }

  async updateRubricQuestions(
    sessionId: number,
    questionSet: QuestionSet
  ): Promise<void> {
    try {
      for (const question of questionSet.questions) {
        await prisma.adaptiveRubric.update({
          where: { id: question.id },
          data: {
            title: question.title,
            content: question.content,
            expectedAnswer: question.expectedAnswer,
            weight: question.weight,
            version: questionSet.version,
            updatedAt: new Date(),
          },
        });
      }

      logger.info('Rubric questions updated successfully', {
        sessionId,
        questionCount: questionSet.questions.length,
      });
    } catch (error) {
      logger.error('Error updating rubric questions:', error);
      throw new Error('Failed to update rubric questions');
    }
  }

  async saveQuestionAnswer(
    rubricId: number,
    evaluatorType: 'agent' | 'human',
    answer: {
      answer: boolean;
      explanation: string;
      evidence?: string[];
    },
    accountId?: string | null
  ): Promise<void> {
    try {
      const existing = await prisma.adaptiveRubricJudgeRecord.findUnique({
        where: { adaptiveRubricId: rubricId },
      });

      if (existing) {
        await prisma.adaptiveRubricJudgeRecord.update({
          where: { id: existing.id },
          data: {
            evaluatorType,
            answer: answer.answer,
            comment: answer.explanation,
            accountId: accountId ?? null,
          },
        });
      } else {
        await prisma.adaptiveRubricJudgeRecord.create({
          data: {
            adaptiveRubricId: rubricId,
            evaluatorType,
            answer: answer.answer,
            comment: answer.explanation,
            overallScore: 0,
            accountId: accountId ?? null,
          },
        });
      }
    } catch (error) {
      logger.error('Error saving question answer:', error);
      throw new Error('Failed to save question answer');
    }
  }

  async saveFinalReport(
    sessionId: number,
    copilotType: CopilotType | undefined,
    modelName: string,
    finalReport: FinalReport
  ): Promise<void> {
    try {
      await prisma.evaluationResult.create({
        data: {
          sessionId,
          copilotType: copilotType ?? CopilotType.dataModel,
          modelName: modelName,
          evaluationStatus: 'completed',
          verdict: finalReport.verdict,
          overallScore: finalReport.overallScore,
          summary: finalReport.summary,
          detailedAnalysis: finalReport.detailedAnalysis,
          discrepancies: finalReport.discrepancies,
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
      }));
    } catch (error) {
      logger.error('Error getting questions by session ID:', error);
      return null;
    }
  }
}

export const evaluationPersistenceService = new EvaluationPersistenceService();
