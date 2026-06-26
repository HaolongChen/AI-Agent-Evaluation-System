import { AccountApplicationService } from "../modules/account/application/account-service.ts";
import type { ILoginService } from "../modules/account/domain/interface/login.interface.ts";
import type { INetworkService } from "../modules/account/domain/interface/network-service.interface.ts";
import { LoginService } from "../modules/account/infrastructure/login.ts";
import { NetworkService } from "../modules/account/infrastructure/network.ts";
import { CopilotExecutionUseCase } from "../modules/copilot-session/application/copilot-execution-lifecycle.ts";
import { CopilotSessionEventRegistrationService } from "../modules/copilot-session/application/event-registration.ts";
import { GetCopilotSessionUseCase } from "../modules/copilot-session/application/get-copilot-session.ts";
import type { IZionProjectService } from "../modules/copilot-session/domain/interface/project-service.interface.ts";
import { CopilotNetworkService } from "../modules/copilot-session/infrastructure/copilot/copilot-network.ts";
import { EventConsumerFactory } from "../modules/copilot-session/infrastructure/event-handler/event-consumer-factory.ts";
import type { ICopilotNetworkService } from "../modules/copilot-session/infrastructure/interface/copilot-network.interface.ts";
import type { ICrdtSchemaService } from "../modules/copilot-session/infrastructure/interface/crdt-schema.interface.ts";
import { CrdtSchemaService } from "../modules/copilot-session/infrastructure/project/crdt-schema-service.ts";
import { ZionProjectService } from "../modules/copilot-session/infrastructure/project/project.service.ts";
import {
	BuildCopilotInputUseCase,
	GetCopilotInputByFiltersUseCase,
} from "../modules/dataset/application/copilot-input.ts";
import { GetCopilotServerUseCase } from "../modules/dataset/application/copilot-server.ts";
import { CreateGoldenSetUseCase } from "../modules/dataset/application/create-golden-set.ts";
import { CreateUserInputUseCase } from "../modules/dataset/application/create-user-input.ts";
import {
	baseRepositoryBundle,
	type RepositoryInjectionType,
} from "./repository.ts";

export type InfrastructureServiceBundle = {
	networkService: INetworkService;
	loginService: ILoginService;
	zionProjectService: IZionProjectService;
	copilotNetworkService: ICopilotNetworkService;
	crdtSchemaService: ICrdtSchemaService;
};

export type ApplicationServiceBundle = {
	accountApplicationService: AccountApplicationService;
	getCopilotServerUseCase: GetCopilotServerUseCase;
	getCopilotInputByFiltersUseCase: GetCopilotInputByFiltersUseCase;
	copilotExecutionUseCase: CopilotExecutionUseCase;
	copilotSessionEventRegistrationService: CopilotSessionEventRegistrationService;
	getCopilotSessionUseCase: GetCopilotSessionUseCase;
	buildCopilotInputUseCase: BuildCopilotInputUseCase;
	createGoldenSetUseCase: CreateGoldenSetUseCase;
	createUserInputUseCase: CreateUserInputUseCase;
};

const networkService = new NetworkService();
const loginService = new LoginService();
const crdtSchemaService = new CrdtSchemaService();
const copilotNetworkService = new CopilotNetworkService(networkService);
const zionProjectService = new ZionProjectService(
	networkService,
	crdtSchemaService,
);

const copilotSessionEventConsumerFactory = (
	repository: RepositoryInjectionType,
) =>
	new EventConsumerFactory(
		zionProjectService,
		copilotNetworkService,
		baseRepositoryBundle.copilotRepositoryService,
		repository.copilotRepository,
		repository.projectRepository,
	);

export const infrastructureServiceBundle: InfrastructureServiceBundle = {
	networkService,
	loginService,
	zionProjectService,
	copilotNetworkService,
	crdtSchemaService,
};

export const createApplicationServiceBundle = (
	repository: RepositoryInjectionType,
): ApplicationServiceBundle => {
	return {
		accountApplicationService: new AccountApplicationService(
			infrastructureServiceBundle.networkService,
			infrastructureServiceBundle.loginService,
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
		copilotSessionEventRegistrationService:
			new CopilotSessionEventRegistrationService(
				copilotSessionEventConsumerFactory(repository),
			),
		getCopilotSessionUseCase: new GetCopilotSessionUseCase({
			projectRepository: repository.projectRepository,
			copilotRepository: repository.copilotRepository,
		}),
		buildCopilotInputUseCase: new BuildCopilotInputUseCase({
			copilotInputRepository: baseRepositoryBundle.copilotInputRepository,
			goldenSetRepository: baseRepositoryBundle.goldenSetRepository,
			userInputRepository: baseRepositoryBundle.userInputRepository,
		}),
		createGoldenSetUseCase: new CreateGoldenSetUseCase(
			baseRepositoryBundle.goldenSetRepository,
		),
		createUserInputUseCase: new CreateUserInputUseCase(
			baseRepositoryBundle.userInputRepository,
		),
	};
};
