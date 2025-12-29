import { prisma } from '../config/prisma.ts';
import { SESSION_STATUS } from '../config/constants.ts';
import type { CopilotType } from '../../build/generated/prisma/enums.ts';
import { logger } from '../utils/logger.ts';
import { goldenSetService } from './GoldenSetService.ts';
import {
  AZURE_OPENAI_DEPLOYMENT,
  GEMINI_API_KEY,
  GEMINI_MODEL,
  OPENAI_MODEL,
  USES_AZURE_OPENAI,
  WS_URL,
} from '../config/env.ts';
import {
  applyAndWatchJob,
  type EvalJobResult,
  type GenJobResult,
} from '../kubernetes/utils/apply-from-file.ts';
import { EvaluationJobRunner } from '../jobs/EvaluationJobRunner.ts';
import { RubricGenerationJobRunner } from '../jobs/RubricGenerationJobRunner.ts';
import { RUN_KUBERNETES_JOBS } from '../config/env.ts';

const resolveDefaultModelName = (): string => {
  // Prefer Azure deployment when Azure is configured; otherwise fall back to Gemini if available.
  if (USES_AZURE_OPENAI) return AZURE_OPENAI_DEPLOYMENT || OPENAI_MODEL;
  if (GEMINI_API_KEY) return GEMINI_MODEL;
  // Last resort: still prefer OpenAI model string (will require Azure env in LangGraph).
  return AZURE_OPENAI_DEPLOYMENT || OPENAI_MODEL;
};

const normalizeRequestedModelName = (modelName: string | undefined): string => {
  if (!modelName) return resolveDefaultModelName();
  // Historical alias used in some call sites; not a real Azure deployment name.
  if (modelName === 'copilot-latest') return resolveDefaultModelName();
  return modelName;
};

export class ExecutionService {
  async createEvaluationSessions(
    goldenSetId: number,
    options?: {
      skipHumanReview?: boolean;
      skipHumanEvaluation?: boolean;
    }
  ) {
    try {
      const USE_KUBERNETES_JOBS = RUN_KUBERNETES_JOBS;
      // Bulk execution defaults to fully automated evaluation
      const skipHumanReview = options?.skipHumanReview ?? true;
      const skipHumanEvaluation = options?.skipHumanEvaluation ?? true;
      const resolvedModelName = normalizeRequestedModelName(undefined);

      const goldenSet = await goldenSetService.getGoldenSet(goldenSetId);
      if (!goldenSet) {
        throw new Error('No golden set found');
      }

      logger.info(
        `Creating ${goldenSet.userInput.length - goldenSet.copilotOutput.length} evaluation sessions concurrently`
      );

      if (USE_KUBERNETES_JOBS) {
        await this.setGoldenSetActive(goldenSetId, true);
        const results = await Promise.allSettled(
          goldenSet.userInput.map(async (userInput, index) => {
            const evalJobResult = (await applyAndWatchJob(
              `evaluation-job-${goldenSet.projectExId}-${
                goldenSet.schemaExId
              }-${index}-${Date.now()}`,
              'default',
              './src/jobs/EvaluationJobRunner.ts',
              300000,
              'evaluation',
              goldenSet.projectExId,
              WS_URL,
              userInput.content
            )) as unknown as EvalJobResult;
            logger.info(
              `Evaluation job for golden set ${goldenSet.id} completed with status:`,
              evalJobResult.status
            );
            if (evalJobResult.status !== 'succeeded') {
              throw new Error(
                `Evaluation job for golden set ${goldenSet.id} failed`
              );
            }
            const genJobResult = (await applyAndWatchJob(
              `rubric-job-${goldenSet.projectExId}-${
                goldenSet.schemaExId
              }-${index}-${Date.now()}`,
              'default',
              './src/jobs/RubricGenerationJobRunner.ts',
              300000,
              'generation',
              String(goldenSet.id),
              goldenSet.projectExId,
              goldenSet.schemaExId,
              goldenSet.copilotType,
              userInput.content,
              evalJobResult.editableText || '',
              resolvedModelName,
              String(skipHumanReview),
              String(skipHumanEvaluation)
            )) as unknown as GenJobResult;
            logger.info(
              `Rubric generation job for golden set ${goldenSet.id} completed with status:`,
              genJobResult.status
            );
            return genJobResult;
          })
        );

        const successful = results.filter((r) => r.status === 'fulfilled');
        const failed = results.filter((r) => r.status === 'rejected');

        logger.info(
          `Kubernetes jobs created: ${successful.length} successful, ${failed.length} failed`
        );

        if (failed.length > 0) {
          failed.forEach((result, index) => {
            if (result.status === 'rejected') {
              logger.error(`Job ${index + 1} failed:`, result.reason);
            }
          });
        }
      } else {
        const results = await Promise.allSettled(
          goldenSet.userInput.map(async (userInput) => {
            const evalJobRunner = new EvaluationJobRunner(
              goldenSet.projectExId,
              WS_URL,
              userInput.content
            );
            evalJobRunner.startJob();
            const { editableText } = await evalJobRunner.waitForCompletion();
            logger.info(
              `Evaluation job for golden set ${goldenSet.id} completed with response:`,
              editableText
            );

            const rubricJobRunner = new RubricGenerationJobRunner(
              goldenSet.id,
              goldenSet.projectExId,
              goldenSet.schemaExId,
              goldenSet.copilotType,
              userInput.content,
              '',
              editableText,
              resolvedModelName,
              skipHumanReview,
              skipHumanEvaluation
            );
            rubricJobRunner.startJob();
            const rubricResult = await rubricJobRunner.waitForCompletion();
            logger.info(
              `Rubric generation job for golden set ${goldenSet.id} completed with response:`,
              rubricResult
            );
            return rubricResult;
          })
        );

        const successful = results.filter((r) => r.status === 'fulfilled');
        const failed = results.filter((r) => r.status === 'rejected');

        logger.info(
          `Local evaluation jobs completed: ${successful.length} successful, ${failed.length} failed`
        );

        if (failed.length > 0) {
          failed.forEach((result, index) => {
            if (result.status === 'rejected') {
              logger.error(`Local job ${index + 1} failed:`, result.reason);
            }
          });
        }
      }
    } catch (error) {
      logger.error('Error creating evaluation sessions:', error);
      throw new Error('Failed to create evaluation sessions');
    }
  }

