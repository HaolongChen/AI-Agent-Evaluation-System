import { prisma } from "../../../../config/prisma.ts";
import type { IDomainEventBus } from "../../../shared/domain/event/domain-event.bus.ts";
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
  constructor(private readonly eventBus: IDomainEventBus) {}

  async save(project: ProjectAggregate): Promise<void> {
    await this.create({ ...project.getData() });
    const events = project.events;

    for (const event of events) {
      await this.eventBus.publish(event);
    }
  }
  async create(data: {
    copilotInputId: string;
    copilotServerId: string;
    projectName: string;
    id: string;
  }): Promise<void> {
    await prisma.project.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
  }
  async update(data: { projectExId: string; id: string }): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async getExIdById(id: string): Promise<string> {
    throw new Error("Method not implemented.");
  }
}
