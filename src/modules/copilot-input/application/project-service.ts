import {
  GQL_DELETE_PROJECT,
  createProjectSubscription,
  createProjectWithTaskIdReturned,
} from "../infrastructure/project-manager.ts";

import type { Account } from "../../account/application/account-handler.ts";
import type {
  DeleteProjectMutation,
  DeleteProjectMutationVariables,
} from "../../../graphql/generated/types.ts";
import type { IProjectRepository } from "../domain/interface/project.interface.ts";
import { ProjectEntity } from "../domain/entity/project.entity.ts";
import { TypeSystemStore } from "../infrastructure/crdt-schema-manager.ts";

export class ProjectService {
  private projectEntity: ProjectEntity | undefined;
  private schemaManager: TypeSystemStore | undefined;
  constructor(
    private account: Account,
    private repository: IProjectRepository,
    private projectName: string,
    private initialSchemaId?: string,
  ) {}

  public getSchemaManager(): TypeSystemStore | undefined {
    return this.schemaManager;
  }

  async createProject(): Promise<ProjectEntity> {
    const gqlClient = await this.account.getGQLClient();
    const organizationExId = process.env.ORGANIZATION_EX_ID;
    if (!organizationExId) {
      throw new Error("ORGANIZATION_EX_ID env var is not set");
    }

    const taskId = await createProjectWithTaskIdReturned(
      this.projectName,
      gqlClient,
      organizationExId,
    );

    console.info("Project creation task started", {
      taskId,
      projectName: this.projectName,
    });
    const projectExId = await createProjectSubscription(taskId, this.account);
    console.log("Project creation completed", {
      projectExId,
      projectName: this.projectName,
    });
    this.schemaManager = new TypeSystemStore(this.account, projectExId);
    await this.schemaManager.fetchAppDetailByExId();
    if (this.initialSchemaId) {
      await this.schemaManager.importSchemaManual(this.initialSchemaId);
    }
    const schemaId = this.schemaManager.getSchemaId();
    try {
      this.projectEntity = new ProjectEntity({
        projectExId,
        name: this.projectName,
        schemaId,
        createdBy: this.account.exId!,
      });
      await this.repository.save(this.projectEntity);
      return this.projectEntity;
    } catch (error) {
      console.error("Error during project creation, attempting cleanup", {
        error,
        projectExId,
      });
      await this.deleteProjectInDatabase();
      throw error;
    }
  }

  async deleteProject(): Promise<void> {
    if (!this.projectEntity) {
      throw new Error(
        "Project entity is not initialized, cannot delete project",
      );
    }
    const gqlClient = await this.account.getGQLClient();
    console.info("Deleting project", {
      projectExId: this.projectEntity.data.projectExId,
    });
    const isDeleted = await gqlClient.gqlRequest<
      DeleteProjectMutation,
      DeleteProjectMutationVariables
    >(GQL_DELETE_PROJECT, { projectExId: this.projectEntity.data.projectExId });
    if (!isDeleted.deleteProject) {
      throw new Error(
        `Failed to delete project with exId ${this.projectEntity.data.projectExId}`,
      );
    }
    console.info("Project deleted", {
      projectExId: this.projectEntity.data.projectExId,
    });
  }

  async deleteProjectInDatabase(): Promise<void> {
    if (!this.schemaManager) {
      console.warn("Schema ID is not set, skipping database cleanup");
      return await this.deleteProject();
    }
    const project = await this.repository.getByUniqueField(
      "schemaId",
      this.schemaManager.getSchemaId(),
    );
    await Promise.all([
      this.repository.deleteById(project.id!),
      this.deleteProject(),
    ]);
  }
}
