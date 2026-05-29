import { prisma } from "../../../../config/prisma.ts";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import { CopilotSessionAggregate } from "../../domain/aggregate/copilot-session.aggregate.ts";
import { CopilotOutputEntity } from "../../domain/entity/copilot-output.entity.ts";
import type { ICopilotSessionRepository } from "../../domain/interface/copilot-session.interface.ts";
import {
  CopilotOutputRepository,
  type CopilotOutputRepositoryType,
} from "./copilot-output.repository.ts";
import type { ProjectAggregate } from "../../domain/aggregate/project.aggregate.ts";
import {
  projectDataMapper,
  type ProjectDataMapperParameters,
  type ProjectRepositoryType,
} from "./project.repository.ts";

export type CopilotSessionRepositoryType = {
  copilotOutput?: CopilotOutputRepositoryType | null;
  project?: ProjectRepositoryType;
} & {
  id: string;
  projectId: string;
  createdAt: Date;
};

export type CopilotSessionDataMapperParameter = {
  project?: {
    aggregate?: ProjectAggregate;
    entity?: ProjectDataMapperParameters;
  };
};

export const copilotSessionDataMapper = (
  data: CopilotSessionRepositoryType,
  entity?: CopilotSessionDataMapperParameter,
): CopilotSessionAggregate => {
  const project =
    entity?.project?.aggregate ??
    (data.project
      ? projectDataMapper(data.project, entity?.project?.entity)
      : undefined);
  if (!project) {
    throw new Error(
      "Missing required data for CopilotSessionAggregate: project",
    );
  }

  const result = repositoryDateMapper(
    data,
    new CopilotSessionAggregate(project, data.id),
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
  async saveCopilotOutput(data: CopilotSessionAggregate): Promise<void> {
    const copilotOutput = data.getEntity("copilotOutput");
    if (!copilotOutput) {
      throw new Error(
        "No CopilotOutput entity found in the provided CopilotSessionAggregate",
      );
    }
    const copilotOutputRepository = new CopilotOutputRepository();
    await copilotOutputRepository.save(copilotOutput);
  }
  async save(entity: CopilotSessionAggregate): Promise<void> {
    const result = await prisma.copilotSession.upsert({
      create: {
        ...entity.getData(),
        projectId: entity.getEntity("project").getData("id"),
      },
      update: {},
      where: { id: entity.getData("id") },
    });
    repositoryDateMapper(result, entity);
    await this.saveCopilotOutput(entity);
  }
  async findById(id: string): Promise<CopilotSessionAggregate> {
    return copilotSessionDataMapper(
      await prisma.copilotSession.findUniqueOrThrow({
        where: { id },
        include: {
          project: {
            include: {
              copilotInput: {
                include: {
                  goldenSet: true,
                  userInput: true,
                },
              },
              copilotServer: true,
            },
          },
          copilotOutput: true,
        },
      }),
    );
  }
  async getByProject(
    project: ProjectAggregate,
  ): Promise<CopilotSessionAggregate> {
    return copilotSessionDataMapper(
      await prisma.copilotSession.findUniqueOrThrow({
        where: { projectId: project.getData("id") },
        include: { copilotOutput: true },
      }),
      { project: { aggregate: project } },
    );
  }
}
