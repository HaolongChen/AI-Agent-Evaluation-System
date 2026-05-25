import { optionsToInclude } from "../../../shared/infrastructure/repository.ts";

import type { CopilotInputOptions } from "../../domain/interface/copilot-input.interface.ts";

export const copilotInputOptionsToInclude = (options: CopilotInputOptions) => {
  return optionsToInclude(
    options as unknown as Parameters<typeof optionsToInclude>[0],
  );
};
