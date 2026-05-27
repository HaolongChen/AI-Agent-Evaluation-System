import { prisma } from "../../../../config/prisma.ts";
import { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import { GoldenSetEntity } from "../../../dataset/domain/entity/golden-set.entity.ts";
import { UserInputEntity } from "../../../dataset/domain/entity/user-input.entity.ts";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import { CopilotSessionAggregate } from "../../domain/aggregate/copilot-session.aggregate.ts";
import { CopilotOutputEntity } from "../../domain/entity/copilot-output.entity.ts";
import { CopilotServerEntity } from "../../domain/entity/copilot-server.entity.ts";
import type { ICopilotSessionRepository } from "../../domain/interface/copilot-session.interface.ts";
import { CopilotOutputRepository } from "./copilot-output.repository.ts";

type CopilotSessionReturnType = {
  copilotInput: {
    id: string;
    goldenSetId: string;
    userInputId: string;
    createdAt: Date;
    goldenSet?: {
      id: string;
      schemaId: string;
      updatedAt: Date;
    };
    userInput?: {
      id: string;
      content: string;
      createdAt: Date;
      createdBy: string;
    };
  };
  copilotOutput: {
    id: string;
    editableText: string | null;
    aiResponse: string;
    copilotSessionExId: string;
    createdAt: Date;
  } | null;
  copilotServer: {
    id: string;
    name: string;
    description: string | null;
    endpoint: string;
    createdAt: Date;
  };
} & {
  id: string;
  copilotInputId: string;
  copilotServerId: string;
  createdAt: Date;
};

export const copilotSessionDataMapper = (
  data: CopilotSessionReturnType,
  stationaryCopilotInputAggregate?: CopilotInputAggregate,
  stationaryCopilotServerEntity?: CopilotServerEntity,
): CopilotSessionAggregate => {
  const result = repositoryDateMapper(
    data,
    new CopilotSessionAggregate(
      repositoryDateMapper(
        data.copilotInput,
        stationaryCopilotInputAggregate ||
          new CopilotInputAggregate(
            repositoryDateMapper(
              data.copilotInput.goldenSet!,
              new GoldenSetEntity(
                data.copilotInput.goldenSet!,
                data.copilotInput.goldenSetId,
              ),
            ),
            repositoryDateMapper(
              data.copilotInput.userInput!,
              new UserInputEntity(
                data.copilotInput.userInput!,
                data.copilotInput.userInputId,
              ),
            ),
            data.copilotInput.id,
          ),
      ),
      repositoryDateMapper(
        data.copilotServer,
        stationaryCopilotServerEntity ||
          new CopilotServerEntity(data.copilotServer, data.copilotServerId),
      ),
      data.id,
    ),
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
      return copilotSessionDataMapper(result, undefined, copilotServer);
    });
  }
  async saveCopilotOutput(data: CopilotSessionAggregate): Promise<void> {
    const copilotOutput = data.getEntity("copilotOutput");
    if (!copilotOutput || copilotOutput.length !== 1) {
      throw new Error(
        "No CopilotOutput entity found in the provided CopilotSessionAggregate",
      );
    }
    const copilotOutputRepository = new CopilotOutputRepository();
    await copilotOutputRepository.save(copilotOutput[0]);
  }
  async save(entity: CopilotSessionAggregate): Promise<void> {
    const copilotInput = entity.getEntity("copilotInput");
    const copilotServer = entity.getEntity("copilotServer");
    if (copilotInput.length !== 1 || copilotServer.length !== 1) {
      throw new Error(
        "CopilotSessionAggregate must have exactly one CopilotInputAggregate and one CopilotServerEntity",
      );
    }
    const result = await prisma.copilotSession.create({
      data: {
        ...entity.getData(),
        copilotInputId: copilotInput[0].getData("id"),
        copilotServerId: copilotServer[0].getData("id"),
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
      return copilotSessionDataMapper(result, copilotInput);
    });
  }
}
