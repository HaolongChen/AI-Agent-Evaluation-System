import z from "zod";
import { evaluationSessionEntity } from "./evaluation-session.entity.ts";

export const copilotOutputJointRubricEntity = z.object( {
  internal: z.object( {
    createdAt: z.date(),
  } ),
  external: z.object( {
    evaluationSession: z.array(evaluationSessionEntity.shape.internal),
  })
})