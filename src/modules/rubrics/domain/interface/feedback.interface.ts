import type {
  ExcludeOptions,
  IRepository,
} from "../../../shared/domain/interface/repository.interface.ts";
import type { AgentFeedbackEntity } from "../entity/agent-feedback.entity.ts";
import type { RubricOptions, RubricReturnType } from "./rubric.interface.ts";

export type AgentFeedbackOptions = {
  name: "agentFeedback";
  options: { rubric: ExcludeOptions<RubricOptions, "agentFeedback"> | boolean };
};

export type AgentFeedbackReturnType<T> = {
  entity: AgentFeedbackEntity;
  rubric: T extends { options: { rubric: infer R } }
    ? RubricReturnType<R>
    : never;
};

export interface IAgentFeedbackRepository extends IRepository<AgentFeedbackEntity> {
  getByRubricId(rubricId: string): Promise<Array<AgentFeedbackEntity>>;
  deleteById(feedbackId: string): Promise<void>;
}
