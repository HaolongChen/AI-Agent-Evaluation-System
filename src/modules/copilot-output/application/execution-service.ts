import type { Account } from "../../account/application/account-handler.ts";
import { ProjectService } from "../../copilot-input/application/project-service.ts";
import type { IGoldenSetRepository } from "../../copilot-input/domain/interface/golden-set.interface.ts";
import { CopilotJobEntity } from "../domain/entity/copilot-job.entity.ts";
import { CopilotOutputEntity } from "../domain/entity/copilot-output.entity.ts";
import type { ICopilotOutputRepository } from "../domain/interface/copilot-output.interface.ts";
import type { IProjectRepository } from "../../copilot-input/domain/interface/project.interface.ts";
import { assertNotNull } from "../../shared/domain/service/type-system.service.ts";
import { CopilotInputEvent, ExecutionJobRunnerV2 } from "./execution-job-v2.ts";
import { createNewSession } from "../infrastructure/copilot-network.ts";
import { runToolCalls } from "./tool-call-handler.ts";
import { Event } from "ts-event-target";
import { clearTimeout } from "node:timers";

export class ExecuteCopilotUseCase {
  private projectService: ProjectService | undefined;
  constructor(
    private readonly repository: {
      copilotOutputRepository: ICopilotOutputRepository;
      goldenSetRepository: IGoldenSetRepository;
      projectRepository: IProjectRepository;
    },
    private readonly account: Account,
  ) {}

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
    this.projectService = new ProjectService(
      this.account,
      this.repository.projectRepository,
      projectName,
      goldenSetEntity.data.schemaId,
    );
    const projectEntity = await this.projectService.createProject();
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
      schemaGraph: assertNotNull(
        this.projectService.getSchemaManager()?.schemaGraph,
      ),
    });

    return copilotJobEntity;
  }

  private generateProjectName(
    goldenSetId: string,
    userInputId: string,
  ): string {
    return `temp-project-${goldenSetId}-${userInputId}-${Date.now()}`;
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
    const gqlClient = await this.account.getGQLClient();
    const wsClient = await this.account.getWsClient();
    try {
      const sessionExId = await createNewSession(
        copilotJobEntity.data.projectExId,
        gqlClient,
      );
      const copilotExecutionService = new ExecutionJobRunnerV2(
        sessionExId,
        wsClient,
        gqlClient,
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
            const { toolCallBatchId, toolCalls } = event.data;
            const result = runToolCalls(
              toolCalls,
              copilotJobEntity.data.schemaGraph,
            );
            // where's schema path?
            if (result.error) {
              console.error(
                `Error executing tool call batch ${toolCallBatchId}:`,
                result.error,
              );
              throw new Error(
                `Error executing tool call batch ${toolCallBatchId}: ${result.error}`,
              );
            }
            if (result.schemaDiff) {
              // TODO: apply schema diff to local
            }
            publish(
              new CopilotInputEvent("TOOL_CALL_BATCH_RESPONSE", {
                toolCallBatchId: event.data.toolCallBatchId,
                responseByToolCallId: JSON.parse(result.data ?? "{}"),
                schemaDiff: result.schemaDiff,
              }),
            );
            // TODO: error handling...
          });

          listen( "CopilotTaskMessage", ( event ) =>
          {
              copilotJobEntity.addTask( event.data );
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
      this.account.clearWsClient();
      throw error;
    } finally {
      await this.projectService?.deleteProjectInDatabase();
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
