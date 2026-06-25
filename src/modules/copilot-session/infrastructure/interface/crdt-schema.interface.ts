import type { IGQLClient } from "../../../account/domain/interface/graphql-client.interface.ts";

export interface ICrdtSchemaService {
  getSchemaGraph(
    schemaId: string,
    gqlClient: IGQLClient,
  ): Promise<unknown>;

  importSchema(
    schemaId: string,
    projectExId: string,
    gqlClient: IGQLClient,
  ): Promise<void>;

  getSchemaIdByProjectExId(
    projectExId: string,
    gqlClient: IGQLClient,
  ): Promise<string>;
}
