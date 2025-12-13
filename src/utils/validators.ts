import { z } from 'zod';

export const schemaExIdValidator = z.string().min(1);
export const copilotTypeValidator = z.enum([
  'data_model_builder',
  'ui_builder',
  'actionflow_builder',
  'log_analyzer',
  'agent_builder',
]);
export const modelNameValidator = z.string().min(1);

export const evaluationSessionInputValidator = z.object({
  schemaExId: schemaExIdValidator,
  copilotType: copilotTypeValidator,
  modelName: modelNameValidator,
});

export const judgeInputValidator = z.object({
  adaptiveRubricId: z.string(),
  evaluatorType: z.string(),
  accountId: z.string().nullable(),
  scores: z.record(z.string(), z.unknown()),
  overallScore: z.number().min(0).max(100),
  summary: z.string().optional(),
});
