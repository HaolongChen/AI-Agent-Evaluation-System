import type { CopilotInputAggregate } from "../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import { logger } from "../../shared/infrastructure/logger.ts";
import type { CreateProjectUseCase } from "./create-project.ts";
import type { DeleteZionProjectUseCase } from "./delete-zion-project.ts";
import type { ExecuteCopilotUseCase } from "./execution-service.ts";

export class CopilotExecutionLifecycle {
  constructor(
    private createProjectUseCase: CreateProjectUseCase,
    private executeCopilotUseCase: ExecuteCopilotUseCase,
    private deleteZionProjectUseCase: DeleteZionProjectUseCase,
  ) {}

  async execute(copilotInput: CopilotInputAggregate, copilotServerId: string) {
    try {
      const projectAggregate = await this.createProjectUseCase.execute(
        copilotInput,
        copilotServerId,
      );
      this.executeCopilotUseCase.setProject(projectAggregate);
      await this.executeCopilotUseCase.executeV2();
      logger.info(
        "received tasks: ",
        projectAggregate.getEntity("copilotOutput")?.getData("tasks"),
      );
      await this.deleteZionProjectUseCase.execute(projectAggregate);
      return projectAggregate;
    } catch (error) {
      console.error("Error in CopilotExecutionLifecycle:", error);
      throw error;
    }
  }
}
