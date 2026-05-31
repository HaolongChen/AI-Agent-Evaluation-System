import { prisma } from "../../../../config/prisma.ts";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import { CopilotOutputEntity } from "../../domain/entity/copilot-output.entity.ts";

export type CopilotOutputRepositoryType = {
  id: string;
  editableText: string | null;
  aiResponse: string;
  copilotSessionExId: string;
  createdAt: Date;
};

export const copilotOutputDataMapper = (
  copilotOutput: CopilotOutputRepositoryType,
): CopilotOutputEntity => {
  return repositoryDateMapper(
    copilotOutput,
    new CopilotOutputEntity(copilotOutput, copilotOutput.id),
  );
};

export class CopilotOutputRepository  {
  async save(entity: CopilotOutputEntity): Promise<void> {
    const output = await prisma.copilotOutput.create({
      data: entity.getData(),
    });
    repositoryDateMapper(output, entity);
  }
  async findById(id: string): Promise<CopilotOutputEntity> {
    const copilotOutput = await prisma.copilotOutput.findUnique({
      where: { id },
    });
    if (!copilotOutput) {
      throw new Error(`CopilotOutput with id ${id} not found`);
    }
    return copilotOutputDataMapper(copilotOutput);
  }
}
