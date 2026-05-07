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
  copilotType: copilotTypeEnum.default("dataModelBuilder"),
  modelName: z.string().default("undefined"),
});

export const goldenSetFiltersSchema = goldenSetSchema.partial();
