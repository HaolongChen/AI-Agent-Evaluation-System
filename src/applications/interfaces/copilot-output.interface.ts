import type z from "zod";
import { copilotOutputEntity } from "../../entities/copilot-output.entity.js";

const initialCopilotOutputEntity = copilotOutputEntity.shape.internal.omit({
  id: true,
  createdAt: true,
});

export interface ICopilotOutputRepository {
  saveCopilotOutput(
    copilotOutput: z.infer<typeof initialCopilotOutputEntity>,
  ): Promise<z.infer<typeof copilotOutputEntity.shape.internal>>;
}
