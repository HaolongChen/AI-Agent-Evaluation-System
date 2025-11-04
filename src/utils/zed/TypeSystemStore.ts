import { ZTypeSystem, type OpaqueSchemaGraph } from "./TypeSystem.ts";
import { QueryBuilder } from "../graphql-builder.ts";
import { graphqlUtils } from "../graphql-utils.ts";
import { logger } from "../logger.ts";

export class TypeSystemStore {
  private currSchemaGraph: OpaqueSchemaGraph | null = null;

  get schemaGraph(): OpaqueSchemaGraph | null {
    return this.currSchemaGraph;
  }

  rehydrate(): void {
    // const zSchema = ZTypeSystem.parseZSchemaFromJsObject(CoreStore);
    // FetchAppDetailByExId
    const query = new QueryBuilder('FetchAppDetailByExId')
    .withVariable('projectExId', projectExId)
    .withVariable('appExId', null)
    .select(
        'lastUploadedSchema'
    )
    this.currSchemaGraph = ZTypeSystem.resolveZSchemaToSchemaGraph(zSchema);
  }
}
