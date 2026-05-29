import type { Account } from "../../account/application/account-handler.ts";
import type { IProjectRepository } from "../domain/interface/project.interface.ts";
import type { IProjectLifecycle, IZionProjectRepository } from "../domain/interface/zion-project.interface.ts";
import type { OpaqueSchemaGraph } from "../../shared/domain/interface/type-system.ts";

export class ProjectLifecycleAdapter implements IProjectLifecycle {

  constructor(
    private account: Account,
    private repository: {projectRepository: IProjectRepository, zionProjectRepository: IZionProjectRepository},
  ) {}

  async importExistingProject(projectExId: string, initialSchemaId?: string) {
    const projectService = new ProjectService(this.account);
    const schemaManager = await projectService.getProjectInZion(projectExId);
    if (initialSchemaId && schemaManager.getSchemaId() !== initialSchemaId) {
      await schemaManager.importSchemaManual(initialSchemaId);
    }
    const projectEntity =
      await projectService.importProjectBySchemaManager(schemaManager);
    if (!schemaManager?.schemaGraph) {
      throw new Error("Schema graph not available after project creation");
    }
    this.projectService = projectService;
    return {
      projectExId: projectEntity.getData("projectExId"),
      schemaGraph: schemaManager.schemaGraph,
    };
  }

  async createTemporaryProject(
    projectName: string,
    initialSchemaId?: string,
  ): Promise<{ projectExId: string; schemaGraph: OpaqueSchemaGraph }> {
    this.projectService = new ProjectService(
      this.account,
      projectName,
      initialSchemaId,
    );
    const projectEntity = await this.projectService.createProject();
    const schemaManager = this.projectService.getSchemaManager();
    if (!schemaManager?.schemaGraph) {
      throw new Error("Schema graph not available after project creation");
    }
    return {
      projectExId: projectEntity.getData("projectExId"),
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
