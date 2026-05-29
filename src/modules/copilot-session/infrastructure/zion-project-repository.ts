import type { Account } from "../../account/application/account-handler.ts";
import { TypeSystemStore } from "../../dataset/infrastructure/crdt-schema-manager.ts";
import type { EntityKey } from "../../shared/domain/entity/entity.ts";
import type { ProjectEntity } from "../domain/entity/project.entity.ts";
import type { IZionProjectRepository } from "../domain/interface/zion-project.interface.ts";
import {
  projectSchema,
  type ProjectMetadata,
} from "../domain/schema/project.schema.ts";
import { createZionProject } from "./project-manager.ts";

export const requiredParameters: EntityKey<
  typeof projectSchema,
  ProjectMetadata
>[] = [
  "category",
  "platform",
  "projectScopeType",
  "useNewType",
  "useRefactoredComponent",
  "name",
];

export class ZionProjectRepository implements IZionProjectRepository {
  constructor(private account: Account) {}
  async createZionProject(project: ProjectEntity): Promise<void> {
    const createdProject = await createZionProject(this.account, project);
    project.setData({ schemaId: createdProject });
  }
  async getByProjectExId(projectExId: string): Promise<ProjectEntity> {
    const typeSystemStore = new TypeSystemStore(this.account, projectExId);
    await typeSystemStore.fetchAppDetailByExId();
    const projectEntity = typeSystemStore.buildProjectEntity();
    projectEntity.setData({ typeSystemStore: typeSystemStore });
    return projectEntity;
  }
  deleteZionProject(project: ProjectEntity): Promise<void> {
    throw new Error("Method not implemented." + project.getData("projectExId"));
  }
  async importSchemaToProject(
    schemaId: string,
    project: ProjectEntity,
  ): Promise<void> {
    let typeSystemStore = project.getData("typeSystemStore");
    if (!typeSystemStore) {
      const projectExId = project.getData("projectExId");
      if (!projectExId) {
        throw new Error("ProjectExId is required to import schema to project");
      }
      typeSystemStore = new TypeSystemStore(this.account, projectExId);
      project.setData({ typeSystemStore: typeSystemStore });
    }
    await typeSystemStore.importSchemaManual(schemaId);
  }
}
