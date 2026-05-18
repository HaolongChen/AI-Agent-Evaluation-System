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
import {
  CopilotEvent,
  ExecutionJobRunnerV2,
  type CopilotEventsList,
} from "./execution-job-v2.ts";
import { Event, EventTarget } from "ts-event-target";
import type {
  CopilotHumanInputContextInput,
  CopilotHumanInputMessageInput,
  CopilotMessageContent_CopilotTerminateMessage_Fragment,
  CopilotTerminateMessageInput,
  CopilotToolCallBatchResponseMessageFragment,
  CreateCopilotSessionMutation,
  CreateCopilotSessionMutationVariables,
  GetCopilotSubscriptionCountQuery,
  GetCopilotSubscriptionCountQueryVariables,
  GetCopilotSubscriptionCountQueryVariables,
  GetLatestSessionMutation,
  GetLatestSessionMutationVariables,
  MessageArgsInputInput as MessageArgumentsInput,
  SendMessageToSessionMutation,
  SendMessageToSessionMutationVariables,
} from "../../../graphql/generated/types.ts";
import {
  CREATE_COPILOT_SESSION,
  GET_COPILOT_SUBSCRIPTION_COUNT,
  GET_LATEST_SESSION,
  SEND_MESSAGE_TO_SESSION,
} from "../infrastructure/copilot-network.ts";
import type { GQLClient } from "../../shared/application/graphql-client.ts";
import type { ToolCall } from "../../shared/domain/interface/types.ts";
import { runToolCalls } from "./message-handler.ts";
import { z } from "zod";

export class ExecuteCopilotUseCase {
  private projectService: ProjectService;
  private _gqlClient?: GQLClient;
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
  async gqlClient(): Promise<GQLClient> {
    if (this._gqlClient) return this._gqlClient;
    await this.account.ensureLoggedIn();
    this._gqlClient = await this.account.getGQLClient();
    return this._gqlClient;
  }

  async getSubscriptionCount(
    copilotJobEntity: CopilotJobEntity,
  ): Promise<number> {
    const gqlClient = await this.gqlClient();
    const copilotSubscriptionCount = await gqlClient.gqlRequest<
      GetCopilotSubscriptionCountQuery,
      GetCopilotSubscriptionCountQueryVariables
    >(GET_COPILOT_SUBSCRIPTION_COUNT, {
      projectExId: copilotJobEntity.data.projectExId,
      sessionType: "COPILOT",
    });
    const count = z.coerce
      .number()
      .safeParse(copilotSubscriptionCount.copilotSubscriptionCount);
    if (!count.success) {
      throw new Error(count.error.message);
    }
    return count.data;
    // TODO: get last session
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
      [CopilotEventsList[keyof CopilotEventsList], Event<"unsubscribe">]
    >(); // TODO: implement handlers
    const copilotExecutionService = new ExecutionJobRunnerV2(
      copilotJobEntity,
      this.account,
      copilotEvent.dispatchEvent.bind(copilotEvent),
    );
    // await copilotExecutionService.verifySession();
    const latestSession = await this.getLatestSession();
    const currentSessionExId = latestSession ?? (await this.createNewSession());
    const unsubscribe = copilotExecutionService.execute(currentSessionExId);
    copilotEvent.addEventListener("unsubscribe", unsubscribe);
    copilotEvent.addEventListener("CopilotEditableTextMessage", (event) => {
      console.log(event);
      copilotEvent.dispatchEvent(new TerminateEvent());
      copilotEvent.dispatchEvent(new UnsubscribeEvent());
      return event.data.content;
    });
    copilotEvent.addEventListener("CopilotToolCallBatchMessage", (event) => {
      const toolCalls: ToolCall[] = event.data.toolCalls.map(
        (toolCall): ToolCall => {
          return {
            toolCallId: toolCall.id,
            args: toolCall.args as Record<string, unknown>,
            name: toolCall.name,
          };
        },
      );
      const { result, successful, errorMessage } = runToolCalls(
        toolCalls,
        typeSystemStore.schemaGraph,
      );
      if (successful && result) {
        copilotEvent.dispatchEvent(
          new ToolResponseEvent({
            toolCallBatchId: event.data.toolCallBatchId,
            responseByToolCallId: result.data,
            schemaDiff: result.schemaDiff,
          }),
        );
      } else {
        throw new Error(`Error executing tool calls: ${errorMessage}`);
      }
    });

    copilotEvent.addEventListener("CopilotInitialStateMessage", (event) => {
      if (event.data.currentJobIsRunning || event.data.terminated) {
        console.error(
          "Received initial state message for a session that is already running or terminated. This likely indicates an issue with the backend job execution.",
        );
        throw new Error(
          "Received initial state message for a session that is already running or terminated. This likely indicates an issue with the backend job execution.",
        );
      }
      if (event.data.copilotMessages.length > 0) {
        console.warn(
          "Received initial state message with existing copilot messages. This may indicate that the session was not properly cleaned up after the last execution.",
        );
        throw new Error(
          "Received initial state message with existing copilot messages. This may indicate that the session was not properly cleaned up after the last execution.",
        );
      }
    });

    copilotEvent.addEventListener(
      "CopilotToolCallBatchResponseMessage",
      (event) => {},
    );
  }
  async getLatestSession(
    copilotJobEntity: CopilotJobEntity,
  ): Promise<string | null> {
    const gqlClient = await this.gqlClient();
    const latestSessionResult = await gqlClient.gqlRequest<
      GetLatestSessionMutation,
      GetLatestSessionMutationVariables
    >(GET_LATEST_SESSION, {
      projectExId: copilotJobEntity.data.projectExId,
      sessionType: "COPILOT",
    });
    return latestSessionResult.latestSession;
  }

