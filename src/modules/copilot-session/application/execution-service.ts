import { ExecutionJobRunnerV2 } from "./execution-job-v2.ts";
import { SessionOrchestrator } from "./session-orchestrator.ts";
import { logger } from "../../shared/infrastructure/logger.ts";
import type { ProjectAggregate } from "../domain/aggregate/project.aggregate.ts";
import type { ICopilotNetworkService } from "../domain/interface/copilot-network.interface.ts";
import type { ICrdtSchemaLifecycleFactory } from "../domain/interface/crdt-schema-lifecycle.interface.ts";
import type { IProjectRepository } from "../domain/interface/project.interface.ts";

export class ExecuteCopilotUseCase {
  private isProjectTemporary = true;
  constructor(
    private repository: {
      projectRepository: IProjectRepository;
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
    project.copilotSessionExId = copilotSessionExId;
    try {
      const runner = new ExecutionJobRunnerV2(
        copilotSessionExId,
        this.CopilotNetworkService,
      );
      const orchestrator = new SessionOrchestrator(runner, crdtSchemaLifecycle);
      const copilotOutput = await orchestrator.run(
        project
          .getEntity("copilotInput")
          .getEntity("userInput")
          .getData("content"),
      );
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
