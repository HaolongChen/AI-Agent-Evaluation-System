import { prisma } from '../config/prisma.ts';
import { SESSION_STATUS } from '../config/constants.ts';
import type { CopilotType } from '../generated/prisma/index.ts';
import { logger } from '../utils/logger.ts';
import { goldenSetService } from './GoldenSetService.ts';
import { REVERSE_COPILOT_TYPES } from '../config/constants.ts';
import { WS_URL } from '../config/env.ts';
import { applyAndWatchJob } from '../kubernetes/utils/apply-from-file.ts';
import { EvaluationJobRunner } from '../jobs/EvaluationJobRunner.ts';
import { RUN_KUBERNETES_JOBS } from '../config/env.ts';

export class ExecutionService {
  async createEvaluationSession(
    projectExId: string,
    schemaExId: string,
    copilotType: CopilotType
    // modelName: string
  ) {
    try {
      const USE_KUBERNETES_JOBS = RUN_KUBERNETES_JOBS;

      const goldenSets = await goldenSetService.getGoldenSets(
        undefined,
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
        const response = await applyAndWatchJob(
          `evaluation-job-${projectExId}-${schemaExId}-${Date.now()}`,
          'default',
          './src/jobs/EvaluationJobRunner.ts',
          300000,
          projectExId,
          WS_URL,
          goldenSet.promptTemplate
        );
        logger.info('Evaluation job started with response:', response);
        return response;
      } else {
        const jobRunner = new EvaluationJobRunner(
          projectExId,
          WS_URL,
          goldenSet.promptTemplate
        );
        jobRunner.startJob();
        const {response, tasks} = await jobRunner.waitForCompletion();
        logger.info('Evaluation job completed with response:', response);
        return {response, tasks};
      }
      // TODO: access to copilot with each golden set
      // return prisma.evaluationSession.create({
      //   data: {
      //     projectExId: projectExId,
      //     schemaExId: schemaExId,
      //     copilotType: copilotType,
      //     modelName: modelName,
      //     status: SESSION_STATUS.PENDING,
      //   },
      // });
      // and store initial rubric for each job
    } catch (error) {
      logger.error('Error creating evaluation session:', error);
      throw new Error('Failed to create evaluation session');
    }
  }

  async createEvaluationSessions(
    sessions: Array<{
      projectExId: string;
      schemaExId: string;
      copilotType: CopilotType;
    }>
  ) {
    try {
      logger.info(
        `Creating ${sessions.length} evaluation sessions concurrently`
      );

      const results = await Promise.allSettled(
        sessions.map((session) =>
          this.createEvaluationSession(
            session.projectExId,
            session.schemaExId,
            session.copilotType
          )
        )
      );

      const successful = results.filter((r) => r.status === 'fulfilled');
      const failed = results.filter((r) => r.status === 'rejected');

      logger.info(
        `Evaluation sessions created: ${successful.length} successful, ${failed.length} failed`
      );

      if (failed.length > 0) {
        failed.forEach((result, index) => {
          if (result.status === 'rejected') {
            logger.error(`Session ${index + 1} failed:`, result.reason);
          }
        });
      }

      return {
        successful: successful.map((r) =>
          r.status === 'fulfilled' ? r.value : null
        ),
        failed: failed.map((r, index) => ({
          session: sessions[successful.length + index],
          error: r.status === 'rejected' ? r.reason : null,
        })),
        summary: {
          total: sessions.length,
          successCount: successful.length,
          failureCount: failed.length,
        },
      };
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
