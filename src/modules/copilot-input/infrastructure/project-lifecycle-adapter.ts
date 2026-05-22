import type { Account } from "../../account/application/account-handler.ts";
import type { IProjectRepository } from "../domain/interface/project.interface.ts";
import type { IProjectLifecycle } from "../domain/interface/project-lifecycle.interface.ts";
import type { OpaqueSchemaGraph } from "../../shared/domain/interface/type-system.ts";
import { ProjectService } from "../application/project-service.ts";

export class ProjectLifecycleAdapter implements IProjectLifecycle {
  public projectService: ProjectService | undefined;

  constructor(
    private readonly account: Account,
    private readonly repository: IProjectRepository,
  ) {}

  async importExistingProject(projectExId: string) {
    const projectService = new ProjectService(this.account, this.repository);
    const schemaManager = await projectService.getProjectInZion(projectExId);
    const projectEntity =
      await projectService.importProjectBySchemaManager(schemaManager);
    if (!schemaManager?.schemaGraph) {
      throw new Error("Schema graph not available after project creation");
    }
    this.projectService = projectService;
    return {
      projectExId: projectEntity.data.projectExId,
      schemaGraph: schemaManager.schemaGraph,
    };
  }

  async createTemporaryProject(
    projectName: string,
    initialSchemaId?: string,
  ): Promise<{ projectExId: string; schemaGraph: OpaqueSchemaGraph }> {
    this.projectService = new ProjectService(
      this.account,
      this.repository,
      projectName,
      initialSchemaId,
    );
    const projectEntity = await this.projectService.createProject();
    const schemaManager = this.projectService.getSchemaManager();
    if (!schemaManager?.schemaGraph) {
      throw new Error("Schema graph not available after project creation");
    }
    return {
      projectExId: projectEntity.data.projectExId,
      schemaGraph: schemaManager.schemaGraph,
    };
  }

  async deleteTemporaryProject(): Promise<void> {
    if (!this.projectService) {
      return;
    }
    await this.projectService.deleteProjectInDatabase();
  }
}
