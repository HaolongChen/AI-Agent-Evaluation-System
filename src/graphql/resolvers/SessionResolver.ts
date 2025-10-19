import { executionService } from '../../services/ExecutionService.ts';
import { logger } from '../../utils/logger.ts';
import type { copilotType } from '../../utils/types.ts';

export const sessionResolver = {
  Query: {
    getSession: async (_: unknown, args: { id: string }) => {
      return executionService.getSession(args.id);
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
        return sessions;
      } catch (error) {
        logger.error('Error fetching sessions:', error);
        throw new Error('Failed to fetch sessions');
      }
    },
  },

  Mutation: {},
};
