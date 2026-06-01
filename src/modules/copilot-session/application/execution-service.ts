import { SessionOrchestrator } from "./session-orchestrator.ts";
import { logger } from "../../shared/infrastructure/logger.ts";
import type {
  CopilotEventType,
  CopilotInputEventType,
} from "../domain/entity/copilot-job.entity.ts";
import { EventTarget } from "ts-event-target";
import type { ICopilotSessionSetupFactory } from "../domain/interface/copilot-session-setup.interface.ts";
import type { ProjectAggregate } from "../domain/aggregate/project.aggregate.ts";
import type { IProjectRepository } from "../domain/interface/project.interface.ts";

export class ExecuteCopilotUseCase {
  private isProjectTemporary = true;
  private unsubscribe: undefined | (() => void);

  private copilotInputEvent: EventTarget<CopilotInputEventType> =
    new EventTarget();
  private copilotEvent: EventTarget<CopilotEventType> = new EventTarget();

  constructor(
    private repository: {
      projectRepository: IProjectRepository;
      copilotSessionSetupFactory: ICopilotSessionSetupFactory;
    },
    private project: ProjectAggregate,
  ) {}

  private createCopilotSession = async () => {
    return this.repository.copilotSessionSetupFactory
      .build(this.project.getData("projectExId"))
      .createNewSession();
  };

  async executeV2() {
    const session = await this.createCopilotSession();
    this.project.copilotSessionExId = session.sessionExId;
    this.unsubscribe = session.subscribeToSessionUpdates(
      this.copilotEvent.dispatchEvent.bind(this.copilotEvent),
    );
    try {
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
      );
      const copilotOutput = await orchestrator.run();
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
