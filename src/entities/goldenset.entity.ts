import z from "zod";
import { userInputEntity } from "./user-input.entity.ts";

export const goldenSetEntity = z.object( {
  internal: z.object( {
    id: z.uuidv4(),
    schemaId: z.string().nonempty(),
    copilotType: z.enum( [
      'dataModelBuilder',
      'uiBuilder',
      'actionFlowBuilder',
      'logAnalyzer',
      'agentBuilder',
    ] ).default( 'dataModelBuilder' ).optional(),
    modelName: z.string().optional().default("undefined")
  } ),
  external: z.object( {
    userInputs: z.array(userInputEntity.shape.internal)
  })
})