  async getSession(id: string) {
    try {
      return prisma.evaluationSession.findUnique({
        where: { id: parseInt(id) },
        include: {
          rubrics: true,
          result: true,
        },
      });
    } catch (error) {
      logger.error('Error fetching evaluation session:', error);
      throw new Error('Failed to fetch evaluation session');
    }
  }

  async getSessions(filters: {
    schemaExId?: string;
    copilotType?: CopilotType;
    modelName?: string;
    status?: (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];
  }) {
    try {
      return prisma.evaluationSession.findMany({
        where: {
          ...(filters.schemaExId && { schemaExId: filters.schemaExId }),
          ...(filters.copilotType && { copilotType: filters.copilotType }),
          ...(filters.modelName && { modelName: filters.modelName }),
          ...(filters.status && { status: filters.status }),
        },
        include: {
          rubrics: true,
          result: true,
        },
        orderBy: { startedAt: 'desc' },
      });
    } catch (error) {
      logger.error('Error fetching evaluation sessions:', error);
      throw new Error('Failed to fetch evaluation sessions');
    }
  }

  async startEvaluationSession(
    goldenSetId: number,
    modelName?: string,
    options?: {
      skipHumanReview?: boolean;
      skipHumanEvaluation?: boolean;
    }
  ): Promise<{
    sessionId: number;
    threadId: string;
    status: string;
    questionSetDraft?: unknown;
    message: string;
  }> {
    try {
      const skipHumanReview = options?.skipHumanReview ?? false;
      const skipHumanEvaluation = options?.skipHumanEvaluation ?? false;
      const resolvedModelName = normalizeRequestedModelName(modelName);

      const goldenSet = await goldenSetService.getGoldenSet(goldenSetId);
      if (!goldenSet) {
        throw new Error('Golden set not found');
      }

      const firstUserInput = goldenSet.userInput[0];
      if (!firstUserInput) {
        throw new Error('Golden set has no user inputs');
      }

      logger.info(`Starting evaluation session for golden set ${goldenSetId}`);

      const evalJobRunner = new EvaluationJobRunner(
        goldenSet.projectExId,
        WS_URL,
        firstUserInput.content
      );
      evalJobRunner.startJob();
      const { editableText } = await evalJobRunner.waitForCompletion();

      const rubricJobRunner = new RubricGenerationJobRunner(
        goldenSet.id,
        goldenSet.projectExId,
        goldenSet.schemaExId,
        goldenSet.copilotType,
        firstUserInput.content,
        '',
        editableText,
        resolvedModelName,
        skipHumanReview,
        skipHumanEvaluation
      );
      rubricJobRunner.startJob();
      const result = await rubricJobRunner.waitForCompletion();

      if (result.status !== 'succeeded') {
        throw new Error(result.error ?? 'Evaluation session failed');
      }

      return {
        sessionId: result.sessionId ?? 0,
        threadId: result.threadId ?? '',
        status: result.graphStatus ?? 'PENDING',
        questionSetDraft: result.questionSet,
        message: result.message ?? 'Evaluation session started',
      };
    } catch (error) {
      logger.error('Error starting evaluation session:', error);
      throw new Error('Failed to start evaluation session');
    }
  }

  async getSessionWithRubrics(sessionId: number) {
    try {
      return prisma.evaluationSession.findUnique({
        where: { id: sessionId },
        include: { rubrics: true },
      });
    } catch (error) {
      logger.error('Error fetching session with rubrics:', error);
      throw new Error('Failed to fetch session with rubrics');
    }
  }

  async updateSessionStatus(
    sessionId: number,
    status: (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS],
    completedAt?: Date
  ) {
    try {
      return prisma.evaluationSession.update({
        where: { id: sessionId },
        data: {
          status,
          ...(completedAt && { completedAt }),
        },
      });
    } catch (error) {
      logger.error('Error updating session status:', error);
      throw new Error('Failed to update session status');
    }
  }

  async setGoldenSetActive(goldenSetId: number, isActive: boolean) {
    try {
      return prisma.goldenSet.update({
        where: { id: goldenSetId },
        data: { isActive },
      });
    } catch (error) {
      logger.error('Error setting golden set active status:', error);
      throw new Error('Failed to set golden set active status');
    }
  }
}

export const executionService = new ExecutionService();
