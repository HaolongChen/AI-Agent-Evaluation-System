import { executionService } from '../../services/ExecutionService.ts';
import { logger } from '../../utils/logger.ts';
import type { copilotType } from '../../utils/types.ts';
import {
  REVERSE_COPILOT_TYPES,
  REVERSE_SESSION_STATUS,
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
    copilotType:
      REVERSE_COPILOT_TYPES[result['copilotType'] as string] ||
      result['copilotType'],
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
    copilotType:
      REVERSE_COPILOT_TYPES[session['copilotType'] as string] ||
      session['copilotType'],
    status:
      REVERSE_SESSION_STATUS[session['status'] as string] || session['status'],
    rubric: transformRubric(
      session['rubric'] as Record<string, unknown> | null | undefined
    ),
    evaluationResult: transformEvaluationResult(
      session['evaluationResult'] as Record<string, unknown> | null | undefined
    ),
  };
}

export const sessionResolver = {
  Query: {
    getSession: async (_: unknown, args: { id: string }) => {
      const session = await executionService.getSession(args.id);
      return session
        ? transformSession(session as unknown as Record<string, unknown>)
        : null;
    },

    getSessions: async (
      _: unknown,
      args: {
        schemaExId?: string;
        copilotType?: copilotType;
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
