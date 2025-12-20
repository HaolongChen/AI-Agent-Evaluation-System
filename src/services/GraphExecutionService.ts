import { v4 as uuidv4 } from 'uuid';
import {
  graph,
  automatedGraph,
  type GraphConfigurable,
} from '../langGraph/agent.ts';
import { prisma } from '../config/prisma.ts';
import { evaluationPersistenceService } from './EvaluationPersistenceService.ts';
import { SESSION_STATUS, REVIEW_STATUS } from '../config/constants.ts';
import { logger } from '../utils/logger.ts';
import { goldenSetService } from './GoldenSetService.ts';
import type {
  Rubric,
  Evaluation,
  FinalReport,
} from '../langGraph/state/state.ts';

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
 * Interrupt payload structure from LangGraph
 */
interface InterruptInfo {
  value: {
    message?: string;
    rubricDraft?: Rubric;
    rubricFinal?: Rubric;
    query?: string;
    context?: string | null;
    candidateOutput?: string;
  };
  resumable: boolean;
  ns: string[];
}

/**
 * Result from graph.invoke() with potential interrupt info
 */
interface GraphResult {
  query: string;
  context: string;
  candidateOutput: string;
  rubricDraft?: Rubric | null;
  rubricApproved?: boolean;
  rubricFinal?: Rubric | null;
  agentEvaluation?: Evaluation | null;
  humanEvaluation?: Evaluation | null;
  finalReport?: FinalReport | null;
  __interrupt__?: InterruptInfo[];
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
 * Uses callbacks pattern where mutations return immediately after starting or resuming,
 * and the graph pauses at interrupt points waiting for human input.
 */
export class GraphExecutionService {
  /**
   * Start a new evaluation session using LangGraph.
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

      // Create a unique thread ID for this session
      const threadId = uuidv4();

      // Prepare metadata for HITL tracking
      const metadata: SessionMetadata = {
        threadId,
        goldenSetId: goldenSet.id,
        skipHumanReview,
        skipHumanEvaluation,
      };

      // Create the copilot simulation session in database
      const session = await prisma.copilotSimulation.create({
        data: {
          goldenSetId: goldenSet.id,
          modelName,
          status: SESSION_STATUS.PENDING,
          metadata: metadata as object,
        },
      });

      // Build initial state from golden set's user inputs
      const userInputContent =
        goldenSet.userInput.length > 0
          ? JSON.stringify(goldenSet.userInput[0]?.content ?? {})
          : '';
      const copilotOutputText =
        goldenSet.copilotOutput.length > 0
          ? goldenSet.copilotOutput[0]?.editableText ?? ''
          : '';

      // Prepare initial state for the graph
      const initialState = {
        query: userInputContent,
        context: copilotOutputText,
        candidateOutput: '',
      };

      // Choose graph based on whether we need interrupts
      const graphToUse =
        skipHumanReview && skipHumanEvaluation ? automatedGraph : graph;

      // Determine provider from model name (gemini models start with 'gemini', otherwise azure)
      const provider = modelName.toLowerCase().startsWith('gemini')
        ? 'gemini'
        : 'azure';

      // Start the graph execution - it will pause at first interrupt
      const configurable: GraphConfigurable = {
        thread_id: threadId,
        provider,
        model: modelName,
        goldenSetId: goldenSet.id,
        skipHumanReview,
        skipHumanEvaluation,
      };
      const result = (await graphToUse.invoke(initialState, {
        configurable,
      })) as GraphResult;

      // Determine the current status based on whether graph is interrupted
      let status: GraphSessionStatus = 'completed';
      let message = 'Evaluation completed successfully';
      let rubricDraftForResponse = result.rubricDraft;

      // Check if graph is interrupted (paused waiting for human input)
      if (result.__interrupt__ && result.__interrupt__.length > 0) {
        const interruptValue = result.__interrupt__[0]?.value;

        // Determine which interrupt point based on interrupt payload
        if (interruptValue?.rubricDraft && !interruptValue?.rubricFinal) {
          status = 'awaiting_rubric_review';
          message =
            'Graph paused for rubric review. Call submitRubricReview to continue.';
          // Use rubric from interrupt value as it's what the human needs to review
          rubricDraftForResponse =
            interruptValue.rubricDraft || result.rubricDraft;
        } else if (interruptValue?.rubricFinal) {
          status = 'awaiting_human_evaluation';
          message =
            'Graph paused for human evaluation. Call submitHumanEvaluation to continue.';
        }
      }

      // Update session with current status
      await prisma.copilotSimulation.update({
        where: { id: session.id },
        data: {
          status:
            status === 'completed'
              ? SESSION_STATUS.COMPLETED
              : SESSION_STATUS.RUNNING,
          ...(status === 'completed' && { completedAt: new Date() }),
        },
      });

      // If rubric draft was created, save it to database
      if (rubricDraftForResponse) {
        await evaluationPersistenceService.saveRubric(
          session.id,
          rubricDraftForResponse,
          modelName
        );
      }

      // If graph completed (no interrupts), save the final report
      if (status === 'completed' && result.finalReport) {
        await evaluationPersistenceService.saveFinalReport(
          session.id,
          result.finalReport
        );

        // Save judge records (agent and human evaluations) if rubric exists
        if (rubricDraftForResponse) {
          const rubricId =
            await evaluationPersistenceService.getRubricIdBySimulationId(
              session.id
            );
          if (rubricId) {
            await evaluationPersistenceService.saveJudgeRecordsFromFinalReport(
              rubricId,
              result.finalReport
            );
          }
        }
      }

      return {
        sessionId: session.id,
        threadId,
        status,
        rubricDraft: rubricDraftForResponse,
        message,
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
   * Submit rubric review and resume the graph.
   */
  async submitRubricReview(
    sessionId: number,
    threadId: string,
    approved: boolean,
    modifiedRubric: Rubric | undefined,
    _feedback: string | undefined,
    reviewerAccountId: string
  ): Promise<RubricReviewResult> {
    try {
      // Update rubric review status in database
      const rubric = await prisma.adaptiveRubric.findUnique({
        where: { simulationId: sessionId },
      });

      if (rubric) {
        await prisma.adaptiveRubric.update({
          where: { id: rubric.id },
          data: {
            reviewStatus: approved
              ? REVIEW_STATUS.APPROVED
              : REVIEW_STATUS.REJECTED,
            reviewedAt: new Date(),
            reviewedBy: reviewerAccountId,
            ...(modifiedRubric && {
              content: JSON.stringify(modifiedRubric.criteria),
              totalWeight: modifiedRubric.totalWeight,
            }),
          },
        });
      }

      // For now, return a simple result
      // Full graph resumption would require LangGraph checkpoint integration
      return {
        sessionId,
        threadId,
        status: 'awaiting_human_evaluation',
        rubricFinal: modifiedRubric ?? null,
        message: 'Rubric review submitted. Graph paused for human evaluation.',
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
   * Submit human evaluation and resume the graph to completion.
   */
  async submitHumanEvaluation(
    sessionId: number,
    threadId: string,
    scores: Array<{ criterionId: string; score: number; reasoning: string }>,
    overallAssessment: string,
    evaluatorAccountId: string
  ): Promise<HumanEvaluationResult> {
    try {
      // Calculate overall score from individual scores
      const overallScore =
        scores.length > 0
          ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
          : 0;

      // Get the rubric for this session
      const rubric = await prisma.adaptiveRubric.findUnique({
        where: { simulationId: sessionId },
      });

      if (rubric) {
        // Save human evaluation as judge record
        await evaluationPersistenceService.saveJudgeRecord(
          rubric.id,
          'human',
          JSON.stringify(scores),
          overallScore,
          overallAssessment,
          evaluatorAccountId
        );
      }

      // Create final report with workflow-compatible Evaluation format
      const finalReport: FinalReport = {
        verdict:
          overallScore >= 70
            ? 'pass'
            : overallScore >= 50
            ? 'needs_review'
            : 'fail',
        overallScore,
        summary: overallAssessment,
        detailedAnalysis: '',
        agentEvaluation: null,
        humanEvaluation: {
          evaluatorType: 'human',
          accountId: evaluatorAccountId,
          scores: scores.map((s) => ({
            criterionId: s.criterionId,
            score: s.score,
            reasoning: s.reasoning,
          })),
          overallScore,
          summary: overallAssessment,
          timestamp: new Date().toISOString(),
        },
        discrepancies: [],
        auditTrace: [],
        generatedAt: new Date().toISOString(),
      };

      // Save final report
      await evaluationPersistenceService.saveFinalReport(
        sessionId,
        finalReport
      );

      // Update session status
      await prisma.copilotSimulation.update({
        where: { id: sessionId },
        data: {
          status: SESSION_STATUS.COMPLETED,
          completedAt: new Date(),
        },
      });

      return {
        sessionId,
        threadId,
        status: 'completed',
        finalReport,
        message: 'Human evaluation submitted. Evaluation completed.',
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
