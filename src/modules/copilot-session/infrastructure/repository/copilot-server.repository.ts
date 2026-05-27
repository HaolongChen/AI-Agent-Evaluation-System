import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import { CopilotServerEntity } from "../../domain/entity/copilot-server.entity.ts";

export type CopilotServerRepositoryType = {
  id: string;
  name: string;
  description: string | null;
  endpoint: string;
  createdAt: Date;
};

export const copilotServerDataMapper = (
  copilotServer: CopilotServerRepositoryType,
): CopilotServerEntity => {
  return repositoryDateMapper(
    copilotServer,
    new CopilotServerEntity(copilotServer, copilotServer.id),
  );
};
