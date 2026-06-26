import type { IRepository } from "../modules/shared/domain/interface/repository.interface.ts";
import type { AgentFeedbackEntity } from "../modules/rubrics/domain/entity/agent-feedback.entity.ts";
import type { IRubricRepository } from "../modules/rubrics/domain/interface/rubric.interface.ts";
import { AgentFeedbackRepository } from "../modules/rubrics/infrastructure/repository/agent-feedback.repository.ts";
import { RubricRepository } from "../modules/rubrics/infrastructure/repository/rubric.repository.ts";
import { CopilotInputRepository } from "../modules/dataset/infrastructure/repository/copilot-input.repository.ts";
import type { ICopilotInputRepository } from "../modules/dataset/domain/interface/copilot-input.interface.ts";
import type { IGoldenSetRepository } from "../modules/dataset/domain/interface/golden-set.interface.ts";
import type { IProjectRepository } from "../modules/copilot-session/domain/interface/project-repository.interface.ts";
import type { IUserInputRepository } from "../modules/dataset/domain/interface/user-input.interface.ts";
import { GoldenSetRepository } from "../modules/dataset/infrastructure/repository/golden-set.repository.ts";
import { UserInputRepository } from "../modules/dataset/infrastructure/repository/user-input.repository.ts";
import type { ICopilotServerRepository } from "../modules/dataset/domain/interface/copilot-server.interface.ts";
import { CopilotServerRepository } from "../modules/dataset/infrastructure/repository/copilot-server.repository.ts";
import type { ICopilotRepository } from "../modules/copilot-session/domain/interface/copilot-repository.interface.ts";
import type { IDomainEventBus } from "../modules/shared/domain/event/domain-event.bus.ts";
import { ProjectRepository, ProjectRepositoryService } from "../modules/copilot-session/infrastructure/repository/project.repository.ts";
import { CopilotRepository, CopilotRepositoryService } from "../modules/copilot-session/infrastructure/repository/copilot.repository.ts";
export const baseRepositoryBundle = {
  goldenSetRepository: new GoldenSetRepository(),
  userInputRepository: new UserInputRepository(),
  rubricRepository: new RubricRepository(),
  copilotInputRepository: new CopilotInputRepository(),
  agentFeedbackRepository: new AgentFeedbackRepository(),
  copilotServerRepository: new CopilotServerRepository(),
  copilotRepositoryService: new CopilotRepositoryService(),
  projectRepositoryService: new ProjectRepositoryService(),
} as const;

export type RepositoryInjectionType = {
  goldenSetRepository: IGoldenSetRepository;
  userInputRepository: IUserInputRepository;
  projectRepository: IProjectRepository;
  rubricRepository: IRubricRepository;
  copilotRepository: ICopilotRepository;
  copilotInputRepository: ICopilotInputRepository;
  copilotServerRepository: ICopilotServerRepository;
  agentFeedbackRepository: IRepository<AgentFeedbackEntity>;
  copilotRepositoryService: CopilotRepositoryService;
  projectRepositoryService: ProjectRepositoryService;
};

const createCopilotSessionRepositoryBundle = (
  eventBus: IDomainEventBus,
): Pick<RepositoryInjectionType, "projectRepository" | "copilotRepository"> => {
  return {
    projectRepository: new ProjectRepository(eventBus),
    copilotRepository: new CopilotRepository(eventBus),
  };
};

export const createRepositoryBundle = (
  eventBus: IDomainEventBus,
): RepositoryInjectionType => {
  return {
    ...baseRepositoryBundle,
    ...createCopilotSessionRepositoryBundle(eventBus),
  };
};
