import { prisma } from "../../../../config/prisma.ts";
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
  entity?: CopilotServerEntity,
): CopilotServerEntity => {
  return repositoryDateMapper(
    copilotServer,
    entity || new CopilotServerEntity(copilotServer, copilotServer.id),
  );
};

export class CopilotServerRepository implements ICopilotServerRepository {
  async getDefault(): Promise<CopilotServerEntity> {
    return this.findById(mockCopilotServerEntity.getData("id"));
  }
  async save(entity: CopilotServerEntity): Promise<void> {
    const result = await prisma.copilotServer.upsert({
      where: { id: entity.getData("id") },
      update: entity.getData(),
      create: entity.getData(),
    });
    copilotServerDataMapper(result, entity);
  }
  async findById(id: string): Promise<CopilotServerEntity> {
    mockCopilotServerEntity.setData({ id });
    await this.save(mockCopilotServerEntity);
    return mockCopilotServerEntity;
  }
}
