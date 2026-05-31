import { ExecutionJobRunnerV2 } from "./execution-job-v2.ts";
import { SessionOrchestrator } from "./session-orchestrator.ts";
import { logger } from "../../shared/infrastructure/logger.ts";
import type { ICopilotInputRepository } from "../../dataset/domain/interface/copilot-input.interface.ts";
import { CopilotSessionAggregate } from "../domain/aggregate/copilot-session.aggregate.ts";
import type { ICopilotServerRepository } from "../../dataset/domain/interface/copilot-server.interface.ts";
import type { ICopilotSessionRepository } from "../domain/interface/copilot-session.interface.ts";
import type { ProjectAggregate } from "../domain/aggregate/project.aggregate.ts";
import type { ICopilotNetworkService } from "../domain/interface/copilot-network.interface.ts";
import type { ICrdtSchemaLifecycleFactory } from "../domain/interface/crdt-schema-lifecycle.interface.ts";

export class ExecuteCopilotUseCase {
  private isProjectTemporary = true;
  constructor(
    private repository: {
      copilotSessionRepository: ICopilotSessionRepository;
      copilotInputRepository: ICopilotInputRepository;
      copilotServerRepository: ICopilotServerRepository;
    },
    private CopilotNetworkService: ICopilotNetworkService,
    private crdtSchemaLifecycleFactory: ICrdtSchemaLifecycleFactory,
  ) {}

  async executeV2(project: ProjectAggregate) {
    const copilotSessionExId =
      await this.CopilotNetworkService.createNewSession(
        project.getData("projectExId"),
      );
    const crdtSchemaLifecycle = this.crdtSchemaLifecycleFactory.create(
      project.getData("projectExId"),
    );
    const session = new CopilotSessionAggregate(
      project,
      crdtSchemaLifecycle,
      copilotSessionExId,
    );
    try {
      const runner = new ExecutionJobRunnerV2(
        copilotSessionExId,
        this.CopilotNetworkService,
      );
      const orchestrator = new SessionOrchestrator(runner, session);
      await orchestrator.run();
      await this.repository.copilotSessionRepository.save(session);
      return session.getEntity("copilotOutput").getData();
    } catch (error) {
      logger.error("Error setting up copilot execution environment:", error);
      // this.account.clearWsClient();
      throw error;
    }
  }
}
