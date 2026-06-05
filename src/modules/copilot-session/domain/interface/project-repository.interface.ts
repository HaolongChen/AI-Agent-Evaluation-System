import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../../dataset/domain/entity/copilot-server.entity.ts";
import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type {
  ProjectAfterSession,
  ProjectAggregate,
} from "../aggregate/project.aggregate.ts";
import type { ProjectEntity } from "../entity/project.entity.ts";

export interface IProjectRepository extends IRepository<ProjectAggregate> {
  getByCopilotInput(
    copilotInput: CopilotInputAggregate,
  ): Promise<Array<ProjectEntity>>;
  getByCopilotServer(
    copilotServer: CopilotServerEntity,
  ): Promise<Array<ProjectEntity>>;
  deleteById(id: string): Promise<void>;
  saveCopilotOutput(data: ProjectAfterSession): Promise<void>;
}
