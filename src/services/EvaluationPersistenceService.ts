import { prisma } from '../config/prisma.ts';
import { REVIEW_STATUS } from '../config/constants.ts';
import type { Rubric, FinalReport } from '../langGraph/state/state.ts';
import type { CopilotType } from '../../build/generated/prisma/enums.ts';
import { logger } from '../utils/logger.ts';

/**
 * EvaluationPersistenceService
 *
 * Centralized service for persisting LangGraph evaluation results to the database.
 * Handles saving rubrics, judge records, and final reports from the LangGraph workflow.
 */
export class EvaluationPersistenceService {
  /**
   * Save or update a rubric to the database
   */
  async saveRubric(
    sessionId: number,
    rubric: Rubric,
    copilotInput: string,
    copilotOutput: string,
    modelName: string
  ): Promise<{ id: number }> {
    try {
      // Check if rubric already exists for this session (upsert by sessionId)
      const existing = await prisma.adaptiveRubric.findFirst({
        where: { sessionId },
        select: { id: true },
      });

      if (existing) {
        await prisma.adaptiveRubric.update({
          where: { id: existing.id },
          data: {
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
        return { id: existing.id };
      }

      const created = await prisma.adaptiveRubric.create({
        data: {
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
      return { id: created.id };
    } catch (error) {
      logger.error('Error saving rubric to database:', error);
      throw new Error('Failed to save rubric');
    }
  }

  /**
   * Save judge records (agent and human evaluations) from the final report
   */
  async saveJudgeRecordsFromFinalReport(
    adaptiveRubricId: number,
    finalReport: FinalReport
  ): Promise<void> {
    try {
      // Save agent evaluation as judge record if present
      if (finalReport.agentEvaluation) {
        await prisma.adaptiveRubricJudgeRecord.create({
          data: {
            adaptiveRubricId,
            evaluatorType: finalReport.agentEvaluation.evaluatorType,
            accountId: null, // null for agent evaluations
            scores: JSON.parse(
              JSON.stringify(finalReport.agentEvaluation.scores)
            ),
            overallScore: finalReport.agentEvaluation.overallScore,
            summary: finalReport.agentEvaluation.summary,
          },
        });
      }

      // Save human evaluation as judge record if present
      if (finalReport.humanEvaluation) {
        await prisma.adaptiveRubricJudgeRecord.create({
          data: {
            adaptiveRubricId,
            evaluatorType: finalReport.humanEvaluation.evaluatorType,
            accountId: null, // would be set by human evaluator in submitHumanEvaluation
            scores: JSON.parse(
              JSON.stringify(finalReport.humanEvaluation.scores)
            ),
            overallScore: finalReport.humanEvaluation.overallScore,
            summary: finalReport.humanEvaluation.summary,
          },
        });
      }
    } catch (error) {
      logger.error('Error saving judge records from final report:', error);
      throw new Error('Failed to save judge records');
    }
  }

  /**
   * Save a single judge record (typically for human evaluations submitted via HITL)
   */
  async saveJudgeRecord(
    adaptiveRubricId: number,
    evaluatorType: 'agent' | 'human',
    scores: Array<{
      criterionId: string;
      score: number;
      reasoning: string;
      evidence?: string[];
    }>,
    overallScore: number,
    summary: string,
    accountId?: string | null
  ): Promise<void> {
    try {
      await prisma.adaptiveRubricJudgeRecord.create({
        data: {
          adaptiveRubricId,
          evaluatorType,
          accountId: accountId ?? null,
          scores: JSON.parse(JSON.stringify(scores)),
          overallScore,
          summary,
        },
      });
    } catch (error) {
      logger.error('Error saving judge record:', error);
      throw new Error('Failed to save judge record');
    }
  }

  /**
   * Save final report to the database
   */
  async saveFinalReport(
    sessionId: number,
    session: {
      copilotType: CopilotType;
      modelName: string;
    },
    finalReport: FinalReport
  ): Promise<void> {
    try {
      await prisma.evaluationResult.create({
        data: {
          sessionId,
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
    } catch (error) {
      logger.error('Error saving final report:', error);
      throw new Error('Failed to save final report');
    }
  }

  /**
   * Get the adaptive rubric ID for a session
   */
  async getRubricIdBySessionId(sessionId: number): Promise<number | null> {
    try {
      const rubric = await prisma.adaptiveRubric.findFirst({
        where: { sessionId },
        select: { id: true },
      });
      return rubric?.id ?? null;
    } catch (error) {
      logger.error('Error getting rubric ID by session ID:', error);
      return null;
    }
  }
}

export const evaluationPersistenceService = new EvaluationPersistenceService();
