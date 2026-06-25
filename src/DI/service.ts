import { AccountApplicationService } from "../modules/account/application/account-service.ts";
import type { ILoginService } from "../modules/account/domain/interface/login.interface.ts";
import type { INetworkService } from "../modules/account/domain/interface/network-service.interface.ts";
import { LoginService } from "../modules/account/infrastructure/login.ts";
import { NetworkService } from "../modules/account/infrastructure/network.ts";
import { CopilotExecutionUseCase } from "../modules/copilot-session/application/copilot-execution-lifecycle.ts";
import type { IZionProjectService } from "../modules/copilot-session/domain/interface/project-service.interface.ts";
import { CopilotNetworkService } from "../modules/copilot-session/infrastructure/copilot/copilot-network.ts";
import type { ICopilotNetworkService } from "../modules/copilot-session/infrastructure/interface/copilot-network.interface.ts";
import type { ICrdtSchemaService } from "../modules/copilot-session/infrastructure/interface/crdt-schema.interface.ts";
import { CrdtSchemaService } from "../modules/copilot-session/infrastructure/project/crdt-schema-service.ts";
import { ZionProjectService } from "../modules/copilot-session/infrastructure/project/project.service.ts";
import { GetCopilotInputByFiltersUseCase } from "../modules/dataset/application/copilot-input.ts";
import { GetCopilotServerUseCase } from "../modules/dataset/application/copilot-server.ts";
import {
  baseRepositoryBundle,
  type RepositoryInjectionType,
} from "./repository.ts";

export type DomainServiceBundle = {
  networkService: INetworkService;
  loginService: ILoginService;
};

export type InfrastructureServiceBundle = {
  zionProjectService: IZionProjectService;
  copilotNetworkService: ICopilotNetworkService;
  crdtSchemaService: ICrdtSchemaService;
};

export type ApplicationServiceBundle = {
  accountApplicationService: AccountApplicationService;
  getCopilotServerUseCase: GetCopilotServerUseCase;
  getCopilotInputByFiltersUseCase: GetCopilotInputByFiltersUseCase;
  copilotExecutionUseCase: CopilotExecutionUseCase;
};

const networkService = new NetworkService();
const loginService = new LoginService();
const crdtSchemaService = new CrdtSchemaService();
const copilotNetworkService = new CopilotNetworkService(networkService);
const zionProjectService = new ZionProjectService(
  networkService,
  crdtSchemaService,
);

const domainServiceBundle: DomainServiceBundle = {
  networkService,
  loginService,
};

export const infrastructureServiceBundle: InfrastructureServiceBundle = {
  zionProjectService,
  copilotNetworkService,
  crdtSchemaService,
};

export const createApplicationServiceBundle = (
  repository: RepositoryInjectionType,
): ApplicationServiceBundle => {
  return {
    accountApplicationService: new AccountApplicationService(
      domainServiceBundle.networkService,
      domainServiceBundle.loginService,
    ),
    getCopilotServerUseCase: new GetCopilotServerUseCase(
      baseRepositoryBundle.copilotServerRepository,
    ),
    getCopilotInputByFiltersUseCase: new GetCopilotInputByFiltersUseCase({
      copilotInputRepository: baseRepositoryBundle.copilotInputRepository,
    }),
    copilotExecutionUseCase: new CopilotExecutionUseCase(
      repository.projectRepository,
      repository.copilotRepository,
    ),
  };
};
