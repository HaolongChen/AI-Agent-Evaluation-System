import { v4 as uuidv4 } from 'uuid';
import {
  graph,
  automatedGraph,
  type GraphConfigurable,
} from '../langGraph/agent.ts';
import { Command } from '@langchain/langgraph';
import { prisma } from '../config/prisma.ts';
import { SESSION_STATUS, REVIEW_STATUS } from '../config/constants.ts';
import type { CopilotType } from '../../build/generated/prisma/enums.ts';
import type { Prisma } from '../../build/generated/prisma/client.ts';
import { logger } from '../utils/logger.ts';
import { goldenSetService } from './GoldenSetService.ts';
import { REVERSE_COPILOT_TYPES } from '../config/constants.ts';
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
    projectExId: string,
    schemaExId: string,
    copilotType: CopilotType,
    modelName: string,
    skipHumanReview: boolean = false,
    skipHumanEvaluation: boolean = false
  ): Promise<StartSessionResult> {
    try {
      // Get the golden set for this evaluation
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

      // Create a unique thread ID for this session
      const threadId = uuidv4();

      // Prepare metadata for HITL tracking
      const metadata: SessionMetadata = {
        threadId,
        goldenSetId: goldenSet.id,
        skipHumanReview,
        skipHumanEvaluation,
      };

      // Create the evaluation session in database
      const session = await prisma.evaluationSession.create({
        data: {
          projectExId,
          schemaExId,
          copilotType,
          modelName,
          status: SESSION_STATUS.RUNNING,
          metadata: metadata as unknown as Prisma.InputJsonValue,
        },
      });

      // Prepare initial state for the graph
      const initialState = {
        query: goldenSet.promptTemplate,
        context: JSON.stringify(goldenSet.idealResponse),
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
        projectExId,
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
      await prisma.evaluationSession.update({
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
        await this.saveRubricToDatabase(
          session.id,
          projectExId,
          schemaExId,
          rubricDraftForResponse,
          goldenSet.promptTemplate,
          result.candidateOutput || '',
          modelName
        );
      }

      // If graph completed (no interrupts), save the final report
      if (status === 'completed' && result.finalReport) {
        await this.saveFinalReport(session.id, session, result.finalReport);
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
    feedback: string | undefined,
    reviewerAccountId: string
  ): Promise<RubricReviewResult> {
    try {
      // Get the session to retrieve metadata
      const session = await prisma.evaluationSession.findUnique({
        where: { id: sessionId },
        include: { rubric: true },
      });

      if (!session) {
        throw new Error('Session not found');
      }

      const metadata = session.metadata as SessionMetadata | null;
      if (!metadata || metadata.threadId !== threadId) {
        throw new Error('Thread ID mismatch');
      }

      // Update rubric in database with review status
      if (session.rubric) {
        const updateData: Prisma.adaptiveRubricUpdateInput = {
          reviewStatus: approved
            ? REVIEW_STATUS.APPROVED
            : REVIEW_STATUS.REJECTED,
          reviewedAt: new Date(),
          reviewedBy: reviewerAccountId,
        };

        if (modifiedRubric) {
          updateData.criteria = JSON.parse(
            JSON.stringify(modifiedRubric.criteria)
          );
          updateData.totalWeight = modifiedRubric.totalWeight;
          updateData.version = modifiedRubric.version;
        }

        await prisma.adaptiveRubric.update({
          where: { id: session.rubric.id },
          data: updateData,
        });
      }

      // Prepare human review input for graph resumption
      // This matches the HumanReviewInput interface expected by humanReviewerNode
      const humanReviewInput = {
        approved,
        ...(modifiedRubric && { modifiedRubric }),
        ...(feedback && { feedback }),
      };

      // Resume the graph with human review input
      // Determine provider from session's model name
      const provider = session.modelName.toLowerCase().startsWith('gemini')
        ? 'gemini'
        : 'azure';

      const resumeConfigurable: GraphConfigurable = {
        thread_id: threadId,
        provider,
        model: session.modelName,
        projectExId: session.projectExId,
        skipHumanReview: metadata.skipHumanReview ?? false,
        skipHumanEvaluation: metadata.skipHumanEvaluation ?? false,
      };
      const result = (await graph.invoke(
        new Command({ resume: humanReviewInput }),
        {
          configurable: resumeConfigurable,
        }
      )) as GraphResult;

      // Determine the new status based on interrupt state
      let status: GraphSessionStatus = 'completed';
      let message = 'Evaluation completed successfully';
      let rubricFinalForResponse = result.rubricFinal;

      // Check if graph is interrupted again (waiting for human evaluation)
      if (result.__interrupt__ && result.__interrupt__.length > 0) {
        const interruptValue = result.__interrupt__[0]?.value;
        if (interruptValue?.rubricFinal) {
          status = 'awaiting_human_evaluation';
          message =
            'Graph paused for human evaluation. Call submitHumanEvaluation to continue.';
          rubricFinalForResponse =
            interruptValue.rubricFinal || result.rubricFinal;
        }
      }

      // Update session status
      await prisma.evaluationSession.update({
        where: { id: sessionId },
        data: {
          status:
            status === 'completed'
              ? SESSION_STATUS.COMPLETED
              : SESSION_STATUS.RUNNING,
          ...(status === 'completed' && { completedAt: new Date() }),
        },
      });

      return {
        sessionId,
        threadId,
        status,
        rubricFinal: rubricFinalForResponse,
        message,
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
      // Get the session
      const session = await prisma.evaluationSession.findUnique({
        where: { id: sessionId },
        include: { rubric: true },
      });

      if (!session) {
        throw new Error('Session not found');
      }

      const metadata = session.metadata as SessionMetadata | null;
      if (!metadata || metadata.threadId !== threadId) {
        throw new Error('Thread ID mismatch');
      }

      // Prepare human evaluation input
      // This matches the HumanEvaluationInput interface expected by humanEvaluatorNode
      const humanEvaluationInput = {
        scores,
        overallAssessment,
      };

      // Resume the graph with human evaluation input
      // Determine provider from session's model name
      const provider = session.modelName.toLowerCase().startsWith('gemini')
        ? 'gemini'
        : 'azure';

      const evalConfigurable: GraphConfigurable = {
        thread_id: threadId,
        provider,
        model: session.modelName,
        projectExId: session.projectExId,
        skipHumanReview: metadata.skipHumanReview ?? false,
        skipHumanEvaluation: metadata.skipHumanEvaluation ?? false,
      };
      const result = (await graph.invoke(
        new Command({ resume: humanEvaluationInput }),
        { configurable: evalConfigurable }
      )) as GraphResult;

      // Store the human evaluation in database
      if (session.rubric && result.humanEvaluation) {
        await prisma.adaptiveRubricJudgeRecord.create({
          data: {
            adaptiveRubricId: session.rubric.id,
            evaluatorType: 'human',
            accountId: evaluatorAccountId,
            scores: JSON.parse(JSON.stringify(result.humanEvaluation.scores)),
            overallScore: result.humanEvaluation.overallScore,
            summary: result.humanEvaluation.summary,
          },
        });
      }

      // Store the final report
      if (result.finalReport) {
        await this.saveFinalReport(sessionId, session, result.finalReport);
      }

      // Update session to completed
      await prisma.evaluationSession.update({
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
        finalReport: result.finalReport,
        message: 'Evaluation completed successfully',
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
    projectExId: string,
    schemaExId: string,
    copilotType: CopilotType,
    modelName: string
  ): Promise<{
    sessionId: number;
    threadId: string;
    finalReport: FinalReport | null;
  }> {
    const result = await this.startSession(
      projectExId,
      schemaExId,
      copilotType,
      modelName,
      true, // skipHumanReview
      true // skipHumanEvaluation
    );

    // Get the final state from the automated run
    const session = await prisma.evaluationSession.findUnique({
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
    const session = await prisma.evaluationSession.findUnique({
      where: { id: sessionId },
      include: {
        rubric: {
          include: { judgeRecords: true },
        },
        result: true,
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const metadata = session.metadata as SessionMetadata | null;

    // Determine status based on session state
    let status: GraphSessionStatus = 'pending';
    if (session.status === SESSION_STATUS.COMPLETED) {
      status = 'completed';
    } else if (session.status === SESSION_STATUS.FAILED) {
      status = 'failed';
    } else if (session.rubric) {
      if (session.rubric.reviewStatus === REVIEW_STATUS.PENDING) {
        status = 'awaiting_rubric_review';
      } else if (
        session.rubric.judgeRecords.some((r) => r.evaluatorType === 'human')
      ) {
        status = 'completed';
      } else {
        status = 'awaiting_human_evaluation';
      }
    }

    return {
      sessionId,
      status,
      threadId: metadata?.threadId ?? null,
      rubricDraft: session.rubric
        ? this.transformDbRubricToState(session.rubric)
        : null,
      rubricFinal:
        session.rubric?.reviewStatus === REVIEW_STATUS.APPROVED
          ? this.transformDbRubricToState(session.rubric)
          : null,
      agentEvaluation: session.rubric
        ? this.extractEvaluation(session.rubric.judgeRecords, 'agent')
        : null,
      humanEvaluation: session.rubric
        ? this.extractEvaluation(session.rubric.judgeRecords, 'human')
        : null,
      finalReport: session.result
        ? this.transformResultToFinalReport(session.result)
        : null,
    };
  }

  // Helper methods

  private async saveRubricToDatabase(
    sessionId: number,
    projectExId: string,
    schemaExId: string,
    rubric: Rubric,
    copilotInput: string,
    copilotOutput: string,
    modelName: string
  ): Promise<void> {
    await prisma.adaptiveRubric.create({
      data: {
        projectExId,
        schemaExId,
        sessionId,
        rubricId: rubric.id,
        version: rubric.version,
        criteria: JSON.parse(JSON.stringify(rubric.criteria)),
        totalWeight: rubric.totalWeight,
        copilotInput,
        copilotOutput,
        modelName,
        reviewStatus: REVIEW_STATUS.PENDING,
      },
    });
  }

  private async saveFinalReport(
    sessionId: number,
    session: {
      schemaExId: string;
      copilotType: CopilotType;
      modelName: string;
    },
    finalReport: FinalReport
  ): Promise<void> {
    await prisma.evaluationResult.create({
      data: {
        sessionId,
        schemaExId: session.schemaExId,
        copilotType: session.copilotType,
        modelName: session.modelName,
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
  }

  private transformDbRubricToState(dbRubric: {
    rubricId: string;
    version: string;
    criteria: Prisma.JsonValue;
    totalWeight: Prisma.Decimal;
    createdAt: Date;
    updatedAt: Date;
  }): Rubric {
    return {
      id: dbRubric.rubricId,
      version: dbRubric.version,
      criteria: dbRubric.criteria as unknown as Rubric['criteria'],
      totalWeight: Number(dbRubric.totalWeight),
      createdAt: dbRubric.createdAt.toISOString(),
      updatedAt: dbRubric.updatedAt.toISOString(),
    };
  }

  private extractEvaluation(
    judgeRecords: Array<{
      evaluatorType: string;
      scores: Prisma.JsonValue;
      overallScore: Prisma.Decimal;
      summary: string;
      timestamp: Date;
    }>,
    type: 'agent' | 'human'
  ): Evaluation | null {
    const record = judgeRecords.find((r) => r.evaluatorType === type);
    if (!record) return null;

    return {
      evaluatorType: type,
      scores: record.scores as unknown as Evaluation['scores'],
      overallScore: Number(record.overallScore),
      summary: record.summary,
      timestamp: record.timestamp.toISOString(),
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