  async createNewSession(copilotJobEntity: CopilotJobEntity) {
    const gqlClient = await this.gqlClient();
    const newCopilotSessionExId = await gqlClient.gqlRequest<
      CreateCopilotSessionMutation,
      CreateCopilotSessionMutationVariables
    >(CREATE_COPILOT_SESSION, {
      projectExId: copilotJobEntity.data.projectExId,
      sessionType: "COPILOT",
    });
    return newCopilotSessionExId.createCopilotSession;
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

export const sendMessageToSession = async (
  sessionExId: string,
  copilotArgumentsInput: MessageArgumentsInput["copilotArgs"],
  client: GQLClient,
) => {
  const response = await client.gqlRequest<
    SendMessageToSessionMutation,
    SendMessageToSessionMutationVariables
  >(SEND_MESSAGE_TO_SESSION, {
    sessionExId,
    argsInput: {
      copilotArgs: copilotArgumentsInput,
    },
  });
  if (!response.sendMessageToSession) {
    throw new Error("Failed to send message to session");
  }
};

export const buildHumanInputMessage = (data: {
  content: string;
  context?: CopilotHumanInputContextInput;
}) => {
  return data as CopilotHumanInputMessageInput;
};

export const buildTerminateMessage = (data?: { reason?: string }) => {
  return data as CopilotTerminateMessageInput;
};

export const buildToolCallBatchMessage = (data: {
  responseByToolCallId: string;
  toolCallBatchId: string;
  schemaDiff?: unknown;
}): CopilotToolCallBatchResponseMessageFragment => {
  return data as CopilotToolCallBatchResponseMessageFragment;
};

export class ToolResponseEvent extends CopilotEvent<"CopilotToolCallBatchResponseMessage"> {
  constructor(data: {
    responseByToolCallId: string;
    toolCallBatchId: string;
    schemaDiff?: unknown;
  }) {
    const message = buildToolCallBatchMessage(data);
    super("CopilotToolCallBatchResponseMessage", message);
  }
}

export class TerminateEvent extends CopilotEvent<"CopilotTerminateMessage"> {
  constructor(data?: { reason?: string }) {
    const message = buildTerminateMessage(data);
    super(
      "CopilotTerminateMessage",
      message as CopilotMessageContent_CopilotTerminateMessage_Fragment,
    );
  }
}

export class UnsubscribeEvent extends Event<"unsubscribe"> {
  constructor() {
    super("unsubscribe");
  }
}
