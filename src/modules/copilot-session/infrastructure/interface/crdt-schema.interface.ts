import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";

export interface ICrdtSchemaService {
  getSchemaGraph(
    schemaId: string,
    networkClient: NetworkClient,
  ): Promise<unknown>;

  importSchema(
    schemaId: string,
    projectExId: string,
    dangerousNetworkClient: NetworkClient,
  ): Promise<void>;

  getSchemaIdByProjectExId(
    projectExId: string,
    networkClient: NetworkClient,
  ): Promise<string>;
}
