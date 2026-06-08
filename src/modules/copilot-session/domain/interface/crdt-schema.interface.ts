import type { FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project } from "../../../../graphql/generated/types.ts";
import type { IGQLClient } from "../../../account/domain/interface/graphql-client.interface.ts";

export interface ICrdtSchemaService
{
  getSchemaModelById ( schemaId: string ): Promise<unknown>;

  getSchemaGraph ( crdtModel: string, gqlClient: IGQLClient ): Promise<unknown>;


  importSchema ( crdtModel: string, projectExId: string, dangerousGraphQLClient: IGQLClient ): Promise<void>;

  fetchAppDetailByExId ( projectExId: string, gqlClient: IGQLClient ): Promise<FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project>;
}