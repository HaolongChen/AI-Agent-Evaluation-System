import { goldenSetService } from '../../services/GoldenSetService.ts';
import { COPILOT_TYPES, REVERSE_COPILOT_TYPES } from '../../config/constants.ts';
import { logger } from '../../utils/logger.ts';

export const goldenResolver = {
  Query: {
    getGoldenSets: async (
      _: unknown,
      args: { goldenSetId: number }
    ) => {
      try {
        const goldenSet = await goldenSetService.getGoldenSet(
          args.goldenSetId
        );
        if (!goldenSet) {
          throw new Error('Golden set not found');
        }
        return { ...goldenSet, copilotType: REVERSE_COPILOT_TYPES[goldenSet.copilotType] };
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
        projectExId: string;
        schemaExId: string;
        copilotType: keyof typeof COPILOT_TYPES;
        description: string;
        query: string;
      }
    ) => {
      try {
        const result = await goldenSetService.updateGoldenSetInput(
          args.projectExId,
          args.schemaExId,
          args.copilotType,
          args.description,
          args.query,
        );
        if (!result) {
          logger.warn('No result returned from updateGoldenSetInput');
          throw new Error('Failed to update golden set input');
        }
        return result;
      } catch (error) {
        logger.error('Error updating golden set input:', error);
        throw new Error('Failed to update golden set input');
      }
    },
  },
};
