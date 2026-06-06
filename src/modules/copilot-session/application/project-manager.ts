import type { NetworkAccount } from "../../account/domain/service/account.service.ts";
import type { CopilotInputAggregate } from "../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../dataset/domain/entity/copilot-server.entity.ts";
import { adoptCopilotServer } from "../../dataset/domain/service/copilot-server-client.ts";
import type { ProjectBeforeCopilotSession } from "../domain/aggregate/project.aggregate.ts";
import type { IProjectService } from "../domain/interface/project-service.interface.ts";
import type {
  CreateProjectUseCase,
  ImportSchemaToProjectByIdUseCase,
} from "./create-project.ts";

export class ProjectManager {
  constructor(
    private networkAccount: NetworkAccount,
    private projectCreationService: CreateProjectUseCase,
    private projectService: IProjectService,
  ) {}
  adoptCopilotServer(copilotServerEntity: CopilotServerEntity): string {
    adoptCopilotServer(
      this.networkAccount.networkClientEntity,
      copilotServerEntity,
    );
    return copilotServerEntity.getData("id");
  }

  createCopilotSession(
    project: ProjectBeforeCopilotSession,
    userInput: string,
  ) {}

  async execute(
    copilotInput: CopilotInputAggregate,
    copilotServer: CopilotServerEntity,
  ): Promise<ProjectBeforeCopilotSession> {
    const copilotServerId = this.adoptCopilotServer(copilotServer);
    const projectAggregate = await this.projectCreationService.execute(
      copilotInput,
      copilotServerId,
      this.projectService,
    );
    const crdtSchemaLifecycle =
      this.projectService.getCrdtSchemaLifecycle(projectAggregate);
    await crdtSchemaLifecycle.importSchemaManual(
      copilotInput.getEntity("goldenSet").getData("schemaId"),
    );
    return projectAggregate;
  }
}
