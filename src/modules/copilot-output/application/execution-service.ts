import { getTypeSystemStoreForCopilot } from "../../copilot-input/infrastructure/type-system-store.ts";
import type { Account } from "../../account/application/account-handler.ts";
import { ProjectService } from "../../copilot-input/application/project-service.ts";
import type { IGoldenSetRepository } from "../../copilot-input/domain/interface/golden-set.interface.ts";
import { CopilotJobEntity } from "../domain/entity/copilot-job.entity.ts";
import { CopilotOutputEntity } from "../domain/entity/copilot-output.entity.ts";
import type { ICopilotOutputRepository } from "../domain/interface/copilot-output.interface.ts";
import { EvaluationJobRunner } from "./execution-job.ts";
import type { IProjectRepository } from "../../copilot-input/domain/interface/project.interface.ts";
import { assertNotNull } from "../../shared/domain/service/type-system.service.ts";
import { ExecutionJobRunnerV2, type CopilotEvent } from "./execution-job-v2.ts";
import { EventTarget, type Event } from "ts-event-target";
import type {
  MessageArgsInputInput as MessageArgumentsInput,
  SendMessageToSessionMutation,
  SendMessageToSessionMutationVariables,
} from "../../../graphql/generated/types.ts";
import { SEND_MESSAGE_TO_SESSION } from "../infrastructure/copilot-network.ts";

export class ExecuteCopilotUseCase {
  private projectService: ProjectService;
  constructor(
    private readonly repository: {
      copilotOutputRepository: ICopilotOutputRepository;
      goldenSetRepository: IGoldenSetRepository;
      projectRepository: IProjectRepository;
    },
    private readonly account: Account,
  ) {
    this.projectService = new ProjectService(
      this.account,
      this.repository.projectRepository,
    );
  }

  private generateProjectName(
    goldenSetId: string,
    userInputId: string,
  ): string {
    return `temp-project-${goldenSetId}-${userInputId}-${Date.now()}`;
  }

  async setupEnvironment(goldenSetId: string, userInputId: string) {
    const { goldenSetEntity, userInputEntity } =
      await this.repository.goldenSetRepository.getCopilotInputByGoldenSetIdAndUserInputId(
        goldenSetId,
        userInputId,
      );
    const typeSystemStore = await getTypeSystemStoreForCopilot(
      goldenSetEntity.data.schemaId,
      this.account,
    );
    const projectName = this.generateProjectName(goldenSetId, userInputId);
    const project = await this.projectService.createProject(
      projectName,
      goldenSetEntity.data.schemaId,
    );
    return { project, userInputEntity, typeSystemStore };
  }

  async execute(goldenSetId: string, userInputId: string) {
    const { project, userInputEntity, typeSystemStore } =
      await this.setupEnvironment(goldenSetId, userInputId);
    await this.account.ensureLoggedIn();
    const wsUrl = buildCopilotExecutionUrl(
      process.env.BACKEND_GRAPHQL_URL,
      project.projectExId,
      this.account.accessToken,
      "copilot-output",
    );
    const copilotJobEntity = new CopilotJobEntity({
      projectExId: project.projectExId,
      query: userInputEntity.data.content,
      wsUrl,
      schemaGraph: assertNotNull(typeSystemStore.schemaGraph),
    });
    const evaluationJobRunner = new EvaluationJobRunner(copilotJobEntity);
    evaluationJobRunner.start();
    const editableText = await evaluationJobRunner.waitForResult();
    await this.projectService.deleteProject(project.projectExId);
    const copilotOutputEntity = new CopilotOutputEntity({
      goldenSetId,
      userInputId,
      content: editableText,
    });
    await this.repository.copilotOutputRepository.save(copilotOutputEntity);
    return copilotOutputEntity.toJSON();
  }

  async sendMessageToSession(argumentsInput: MessageArgumentsInput) {
    const gqlClient = await this.account.getGQLClient();
    await gqlClient.gqlRequest<
      SendMessageToSessionMutation,
      SendMessageToSessionMutationVariables
    >(SEND_MESSAGE_TO_SESSION, {
      sessionExId: this.account.sessionId,
      argsInput: argumentsInput,
    });
  }

  async executeV2(goldenSetId: string, userInputId: string) {
    const { project, userInputEntity, typeSystemStore } =
      await this.setupEnvironment(goldenSetId, userInputId);
    const copilotJobEntity = new CopilotJobEntity({
      projectExId: project.projectExId,
      query: userInputEntity.data.content,
      wsUrl: process.env.SUBSCRIPTION_GRAPHQL_URL,
      schemaGraph: assertNotNull(typeSystemStore.schemaGraph),
    });
    const copilotEvent = new EventTarget<
      [CopilotEvent, Event<"unsubscribe">]
    >(); // TODO: implement handlers
    const copilotExecutionService = new ExecutionJobRunnerV2(
      copilotJobEntity,
      this.account,
      copilotEvent.dispatchEvent.bind(copilotEvent),
    );
    // await copilotExecutionService.verifySession();
    const latestSession = await copilotExecutionService.getLatestSession();
    const currentSessionExId =
      latestSession ?? (await copilotExecutionService.createNewSession());
    const unsubscribe = copilotExecutionService.execute(currentSessionExId);
    copilotEvent.addEventListener("unsubscribe", unsubscribe);
  }
}

export const buildCopilotExecutionUrl = (
  hostname: string,
  projectExId: string,
  userToken: string,
  clientType: string,
): string => {
  return `${hostname}projectExId=${projectExId}&userToken=${userToken}&clientType=${clientType}`;
};
