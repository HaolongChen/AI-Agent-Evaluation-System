import { fromUint8Array } from "js-base64";
import type { IGQLClient } from "../../../account/domain/interface/graphql-client.interface.ts";
import { CrdtSchemaAggregate } from "../aggregate/crdt-schema.aggregate.ts";
import type { ICrdtSchemaService } from "../interface/crdt-schema.interface.ts";
import type { ProjectEntity } from "../entity/project.entity.ts";
export class CrdtSchemaHandler {
  constructor(private readonly crdtSchemaService: ICrdtSchemaService) {}

  private schemaTransformer = (schema: unknown): string => {
    return fromUint8Array(new Uint8Array(schema as ArrayBufferLike));
  };

  async getSchemaGraph(crdtSchema: CrdtSchemaAggregate, gqlClient: IGQLClient) {
    const arrayBuffer = await this.crdtSchemaService.getSchemaModelById(
      crdtSchema.schemaId,
    );
    return this.crdtSchemaService.getSchemaGraph(
      this.schemaTransformer(arrayBuffer),
      gqlClient,
    );
  }

  async importSchema(
    schemaId: string,
    projectExId: string,
    dangerousGQLClient: IGQLClient,
  ) {
    const arrayBuffer =
      await this.crdtSchemaService.getSchemaModelById(schemaId);
    const crdtModel = this.schemaTransformer(arrayBuffer);
    await this.crdtSchemaService.importSchema(
      crdtModel,
      projectExId,
      dangerousGQLClient,
    );
  }

  async rehydrate(
    project: ProjectEntity,
    gqlClient: IGQLClient,
  ): Promise<CrdtSchemaAggregate> {
    const data = await this.crdtSchemaService.fetchAppDetailByExId(
      project.getData("projectExId"),
      gqlClient,
    );
    if (!data.latestSchema?.crdtModelUrl) {
      throw new Error(
        `No CRDT schema found for projectExId: ${project.getData("projectExId")}`,
      );
    }
    return new CrdtSchemaAggregate(
      {
        ...data,
        crdtModelUrl: data.latestSchema?.crdtModelUrl,
        type: data.type || "SINGLE_CLIENT",
        category: data.category || "OTHERS",
        projectSpace: data.projectSpace?.projectSpaceType || "PERSONAL",
      },
      project,
    );
  }
}
