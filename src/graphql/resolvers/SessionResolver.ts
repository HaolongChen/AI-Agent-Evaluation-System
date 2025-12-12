import { executionService } from '../../services/ExecutionService.ts';
import { logger } from '../../utils/logger.ts';
import type { copilotType } from '../../utils/types.ts';
import { 
  COPILOT_TYPES, 
  SESSION_STATUS, 
  REVERSE_COPILOT_TYPES 
} from '../../config/constants.ts';

// Helper to map database enum to GraphQL enum
const mapSessionToGraphQL = (session: any) => {
  if (!session) return null;
  return {
    ...session,
    copilotType: Object.keys(COPILOT_TYPES).find(
      (key) => COPILOT_TYPES[key as keyof typeof COPILOT_TYPES] === session.copilotType
    ) as keyof typeof COPILOT_TYPES,
    status: Object.keys(SESSION_STATUS).find(
      (key) => SESSION_STATUS[key as keyof typeof SESSION_STATUS] === session.status
    ) as keyof typeof SESSION_STATUS,
  };
};

export const sessionResolver = {
  Query: {
    getSession: async (_: unknown, args: { id: string }) => {
      const session = await executionService.getSession(args.id);
      return mapSessionToGraphQL(session);
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
        return sessions.map(mapSessionToGraphQL);
      } catch (error) {
        logger.error('Error fetching sessions:', error);
        throw new Error('Failed to fetch sessions');
      }
    },
  },

  Mutation: {},
};
