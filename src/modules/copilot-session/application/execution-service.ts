import { SessionOrchestrator } from "./session-orchestrator.ts";
import { logger } from "../../shared/infrastructure/logger.ts";
import type { ProjectAggregate } from "../domain/aggregate/project.aggregate.ts";
import type { IProjectRepository } from "../domain/interface/project.interface.ts";
import type {
  CopilotEventType,
  CopilotInputEventType,
} from "../domain/entity/copilot-job.entity.ts";
import { EventTarget } from "ts-event-target";
import type { CopilotApiResultJs } from "../../shared/domain/interface/type-system.ts";
import type { ICopilotSessionSetupFactory } from "../domain/interface/copilot-session-setup.interface.ts";

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
  ) {}

  async executeV2(project: ProjectAggregate) {
    const session = await this.repository.copilotSessionSetupFactory
      .build(project.getData("projectExId"))
      .createNewSession();
    project.copilotSessionExId = session.sessionExId;
    const runToolCalls = (
      toolCalls: unknown[],
      toolCallBatchId: string,
    ): CopilotApiResultJs => {
      const result = session.runCopilotToolCalls(toolCalls);
      session.sendMessageToSession("TOOL_CALL_BATCH_RESPONSE", {
        toolCallBatchId,
        responseByToolCallId: JSON.parse(result.data ?? "{}"),
        schemaDiff: result.schemaDiff,
      });
      return result;
    };
    const sendHumanInput = () =>
      session.sendMessageToSession("HUMAN_INPUT", {
        content: project
          .getEntity("copilotInput")
          .getEntity("userInput")
          .getData("content"),
      });
    const terminateSession = () => {
      session.sendMessageToSession("TERMINATE", {});
      this.unsubscribe?.();
    };
    const sendContinueOperation = () =>
      session.sendMessageToSession("HUMAN_OPERATION", {
        humanOperationType: "CONTINUE",
      });
    this.unsubscribe = session.subscribeToSessionUpdates(
      this.copilotEvent.dispatchEvent.bind(this.copilotEvent),
    );
    try {
      const orchestrator = new SessionOrchestrator(
        this.copilotEvent.addEventListener.bind(this.copilotEvent),
        runToolCalls.bind(session),
        sendHumanInput,
        sendContinueOperation,
        terminateSession,
      );
      const copilotOutput = await orchestrator.run();
      project.setEntity("copilotOutput", copilotOutput);
      await this.repository.projectRepository.save(project);
      return project;
    } catch (error) {
      logger.error("Error setting up copilot execution environment:", error);
      // this.account.clearWsClient();
      throw error;
    }
  }
}
