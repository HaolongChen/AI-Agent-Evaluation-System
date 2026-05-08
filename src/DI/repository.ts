import type { IGoldenSetRepository } from "../modules/copilot-input/domain/interface/golden-set.interface.ts";
import type { IUserInputRepository } from "../modules/copilot-input/domain/interface/user-input.interface.ts";
import { GoldenSetRepository } from "../modules/copilot-input/infrastructure/repository/golden-set.repository.ts";
import { UserInputRepository } from "../modules/copilot-input/infrastructure/repository/user-input.repository.ts";
import type { ICopilotOutputRepository } from "../modules/copilot-output/domain/interface/copilot-output.interface.ts";
import { CopilotOutputRepository } from "../modules/copilot-output/infrastructure/repository/copilot-output.repository.ts";
import type { IRubricRepository } from "../modules/rubrics/domain/interface/rubric.interface.ts";
import { RubricRepository } from "../modules/rubrics/infrastructure/repository/rubric.repository.ts";

const prismaRepository: RepositoryInjectionType = {
  goldenSetRepository: new GoldenSetRepository(),
  userInputRepository: new UserInputRepository(),
  rubricRepository: new RubricRepository(),
  copilotOutputRepository: new CopilotOutputRepository(),
};

export const repositoryInjections = {
  prisma: prismaRepository,
};

export type RepositoryInjectionType = {
  goldenSetRepository: IGoldenSetRepository;
  userInputRepository: IUserInputRepository;
  rubricRepository: IRubricRepository;
  copilotOutputRepository: ICopilotOutputRepository;
};

export const repository = repositoryInjections.prisma;
