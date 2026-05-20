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
import { CopilotInputEvent, ExecutionJobRunnerV2 } from "./execution-job-v2.ts";
import type {
  CreateCopilotSessionMutation,
  CreateCopilotSessionMutationVariables,
  GetCopilotSubscriptionCountQuery,
  GetCopilotSubscriptionCountQueryVariables,
  GetLatestSessionMutation,
  GetLatestSessionMutationVariables,
} from "../../../graphql/generated/types.ts";
import {
  CREATE_COPILOT_SESSION,
  GET_COPILOT_SUBSCRIPTION_COUNT,
  GET_LATEST_SESSION,
} from "../infrastructure/copilot-network.ts";
import type { ToolCall } from "../../shared/domain/interface/types.ts";
import { runToolCalls } from "./message-handler.ts";
import { z } from "zod";
import { Event } from "ts-event-target";
import { clearTimeout } from "node:timers";

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

  async setupEnvironment(
    goldenSetId: string,
    userInputId: string,
    legacy: boolean = false,
  ): Promise<CopilotJobEntity> {
    const { goldenSetEntity, userInputEntity } =
      await this.repository.goldenSetRepository.getCopilotInputByGoldenSetIdAndUserInputId(
        goldenSetId,
        userInputId,
      );
    const projectName = this.generateProjectName(goldenSetId, userInputId);
    const projectEntity = await this.projectService.createProject(
      projectName,
      goldenSetEntity.data.schemaId,
    );
    const typeSystemStore = await getTypeSystemStoreForCopilot(
      projectEntity.data.projectExId,
      goldenSetEntity.data.schemaId,
      this.account,
    );

    await typeSystemStore.importSchemaManual();
    const copilotJobEntity = new CopilotJobEntity({
      projectExId: projectEntity.data.projectExId,
      query: userInputEntity.data.content,
      wsUrl: legacy
        ? buildCopilotExecutionUrl(
            process.env.BACKEND_GRAPHQL_URL,
            projectEntity.data.projectExId,
            this.account.accessToken,
            "copilot-output",
          )
        : process.env.SUBSCRIPTION_GRAPHQL_URL,
      schemaGraph: assertNotNull(typeSystemStore.schemaGraph),
    });

    return copilotJobEntity;
  }

  private generateProjectName(
    goldenSetId: string,
    userInputId: string,
  ): string {
    return `temp-project-${goldenSetId}-${userInputId}-${Date.now()}`;
  }
  async execute(goldenSetId: string, userInputId: string) {
    const copilotJobEntity = await this.setupEnvironment(
      goldenSetId,
      userInputId,
    );
    await this.account.ensureLoggedIn();

    const evaluationJobRunner = new EvaluationJobRunner(copilotJobEntity);
    evaluationJobRunner.start();
    const editableText = await evaluationJobRunner.waitForResult();
    await this.projectService.deleteProjectInDatabase(
      "projectExId",
      copilotJobEntity.data.projectExId,
    );
    const copilotOutputEntity = new CopilotOutputEntity({
      goldenSetId,
      userInputId,
      content: editableText,
    });
    await this.repository.copilotOutputRepository.save(copilotOutputEntity);
    return copilotOutputEntity.toJSON();
  }

  async getLatestSession(projectExId: string): Promise<string | null> {
    const gqlClient = await this.account.getGQLClient();
    const latestSessionResult = await gqlClient.gqlRequest<
      GetLatestSessionMutation,
      GetLatestSessionMutationVariables
    >(GET_LATEST_SESSION, {
      projectExId,
      sessionType: "COPILOT",
    });
    return latestSessionResult.latestSession;
  }

  async createNewSession(projectExId: string): Promise<string> {
    const gqlClient = await this.account.getGQLClient();
    const newCopilotSessionExId = await gqlClient.gqlRequest<
      CreateCopilotSessionMutation,
      CreateCopilotSessionMutationVariables
    >(CREATE_COPILOT_SESSION, {
      projectExId,
      sessionType: "COPILOT",
    });
    return newCopilotSessionExId.createCopilotSession;
  }

  async getSubscriptionCount(projectExId: string): Promise<number> {
    const gqlClient = await this.account.getGQLClient();
    const copilotSubscriptionCount = await gqlClient.gqlRequest<
      GetCopilotSubscriptionCountQuery,
      GetCopilotSubscriptionCountQueryVariables
    >(GET_COPILOT_SUBSCRIPTION_COUNT, {
      projectExId,
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

  copilotJobEntityToCopilotOutputEntity(
    copilotJobEntity: CopilotJobEntity,
    goldenSetId: string,
    userInputId: string,
  ): CopilotOutputEntity {
    if (!copilotJobEntity.editableText) {
      throw new Error(
        "Copilot job has not produced editable text or has not terminated yet.",
      );
    }
    return new CopilotOutputEntity({
      goldenSetId,
      userInputId,
      content: copilotJobEntity.editableText,
    });
  }

  async executeV2(goldenSetId: string, userInputId: string) {
    const copilotJobEntity = await this.setupEnvironment(
      goldenSetId,
      userInputId,
    );
    try {
      const sessionExId =
        (await this.getLatestSession(copilotJobEntity.data.projectExId)) ??
        (await this.createNewSession(copilotJobEntity.data.projectExId));
      const copilotExecutionService = new ExecutionJobRunnerV2(
        sessionExId,
        await this.account.getWsClient(),
        await this.account.getGQLClient(),
      );
      const { publish, listen } = copilotExecutionService.execute();
      const jobPromise = new Promise<CopilotOutputEntity>((resolve, reject) => {
        const timer = setTimeout(
          () => {
            reject("timeout");
          },
          2 * 60 * 1000,
        );
        try {
          listen("CopilotEditableTextMessage", async (event) => {
            console.log(event);

            copilotJobEntity.editableText = event.data.content;
            publish(new CopilotInputEvent("TERMINATE", {}));
            const copilotOutputEntity =
              this.copilotJobEntityToCopilotOutputEntity(
                copilotJobEntity,
                goldenSetId,
                userInputId,
              );
            resolve(copilotOutputEntity);
          });
          listen("CopilotToolCallBatchMessage", (event) => {
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
              copilotJobEntity.data.schemaGraph,
            );
            if (successful && result) {
              const toolResponsesMap = new Map<string, string>();
              for (const [key, value] of Object.entries(
                JSON.parse(result.data),
              )) {
                toolResponsesMap.set(key, value as string);
              }
              console.log(
                "Tool call batch executed successfully",
                toolResponsesMap,
              );
              publish(
                new CopilotInputEvent("TOOL_CALL_BATCH_RESPONSE", {
                  toolCallBatchId: event.data.toolCallBatchId,
                  responseByToolCallId: toolResponsesMap,
                  schemaDiff: result.schemaDiff,
                }),
              );
            } else {
              throw new Error(`Error executing tool calls: ${errorMessage}`);
            }
          });

          listen("CopilotTaskMessage", (event) => {
            copilotJobEntity.addTask({
              ...event.data,
              timestamp: event.timeStamp,
            });
          });

          listen("CopilotTerminateMessage", () => {
            copilotJobEntity.setTerminate();
            publish(new Event("unsubscribe"));
          });

          listen("CopilotStateChangeMessage", (event) => {
            if (
              !event.data.currentJobIsRunning &&
              !copilotJobEntity.isTerminated
            ) {
              console.error(
                "Current job is not running, but session is not marked as terminated. This likely indicates an issue with the backend job execution.",
              );
            }
          });
          listen("CopilotErrorMessage", reject);
          listen("CopilotToolCallBatchExecErrorMessage", reject);

          listen("CopilotInitialStateMessage", (event) => {
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
            publish(
              new CopilotInputEvent("HUMAN_INPUT", {
                content: copilotJobEntity.data.query,
              }),
            );
          });
        } catch (error) {
          console.error("Error during copilot session execution:", error);
          copilotJobEntity.setTerminate();
          publish(new CopilotInputEvent("TERMINATE", {}));
        } finally {
          console.log("Cleaning up copilot session execution environment");
          clearTimeout(timer);
        }
      });
      const result = await jobPromise;
      await this.repository.copilotOutputRepository.save(result);
      return result.toJSON();
    } catch (error) {
      console.error("Error setting up copilot execution environment:", error);
      await this.projectService
        .deleteProjectInDatabase(
          "projectExId",
          copilotJobEntity.data.projectExId,
        )
        .catch((error) => {
          console.error(
            "Error occurred while deleting project in database:",
            error,
          );
          return this.projectService.deleteProject(
            copilotJobEntity.data.projectExId,
          );
        });
      throw error;
    } finally {
      await this.projectService
        .deleteProjectInDatabase(
          "projectExId",
          copilotJobEntity.data.projectExId,
        )
        .catch((error) => {
          console.error(
            "Error occurred while deleting project in database:",
            error,
          );
          return this.projectService.deleteProject(
            copilotJobEntity.data.projectExId,
          );
        });
    }
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
