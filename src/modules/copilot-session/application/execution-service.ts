import type { ProjectBeforeCopilotSession } from "../domain/aggregate/project.aggregate.ts";
import type { IProjectService } from "../domain/interface/project-service.interface.ts";
import { projectSessionBridge } from "../domain/service/project-session-bridge.ts";
import type { ICopilotNetworkService } from "../infrastructure/interface/copilot-network.interface.ts";
import type { CopilotExecutionService } from "../domain/service/copilot-execution.service.ts";

export class CreateCopilotSessionUseCase {
  constructor(private projectService: IProjectService) {}

  async execute(
    project: ProjectBeforeCopilotSession,
    schemaId: string,
    userInput: string,
  ) {
    const sessionExId = await this.projectService.createCopilotSession(project);
    project.setData({ copilotSessionExId: sessionExId });
    const projectWithSession = projectSessionBridge(
      project,
      schemaId,
      userInput,
    );
    return this.projectService.getCopilotNetworkService(projectWithSession);
  }
}

export class CopilotExecutionUseCase {
  private operationList: Array<() => void> = [];
  private readonly TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

  private timer: NodeJS.Timeout | undefined;

  constructor(
    private copilotNetworkService: ICopilotNetworkService,
    private resolve: () => void,
    private reject: (error: unknown) => void,
  ) {
    this.operationList = [
      this.copilotNetworkService.sendHumanOperationMessage.bind(
        this.copilotNetworkService,
      ),
      () => {
        this.copilotNetworkService.stopSession();
        clearTimeout(this.timer!);
        this.resolve();
        this.unsubscribe?.();
      },
    ];
    Promise.withResolvers();
  }

  private unsubscribe: undefined | (() => void);

  subscribe(copilotExecution: CopilotExecutionService): () => void {
    this.listenersRegistration(copilotExecution);
    this.timer = setTimeout(() => {
      this.reject(new Error("Session timeout"));
    }, this.TIMEOUT_MS);
    this.unsubscribe = this.copilotNetworkService.subscribeToSessionUpdates(
      copilotExecution.publisher,
    );
    return this.unsubscribe;
  }

  private listenersRegistration(copilotExecution: CopilotExecutionService) {
    copilotExecution.register("CopilotToolCallBatchMessage", (event) => {
      this.copilotNetworkService.delegateCopilotToolCalls(event);
    });

    copilotExecution.register("CopilotStateChangeMessage", (event) => {
      if (event.data.currentJobIsRunning === false) {
        const operation = this.operationList.shift();
        if (!operation) {
          this.reject(
            new Error(
              "No more operations to perform, but session is still active.",
            ),
          );
          return;
        }
        operation();
      }
    });

    copilotExecution.register("CopilotInitialStateMessage", (event) => {
      if (!event.data.currentJobIsRunning && !event.data.terminated) {
        this.copilotNetworkService.sendHumanMessage();
      }
    });
  }
}
