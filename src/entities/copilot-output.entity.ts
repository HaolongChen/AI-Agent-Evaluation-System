import z from "zod";
import { copilotOutputJointRubricEntity } from "./copilot-output-rubric.entity.ts";

export const copilotOutputEntity = z.object({
  internal: z.object({
    id: z.uuidv4(),
    goldenSetId: z.uuidv4(),
    userInputId: z.uuidv4(),
    content: z.string().nonempty(),
    createdAt: z.date(),
  }),
  external: z.object({
    rubrics: z.array(copilotOutputJointRubricEntity.shape.internal),
  }),
});
