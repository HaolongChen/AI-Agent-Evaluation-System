import { goldenSetService } from '../../services/GoldenSetService.ts';
import { COPILOT_TYPES } from '../../config/constants.ts';
import { logger } from '../../utils/logger.ts';

export const goldenResolver = {
  Query: {
    getGoldenSetSchemas: async (
      _: unknown,
      args: { copilotType?: keyof typeof COPILOT_TYPES }
    ) => {
      return goldenSetService.getGoldenSetSchemas(args.copilotType);
    },

    getGoldenSets: async (
      _: unknown,
      args: { projectExId?: string; copilotType?: keyof typeof COPILOT_TYPES }
    ) => {
      try {
        const goldenSets = await goldenSetService.getGoldenSets(
          args.projectExId,
          args.copilotType
        );
        const results = goldenSets.map((gs) => {
          return {
            ...gs,
            copilotType: Object.keys(COPILOT_TYPES).find(
              (key) =>
                COPILOT_TYPES[key as keyof typeof COPILOT_TYPES] ===
                gs.copilotType
            ) as keyof typeof COPILOT_TYPES,
          };
        });
        return results;
      } catch (error) {
        logger.error('Error fetching golden sets:', error);
        throw new Error('Failed to fetch golden sets');
      }
    },
  },

  Mutation: {
    updateGoldenSetProject: async (
      _: unknown,
      args: {
        projectExId: string;
        schemaExId: string;
        copilotType: keyof typeof COPILOT_TYPES;
        description: string;
        promptTemplate: string;
        idealResponse: object;
      }
    ) => {
      try {
        const result = await goldenSetService.updateGoldenSetProject(
          args.projectExId,
          args.schemaExId,
          args.copilotType,
          args.description,
          args.promptTemplate,
          args.idealResponse
        );
        const newResult = {
          ...result,
          copilotType: Object.keys(COPILOT_TYPES).find(
            (key) =>
              COPILOT_TYPES[key as keyof typeof COPILOT_TYPES] ===
              result.copilotType
          ) as keyof typeof COPILOT_TYPES,
        };
        logger.debug('Updated golden set project:', newResult);
        return newResult;
      } catch (error) {
        logger.error('Error updating golden set project:', error);
        throw new Error('Failed to update golden set project');
      }
    },
  },
};
