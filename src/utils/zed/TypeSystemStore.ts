import { CoreStore } from "./CoreStore.ts";
import { ZTypeSystem, type OpaqueSchemaGraph } from "./TypeSystem.ts";
// import { Diff } from 'zed/types/Diff';
// import { assertNotNull, isDefinedAndNotNull } from 'zed/utils/utils';
// import { LoggingEvent } from 'zed/utils/logging/LogSingleLineToServer';
// import { TypeSystemHelper } from 'zed/utils/TypeSystemHelper';
// import { trackExecutionTime } from 'zed/utils/ExecutionTimeUtil';

export class TypeSystemStore {
  private currSchemaGraph: OpaqueSchemaGraph | null = null;

  get schemaGraph(): OpaqueSchemaGraph | null {
    return this.currSchemaGraph;
  }

  rehydrate(): void {
    // const zSchema = ZTypeSystem.parseZSchemaFromJsObject(CoreStore);
    this.currSchemaGraph = ZTypeSystem.resolveZSchemaToSchemaGraph(zSchema);
  }
}
