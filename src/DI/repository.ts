import type { IRepository } from "../modules/shared/domain/interface/repository.interface.ts";
import type { AgentFeedbackEntity } from "../modules/rubrics/domain/entity/agent-feedback.entity.ts";
import type { IRubricRepository } from "../modules/rubrics/domain/interface/rubric.interface.ts";
import { AgentFeedbackRepository } from "../modules/rubrics/infrastructure/repository/agent-feedback.repository.ts";
import { RubricRepository } from "../modules/rubrics/infrastructure/repository/rubric.repository.ts";
import { CopilotInputRepository } from "../modules/dataset/infrastructure/repository/copilot-input.repository.ts";
import type { ICopilotOutputRepository } from "../modules/copilot-session/domain/interface/copilot-output.interface.ts";
import { CopilotOutputRepository } from "../modules/copilot-session/infrastructure/repository/copilot-output.repository.ts";
import type { ICopilotInputRepository } from "../modules/dataset/domain/interface/copilot-input.interface.ts";
import type { IGoldenSetRepository } from "../modules/dataset/domain/interface/golden-set.interface.ts";
import type { IProjectRepository } from "../modules/copilot-session/domain/interface/project.interface.ts";
import type { IUserInputRepository } from "../modules/dataset/domain/interface/user-input.interface.ts";
import { GoldenSetRepository } from "../modules/dataset/infrastructure/repository/golden-set.repository.ts";
import { ProjectRepository } from "../modules/copilot-session/infrastructure/repository/project.repository.ts";
import { UserInputRepository } from "../modules/dataset/infrastructure/repository/user-input.repository.ts";
import type { ICopilotSessionRepository } from "../modules/copilot-session/domain/interface/copilot-session.interface.ts";
import type { ICopilotServerRepository } from "../modules/dataset/domain/interface/copilot-server.interface.ts";
import { CopilotSessionRepository } from "../modules/copilot-session/infrastructure/repository/copilot-session.repository.ts";
import { CopilotServerRepository } from "../modules/dataset/infrastructure/repository/copilot-server.repository.ts";
export function createRepositoryBundle(): RepositoryInjectionType {
  return {
    goldenSetRepository: new GoldenSetRepository(),
    userInputRepository: new UserInputRepository(),
    projectRepository: new ProjectRepository(),
    rubricRepository: new RubricRepository(),
    copilotOutputRepository: new CopilotOutputRepository(),
    copilotInputRepository: new CopilotInputRepository(),
    agentFeedbackRepository: new AgentFeedbackRepository(),
    copilotServerRepository: new CopilotServerRepository(),
    copilotSessionRepository: new CopilotSessionRepository(),
  };
}

export type RepositoryInjectionType = {
  goldenSetRepository: IGoldenSetRepository;
  userInputRepository: IUserInputRepository;
  projectRepository: IProjectRepository;
  rubricRepository: IRubricRepository;
  copilotOutputRepository: ICopilotOutputRepository;
  copilotInputRepository: ICopilotInputRepository;
  copilotSessionRepository: ICopilotSessionRepository;
  copilotServerRepository: ICopilotServerRepository;
  agentFeedbackRepository: IRepository<AgentFeedbackEntity>;
};

export const repository = createRepositoryBundle();
