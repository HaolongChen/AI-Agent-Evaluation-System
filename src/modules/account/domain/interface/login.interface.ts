import type { z } from "zod";
import type { IGQLClient } from "../../../shared/domain/interface/graphql-client.interface.ts";
import { accountSchema, type AccountInfo } from "../schema/account.schema.ts";

export interface ILoginService {
  login(data: z.infer<typeof accountSchema>, gqlClient: IGQLClient
  ): Promise<AccountInfo>;
  login(data: z.infer<typeof accountSchema>, gqlClient: IGQLClient
  ): Promise<AccountInfo>;
}
