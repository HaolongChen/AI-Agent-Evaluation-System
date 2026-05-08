import { prisma } from "../../../../config/prisma.ts";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import { CopilotOutputEntity } from "../../domain/entity/copilot-output.entity.ts";
import type { ICopilotOutputRepository } from "../../domain/interface/copilot-output.interface.ts";

export class CopilotOutputRepository implements ICopilotOutputRepository {
  async getByGoldenSetIdAndUserInputId(
    goldenSetId: string,
    userInputId: string,
  ): Promise<CopilotOutputEntity[]> {
    const copilotInput = await prisma.goldenSet_userInput.findUnique({
      where: { goldenSetId_userInputId: { goldenSetId, userInputId } },
      include: { copilotOutput: true },
    });
    if (!copilotInput) {
      throw new Error(
        `No association found for GoldenSet ID ${goldenSetId} and UserInput ID ${userInputId}`,
      );
    }
    if (
      !copilotInput.copilotOutput ||
      copilotInput.copilotOutput.length === 0
    ) {
      return [];
    }
    return copilotInput.copilotOutput.map((output) =>
      repositoryDateMapper(output, new CopilotOutputEntity(output, output.id)),
    );
  }
  async save(entity: CopilotOutputEntity): Promise<void> {
    const output = await prisma.copilotOutput.create({
      data: { ...entity.data, id: entity.id },
    });
    entity.createdAt = output.createdAt;
  }
  async findById(id: string): Promise<CopilotOutputEntity> {
    const copilotOutput = await prisma.copilotOutput.findUnique({
      where: { id },
    });
    if (!copilotOutput) {
      throw new Error(`CopilotOutput with id ${id} not found`);
    }
    return repositoryDateMapper(
      copilotOutput,
      new CopilotOutputEntity(copilotOutput, copilotOutput.id),
    );
  }
}
