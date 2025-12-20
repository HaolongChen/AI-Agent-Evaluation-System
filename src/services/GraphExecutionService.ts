import { prisma } from '../config/prisma.ts';
import { SESSION_STATUS, REVIEW_STATUS } from '../config/constants.ts';
import { logger } from '../utils/logger.ts';
import { goldenSetService } from './GoldenSetService.ts';
import { RUN_KUBERNETES_JOBS } from '../config/env.ts';
import {
  RubricGenerationJobRunner,
  type RubricGenerationResult,
} from '../jobs/RubricGenerationJobRunner.ts';
import {
  RubricReviewJobRunner,
  type RubricReviewJobResult,
} from '../jobs/RubricReviewJobRunner.ts';
import {
  HumanEvaluationJobRunner,
  type HumanEvaluationJobResult,
} from '../jobs/HumanEvaluationJobRunner.ts';
import {
  applyAndWatchJob,
  type GenJobResult,
  type RubricReviewK8sJobResult,
  type HumanEvaluationK8sJobResult,
} from '../kubernetes/utils/apply-from-file.ts';
import type {
  Rubric,
  Evaluation,
  FinalReport,
} from '../langGraph/state/state.ts';

// Kubernetes namespace for jobs
const K8S_NAMESPACE = process.env['KUBERNETES_NAMESPACE'] || 'ai-evaluation';
// Path to job runner scripts for K8s execution
const RUBRIC_GENERATION_JOB_SCRIPT_PATH =
  'src/jobs/RubricGenerationJobRunner.ts';
const RUBRIC_REVIEW_JOB_SCRIPT_PATH = 'src/jobs/RubricReviewJobRunner.ts';
const HUMAN_EVALUATION_JOB_SCRIPT_PATH = 'src/jobs/HumanEvaluationJobRunner.ts';

/**
 * Session state indicating where the graph is paused
 */
export type GraphSessionStatus =
  | 'pending'
  | 'awaiting_rubric_review'
  | 'awaiting_human_evaluation'
  | 'completed'
  | 'failed';

/**
 * Metadata stored in session for HITL tracking
 */
interface SessionMetadata {
  threadId: string;
  goldenSetId?: number;
  skipHumanReview?: boolean;
  skipHumanEvaluation?: boolean;
}

/**
 * Result returned when starting a graph session
 */
export interface StartSessionResult {
  sessionId: number;
  threadId: string;
  status: GraphSessionStatus;
  rubricDraft?: Rubric | null | undefined;
  message: string;
}

/**
 * Result returned when resuming with rubric review
 */
export interface RubricReviewResult {
  sessionId: number;
  threadId: string;
  status: GraphSessionStatus;
  rubricFinal?: Rubric | null | undefined;
  message: string;
}

/**
 * Result returned when resuming with human evaluation
 */
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
 * Uses job runners for execution - either directly or via Kubernetes jobs.
 */
