import { prisma } from "../../../../config/prisma.ts";
import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../../dataset/domain/entity/copilot-server.entity.ts";
import { ProjectAggregate } from "../../domain/aggregate/project.aggregate.ts";
import { ProjectEntity } from "../../domain/entity/project.entity.ts";
import { type IProjectRepository } from "../../domain/interface/project-repository.interface.ts";
import {
  projectWithCopilotSessionDataMapper,
  rawProjectDataMapper,
} from "./project.dto.ts";

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
  async getByCopilotServer(
    copilotServer: CopilotServerEntity,
  ): Promise<Array<ProjectEntity>> {
    const projects = await prisma.project.findMany({
      where: {
        copilotServerId: copilotServer.getData("id"),
      },
      include: {
        copilotOutput: true,
      },
    });
    return projects.map((project) => {
      return project.copilotOutput
        ? projectWithCopilotSessionDataMapper(project)
        : rawProjectDataMapper(project);
    });
  }
  async getByCopilotInput(
    copilotInput: CopilotInputAggregate,
  ): Promise<Array<ProjectEntity>> {
    const projects = await prisma.project.findMany({
      where: {
        copilotInputId: copilotInput.getData("id"),
      },
      include: {
        copilotOutput: true,
      },
    });
    return projects.map((project) =>
      projectWithCopilotSessionDataMapper(project),
    );
  }
  async deleteById(id: string): Promise<void> {
    await prisma.project.delete({ where: { id } });
  }
  async save(data: ProjectAggregate): Promise<void> {
    const project = await prisma.project.upsert({
      where: {
        id: data.getData("id"),
        copilotInputId: data.getData("copilotInputId"),
        copilotServerId: data.getData("copilotServerId"),
      },

      update: {
        projectExId: data.getData("projectExId"),
        projectName: data.getData("projectName"),
      },
      create: { ...data.getData() },
    });
    rawProjectDataMapper(project, data);
  }

  async findById(id: string): Promise<ProjectAggregate> {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        copilotOutput: true,
      },
    });
    if (!project) {
      throw new Error(`Project with ID ${id} not found`);
    }
    return rawProjectDataMapper(project);
  }
}
