import type { IGoldenSetRepository } from "../modules/copilot-input/domain/interface/golden-set.interface.ts";
import type { IProjectRepository } from "../modules/copilot-input/domain/interface/project.interface.ts";
import type { IUserInputRepository } from "../modules/copilot-input/domain/interface/user-input.interface.ts";
import type { ICopilotInputRepository } from "../modules/copilot-input/domain/interface/copilot-input.interface.ts";
import { CopilotInputRepository } from "../modules/copilot-input/infrastructure/repository/copilot-input.repository.ts";
import { GoldenSetRepository } from "../modules/copilot-input/infrastructure/repository/golden-set.repository.ts";
import { ProjectRepository } from "../modules/copilot-input/infrastructure/repository/project.repository.ts";
import { UserInputRepository } from "../modules/copilot-input/infrastructure/repository/user-input.repository.ts";
import type { ICopilotOutputRepository } from "../modules/copilot-output/domain/interface/copilot-output.interface.ts";
import { CopilotOutputRepository } from "../modules/copilot-output/infrastructure/repository/copilot-output.repository.ts";
import type { IRepository } from "../modules/shared/domain/interface/repository.interface.ts";
import type { AgentFeedbackEntity } from "../modules/rubrics/domain/entity/agent-feedback.entity.ts";
import type { IRubricRepository } from "../modules/rubrics/domain/interface/rubric.interface.ts";
import { AgentFeedbackRepository } from "../modules/rubrics/infrastructure/repository/agent-feedback.repository.ts";
import { RubricRepository } from "../modules/rubrics/infrastructure/repository/rubric.repository.ts";

export function createRepositoryBundle(): RepositoryInjectionType {
  const projectRepository = new ProjectRepository();
  return {
    goldenSetRepository: new GoldenSetRepository(),
    userInputRepository: new UserInputRepository(),
    projectRepository,
    rubricRepository: new RubricRepository(),
    copilotOutputRepository: new CopilotOutputRepository(),
    copilotInputRepository: new CopilotInputRepository(),
    agentFeedbackRepository: new AgentFeedbackRepository(),
  };
}

export type RepositoryInjectionType = {
  goldenSetRepository: IGoldenSetRepository;
  userInputRepository: IUserInputRepository;
  projectRepository: IProjectRepository;
  rubricRepository: IRubricRepository;
  copilotOutputRepository: ICopilotOutputRepository;
  copilotInputRepository: ICopilotInputRepository;
  agentFeedbackRepository: IRepository<AgentFeedbackEntity>;
};

export const repository = createRepositoryBundle();
