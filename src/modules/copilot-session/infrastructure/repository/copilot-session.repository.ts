import { prisma } from "../../../../config/prisma.ts";
import { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import {
  copilotInputDataMapper,
  type CopilotInputDataMapperParameter,
  type CopilotInputRepositoryType,
} from "../../../dataset/infrastructure/repository/copilot-input.repository.ts";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import { CopilotSessionAggregate } from "../../domain/aggregate/copilot-session.aggregate.ts";
import { CopilotOutputEntity } from "../../domain/entity/copilot-output.entity.ts";
import { CopilotServerEntity } from "../../domain/entity/copilot-server.entity.ts";
import type { ICopilotSessionRepository } from "../../domain/interface/copilot-session.interface.ts";
import {
  CopilotOutputRepository,
  type CopilotOutputRepositoryType,
} from "./copilot-output.repository.ts";
import {
  copilotServerDataMapper,
  type CopilotServerRepositoryType,
} from "./copilot-server.repository.ts";

export type CopilotSessionRepositoryType = {
  copilotInput?: CopilotInputRepositoryType;
  copilotOutput?: CopilotOutputRepositoryType | null;
  copilotServer?: CopilotServerRepositoryType;
} & {
  id: string;
  copilotInputId: string;
  copilotServerId: string;
  createdAt: Date;
};

export type CopilotSessionDataMapperParameter = {
  copilotInput?: {
    aggregate?: CopilotInputAggregate;
    entity?: CopilotInputDataMapperParameter;
  };
  copilotServer?: CopilotServerEntity;
};

export const copilotSessionDataMapper = (
  data: CopilotSessionRepositoryType,
  entity?: CopilotSessionDataMapperParameter,
): CopilotSessionAggregate => {
  const copilotInput =
    entity?.copilotInput?.aggregate ??
    (data.copilotInput
      ? copilotInputDataMapper(data.copilotInput, entity?.copilotInput?.entity)
      : undefined);
  const copilotServer =
    entity?.copilotServer ??
    (data.copilotServer
      ? copilotServerDataMapper(data.copilotServer)
      : undefined);
  if (!copilotInput || !copilotServer) {
    throw new Error("Missing required data for CopilotSessionAggregate");
  }
  const result = repositoryDateMapper(
    data,
    new CopilotSessionAggregate(copilotInput, copilotServer, data.id),
  );
  if (data.copilotOutput) {
    result.setEntity(
      "copilotOutput",
      repositoryDateMapper(
        data.copilotOutput,
        new CopilotOutputEntity(data.copilotOutput, data.copilotOutput.id),
      ),
    );
  }
  return result;
};

export class CopilotSessionRepository implements ICopilotSessionRepository {
  async getByCopilotServer(
    copilotServer: CopilotServerEntity,
  ): Promise<Array<CopilotSessionAggregate>> {
    const results = await prisma.copilotSession.findMany({
      where: { copilotServerId: copilotServer.getData("id") },
      include: {
        copilotInput: { include: { goldenSet: true, userInput: true } },
        copilotServer: true,
        copilotOutput: true,
      },
    });
    return results.map((result) => {
      return copilotSessionDataMapper(result, { copilotServer });
    });
  }
  async saveCopilotOutput(data: CopilotSessionAggregate): Promise<void> {
    const copilotOutput = data.getEntity("copilotOutput");
    if (!copilotOutput) {
      throw new Error(
        "No CopilotOutput entity found in the provided CopilotSessionAggregate",
      );
    }
    const copilotOutputRepository = new CopilotOutputRepository();
    await copilotOutputRepository.save(copilotOutput);
  }
  async save(entity: CopilotSessionAggregate): Promise<void> {
    const copilotInput = entity.getEntity("copilotInput");
    const copilotServer = entity.getEntity("copilotServer");
    if (!copilotInput || !copilotServer) {
      throw new Error(
        "CopilotSessionAggregate must have exactly one CopilotInputAggregate and one CopilotServerEntity",
      );
    }
    const result = await prisma.copilotSession.create({
      data: {
        ...entity.getData(),
        copilotInputId: copilotInput.getData("id"),
        copilotServerId: copilotServer.getData("id"),
      },
    });
    repositoryDateMapper(result, entity);
    await this.saveCopilotOutput(entity);
  }
  async findById(id: string): Promise<CopilotSessionAggregate> {
    return copilotSessionDataMapper(
      await prisma.copilotSession.findUniqueOrThrow({
        where: { id },
        include: {
          copilotInput: { include: { goldenSet: true, userInput: true } },
          copilotServer: true,
          copilotOutput: true,
        },
      }),
    );
  }
  async getByCopilotInput(
    copilotInput: CopilotInputAggregate,
  ): Promise<Array<CopilotSessionAggregate>> {
    const results = await prisma.copilotSession.findMany({
      where: { copilotInputId: copilotInput.getData("id") },
      include: {
        copilotInput: true,
        copilotServer: true,
        copilotOutput: true,
      },
    });
    return results.map((result) => {
      return copilotSessionDataMapper(result, {
        copilotInput: { aggregate: copilotInput },
      });
    });
  }
}
