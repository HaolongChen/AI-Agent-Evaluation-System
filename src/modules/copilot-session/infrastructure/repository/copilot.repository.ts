import { prisma } from "../../../../config/prisma.ts";
import type { ICopilotRepository } from "../../domain/interface/copilot-repository.interface.ts";

export class CopilotRepository implements ICopilotRepository {
  async save(
    id: string,
    data?: { editableText: string } | { aiResponse: string },
    task?: unknown,
  ): Promise<void> {
    await prisma.copilotOutput.update({
      where: { id },
      data: {
        ...data,
        tasks: {
          push: task as object,
        },
      },
    });
  }
  async linkProject(
    projectId: string,
    copilotInputId: string,
    copilotServerId: string,
  ): Promise<void> {
    await prisma.project.update({
      where: { id: projectId },
      data: { copilotInputId, copilotServerId },
    });
  }
  async linkCopilotSession(
    copilotSessionExId: string,
    projectId: string,
    id: string,
  ): Promise<void> {
    await prisma.copilotOutput.upsert({
      where: { id },
      update: { copilotSessionExId, projectId },
      create: { id, projectId, copilotSessionExId },
    });
  }
}
