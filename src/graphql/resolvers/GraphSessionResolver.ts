import { graphExecutionService } from '../../services/GraphExecutionService.ts';
import { logger } from '../../utils/logger.ts';
import type { QuestionSet, EvaluationQuestion } from '../../langGraph/state/state.ts';

export interface EvaluationQuestionInput {
  id: number;
  title: string;
  content: string;
  expectedAnswer: boolean;
  weight: number;
}

export interface QuestionSetInput {
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
  id: number;
  answer: boolean;
  explanation: string;
}

export interface QuestionAnswerPatchInput {
  id: number;
  answer?: boolean;
  explanation?: string;
}

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
  return mapping[status] ?? 'PENDING';
}

export const graphSessionResolver = {
  Query: {
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
          evaluation: state.evaluation,
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
        throw new Error('Failed to submit question set review');
      }
    },

    submitHumanEvaluation: async (
      _: unknown,
      args: {
        sessionId: number;
        threadId: string;
        answers?: QuestionAnswerInput[];
        overallAssessment: string;
        evaluatorAccountId: string;
      }
    ) => {
      try {
        logger.info('Submitting human evaluation', {
          sessionId: args.sessionId,
          answersCount: args.answers?.length ?? 0,
        });

        const result = await graphExecutionService.submitHumanEvaluation(
          args.sessionId,
          args.threadId,
          args.answers,
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
        throw new Error('Failed to submit human evaluation');
      }
    },
  },
};
