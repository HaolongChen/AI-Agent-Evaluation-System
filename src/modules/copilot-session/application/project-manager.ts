import type { Account } from "../../account/domain/entity/account.entity.ts";
import type { NetworkClient } from "../../account/domain/entity/network-client.entity.ts";
import type { GetCopilotInputByFiltersUseCase } from "../../dataset/application/copilot-input.ts";
import type { IProjectManager } from "../domain/interface/project-manager.interface.ts";
import type { IZionProjectService } from "../domain/interface/project-service.interface.ts";

export class CopilotProject
{
  constructor (
    private readonly projectManager: IProjectManager,
    private readonly projectService: IZionProjectService,
    private readonly copilotInputService: GetCopilotInputByFiltersUseCase
  ) {}

  async create ( copilotInputId: string, projectId: string, account: Account, networkClient: NetworkClient )
  {
    const copilotInput = await this.copilotInputService.execute( copilotInputId );
    const zionProject = this.projectManager.create( copilotInput, projectId );
    return this.projectService.createProjectInZion( zionProject, account, networkClient );
  }
}