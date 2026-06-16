import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { ZionProject } from "../entity/zion-project.entity.ts";

export interface IProjectManager
{
  buildZionProject ( copilotInput: CopilotInputAggregate, projectId: string ): ZionProject;
}