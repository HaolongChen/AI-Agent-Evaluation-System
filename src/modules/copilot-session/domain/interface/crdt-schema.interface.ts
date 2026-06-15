import type { FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project } from "../../../../graphql/generated/types.ts";
import type { NetworkClientEntity } from "../../../account/domain/entity/network-client.entity.ts";

export interface ICrdtSchemaService {
  getSchemaModelById(schemaId: string): Promise<unknown>;

  getSchemaGraph(crdtModel: string, networkClient: NetworkClientEntity): Promise<unknown>;

  importSchema(
    crdtModel: string,
    projectExId: string,
    dangerousNetworkClient: NetworkClientEntity
  ): Promise<void>;

  fetchAppDetailByExId(
    projectExId: string,
    networkClient: NetworkClientEntity
  ): Promise<FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project>;
}
