import { SessionOrchestrator } from "./session-orchestrator.ts";
import { logger } from "../../shared/infrastructure/logger.ts";
import type { CopilotEventType } from "../domain/entity/copilot-job.entity.ts";
import { EventTarget } from "ts-event-target";
import type { ICopilotSessionSetupFactory } from "../domain/interface/copilot-session-setup.interface.ts";
import type { ProjectAggregate } from "../domain/aggregate/project.aggregate.ts";
import type { IProjectRepository } from "../domain/interface/project-repository.interface.ts";
import { CopilotOutputFactory } from "../domain/service/copilot-output-factory.ts";

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
