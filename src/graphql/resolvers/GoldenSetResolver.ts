import { goldenSetService } from '../../services/GoldenSetService.ts';
import { COPILOT_TYPES } from '../../config/constants.ts';

export const goldenResolver = {
  Query: {
    getGoldenSetSchemas: async (
      _: unknown,
      args: { copilotType?: keyof typeof COPILOT_TYPES }
    ) => {
      return goldenSetService.getGoldenSetSchemas(args.copilotType);
    },

    getGoldenSet: async (
      _: unknown,
      args: { projectExId?: string; copilotType?: keyof typeof COPILOT_TYPES }
    ) => {
      return goldenSetService.getGoldenSet(args.projectExId, args.copilotType);
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
      return goldenSetService.updateGoldenSetProject(
        args.projectExId,
        args.schemaExId,
        args.copilotType,
        args.description,
        args.promptTemplate,
        args.idealResponse
      );
    },
  },
};
