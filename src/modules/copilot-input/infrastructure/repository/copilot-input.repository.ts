import type { BaseOptions } from "../../../shared/domain/interface/repository.interface.ts";
import { optionsToInclude } from "../../../shared/infrastructure/repository.ts";

import type { CopilotInputOptions } from "../../domain/interface/copilot-input.interface.ts";

export const copilotInputOptionsToInclude = (
	options: CopilotInputOptions,
) =>
{
  return optionsToInclude(options as BaseOptions);
};
