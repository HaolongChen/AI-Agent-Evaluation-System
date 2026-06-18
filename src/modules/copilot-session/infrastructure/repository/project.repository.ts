import { prisma } from "../../../../config/prisma.ts";
import type { Account } from "../../../account/domain/entity/account.entity.ts";
import { copilotInputDataMapper } from "../../../dataset/infrastructure/repository/copilot-input.repository.ts";
import type { IDomainEventBus } from "../../../shared/domain/event/domain-event.bus.ts";
import { ProjectAggregate } from "../../domain/aggregate/project.aggregate.ts";
import { type IProjectRepository } from "../../domain/interface/project-repository.interface.ts";
import type { IProjectRepositoryService } from "../interface/project-repository-service.interface.ts";

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

  async save(entity: ProjectAggregate): Promise<void> {
    const { id, projectName, copilotInputId } = entity.getData();
    const state = entity.state;
    if (state.status === "pending") {
      throw new Error("Project is still pending, cannot save to database.");
    }
    await prisma.project.upsert({
      where: { id },
      update: { projectName, copilotInputId, ...state },
      create: { id, projectName, copilotInputId, ...state },
    });
    const events = entity.events;
    await this.eventBus.publishAll(events);
  }
  async findById(id: string, account: Account): Promise<ProjectAggregate> {
    const project = await prisma.project.findUniqueOrThrow({
      where: { id },
      include: {
        copilotInput: {
          include: {
            goldenSet: true,
            userInput: true,
          },
        },
      },
    });
    const copilotInput = copilotInputDataMapper(project.copilotInput);
    return project.projectExId
      ? ProjectAggregate.complete(
          project.projectExId,
          project.id,
          copilotInput,
          account,
        )
      : new ProjectAggregate(copilotInput, account, project.id);
  }
}

export class ProjectRepositoryService implements IProjectRepositoryService {
  async saveProjectExId(id: string, projectExId: string): Promise<void> {
    await prisma.project.update({
      where: { id },
      data: { projectExId, status: "active" },
    });
  }
  async markProjectDeleted(projectExId: string): Promise<void> {
    await prisma.project.update({
      where: { projectExId },
      data: { status: "deleted" },
    });
  }
}
