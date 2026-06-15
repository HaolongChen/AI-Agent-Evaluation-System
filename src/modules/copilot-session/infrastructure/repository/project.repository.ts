import { prisma } from "../../../../config/prisma.ts";
import type { ProjectAggregate } from "../../domain/aggregate/project.aggregate.ts";
import { type IProjectRepository } from "../../domain/interface/project-repository.interface.ts";

export type ProjectRepositoryType = {
  id: string;
  copilotInputId: string;
  copilotServerId: string;
  projectExId: string;
  projectName: string;
  createdAt: Date;
  createdBy: string;
  copilotOutput: CopilotOutputRepositoryType;
};

export type CopilotOutputRepositoryType = {
  id: string;
  editableText: string;
  copilotSessionExId: string;
  tasks: unknown[];
  aiResponse: string;
  createdAt: Date;
};

export type ProjectDataMapperParameters = {
  aggregate?: ProjectAggregate;
};

export class ProjectRepository implements IProjectRepository {
  async deleteById(id: string): Promise<void> {
    await prisma.project.delete({ where: { id } });
  }
  async save(data: {
    projectExId: string;
    projectName: string;
    id: string;
  }): Promise<void> {
    await prisma.project.create({ data });
  }

  async getExIdById(id: string): Promise<string> {
    const project = await prisma.project.findUniqueOrThrow({
      where: { id },
    });
    return project.projectExId;
  }
}
