import type {
  IRepository,
} from "../../../shared/domain/interface/repository.interface.ts";
import type { AgentFeedbackEntity } from "../entity/agent-feedback.entity.ts";
export interface IAgentFeedbackRepository extends IRepository<AgentFeedbackEntity> {
  getByRubricId(rubricId: string): Promise<Array<AgentFeedbackEntity>>;
  deleteById(feedbackId: string): Promise<void>;
}
