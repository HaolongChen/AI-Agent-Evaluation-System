import type { NetworkAccount } from "../../account/domain/service/account.service.ts";
import type { CopilotInputAggregate } from "../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../dataset/domain/entity/copilot-server.entity.ts";
import { adoptCopilotServer } from "../../dataset/domain/service/copilot-server-client.ts";
import type { ProjectBeforeCopilotSession } from "../domain/aggregate/project.aggregate.ts";
import type { CreateProjectUseCase } from "./create-project.ts";

export class ProjectManager {
  constructor(
    private networkAccount: NetworkAccount,
    private projectCreationService: CreateProjectUseCase,
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
  ) {
    const copilotServerId = this.adoptCopilotServer(copilotServer);
    const projectAggregate = await this.projectCreationService.execute(
      copilotInput,
      copilotServerId,
    );
    return projectAggregate;
  }
}
