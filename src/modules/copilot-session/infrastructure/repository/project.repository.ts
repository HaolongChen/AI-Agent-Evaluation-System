import { prisma } from "../../../../config/prisma.ts";
import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../../dataset/domain/entity/copilot-server.entity.ts";
import {
  copilotInputDataMapper,
  type CopilotInputDataMapperParameter,
  type CopilotInputRepositoryType,
} from "../../../dataset/infrastructure/repository/copilot-input.repository.ts";
import {
  copilotServerDataMapper,
  type CopilotServerRepositoryType,
} from "../../../dataset/infrastructure/repository/copilot-server.repository.ts";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import {
  ProjectAfterSession,
  ProjectAggregate,
  ProjectWithCopilotSession,
} from "../../domain/aggregate/project.aggregate.ts";
import { CopilotOutputEntity } from "../../domain/entity/copilot-output.entity.ts";
import { ProjectEntity } from "../../domain/entity/project.entity.ts";
import { type IProjectRepository } from "../../domain/interface/project.interface.ts";

export type ProjectRepositoryType = {
  id: string;
  copilotInputId: string;
  copilotServerId: string;
  projectExId: string;
  projectName: string;
  createdAt: Date;
  createdBy: string;
  copilotServer?: CopilotServerRepositoryType;
  copilotInput?: CopilotInputRepositoryType;
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
  copilotInput?: {
    aggregate?: CopilotInputAggregate;
    entity?: CopilotInputDataMapperParameter;
  };
  copilotServer?: CopilotServerEntity;
  aggregate?: ProjectAggregate;
};

/**
 * State 1: copilot session and copilot output are absent
 * State 2: copilot session is present but copilot output is absent
 * State 3: both copilot session and copilot output are present
 * The data mapper should be able to handle all three states when mapping from repository data to aggregate, and when mapping from aggregate to repository data
 */
export const rawProjectDataMapper = (
  data: {
    id: string;
    copilotInputId: string;
    copilotServerId: string;
    projectExId: string;
    projectName: string;
    createdAt: Date;
    createdBy: string;
    copilotServer?: CopilotServerRepositoryType;
    copilotInput?: CopilotInputRepositoryType;
  },
  entity?: {
    copilotInput?: {
      aggregate?: CopilotInputAggregate;
      entity?: CopilotInputDataMapperParameter;
    };
    copilotServer?: CopilotServerEntity;
  },
): ProjectAggregate => {
  // state 1 starts
  const copilotInput =
    entity?.copilotInput?.aggregate ??
    (data.copilotInput
      ? copilotInputDataMapper(
          data.copilotInput,
          entity?.copilotInput?.entity,
          entity?.copilotInput?.aggregate,
        )
      : undefined);
  const copilotServer = data.copilotServer
    ? copilotServerDataMapper(data.copilotServer, entity?.copilotServer)
    : undefined;
  if (!copilotInput || !copilotServer) {
    throw new Error("Missing required data for CopilotSessionAggregate");
  }
  return new ProjectAggregate(
    copilotInput,
    copilotServer,
    projectEntityDataMapper(data),
  );
};

export const projectDataMapper = (
  data: ProjectRepositoryType,
  entity?: ProjectDataMapperParameters,
): ProjectAfterSession => {
  const project = projectEntityDataMapper(data, entity?.aggregate);
  const copilotOutput = copilotOutputDataMapper(data.copilotOutput);
  return new ProjectAfterSession(project, copilotOutput);
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
        copilotInput: { include: { goldenSet: true, userInput: true } },
        copilotSession: {
          include: {
            copilotOutput: true,
          },
        },
      },
    });
    return projects.map((project) => projectDataMapper(project));
  }
  async getByCopilotInput(
    copilotInput: CopilotInputAggregate,
  ): Promise<Array<ProjectEntity>> {
    const projects = await prisma.project.findMany({
      where: {
        copilotInputId: copilotInput.getData("id"),
      },
      include: {
        copilotServer: true,
        copilotSession: {
          include: {
            copilotOutput: true,
          },
        },
      },
    });
    return projects.map((project) =>
      projectDataMapper(project, { copilotInput: { aggregate: copilotInput } }),
    );
  }
  async deleteById(id: string): Promise<void> {
    await prisma.project.delete({ where: { id } });
  }
  async save(data: ProjectAggregate): Promise<void> {
    const sessionId = data.copilotSessionExId;
    const output = data.getEntity("copilotOutput");
    const project = await prisma.project.upsert({
      where: { id: data.getData("id") },
      include: {
        copilotSession: {
          include: { copilotOutput: true },
        },
      },
      update: {
        ...(sessionId
          ? {
              copilotSession: {
                upsert: {
                  where: { id: sessionId },
                  update: {
                    ...(output
                      ? {
                          copilotOutput: {
                            upsert: {
                              where: { copilotSessionExId: sessionId },
                              update: { ...output.getData() },
                              create: { ...output.getData() },
                            },
                          },
                        }
                      : {}),
                  },
                  create: {
                    ...(output
                      ? {
                          copilotOutput: {
                            create: {
                              ...output.getData(),
                            },
                          },
                        }
                      : {}),
                  },
                },
              },
            }
          : {}),
      },
      create: {
        ...data.getData(),
        copilotInputId: data.getEntity("copilotInput").getData("id"),
        copilotServerId: data.copilotServerId,
        ...(sessionId
          ? {
              copilotSession: {
                create: {
                  id: sessionId,
                  ...(output
                    ? {
                        copilotOutput: {
                          create: {
                            ...output.getData(),
                          },
                        },
                      }
                    : {}),
                },
              },
            }
          : {}),
      },
    });
    projectDataMapper(project, { aggregate: data });
  }

  async findById(id: string): Promise<ProjectAggregate> {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        copilotInput: {
          include: {
            goldenSet: true,
            userInput: true,
          },
        },
        copilotSession: {
          include: {
            copilotOutput: true,
          },
        },
      },
    });
    if (!project) {
      throw new Error(`Project with ID ${id} not found`);
    }
    return projectDataMapper(project);
  }
}
