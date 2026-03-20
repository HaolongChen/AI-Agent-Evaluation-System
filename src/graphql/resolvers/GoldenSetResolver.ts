import { goldenSetService } from '../../services/GoldenSetService.ts';
// import { COPILOT_TYPES, REVERSE_COPILOT_TYPES } from '../../config/constants.ts';
import { logger } from '../../utils/logger.ts';
// import type { CopilotType } from '../../../build/generated/prisma/enums.ts';
// import { transformSession } from './SessionResolver.ts';
import type { GoldenSetFilters } from '../generated/resolvers-types.ts';

// function transformGoldenSet(goldenSet: {
//   id: number;
//   projectExId: string;
//   copilotType: CopilotType;
//   createdAt: Date;
//   createdBy: string | null;
//   isActive: boolean;
//   userInput?: unknown[];
//   copilotOutput?: unknown[];
//   evaluationSessions?: Array<Record<string, unknown>>;
// }) {
//   return {
//     ...goldenSet,
//     copilotType: REVERSE_COPILOT_TYPES[goldenSet.copilotType],
//     userInputs: goldenSet.userInput ?? [],
//     copilotOutputs: goldenSet.copilotOutput ?? [],
//     evaluationSessions: goldenSet.evaluationSessions?.map(transformSession) ?? [],
//   };
// }

export const goldenSetResolver = {
  Query: {
    getGoldenSetById: async (_: unknown, args: { id: number }) => {
      try {
        const goldenSet = await goldenSetService.getGoldenSetById(args.id);
        if (!goldenSet) {
          return null;
        }
        return goldenSet;
        // return transformGoldenSet(goldenSet);
      } catch (error) {
        logger.error('Error fetching golden set:', error);
        throw new Error('Failed to fetch golden set');
      }
    },

    getGoldenSets: async (_: unknown, args: { filters?: GoldenSetFilters }) => {
      try {
        const goldenSets = await goldenSetService.getGoldenSets(args.filters);
        return goldenSets;
      } catch (error) {
        logger.error('Error fetching golden sets:', error);
        throw new Error('Failed to fetch golden sets');
      }
    },
  },

  Mutation: {
    createUserInput: async (
      _: unknown,
      args: {
        description?: string;
        query: string;
        createdBy?: string;
      }
    ) => {
      try {
        const result = await goldenSetService.createUserInput(
          args.description ?? '',
          args.query,
          args.createdBy ?? 'unknown'
        );
        if (!result) {
          logger.warn('No result returned from createUserInput');
          throw new Error('Failed to create user input');
        }
        return result;
      } catch (error) {
        logger.error('Error creating user input:', error);
        throw new Error('Failed to create user input');
      }
    },
  },
};
