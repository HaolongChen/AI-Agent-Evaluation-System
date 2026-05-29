import type { Account } from "../../account/application/account-handler.ts";
import { TypeSystemStore } from "../../dataset/infrastructure/crdt-schema-manager.ts";
import { ProjectEntity } from "../domain/entity/project.entity.ts";
import type { ZionProjectEntity } from "../domain/entity/zion-project.entity.ts";
import type { IZionProjectRepository } from "../domain/interface/zion-project.interface.ts";

import { createZionProject, deleteProjectInZion } from "./project-manager.ts";

export class ZionProjectRepository implements IZionProjectRepository {
  constructor(private account: Account) {}
  async createZionProject(project: ZionProjectEntity): Promise<ProjectEntity> {
    const createdProject = await createZionProject(this.account, project);
    const projectEntity = new ProjectEntity({ projectExId: createdProject });
    await this.getTypeSystemStoreByProjectEntity(projectEntity);
    return projectEntity;
  }
  async getTypeSystemStoreByProjectEntity(
    project: ProjectEntity,
  ): Promise<ProjectEntity> {
    const typeSystemStore = new TypeSystemStore(
      this.account,
      project.getData("projectExId"),
    );
    await typeSystemStore.fetchAppDetailByExId();

    project.setData({ typeSystemStore: typeSystemStore });
    return project;
  }
  async deleteZionProject(project: ProjectEntity): Promise<void> {
    const projectExId = project.getData("projectExId");
    await deleteProjectInZion(this.account, projectExId);
  }
  async importSchemaToProject(
    schemaId: string,
    project: ProjectEntity,
  ): Promise<void> {
    let typeSystemStore = project.getData("typeSystemStore");
    if (!typeSystemStore) {
      await this.getTypeSystemStoreByProjectEntity(project);
      typeSystemStore = project.getData("typeSystemStore");
      if (!typeSystemStore) {
        throw new Error("Failed to initialize type system store for project");
      }
    }
    await typeSystemStore.importSchemaManual(schemaId);
  }
}
