import { SessionOrchestrator } from "./session-orchestrator.ts";
import { logger } from "../../shared/infrastructure/logger.ts";
import type { CopilotEventType } from "../domain/entity/copilot-job.entity.ts";
import { EventTarget } from "ts-event-target";
import type { ICopilotSessionSetupFactory } from "../domain/interface/copilot-session-setup.interface.ts";
import type {
  ProjectAggregate,
  ProjectBeforeCopilotSession,
} from "../domain/aggregate/project.aggregate.ts";
import type { IProjectRepository } from "../domain/interface/project-repository.interface.ts";
import { CopilotOutputFactory } from "../domain/service/copilot-output-factory.ts";
import type { IProjectService } from "../domain/interface/project-service.interface.ts";
import { projectSessionBridge } from "../domain/service/project-session-bridge.ts";
import type { ICopilotNetworkService } from "../domain/interface/copilot-network.interface.ts";
import type { CopilotExecutionService } from "../domain/service/copilot-execution.service.ts";

export class ExecuteCopilotUseCase {
  private copilotEvent: EventTarget<CopilotEventType> = new EventTarget();
  private _project: ProjectAggregate | undefined;
  constructor(
    private repository: {
      projectRepository: IProjectRepository;
      copilotSessionSetupFactory: ICopilotSessionSetupFactory;
    },
    project?: ProjectAggregate,
  ) {
    this._project = project;
  }

  setProject(project: ProjectAggregate) {
    this._project = project;
  }

  get project(): ProjectAggregate {
    if (!this._project) {
      throw new Error("Project not set for ExecuteCopilotUseCase");
    }
    return this._project;
  }

  private createCopilotSession = async () => {
    return this.repository.copilotSessionSetupFactory
      .build(this.project.getData("projectExId"))
      .createNewSession();
  };

  async executeV2() {
    try {
      const session = await this.createCopilotSession();
      const copilotOutputFactory = new CopilotOutputFactory(
        session.sessionExId,
      );
      const orchestrator = new SessionOrchestrator(
        this.copilotEvent.addEventListener.bind(this.copilotEvent),
        session.delegateCopilotToolCall.bind(session),
        () =>
          session.sendHumanMessage(
            this.project
              .getEntity("copilotInput")
              .getEntity("userInput")
              .getData("content"),
          ),
        session.sendHumanOperationMessage.bind(session),
        session.terminateSession.bind(session),
        copilotOutputFactory,
      );
      const copilotOutputPromise = orchestrator.run();
      const unsubscribe = session.subscribeToSessionUpdates(
        this.copilotEvent.dispatchEvent.bind(this.copilotEvent),
      );
      const copilotOutput = await copilotOutputPromise;
      unsubscribe();
      this.project.setEntity("copilotOutput", copilotOutput);
      await this.repository.projectRepository.save(this.project);
      return this.project;
    } catch (error) {
      logger.error("Error setting up copilot execution environment:", error);
      // this.account.clearWsClient();
      throw error;
    }
  }
}

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
  constructor(private copilotNetworkService: ICopilotNetworkService) {}

  subscribe(copilotExecution: CopilotExecutionService): () => void {
    return this.copilotNetworkService.subscribeToSessionUpdates(
      copilotExecution.publisher,
    );
  }

  listenersRegistration(copilotExecution: CopilotExecutionService) {
    copilotExecution.register("CopilotToolCallBatchMessage", (event) => {
      this.copilotNetworkService.delegateCopilotToolCalls(event);
    });

    copilotExecution.register("CopilotStateChangeMessage", (event) => {
      if (event.data.currentJobIsRunning === false) {
      }
    });
  }
}
