import { fromUint8Array } from "js-base64";
import type { IGQLClient } from "../../../account/domain/interface/graphql-client.interface.ts";
import { CrdtSchemaAggregate } from "../aggregate/project.aggregate.ts";
import type { ICrdtSchemaService } from "../interface/crdt-schema.interface.ts";
import type { ProjectEntity } from "../entity/project.entity.ts";
export class CrdtSchemaHandler {
  constructor(private readonly crdtSchemaService: ICrdtSchemaService) {}

  private schemaTransformer = (schema: unknown): string => {
    return fromUint8Array(new Uint8Array(schema as ArrayBufferLike));
  };

  private getSchemaIdFromUrl = ( url: string ): string =>
  {
    return new URL( url ).pathname.split( "/" )[ 2 ];
  }

  async getSchemaGraph(schemaId: string, gqlClient: IGQLClient) {
    const arrayBuffer = await this.crdtSchemaService.getSchemaModelById(
      schemaId,
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

  async getSchemaId(
    project: ProjectEntity,
    gqlClient: IGQLClient,
  ): Promise<string> {
    const data = await this.crdtSchemaService.fetchAppDetailByExId(
      project.getData("projectExId"),
      gqlClient,
    );
    const url = data.latestSchema?.crdtModelUrl;
    if ( !url )
    {
      throw new Error( "No schema linked to this project" );
    }
    return this.getSchemaIdFromUrl( url );
  }
}
