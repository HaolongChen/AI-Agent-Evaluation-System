import { prisma } from "../../../../config/prisma.ts";
import { CopilotOutputEntity } from "../../domain/entity/copilot-output.schema.js";
import type { ICopilotOutputRepository } from "../../domain/interface/copilot-output.interface.ts";

export class CopilotOutputRepository implements ICopilotOutputRepository {
  async getByGoldenSetIdAndUserInputId(
    goldenSetId: string,
    userInputId: string,
  ): Promise<CopilotOutputEntity[]> {
    const copilotOutputs = await prisma.copilotOutput.findMany({
      where: {
        goldenSetId,
        userInputId,
      },
    });
    return copilotOutputs.map(
      (output) => new CopilotOutputEntity(output, output.id),
    );
  }
  async save(entity: CopilotOutputEntity): Promise<void> {
    await prisma.copilotOutput.create({
      data: { ...entity.data, id: entity.id },
    });
  }
  async findById(id: string): Promise<CopilotOutputEntity> {
    const copilotOutput = await prisma.copilotOutput.findUnique({
      where: { id },
    });
    if (!copilotOutput) {
      throw new Error(`CopilotOutput with id ${id} not found`);
    }
    return new CopilotOutputEntity(copilotOutput, copilotOutput.id);
  }
}
