import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import {
  CopilotServerEntity,
  mockCopilotServerEntity,
} from "../../domain/entity/copilot-server.entity.ts";
import type { ICopilotServerRepository } from "../../domain/interface/copilot-server.interface.ts";

export type CopilotServerRepositoryType = {
  id: string;
  name: string;
  description: string | null;
  wsEndpoint: string;
  gqlEndpoint: string;
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

export class CopilotServerRepository implements ICopilotServerRepository {
  getDefault(): Promise<CopilotServerEntity> {
    return Promise.resolve(mockCopilotServerEntity);
  }
  save(entity: CopilotServerEntity): Promise<void> {
    entity.getData("createdAt");
    return Promise.resolve();
  }
  findById(id: string): Promise<CopilotServerEntity> {
    mockCopilotServerEntity.setData({ id: id });
    return Promise.resolve(mockCopilotServerEntity);
  }
}
