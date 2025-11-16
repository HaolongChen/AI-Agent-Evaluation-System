import { prisma } from '../config/prisma.ts';
import { SESSION_STATUS } from '../config/constants.ts';
import type { CopilotType } from '../generated/prisma/index.ts';
import { logger } from '../utils/logger.ts';
import { goldenSetService } from './GoldenSetService.ts';
import { REVERSE_COPILOT_TYPES } from '../config/constants.ts';
import { WS_URL } from '../config/env.ts';
import { applyAndWatchJob } from '../kubernetes/utils/apply-from-file.ts';
import type { JobResult } from '../kubernetes/utils/apply-from-file.ts';
import { RUN_KUBERNETES_JOBS } from '../config/env.ts';
import { RubricGenerationJobRunner } from '../jobs/RubricGenerationJobRunner.ts';
import type { RubricGenerationJobResult } from '../jobs/RubricGenerationJobRunner.ts';
import type { copilotType } from '../utils/types.ts';

export class ExecutionService {
  async createEvaluationSession(
    projectExId: string,
    schemaExId: string,
    copilotType: CopilotType,
    modelName?: string
  ): Promise<JobResult | RubricGenerationJobResult> {
    try {
      const USE_KUBERNETES_JOBS = RUN_KUBERNETES_JOBS;

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
        const jobResult = await applyAndWatchJob(
          `rubric-job-${projectExId}-${schemaExId}-${Date.now()}`,
          'default',
          './src/jobs/RubricGenerationJobRunner.ts',
          300000,
          String(goldenSet.id),
          projectExId,
          schemaExId,
          goldenSet.copilotType,
          WS_URL,
          modelName ?? 'copilot-latest'
        );
        logger.info(
          'Rubric generation job completed with status:',
          jobResult.status
        );
        return jobResult;
      }

      const jobRunner = new RubricGenerationJobRunner({
        goldenSetId: goldenSet.id,
        projectExId: goldenSet.projectExId,
        schemaExId: goldenSet.schemaExId,
        copilotType: goldenSet.copilotType as copilotType,
        wsUrl: WS_URL,
        ...(modelName ? { modelName } : {}),
      });
      return jobRunner.run();
    } catch (error) {
      logger.error('Error creating evaluation session:', error);
      throw new Error('Failed to create evaluation session');
    }
  }

  async createEvaluationSessions() {
    try {
      const USE_KUBERNETES_JOBS = RUN_KUBERNETES_JOBS;

      const goldenSets = await goldenSetService.getGoldenSets();
      if (!goldenSets || goldenSets.length === 0) {
        throw new Error('No golden sets found');
      }

      logger.info(
        `Creating ${goldenSets.length} evaluation sessions concurrently`
      );

      if (USE_KUBERNETES_JOBS) {
        const results = await Promise.allSettled(
          goldenSets.map((goldenSet) =>
            applyAndWatchJob(
              `rubric-job-${goldenSet.projectExId}-${
                goldenSet.schemaExId
              }-${Date.now()}`,
              'default',
              './src/jobs/RubricGenerationJobRunner.ts',
              300000,
              String(goldenSet.id),
              goldenSet.projectExId,
              goldenSet.schemaExId,
              goldenSet.copilotType,
              WS_URL,
              'copilot-latest'
            )
          )
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

        return {
          successful: successful.map((r) =>
            r.status === 'fulfilled' ? r.value : null
          ),
          failed: failed.map((r, index) => ({
            goldenSet: goldenSets[successful.length + index],
            error: r.status === 'rejected' ? r.reason : null,
          })),
          summary: {
            total: goldenSets.length,
            successCount: successful.length,
            failureCount: failed.length,
          },
        };
      } else {
        const jobRunners = goldenSets.map(
          (goldenSet) =>
            new RubricGenerationJobRunner({
              goldenSetId: goldenSet.id,
              projectExId: goldenSet.projectExId,
              schemaExId: goldenSet.schemaExId,
              copilotType: goldenSet.copilotType as copilotType,
              wsUrl: WS_URL,
            })
        );

        const results = await Promise.allSettled(
          jobRunners.map((runner) => runner.run())
        );

        const successful = results.filter((r) => r.status === 'fulfilled');
        const failed = results.filter((r) => r.status === 'rejected');

        logger.info(
          `Evaluation jobs completed: ${successful.length} successful, ${failed.length} failed`
        );

        if (failed.length > 0) {
          failed.forEach((result, index) => {
            if (result.status === 'rejected') {
              logger.error(`Job ${index + 1} failed:`, result.reason);
            }
          });
        }

        return {
          successful: successful.map((r) =>
            r.status === 'fulfilled' ? r.value : null
          ),
          failed: failed.map((r, index) => ({
            goldenSet: goldenSets[successful.length + index],
            error: r.status === 'rejected' ? r.reason : null,
          })),
          summary: {
            total: goldenSets.length,
            successCount: successful.length,
            failureCount: failed.length,
          },
        };
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

  async updateSessionStatus(
    sessionId: string,
    status: (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS],
    metrics?: {
      totalLatencyMs?: number;
      roundtripCount?: number;
      inputTokens?: number;
      outputTokens?: number;
      contextPercentage?: number;
      metadata?: object;
    }
  ) {
    try {
      return prisma.evaluationSession.update({
        where: { id: parseInt(sessionId) },
        data: {
          status,
          ...(status === SESSION_STATUS.COMPLETED && {
            completedAt: new Date(),
          }),
          ...(metrics && {
            totalLatencyMs: metrics.totalLatencyMs,
            roundtripCount: metrics.roundtripCount,
            inputTokens: metrics.inputTokens,
            outputTokens: metrics.outputTokens,
            contextPercentage: metrics.contextPercentage,
            metadata: metrics.metadata,
          }),
        },
      });
    } catch (error) {
      logger.error('Error updating evaluation session status:', error);
      throw new Error('Failed to update evaluation session status');
    }
  }
}

export const executionService = new ExecutionService();
