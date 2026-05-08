import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { AgentFeedbackEntity } from "../entity/agent-feedback.entity.ts";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IAgentFeedbackRepository extends IRepository<AgentFeedbackEntity> {}
