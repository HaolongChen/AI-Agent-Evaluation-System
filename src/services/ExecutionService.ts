import { prisma } from '../config/prisma.ts';
import { SESSION_STATUS } from '../config/constants.ts';
import type { CopilotType } from '../../build/generated/prisma/enums.ts';
import { logger } from '../utils/logger.ts';
import { goldenSetService } from './GoldenSetService.ts';
import { REVERSE_COPILOT_TYPES } from '../config/constants.ts';
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
  async createEvaluationSession(
    projectExId: string,
    schemaExId: string,
    copilotType: CopilotType,
    modelName: string,
    options?: {
      skipHumanReview?: boolean;
      skipHumanEvaluation?: boolean;
    }
  ) {
    try {
      const USE_KUBERNETES_JOBS = RUN_KUBERNETES_JOBS;
      const skipHumanReview = options?.skipHumanReview ?? true;
      const skipHumanEvaluation = options?.skipHumanEvaluation ?? true;
      const resolvedModelName = normalizeRequestedModelName(modelName);

      const goldenSets = await goldenSetService.getGoldenSets(
        projectExId,
        schemaExId,
        REVERSE_COPILOT_TYPES[copilotType]
      );
      if (!goldenSets || goldenSets.length === 0) {
        throw new Error('No golden sets found');
      }
      if (goldenSets.length > 1) {
        throw new Error('Multiple golden sets found, expected only one');
      }
      const goldenSet = goldenSets[0];
      if (!goldenSet) {
        throw new Error('Golden set is undefined');
      }
      if (USE_KUBERNETES_JOBS) {
        const evalJobResult = (await applyAndWatchJob(
          `evaluation-job-${projectExId}-${schemaExId}-${Date.now()}`,
          'default',
          './src/jobs/EvaluationJobRunner.ts',
          300000,
          'evaluation',
          projectExId,
          WS_URL,
          goldenSet.query
        )) as unknown as EvalJobResult;
        logger.info(
          'Evaluation job completed with status:',
          evalJobResult.status
        );
        if (evalJobResult.status !== 'succeeded') {
          throw new Error('Evaluation job failed');
        }
        const genJobResult = (await applyAndWatchJob(
          `rubric-job-${projectExId}-${schemaExId}-${Date.now()}`,
          'default',
          './src/jobs/RubricGenerationJobRunner.ts',
          300000,
          'generation',
          String(goldenSet.id),
          projectExId,
          schemaExId,
          String(copilotType),
          goldenSet.query,
          '',
          evalJobResult.editableText || '',
          resolvedModelName,
          String(skipHumanReview),
          String(skipHumanEvaluation)
        )) as unknown as GenJobResult;
        logger.info(
          'Rubric generation job completed with status:',
          genJobResult.status
        );
        return genJobResult;
      } else {
        const evalJobRunner = new EvaluationJobRunner(
          projectExId,
          WS_URL,
          goldenSet.query
        );
        evalJobRunner.startJob();
        const { editableText } = await evalJobRunner.waitForCompletion();
        logger.info('Evaluation job completed with response:', editableText);
        const genJobRunner = new RubricGenerationJobRunner(
          goldenSet.id,
          projectExId,
          schemaExId,
          copilotType,
          goldenSet.query,
          '',
          editableText,
          resolvedModelName,
          skipHumanReview,
          skipHumanEvaluation
        );
        genJobRunner.startJob();
        const genResult = await genJobRunner.waitForCompletion();
        logger.info(
          'Rubric generation job completed with response:',
          genResult
        );
        return { candidateOutput: editableText, ...genResult };
      }
    } catch (error) {
      logger.error('Error creating evaluation session:', error);
      throw new Error('Failed to create evaluation session');
    }
  }

  async createEvaluationSessions(options?: {
    skipHumanReview?: boolean;
    skipHumanEvaluation?: boolean;
  }) {
    try {
      const USE_KUBERNETES_JOBS = RUN_KUBERNETES_JOBS;
      // Bulk execution defaults to fully automated evaluation
      const skipHumanReview = options?.skipHumanReview ?? true;
      const skipHumanEvaluation = options?.skipHumanEvaluation ?? true;
      const resolvedModelName = normalizeRequestedModelName(undefined);

      const goldenSets = await goldenSetService.getGoldenSets();
      if (!goldenSets || goldenSets.length === 0) {
        throw new Error('No golden sets found');
      }

      logger.info(
        `Creating ${goldenSets.length} evaluation sessions concurrently`
      );

      if (USE_KUBERNETES_JOBS) {
        const results = await Promise.allSettled(
          goldenSets.map(async (goldenSet) => {
            const evalJobResult = (await applyAndWatchJob(
              `evaluation-job-${goldenSet.projectExId}-${
                goldenSet.schemaExId
              }-${Date.now()}`,
              'default',
              './src/jobs/EvaluationJobRunner.ts',
              300000,
              'evaluation',
              goldenSet.projectExId,
              WS_URL,
              goldenSet.query
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
              }-${Date.now()}`,
              'default',
              './src/jobs/RubricGenerationJobRunner.ts',
              300000,
              'generation',
              String(goldenSet.id),
              goldenSet.projectExId,
              goldenSet.schemaExId,
              String(goldenSet.copilotType as unknown as CopilotType),
              goldenSet.query,
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

        // return {
        //   successful: successful.map((r) =>
        //     r.status === 'fulfilled' ? r.value : null
        //   ),
        //   failed: failed.map((r, index) => ({
        //     goldenSet: goldenSets[successful.length + index],
        //     error: r.status === 'rejected' ? r.reason : null,
        //   })),
        //   summary: {
        //     total: goldenSets.length,
        //     successCount: successful.length,
        //     failureCount: failed.length,
        //   },
        // };
      } else {
        const results = await Promise.allSettled(
          goldenSets.map(async (goldenSet) => {
            const evalJobRunner = new EvaluationJobRunner(
              goldenSet.projectExId,
              WS_URL,
              goldenSet.query
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
              goldenSet.copilotType as unknown as CopilotType,
              goldenSet.query,
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

        // return {
        //   successful: successful.map((r) =>
        //     r.status === "fulfilled" ? r.value : null
        //   ),
        //   failed: failed.map((r, index) => ({
        //     goldenSet: goldenSets[successful.length + index],
        //     error: r.status === "rejected" ? r.reason : null,
        //   })),
        //   summary: {
        //     total: goldenSets.length,
        //     successCount: successful.length,
        //     failureCount: failed.length,
        //   },
        // };
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
          rubric: true,
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
          rubric: true,
          result: true,
        },
        orderBy: { startedAt: 'desc' },
      });
    } catch (error) {
      logger.error('Error fetching evaluation sessions:', error);
      throw new Error('Failed to fetch evaluation sessions');
    }
  }
}

export const executionService = new ExecutionService();