export class GraphExecutionService {
  /**
   * Start a new evaluation session using LangGraph via job runners.
   * The graph will pause at the first interrupt point (humanReviewer).
   */
  async startSession(
    goldenSetId: number,
    modelName: string,
    skipHumanReview: boolean = false,
    skipHumanEvaluation: boolean = false
  ): Promise<StartSessionResult> {
    try {
      // Get the golden set for this evaluation
      const goldenSet = await goldenSetService.getGoldenSetById(goldenSetId);

      if (!goldenSet) {
        throw new Error('Golden set not found');
      }

      // Build initial state from golden set's user inputs
      const userInputContent =
        goldenSet.userInput.length > 0
          ? JSON.stringify(goldenSet.userInput[0]?.content ?? {})
          : '';
      const copilotOutputText =
        goldenSet.copilotOutput.length > 0
          ? goldenSet.copilotOutput[0]?.editableText ?? ''
          : '';

      let result: RubricGenerationResult;

      if (RUN_KUBERNETES_JOBS) {
        // Run as Kubernetes job
        const jobName = `rubric-gen-${goldenSetId}-${Date.now()}`;
        logger.info(`Running rubric generation as K8s job: ${jobName}`);

        const k8sResult = (await applyAndWatchJob(
          jobName,
          K8S_NAMESPACE,
          RUBRIC_GENERATION_JOB_SCRIPT_PATH,
          300000, // 5 minute timeout
          'generation',
          String(goldenSetId),
          userInputContent,
          copilotOutputText,
          '', // candidateOutput
          modelName,
          String(skipHumanReview),
          String(skipHumanEvaluation)
        )) as GenJobResult;

        if (k8sResult.status === 'failed') {
          throw new Error(
            `K8s rubric generation job failed: ${
              k8sResult.reason || k8sResult.error || 'Unknown error'
            }`
          );
        }

        if (!k8sResult.sessionId || !k8sResult.threadId) {
          throw new Error(
            'K8s rubric generation job succeeded but missing sessionId or threadId'
          );
        }

        result = {
          status: 'succeeded',
          sessionId: k8sResult.sessionId,
          threadId: k8sResult.threadId,
          graphStatus:
            (k8sResult.graphStatus as RubricGenerationResult['graphStatus']) ||
            'completed',
          ...(k8sResult.message && { message: k8sResult.message }),
          ...(k8sResult.rubric !== undefined && { rubric: k8sResult.rubric }),
          ...(k8sResult.evaluationScore !== undefined && {
            evaluationScore: k8sResult.evaluationScore,
          }),
          ...(k8sResult.finalReport !== undefined && {
            finalReport: k8sResult.finalReport,
          }),
          ...(k8sResult.error && { error: k8sResult.error }),
        };
      } else {
        // Run directly in-process using job runner
        const jobRunner = new RubricGenerationJobRunner(
          goldenSetId,
          userInputContent,
          copilotOutputText,
          '', // candidateOutput
          modelName,
          skipHumanReview,
          skipHumanEvaluation
        );

        jobRunner.startJob();
        result = await jobRunner.waitForCompletion();
      }

      if (result.status === 'failed') {
        throw new Error(result.error || 'Rubric generation failed');
      }

      // Map graphStatus to GraphSessionStatus
      let status: GraphSessionStatus;
      switch (result.graphStatus) {
        case 'awaiting_rubric_review':
          status = 'awaiting_rubric_review';
          break;
        case 'awaiting_human_evaluation':
          status = 'awaiting_human_evaluation';
          break;
        case 'completed':
        default:
          status = 'completed';
          break;
      }

      return {
        sessionId: result.sessionId!,
        threadId: result.threadId!,
        status,
        rubricDraft: result.rubric,
        message: result.message || 'Session started successfully',
      };
    } catch (error) {
      logger.error('Error starting graph session:', error);
      throw new Error(
        `Failed to start evaluation session: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Submit rubric review and resume the graph via job runners.
   */
  async submitRubricReview(
    sessionId: number,
    threadId: string,
    approved: boolean,
    modifiedRubric: Rubric | undefined,
    feedback: string | undefined,
    reviewerAccountId: string
  ): Promise<RubricReviewResult> {
    try {
      let result: RubricReviewJobResult;

      if (RUN_KUBERNETES_JOBS) {
        // Run as Kubernetes job
        const jobName = `rubric-review-${sessionId}-${Date.now()}`;
        logger.info(`Running rubric review as K8s job: ${jobName}`);

        const k8sResult = (await applyAndWatchJob(
          jobName,
          K8S_NAMESPACE,
          RUBRIC_REVIEW_JOB_SCRIPT_PATH,
          300000, // 5 minute timeout
          'rubric-review',
          String(sessionId),
          threadId,
          String(approved),
          reviewerAccountId,
          modifiedRubric ? JSON.stringify(modifiedRubric) : 'null',
          feedback || ''
        )) as RubricReviewK8sJobResult;

        if (k8sResult.status === 'failed') {
          throw new Error(
            `K8s rubric review job failed: ${
              k8sResult.reason || k8sResult.error || 'Unknown error'
            }`
          );
        }

        if (!k8sResult.sessionId || !k8sResult.threadId) {
          throw new Error(
            'K8s rubric review job succeeded but missing sessionId or threadId'
          );
        }

        result = {
          status: 'succeeded',
          sessionId: k8sResult.sessionId,
          threadId: k8sResult.threadId,
          graphStatus:
            (k8sResult.graphStatus as RubricReviewJobResult['graphStatus']) ||
            'completed',
          ...(k8sResult.message && { message: k8sResult.message }),
          ...(k8sResult.rubricFinal !== undefined && {
            rubricFinal: k8sResult.rubricFinal,
          }),
          ...(k8sResult.finalReport !== undefined && {
            finalReport: k8sResult.finalReport,
          }),
          ...(k8sResult.error && { error: k8sResult.error }),
        };
      } else {
        // Run directly in-process using job runner
        const jobRunner = new RubricReviewJobRunner(
          sessionId,
          threadId,
          approved,
          reviewerAccountId,
          modifiedRubric,
          feedback
        );

        jobRunner.startJob();
        result = await jobRunner.waitForCompletion();
      }

      if (result.status === 'failed') {
        throw new Error(result.error || 'Rubric review failed');
      }

      // Map graphStatus to GraphSessionStatus
      const status: GraphSessionStatus =
        result.graphStatus === 'completed'
          ? 'completed'
          : 'awaiting_human_evaluation';

      return {
        sessionId: result.sessionId!,
        threadId: result.threadId!,
        status,
        rubricFinal: result.rubricFinal,
        message: result.message || 'Rubric review submitted successfully',
      };
    } catch (error) {
      logger.error('Error submitting rubric review:', error);
      throw new Error(
        `Failed to submit rubric review: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Submit human evaluation and resume the graph to completion via job runners.
   */
  async submitHumanEvaluation(
    sessionId: number,
    threadId: string,
    scores: Array<{ criterionId: string; score: number; reasoning: string }>,
    overallAssessment: string,
    evaluatorAccountId: string
  ): Promise<HumanEvaluationResult> {
    try {
      let result: HumanEvaluationJobResult;

      if (RUN_KUBERNETES_JOBS) {
        // Run as Kubernetes job
        const jobName = `human-eval-${sessionId}-${Date.now()}`;
        logger.info(`Running human evaluation as K8s job: ${jobName}`);

        const k8sResult = (await applyAndWatchJob(
          jobName,
          K8S_NAMESPACE,
          HUMAN_EVALUATION_JOB_SCRIPT_PATH,
          300000, // 5 minute timeout
          'human-evaluation',
          String(sessionId),
          threadId,
          JSON.stringify(scores),
          overallAssessment,
          evaluatorAccountId
        )) as HumanEvaluationK8sJobResult;

        if (k8sResult.status === 'failed') {
          throw new Error(
            `K8s human evaluation job failed: ${
              k8sResult.reason || k8sResult.error || 'Unknown error'
            }`
          );
        }

        if (!k8sResult.sessionId || !k8sResult.threadId) {
          throw new Error(
            'K8s human evaluation job succeeded but missing sessionId or threadId'
          );
        }

        result = {
          status: 'succeeded',
          sessionId: k8sResult.sessionId,
          threadId: k8sResult.threadId,
          graphStatus: 'completed',
          ...(k8sResult.message && { message: k8sResult.message }),
          ...(k8sResult.finalReport !== undefined && {
            finalReport: k8sResult.finalReport,
          }),
          ...(k8sResult.error && { error: k8sResult.error }),
        };
      } else {
        // Run directly in-process using job runner
        const jobRunner = new HumanEvaluationJobRunner(
          sessionId,
          threadId,
          scores,
          overallAssessment,
          evaluatorAccountId
        );

        jobRunner.startJob();
        result = await jobRunner.waitForCompletion();
      }

      if (result.status === 'failed') {
        throw new Error(result.error || 'Human evaluation failed');
      }

      return {
        sessionId: result.sessionId!,
        threadId: result.threadId!,
        status: 'completed',
        finalReport: result.finalReport,
        message: result.message || 'Human evaluation submitted successfully',
      };
    } catch (error) {
      logger.error('Error submitting human evaluation:', error);
      throw new Error(
        `Failed to submit human evaluation: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Run a fully automated evaluation (no human in the loop)
   */
  async runAutomatedEvaluation(
    goldenSetId: number,
    modelName: string
  ): Promise<{
    sessionId: number;
    threadId: string;
    finalReport: FinalReport | null;
  }> {
    const result = await this.startSession(
      goldenSetId,
      modelName,
      true, // skipHumanReview
      true // skipHumanEvaluation
    );

    // Get the final state from the automated run
    const session = await prisma.copilotSimulation.findUnique({
      where: { id: result.sessionId },
      include: { result: true },
    });

    return {
      sessionId: result.sessionId,
      threadId: result.threadId,
      finalReport: session?.result
        ? this.transformResultToFinalReport(session.result)
        : null,
    };
  }

  /**
   * Get the current state of a graph session
   */
  async getSessionState(sessionId: number): Promise<{
    sessionId: number;
    status: GraphSessionStatus;
    threadId: string | null;
    rubricDraft: Rubric | null;
    rubricFinal: Rubric | null;
    agentEvaluation: Evaluation | null;
    humanEvaluation: Evaluation | null;
    finalReport: FinalReport | null;
  }> {
    const session = await prisma.copilotSimulation.findUnique({
      where: { id: sessionId },
      include: {
        rubric: {
          include: { judgeRecord: true },
        },
        result: true,
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const metadata = session.metadata as SessionMetadata | null;

    // Get first rubric from array (1:N relation but typically 1:1)
    const rubric = session.rubric?.[0];

    // Determine status based on session state
    let status: GraphSessionStatus = 'pending';
    if (session.status === SESSION_STATUS.COMPLETED) {
      status = 'completed';
    } else if (session.status === SESSION_STATUS.FAILED) {
      status = 'failed';
    } else if (rubric) {
      if (rubric.reviewStatus === REVIEW_STATUS.PENDING) {
        status = 'awaiting_rubric_review';
      } else if (rubric.judgeRecord?.evaluatorType === 'human') {
        status = 'completed';
      } else {
        status = 'awaiting_human_evaluation';
      }
    }

    return {
      sessionId,
      status,
      threadId: metadata?.threadId ?? null,
      rubricDraft: rubric ? this.transformDbRubricToState(rubric) : null,
      rubricFinal:
        rubric?.reviewStatus === REVIEW_STATUS.APPROVED
          ? this.transformDbRubricToState(rubric)
          : null,
      agentEvaluation:
        rubric?.judgeRecord?.evaluatorType === 'agent'
          ? this.extractEvaluation(rubric.judgeRecord)
          : null,
      humanEvaluation:
        rubric?.judgeRecord?.evaluatorType === 'human'
          ? this.extractEvaluation(rubric.judgeRecord)
          : null,
      finalReport: session.result
        ? this.transformResultToFinalReport(session.result)
        : null,
    };
  }

  private transformDbRubricToState(dbRubric: {
    id: number;
    version: string;
    title: string;
    content: string;
    expectedAnswer: boolean;
    weights: unknown;
    totalWeight: unknown;
    modelProvider: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Rubric {
    // Parse criteria from JSON content, or create a single criterion from fields
    let criteria;
    try {
      criteria = JSON.parse(dbRubric.content);
    } catch {
      // If content is not JSON, create a single criterion from the DB fields
      criteria = [
        {
          id: String(dbRubric.id),
          name: dbRubric.title,
          description: dbRubric.content,
          weight: Number(dbRubric.weights),
          scoringScale: { min: 0, max: 100 },
          isHardConstraint: dbRubric.expectedAnswer,
        },
      ];
    }

    return {
      id: String(dbRubric.id),
      version: dbRubric.version,
      criteria,
      totalWeight: Number(dbRubric.totalWeight),
      createdAt: dbRubric.createdAt.toISOString(),
      updatedAt: dbRubric.updatedAt.toISOString(),
    };
  }

  private extractEvaluation(judgeRecord: {
    evaluatorType: string;
    accountId: string | null;
    answer: string;
    comment: string | null;
    overallScore: unknown;
    timestamp: Date;
  }): Evaluation {
    // Parse scores from JSON answer
    let scores = [];
    try {
      scores = JSON.parse(judgeRecord.answer);
    } catch {
      scores = [];
    }

    return {
      evaluatorType: judgeRecord.evaluatorType as 'agent' | 'human',
      accountId: judgeRecord.accountId,
      scores,
      overallScore: Number(judgeRecord.overallScore),
      summary: judgeRecord.comment ?? '',
      timestamp: judgeRecord.timestamp.toISOString(),
    };
  }

  private transformResultToFinalReport(result: {
    verdict: string;
    overallScore: unknown;
    summary: string;
    discrepancies: string[];
    generatedAt: Date;
  }): FinalReport {
    return {
      verdict: result.verdict as FinalReport['verdict'],
      overallScore: Number(result.overallScore),
      summary: result.summary,
      detailedAnalysis: '',
      agentEvaluation: null,
      humanEvaluation: null,
      discrepancies: result.discrepancies,
      auditTrace: [],
      generatedAt: result.generatedAt.toISOString(),
    };
  }
}

export const graphExecutionService = new GraphExecutionService();
