import type { OpaqueSchemaGraph } from "../../../shared/domain/interface/type-system.ts";

export interface IProjectLifecycle {
  createTemporaryProject(
    projectName: string,
    initialSchemaId?: string,
  ): Promise<{ projectExId: string; schemaGraph: OpaqueSchemaGraph }>;

  importExistingProject(
    projectExId: string,
  ): Promise<{ projectExId: string; schemaGraph: OpaqueSchemaGraph }>;

  deleteTemporaryProject(): Promise<void>;
}
