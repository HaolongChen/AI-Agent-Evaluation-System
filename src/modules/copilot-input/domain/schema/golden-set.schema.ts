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
  projectExId: z.string().nullish(),
  projectName: z.string().nullish(),
});

export const goldenSetFiltersSchema = goldenSetSchema.partial();
