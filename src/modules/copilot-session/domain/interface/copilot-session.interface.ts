
import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { CopilotSessionAggregate } from "../aggregate/copilot-session.aggregate.ts";
import type { ProjectAggregate } from "../aggregate/project.aggregate.ts";

export interface ICopilotSessionRepository extends IRepository<CopilotSessionAggregate> {
  getByProject(project: ProjectAggregate): Promise<CopilotSessionAggregate>;

  saveCopilotOutput(data: CopilotSessionAggregate): Promise<void>;
}
