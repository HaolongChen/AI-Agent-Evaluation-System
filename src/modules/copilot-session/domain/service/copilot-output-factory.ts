import type { z } from "zod";
import { copilotOutputSchema } from "../schema/copilot-output.schema.ts";
import { CopilotOutputEntity } from "../entity/copilot-output.entity.ts";

export class CopilotOutputFactory {
  constructor(private copilotSessionExId: string) {}

  build(
    data: Omit<z.infer<typeof copilotOutputSchema>, "copilotSessionExId">,
    id?: string,
  ) {
    return new CopilotOutputEntity(
      { ...data, copilotSessionExId: this.copilotSessionExId },
      id,
    );
  }
}
