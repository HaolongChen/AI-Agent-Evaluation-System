import z from "zod";
import { userInputInternalEntity } from "./user-input.entity.ts";

export const copilotTypeEnum = z.enum([
	"dataModelBuilder",
	"uiBuilder",
	"actionFlowBuilder",
	"logAnalyzer",
	"agentBuilder",
]);

export type CopilotType = z.infer<typeof copilotTypeEnum>;

export const goldenSetEntity = z.object({
	internal: z.object({
		id: z.uuidv4(),
		schemaId: z.string().nonempty(),
		copilotType: copilotTypeEnum.optional().default("dataModelBuilder"),
		modelName: z.string().optional().default("undefined"),
	}),
	external: z.object({
		userInputs: z.array(userInputInternalEntity),
	}),
});
