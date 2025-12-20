import { executionService } from '../../services/ExecutionService.ts';
import { logger } from '../../utils/logger.ts';
import {
  REVERSE_REVIEW_STATUS,
  REVERSE_EVALUATION_STATUS,
} from '../../config/constants.ts';

/**
 * Transform rubric data from Prisma to GraphQL format
 */
function transformRubric(rubric: Record<string, unknown> | null | undefined) {
  if (!rubric) return null;
  return {
    ...rubric,
    reviewStatus:
      REVERSE_REVIEW_STATUS[rubric['reviewStatus'] as string] ||
      rubric['reviewStatus'],
  };
}

/**
 * Transform evaluation result data from Prisma to GraphQL format
 */
function transformEvaluationResult(
  result: Record<string, unknown> | null | undefined
) {
  if (!result) return null;
  return {
    ...result,
    evaluationStatus:
      REVERSE_EVALUATION_STATUS[result['evaluationStatus'] as string] ||
      result['evaluationStatus'],
  };
}

/**
 * Transform session data from Prisma to GraphQL format
 * Converts lowercase enum values to uppercase GraphQL enum values
 */
function transformSession(session: Record<string, unknown>) {
  return {
    ...session,
    rubric: Array.isArray(session['rubric'])
      ? (session['rubric'] as Record<string, unknown>[]).map((r) =>
          transformRubric(r)
        )
      : session['rubric']
      ? [transformRubric(session['rubric'] as Record<string, unknown>)]
      : [],
    result: transformEvaluationResult(
      session['result'] as Record<string, unknown> | null | undefined
    ),
  };
}

export const sessionResolver = {
  Query: {
    getSession: async (_: unknown, args: { id: string }) => {
      const session = await executionService.getSession(args.id);
      logger.debug('Fetched session:', session);
      return session;
    },

    getSessions: async (
      _: unknown,
      args: {
        goldenSetId?: number;
        modelName?: string;
      }
    ) => {
      try {
        const sessions = await executionService.getSessions(args);
        return sessions.map((s) =>
          transformSession(s as unknown as Record<string, unknown>)
        );
      } catch (error) {
        logger.error('Error fetching sessions:', error);
        throw new Error('Failed to fetch sessions');
      }
    },
  },

  Mutation: {},
};
