import type { IGoldenSetRepository } from "../modules/copilot-input/domain/interface/golden-set.interface.ts";
import type { IProjectRepository } from "../modules/copilot-input/domain/interface/project.interface.ts";
import type { IUserInputRepository } from "../modules/copilot-input/domain/interface/user-input.interface.ts";
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
import type { IProjectLifecycle } from "../modules/copilot-input/domain/interface/project-lifecycle.interface.ts";
import { ProjectLifecycleAdapter } from "../modules/copilot-input/infrastructure/project-lifecycle-adapter.ts";
import { myAccount } from "./account.ts";

const prismaRepository: RepositoryInjectionType = {
  goldenSetRepository: new GoldenSetRepository(),
  userInputRepository: new UserInputRepository(),
  projectRepository: new ProjectRepository(),
  rubricRepository: new RubricRepository(),
  copilotOutputRepository: new CopilotOutputRepository(),
  agentFeedbackRepository: new AgentFeedbackRepository(),
  projectLifecycle: new ProjectLifecycleAdapter(
    myAccount,
    new ProjectRepository(),
  ),
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
  agentFeedbackRepository: IRepository<AgentFeedbackEntity>;
  projectLifecycle: IProjectLifecycle;
};

export const repository = repositoryInjections.prisma;
