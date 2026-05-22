import { Logger } from "tslog";

export const logger = new Logger({
  type: "pretty",
  name: "ai-agent-evaluation-system",
  hideLogPositionForProduction: false,
  prettyLogTemplate: "{{logLevelName}} {{fileNameWithLine}} {{arguments}}",
});
