import type { IGoldenSetRepository } from "../modules/copilot-input/domain/interface/golden-set.interface.ts";
import type { IProjectRepository } from "../modules/copilot-input/domain/interface/project.interface.ts";
import type { IUserInputRepository } from "../modules/copilot-input/domain/interface/user-input.interface.ts";
import { GoldenSetRepository } from "../modules/copilot-input/infrastructure/repository/golden-set.repository.ts";
import { ProjectRepository } from "../modules/copilot-input/infrastructure/repository/project.repository.ts";
import { UserInputRepository } from "../modules/copilot-input/infrastructure/repository/user-input.repository.ts";
import type { ICopilotOutputRepository } from "../modules/copilot-output/domain/interface/copilot-output.interface.ts";
import { CopilotOutputRepository } from "../modules/copilot-output/infrastructure/repository/copilot-output.repository.ts";
import type { IAgentFeedbackRepository } from "../modules/rubrics/domain/interface/agent-feedback.interface.ts";
import type { IRubricRepository } from "../modules/rubrics/domain/interface/rubric.interface.ts";
import { AgentFeedbackRepository } from "../modules/rubrics/infrastructure/repository/agent-feedback.repository.ts";
import { RubricRepository } from "../modules/rubrics/infrastructure/repository/rubric.repository.ts";

const prismaRepository: RepositoryInjectionType = {
  goldenSetRepository: new GoldenSetRepository(),
  userInputRepository: new UserInputRepository(),
  projectRepository: new ProjectRepository(),
  rubricRepository: new RubricRepository(),
  copilotOutputRepository: new CopilotOutputRepository(),
  agentFeedbackRepository: new AgentFeedbackRepository(),
};

export const repositoryInjections = {
  prisma: prismaRepository,
};

export type RepositoryInjectionType = {
  goldenSetRepository: IGoldenSetRepository;
  userInputRepository: IUserInputRepository;
  projectRepository: IProjectRepository;
  rubricRepository: IRubricRepository;
  copilotOutputRepository: ICopilotOutputRepository;
  agentFeedbackRepository: IAgentFeedbackRepository;
};

export const repository = repositoryInjections.prisma;
