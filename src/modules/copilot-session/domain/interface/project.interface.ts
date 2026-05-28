import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../../dataset/domain/entity/copilot-server.entity.ts";
import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { ProjectAggregate } from "../aggregate/project.aggregate.ts";

export interface IProjectRepository extends IRepository<ProjectAggregate> {
  getByCopilotInput(copilotInput: CopilotInputAggregate): Promise<Array<ProjectAggregate>>
  getByCopilotServer(copilotServer: CopilotServerEntity): Promise<Array<ProjectAggregate>>;
  deleteById(id: string): Promise<void>;
}
