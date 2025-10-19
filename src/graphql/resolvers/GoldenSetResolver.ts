import { goldenSetService } from '../../services/GoldenSetService.ts';
import type { copilotType } from '../../utils/types.ts';

export const goldenResolver = {
  Query: {
    getGoldenSetSchemas: async (
      _: unknown,
      args: { copilotType?: copilotType }
    ) => {
      return goldenSetService.getGoldenSetSchemas(args.copilotType);
    },

    getGoldenSet: async (
      _: unknown,
      args: { projectExId?: string; copilotType?: copilotType }
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
        copilotType: copilotType;
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
