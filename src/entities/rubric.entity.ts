import z from "zod";
import { criteriaEntity } from "./criteria.entity.ts";
import { agentFeedbackEntity } from "./agent-feedback.entity.ts";
import { copilotOutputJointRubricEntity } from "./copilot-output-rubric.entity.ts";

export const rubricEntity = z.object( {
  internal: z.object( {
    id: z.uuidv4(),
    createdAt: z.date()
  } ),
  external: z.object( {
    copilotOutputs: z.array( copilotOutputJointRubricEntity.shape.internal ),
    criterion: z.array( criteriaEntity.shape.internal ),
    agentFeedbacks: z.array(agentFeedbackEntity.shape.internal),
  })
})