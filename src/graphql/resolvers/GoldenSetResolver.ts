import { goldenSetService } from '../../services/GoldenSetService.ts';
import { COPILOT_TYPES, REVERSE_COPILOT_TYPES } from '../../config/constants.ts';
import { logger } from '../../utils/logger.ts';
import type { CopilotType } from '../../../build/generated/prisma/enums.ts';
import { transformSession } from './SessionResolver.ts';

export interface GoldenSetFilters {
  projectExId?: string;
  copilotType?: keyof typeof COPILOT_TYPES;
  isActive?: boolean;
}

function transformGoldenSet(goldenSet: {
  id: number;
  projectExId: string;
  copilotType: CopilotType;
  createdAt: Date;
  createdBy: string | null;
  isActive: boolean;
  userInput?: unknown[];
  copilotOutput?: unknown[];
  evaluationSessions?: Array<Record<string, unknown>>;
}) {
  return {
    ...goldenSet,
    copilotType: REVERSE_COPILOT_TYPES[goldenSet.copilotType],
    userInputs: goldenSet.userInput ?? [],
    copilotOutputs: goldenSet.copilotOutput ?? [],
    evaluationSessions: goldenSet.evaluationSessions?.map(transformSession) ?? [],
  };
}

export const goldenSetResolver = {
  Query: {
    getGoldenSet: async (_: unknown, args: { id: number }) => {
      try {
        const goldenSet = await goldenSetService.getGoldenSet(args.id);
        if (!goldenSet) {
          return null;
        }
        return transformGoldenSet(goldenSet);
      } catch (error) {
        logger.error('Error fetching golden set:', error);
        throw new Error('Failed to fetch golden set');
      }
    },

    getGoldenSets: async (_: unknown, args: { filters?: GoldenSetFilters }) => {
      try {
        const goldenSets = await goldenSetService.getGoldenSets(args.filters);
        return goldenSets.map(transformGoldenSet);
      } catch (error) {
        logger.error('Error fetching golden sets:', error);
        throw new Error('Failed to fetch golden sets');
      }
    },
  },

  Mutation: {
    updateGoldenSetInput: async (
      _: unknown,
      args: {
        projectExId?: string;
        copilotType: keyof typeof COPILOT_TYPES;
        description?: string;
        query: string;
      }
    ) => {
      try {
        const result = await goldenSetService.updateGoldenSetInput(
          args.projectExId ?? '0',
          args.copilotType,
          args.description ?? '',
          args.query
        );
        if (!result) {
          logger.warn('No result returned from updateGoldenSetInput');
          throw new Error('Failed to update golden set input');
        }
        return transformGoldenSet(result);
      } catch (error) {
        logger.error('Error updating golden set input:', error);
        throw new Error('Failed to update golden set input');
      }
    },
  },
};
