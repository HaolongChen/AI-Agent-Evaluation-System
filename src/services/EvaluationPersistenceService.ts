import { prisma } from '../config/prisma.ts';
import { REVIEW_STATUS } from '../config/constants.ts';
import type {
  Rubric,
  Evaluation,
  FinalReport,
} from '../langGraph/state/state.ts';
import { logger } from '../utils/logger.ts';

/**
 * EvaluationPersistenceService
 *
 * Centralized service for persisting LangGraph evaluation results to the database.
 * Handles saving rubrics, judge records, and final reports from the LangGraph workflow.
 *
 * IMPORTANT: This service persists LangGraph workflow outputs (rubrics, evaluations, reports).
 * The simulationId parameter references copilotSimulation records, which are created by
 * the caller after EvaluationJobRunner completes the remote copilot WebSocket session.
 * copilotSimulation tracks the remote copilot interaction, NOT the LangGraph workflow.
 *
 * Schema Mapping:
 * - adaptiveRubric table represents ONE question/criterion
 *   - title: RubricCriterion.name
 *   - content: RubricCriterion.description
 *   - expectedAnswer: RubricCriterion.isHardConstraint
 *   - weight: RubricCriterion.weight
 *
 * - adaptiveRubricJudgeRecord table represents ONE answer for ONE question
 *   - answer: EvaluationScore.reasoning + evidence
 *   - overallScore: EvaluationScore.score
 *   - comment: Evaluation.summary
 *
 * Note: Due to @unique constraints on simulationId and adaptiveRubricId in the schema,
 * the current implementation stores all criteria/scores as JSON in a single record.
 * A future schema migration could remove these constraints to enable true 1:1 mapping.
 */
export class EvaluationPersistenceService {
  /**
   * Save or update a rubric to the database
   * Maps LangGraph Rubric interface (with criteria array) to Prisma adaptiveRubric model
   * The criteria array is serialized to JSON and stored in the content field
   */
  async saveRubric(
    simulationId: number,
    rubric: Rubric,
    modelProvider?: string
  ): Promise<{ id: number }> {
    try {
      // Serialize criteria to JSON for storage
      const contentJson = JSON.stringify(rubric.criteria);
      // Use first criterion's name as title, or default
      const title = rubric.criteria[0]?.name ?? 'Evaluation Rubric';
      // Use first criterion's weight or totalWeight
      const weight = rubric.criteria[0]?.weight ?? rubric.totalWeight;
      // expectedAnswer based on whether first criterion is hard constraint
      const expectedAnswer = rubric.criteria[0]?.isHardConstraint ?? true;

      // Check if rubric already exists for this simulation (1:1 relation via @unique)
      const existing = await prisma.adaptiveRubric.findUnique({
        where: { simulationId },
        select: { id: true },
      });

      if (existing) {
        await prisma.adaptiveRubric.update({
          where: { id: existing.id },
          data: {
            version: rubric.version,
            title,
            content: contentJson,
            expectedAnswer,
            weight,
            totalWeight: rubric.totalWeight,
            modelProvider: modelProvider ?? null,
            reviewStatus: REVIEW_STATUS.PENDING,
            updatedAt: new Date(),
          },
        });
        return { id: existing.id };
      }

      const created = await prisma.adaptiveRubric.create({
        data: {
          simulationId,
          version: rubric.version,
          title,
          content: contentJson,
          expectedAnswer,
          weight,
          totalWeight: rubric.totalWeight,
          modelProvider: modelProvider ?? null,
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
   * Transform Evaluation (with scores array) to DB format (answer as JSON string)
   */
  private transformEvaluationToDb(evaluation: Evaluation): {
    answer: string;
    comment: string;
  } {
    return {
      answer: JSON.stringify(evaluation.scores),
      comment: evaluation.summary,
    };
  }

  /**
   * Save judge records (agent and human evaluations) from the final report
   * Maps LangGraph Evaluation interface to Prisma adaptiveRubricJudgeRecord model
   */
  async saveJudgeRecordsFromFinalReport(
    adaptiveRubricId: number,
    finalReport: FinalReport
  ): Promise<void> {
    try {
      // Save agent evaluation as judge record if present
      if (finalReport.agentEvaluation) {
        const { answer, comment } = this.transformEvaluationToDb(
          finalReport.agentEvaluation
        );
        await prisma.adaptiveRubricJudgeRecord.create({
          data: {
            adaptiveRubricId,
            evaluatorType: finalReport.agentEvaluation.evaluatorType,
            accountId: null, // null for agent evaluations
            answer,
            comment,
            overallScore: finalReport.agentEvaluation.overallScore,
          },
        });
      }

      // Save human evaluation as judge record if present
      if (finalReport.humanEvaluation) {
        const { answer, comment } = this.transformEvaluationToDb(
          finalReport.humanEvaluation
        );
        await prisma.adaptiveRubricJudgeRecord.create({
          data: {
            adaptiveRubricId,
            evaluatorType: finalReport.humanEvaluation.evaluatorType,
            accountId: finalReport.humanEvaluation.accountId ?? null,
            answer,
            comment,
            overallScore: finalReport.humanEvaluation.overallScore,
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
    answer: string,
    overallScore: number,
    comment?: string | null,
    accountId?: string | null
  ): Promise<void> {
    try {
      await prisma.adaptiveRubricJudgeRecord.create({
        data: {
          adaptiveRubricId,
          evaluatorType,
          accountId: accountId ?? null,
          answer,
          comment: comment ?? null,
          overallScore,
        },
      });
    } catch (error) {
      logger.error('Error saving judge record:', error);
      throw new Error('Failed to save judge record');
    }
  }

  /**
   * Save final report to the database
   * Maps LangGraph FinalReport interface to Prisma evaluationResult model
   */
  async saveFinalReport(
    simulationId: number,
    finalReport: FinalReport
  ): Promise<void> {
    try {
      await prisma.evaluationResult.create({
        data: {
          simulationId,
          evaluationStatus: 'completed',
          verdict: finalReport.verdict,
          overallScore: finalReport.overallScore,
          summary: finalReport.summary,
          discrepancies: finalReport.discrepancies,
          generatedAt: new Date(finalReport.generatedAt),
        },
      });
    } catch (error) {
      logger.error('Error saving final report:', error);
      throw new Error('Failed to save final report');
    }
  }

  /**
   * Get the adaptive rubric ID for a simulation
   */
  async getRubricIdBySimulationId(
    simulationId: number
  ): Promise<number | null> {
    try {
      const rubric = await prisma.adaptiveRubric.findUnique({
        where: { simulationId },
        select: { id: true },
      });
      return rubric?.id ?? null;
    } catch (error) {
      logger.error('Error getting rubric ID by simulation ID:', error);
      return null;
    }
  }
}

export const evaluationPersistenceService = new EvaluationPersistenceService();
