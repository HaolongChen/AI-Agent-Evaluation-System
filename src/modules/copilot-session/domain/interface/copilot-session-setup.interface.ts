import type { ICopilotNetworkService } from "./copilot-network.interface.ts";

export interface ICopilotSessionSetup {
  createNewSession(): Promise<ICopilotNetworkService>;
}

export interface ICopilotSessionSetupFactory {
  build(projectExId: string): ICopilotSessionSetup;
}
