import { executionService } from '../../services/ExecutionService.ts';
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
      return executionService.getSessions(args);
    },
  },

  Mutation: {
    execAiCopilotByTypeAndModel: async (
      _: unknown,
      args: {
        projectExId: string;
        schemaExId: string;
        copilotType: copilotType;
        modelName: string;
      }
    ) => {
      return executionService.createEvaluationSession(
        args.projectExId,
        args.schemaExId,
        args.copilotType,
        args.modelName
      );
    },
  },
};
