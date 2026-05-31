import { prisma } from "../../../../config/prisma.ts";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import {
  type CopilotOutputRepositoryType,
} from "./copilot-output.repository.ts";
import type { ProjectAggregate } from "../../domain/aggregate/project.aggregate.ts";
import {
  type ProjectDataMapperParameters,
  type ProjectRepositoryType,
} from "./project.repository.ts";
import { CopilotSessionEntity } from "../../domain/entity/copilot-session.entity.ts";

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
): CopilotSessionEntity =>
{
  const session = entity?.project?.aggregate?.getEntity( "copilotSession" );
  return repositoryDateMapper(data, session ?? new CopilotSessionEntity(data.id));
  // const project =
  //   entity?.project?.aggregate ??
  //   (data.project
  //     ? projectDataMapper(data.project, entity?.project?.entity)
  //     : undefined);
  // if (!project) {
  //   throw new Error(
  //     "Missing required data for CopilotSessionAggregate: project",
  //   );
  // }

  // const result = repositoryDateMapper(
  //   data,
  //   new CopilotSessionAggregate(project, {} as ICrdtSchemaLifecycle, data.id),
  // ); // Faking data here
  // if (data.copilotOutput) {
  //   result.setEntity(
  //     "copilotOutput",
  //     repositoryDateMapper(
  //       data.copilotOutput,
  //       new CopilotOutputEntity(data.copilotOutput, data.copilotOutput.id),
  //     ),
  //   );
  // }
  // return result;
};

export class CopilotSessionRepository {
  async save(entity: CopilotSessionEntity, projectId: string): Promise<void> {
    const result = await prisma.copilotSession.upsert({
      create: {
        id: entity.getData( "id" ),
        projectId,
      },
      update: {},
      where: { id: projectId },
    });
    repositoryDateMapper(result, entity);
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
