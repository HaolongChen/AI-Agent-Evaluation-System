import { goldenSetService } from '../../services/GoldenSetService.ts';
import {
  COPILOT_TYPES,
  REVERSE_COPILOT_TYPES,
} from '../../config/constants.ts';
import { logger } from '../../utils/logger.ts';
import type { CopilotType } from '../../../build/generated/prisma/enums.ts';

export const goldenResolver = {
  Query: {
    getGoldenSetSchemas: async (
      _: unknown,
      args: { copilotType?: keyof typeof COPILOT_TYPES }
    ) => {
      const result = await goldenSetService.getGoldenSetSchemas(
        args.copilotType
      );
      return result;
    },

    getGoldenSets: async (
      _: unknown,
      args: { projectExId?: string; copilotType?: CopilotType }
    ) => {
      try {
        const goldenSets = await goldenSetService.getGoldenSets(
          args.projectExId,
          undefined, // ensure correct arg position for schemaExId
          args.copilotType
        );
        const results = goldenSets.map((gs) => {
          return {
            ...gs,
            copilotType: gs.copilotType,
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
    createGoldenSet: async (
      _: unknown,
      args: {
        projectExId: string;
        schemaExId: string;
        copilotType: keyof typeof COPILOT_TYPES;
        userInput: Array<{ description?: string; content: object }>;
        copilotOutput: Array<{ editableText: string }>;
      }
    ) => {
      try {
        const result = await goldenSetService.createGoldenSet(
          args.projectExId,
          args.schemaExId,
          args.copilotType,
          args.userInput,
          args.copilotOutput
        );
        if (!result) {
          throw new Error('Failed to create golden set');
        }
        return {
          ...result,
          copilotType: REVERSE_COPILOT_TYPES[result.copilotType as CopilotType],
        };
      } catch (error) {
        logger.error('Error creating golden set:', error);
        throw new Error('Failed to create golden set');
      }
    },

    updateGoldenSet: async (
      _: unknown,
      args: {
        id: string;
        isActive?: boolean[];
      }
    ) => {
      try {
        if (!args.isActive) {
          throw new Error('isActive is required');
        }
        const result = await goldenSetService.updateGoldenSetIsActive(
          parseInt(args.id),
          args.isActive
        );
        return {
          ...result,
          copilotType: REVERSE_COPILOT_TYPES[result.copilotType as CopilotType],
        };
      } catch (error) {
        logger.error('Error updating golden set:', error);
        throw new Error('Failed to update golden set');
      }
    },
  },
};
