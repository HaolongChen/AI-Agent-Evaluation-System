import { executionService } from '../../services/ExecutionService.ts';
import { logger } from '../../utils/logger.ts';
import {
  REVERSE_COPILOT_TYPES,
  REVERSE_SESSION_STATUS,
  REVERSE_REVIEW_STATUS,
  REVERSE_EVALUATION_STATUS,
  COPILOT_TYPES,
  SESSION_STATUS,
} from '../../config/constants.ts';
import type { CopilotType, SessionStatus } from '../../../build/generated/prisma/enums.ts';

export interface SessionFilters {
  goldenSetId?: number;
  schemaExId?: string;
  copilotType?: keyof typeof COPILOT_TYPES;
  modelName?: string;
  status?: string;
}

function transformRubric(rubric: Record<string, unknown> | null | undefined) {
  if (!rubric) return null;
  return {
    ...rubric,
    reviewStatus:
      REVERSE_REVIEW_STATUS[rubric['reviewStatus'] as string] ??
      rubric['reviewStatus'],
  };
}

function transformEvaluationResult(
  result: Record<string, unknown> | null | undefined
) {
  if (!result) return null;
  const copilotKey = result['copilotType'] as CopilotType;
  return {
    ...result,
    copilotType: REVERSE_COPILOT_TYPES[copilotKey] ?? result['copilotType'],
    evaluationStatus:
      REVERSE_EVALUATION_STATUS[result['evaluationStatus'] as string] ??
      result['evaluationStatus'],
  };
}

function transformSession(session: Record<string, unknown>) {
  const statusKey = session['status'] as SessionStatus;
  const rubrics = session['rubrics'] as Record<string, unknown>[] | undefined;

  return {
    ...session,
    status: REVERSE_SESSION_STATUS[statusKey] ?? session['status'],
    rubrics: rubrics?.map(transformRubric) ?? [],
    result: transformEvaluationResult(
      session['result'] as Record<string, unknown> | null | undefined
    ),
  };
}

const graphqlToDbStatus: Record<string, (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS]> = {
  PENDING: SESSION_STATUS.PENDING,
  RUNNING: SESSION_STATUS.RUNNING,
  COMPLETED: SESSION_STATUS.COMPLETED,
  FAILED: SESSION_STATUS.FAILED,
};

export const sessionResolver = {
  Query: {
    getSession: async (_: unknown, args: { id: number }) => {
      try {
        const session = await executionService.getSession(String(args.id));
        return session
          ? transformSession(session as unknown as Record<string, unknown>)
          : null;
      } catch (error) {
        logger.error('Error fetching session:', error);
        throw new Error('Failed to fetch session');
      }
    },

    getSessions: async (_: unknown, args: { filters?: SessionFilters }) => {
      try {
        const filters = args.filters;
        const dbStatus = filters?.status ? graphqlToDbStatus[filters.status] : undefined;

        const sessions = await executionService.getSessions({
          ...(filters?.schemaExId && { schemaExId: filters.schemaExId }),
          ...(filters?.copilotType && { copilotType: COPILOT_TYPES[filters.copilotType] as CopilotType }),
          ...(filters?.modelName && { modelName: filters.modelName }),
          ...(dbStatus && { status: dbStatus }),
        });
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
