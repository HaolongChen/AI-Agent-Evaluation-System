import { prisma } from '../config/prisma.ts';
import { logger } from '../utils/logger.ts';
import { executionService } from './ExecutionService.ts';
import { goldenSetService } from './GoldenSetService.ts';
import { rubricService } from './RubricService.ts';
import { REVERSE_COPILOT_TYPES } from '../config/constants.ts';
import { analyticsService } from './AnalyticsService.ts';

export class JudgeService {
  async createJudgeRecord(
    adaptiveRubricId: string,
    accountId: string,
    result: boolean[],
    confidenceScore: number[],
    notes?: string
  ) {
    try {
      const createRecord = async () => {
        const finalRecord = await prisma.adaptiveRubricJudgeRecord.create({
          data: {
            adaptiveRubricId: parseInt(adaptiveRubricId),
            accountId: accountId,
            result,
            confidenceScore: confidenceScore ?? [],
            notes: notes ?? null,
          },
        });
        return finalRecord;
      };
      const createResult = async () => {
        const rubric = await rubricService.getRubricById(adaptiveRubricId);
        if (!rubric) {
          throw new Error('Rubric not found for updating judge records');
        }
        const session = await executionService.getSession(
          rubric.sessionId.toString()
        );
        if (!session) {
          throw new Error(
            'Evaluation session not found for updating judge records'
          );
        }

        if (!session.copilotType) {
          throw new Error('Copilot type not found in session');
        }

        const copilotType = REVERSE_COPILOT_TYPES[session.copilotType];
        if (!copilotType) {
          throw new Error('Invalid copilot type in session');
        }

        const originalGoldenSet = await goldenSetService.getGoldenSets(
          rubric.projectExId,
          rubric.schemaExId,
          copilotType
        );
        if (originalGoldenSet.length !== 1 || !originalGoldenSet[0]) {
          throw new Error(
            'Original golden set not found or ambiguous for updating judge records'
          );
        }
        if (originalGoldenSet[0].nextGoldenSetId) {
          const newGoldenSet =
            await goldenSetService.simplyUpdateGoldenSetProject(
              rubric.projectExId,
              rubric.schemaExId,
              copilotType,
              originalGoldenSet[0].description ?? '',
              originalGoldenSet[0].promptTemplate ?? '',
              (originalGoldenSet[0].idealResponse as object) ?? {}
            );
          logger.info('Updated golden set with new ID:', newGoldenSet.id);
        }
        const finalResult = await analyticsService.createEvaluationResult(
          session.id.toString(),
          rubric.schemaExId,
          session.copilotType,
          session.modelName,
          {
            judgeResult: result,
            confidenceScore: confidenceScore,
            // TODO: implement metrics
          },
          result.filter((r) => r).length / result.length
        );
        return finalResult;

      };
      const finalRecord = await createRecord();
      const finalResult = await createResult();
      return { finalRecord, finalResult };
    } catch (error) {
      logger.error('Error creating judge record:', error);
      throw new Error('Failed to create judge record');
    }
  }

  async getJudgeRecordsByRubric(rubricId: string) {
    try {
      return prisma.adaptiveRubricJudgeRecord.findMany({
        where: {
          adaptiveRubricId: parseInt(rubricId),
        },
        orderBy: { judgedAt: 'desc' },
      });
    } catch (error) {
      logger.error('Error fetching judge records by rubric:', error);
      throw new Error('Failed to fetch judge records by rubric');
    }
  }
}

export const judgeService = new JudgeService();
