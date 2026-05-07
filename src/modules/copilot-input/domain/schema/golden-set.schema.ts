import z from "zod";

export const copilotTypeEnum = z.enum([
  "dataModelBuilder",
  "uiBuilder",
  "actionFlowBuilder",
  "logAnalyzer",
  "agentBuilder",
]);

export const goldenSetSchema = z.object({
  schemaId: z.string(),
  copilotType: copilotTypeEnum.optional().default("dataModelBuilder"),
  modelName: z.string().optional().default("undefined"),
});

export const goldenSetFiltersSchema = goldenSetSchema.partial();
