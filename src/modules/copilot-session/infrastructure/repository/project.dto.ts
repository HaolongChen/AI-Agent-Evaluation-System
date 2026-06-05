import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import {
  ProjectAfterSession,
  ProjectAggregate,
  ProjectBeforeCopilotSession,
} from "../../domain/aggregate/project.aggregate.ts";
import { CopilotOutputEntity } from "../../domain/entity/copilot-output.entity.ts";
import { ProjectEntity } from "../../domain/entity/project.entity.ts";
import type { CopilotOutputRepositoryType } from "./project.repository.ts";

export type RawProjectRepositoryType = {
  id: string;
  copilotInputId: string;
  copilotServerId: string;
  projectExId: string;
  projectName: string;
  createdAt: Date;
  createdBy: string;
};

export type CopilotOutputRepositoryType = {
  id: string;
  editableText: string;
  copilotSessionExId: string;
  tasks: unknown[];
  aiResponse: string;
  createdAt: Date;
};

export const projectEntityDataMapper = (
  data: RawProjectRepositoryType,
  project?: ProjectEntity,
): ProjectEntity => {
  return repositoryDateMapper(
    data,
    project ?? new ProjectEntity(data, {}, data.id),
  );
};

export const copilotOutputDataMapper = (
  data: CopilotOutputRepositoryType,
  entity?: CopilotOutputEntity,
): CopilotOutputEntity => {
  const result = repositoryDateMapper(
    data,
    entity ?? new CopilotOutputEntity(data, data.id),
  );
  return result;
};

export const rawProjectDataMapper = (
  data: RawProjectRepositoryType,
  aggregate?: ProjectBeforeCopilotSession,
): ProjectBeforeCopilotSession => {
  if (aggregate) {
    return repositoryDateMapper(data, aggregate);
  }
  return repositoryDateMapper(
    data,
    new ProjectBeforeCopilotSession(
      data.copilotInputId,
      data.copilotServerId,
      projectEntityDataMapper(data),
    ),
  );
};

export const projectWithCopilotSessionDataMapper = (
  data: RawProjectRepositoryType & {
    copilotOutput: CopilotOutputRepositoryType;
  },
  aggregate?: ProjectAfterSession,
): ProjectAfterSession => {
  if (aggregate) {
    copilotOutputDataMapper(
      data.copilotOutput,
      aggregate.getEntity("copilotOutput"),
    );
  }
  const project = rawProjectDataMapper(data);
  const copilotOutput = copilotOutputDataMapper(data.copilotOutput);
  return new ProjectAfterSession(project, data, { copilotOutput });
};
