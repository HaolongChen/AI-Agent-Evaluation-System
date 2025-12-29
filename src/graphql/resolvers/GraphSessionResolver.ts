import { graphExecutionService } from '../../services/GraphExecutionService.ts';
import { logger } from '../../utils/logger.ts';
import type { QuestionSet, EvaluationQuestion } from '../../langGraph/state/state.ts';


/**
 * Input types matching GraphQL schema - Question-based evaluation
 */
export interface EvaluationQuestionInput {
  id: number;
  title: string;
  content: string;
  expectedAnswer: boolean;
  weight: number;
}

export interface QuestionSetInput {
  id: number;
  version: string;
  questions: EvaluationQuestionInput[];
  totalWeight: number;
}

export interface QuestionPatchInput {
  questionId: number;
  title?: string;
  content?: string;
  expectedAnswer?: boolean;
  weight?: number;
}

export interface QuestionAnswerInput {
  questionId: number;
  answer: boolean;
  explanation: string;
  evidence?: string[];
}

export interface QuestionAnswerPatchInput {
  questionId: number;
  answer?: boolean;
  explanation?: string;
  evidence?: string[];
}

/**
 * Transform QuestionSetInput to QuestionSet (adds timestamps)
 */
function transformQuestionSetInput(
  input: QuestionSetInput | null | undefined
): QuestionSet | undefined {
  if (!input) return undefined;

  const now = new Date().toISOString();
  return {
    version: input.version,
    questions: input.questions.map(
      (q): EvaluationQuestion => ({
        id: q.id,
        title: q.title,
        content: q.content,
        expectedAnswer: q.expectedAnswer,
        weight: q.weight,
      })
    ),
    totalWeight: input.totalWeight,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * GraphSessionResolver
 *
 * Handles HITL (Human-in-the-Loop) graph execution mutations and queries.
 *
 * Flow:
 * 1. startGraphSession - Starts the evaluation, returns when paused at humanReviewer
 * 2. submitRubricReview - Provides rubric review, resumes until humanEvaluator
 * 3. submitHumanEvaluation - Provides evaluation, completes the flow
 *
 * Alternatively:
 * - runAutomatedEvaluation - Runs the entire flow without human intervention
 */
export const graphSessionResolver = {
  Query: {
    /**
     * Get the current state of a graph session
     */
    getGraphSessionState: async (_: unknown, args: { sessionId: number }) => {
      try {
        const state = await graphExecutionService.getSessionState(
          args.sessionId
        );
        return {
          sessionId: state.sessionId,
          status: mapStatusToGraphQL(state.status),
          threadId: state.threadId,
          questionSetDraft: state.questionSetDraft,
          questionSetFinal: state.questionSetFinal,
          agentEvaluation: state.agentEvaluation,
          humanEvaluation: state.humanEvaluation,
          finalReport: state.finalReport,
        };
      } catch (error) {
        logger.error('Error getting graph session state:', error);
        throw new Error('Failed to get graph session state');
      }
    },
  },

  Mutation: {
    submitRubricReview: async (
      _: unknown,
      args: {
        sessionId: number;
        threadId: string;
        approved: boolean;
        modifiedQuestionSet?: QuestionSetInput | null;
        questionPatches?: QuestionPatchInput[] | null;
        feedback?: string | null;
        reviewerAccountId: string;
      }
    ) => {
      try {
        logger.info('Submitting question set review', {
          sessionId: args.sessionId,
          approved: args.approved,
        });

        const result = await graphExecutionService.submitRubricReview(
          args.sessionId,
          args.threadId,
          args.approved,
          transformQuestionSetInput(args.modifiedQuestionSet),
          args.questionPatches ?? undefined,
          args.feedback ?? undefined,
          args.reviewerAccountId
        );

        return {
          sessionId: result.sessionId,
          threadId: result.threadId,
          status: mapStatusToGraphQL(result.status),
          questionSetFinal: result.questionSetFinal,
          message: result.message,
        };
      } catch (error) {
        logger.error('Error submitting question set review:', error);
        throw new Error(
          `Failed to submit question set review: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    },

    submitHumanEvaluation: async (
      _: unknown,
      args: {
        sessionId: number;
        threadId: string;
        answers?: QuestionAnswerInput[] | null;
        answerPatches?: QuestionAnswerPatchInput[] | null;
        overallAssessment: string;
        evaluatorAccountId: string;
      }
    ) => {
      try {
        logger.info('Submitting human evaluation', {
          sessionId: args.sessionId,
          answersCount: args.answers?.length ?? args.answerPatches?.length ?? 0,
        });

        const result = await graphExecutionService.submitHumanEvaluation(
          args.sessionId,
          args.threadId,
          args.answers ?? undefined,
          args.answerPatches ?? undefined,
          args.overallAssessment,
          args.evaluatorAccountId
        );

        return {
          sessionId: result.sessionId,
          threadId: result.threadId,
          status: mapStatusToGraphQL(result.status),
          finalReport: result.finalReport,
          message: result.message,
        };
      } catch (error) {
        logger.error('Error submitting human evaluation:', error);
        throw new Error(
          `Failed to submit human evaluation: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    },
  },
};

/**
 * Map internal status to GraphQL enum
 */
function mapStatusToGraphQL(
  status:
    | 'pending'
    | 'awaiting_rubric_review'
    | 'awaiting_human_evaluation'
    | 'completed'
    | 'failed'
): string {
  const mapping: Record<string, string> = {
    pending: 'PENDING',
    awaiting_rubric_review: 'AWAITING_RUBRIC_REVIEW',
    awaiting_human_evaluation: 'AWAITING_HUMAN_EVALUATION',
    completed: 'COMPLETED',
    failed: 'FAILED',
  };
  return mapping[status] || 'PENDING';
}
