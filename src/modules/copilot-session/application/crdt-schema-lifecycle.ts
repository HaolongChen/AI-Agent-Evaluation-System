import type { ProjectEntity } from "../domain/entity/project.entity.ts";
import type { ICrdtSchemaLifecycleFactory } from "../domain/interface/crdt-schema-lifecycle.interface.ts";

export class CrdtSchemaLifecycle {
  constructor(
    private crdtSchemaLifecycleFactory: ICrdtSchemaLifecycleFactory,
  ) {}

  getByProjectEntity(projectEntity: ProjectEntity) {
    return this.crdtSchemaLifecycleFactory.create(
      projectEntity.getData("projectExId"),
    );
  }
}
