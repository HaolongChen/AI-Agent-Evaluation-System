import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import {
  ProjectAggregate,
  type ProjectAfterSession,
  type ProjectBeforeCopilotSession,
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
  aggregate?: ProjectAggregate,
): ProjectAggregate => {
  return new ProjectAggregate(
    projectEntityDataMapper(data, aggregate),
    data,
    {},
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
};
