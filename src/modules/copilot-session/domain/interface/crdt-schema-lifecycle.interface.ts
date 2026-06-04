import type { FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project } from "../../../../graphql/generated/types.ts";
import type { OpaqueSchemaGraph } from "../../../shared/domain/interface/type-system.ts";
import type { ProjectEntity } from "../entity/project.entity.ts";

export interface ICrdtSchemaLifecycle {
  fetchAppDetailByExId(): Promise<void>;
  getSchemaId(): Promise<string>;
  schemaGraph(): Promise<OpaqueSchemaGraph>;
  getProjectInfo(): Promise<FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project>;
  rehydrate(): Promise<OpaqueSchemaGraph>;
  importSchemaManual(schemaId: string): Promise<void>;
}
