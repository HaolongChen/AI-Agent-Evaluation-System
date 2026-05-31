import type { Account } from "../modules/account/application/account-handler.ts";
import type { ICopilotNetworkService } from "../modules/copilot-session/domain/interface/copilot-network.interface.ts";
import type { ICrdtSchemaLifecycleFactory } from "../modules/copilot-session/domain/interface/crdt-schema-lifecycle.interface.ts";
import type { IZionProjectService } from "../modules/copilot-session/domain/interface/zion-project.interface.ts";
import { CopilotNetworkService } from "../modules/copilot-session/infrastructure/copilot-network.ts";
import { TypeSystemStoreFactory } from "../modules/copilot-session/infrastructure/crdt-schema-manager.ts";
import { ZionProjectService } from "../modules/copilot-session/infrastructure/zion-project-repository.ts";
import { getDangerousAccount, getMyAccount } from "./account.ts";

export type ZionInjectionType = {
  zionProjectService: IZionProjectService;
  crdtSchemaLifecycleFactory: ICrdtSchemaLifecycleFactory;
  CopilotNetworkService: ICopilotNetworkService;
  account: Account;
  dangerousAccount: Account;
};

export async function createZionInjectionBundle(): Promise<ZionInjectionType> {
  const account = await getMyAccount();
  const dangerousAccount = await getDangerousAccount();
  return {
    zionProjectService: new ZionProjectService(
      account.account,
      account.gqlClient,
      account.wsClient,
    ),
    crdtSchemaLifecycleFactory: new TypeSystemStoreFactory(
      account.gqlClient,
      dangerousAccount.gqlClient,
    ),
    CopilotNetworkService: new CopilotNetworkService(
      account.gqlClient,
      account.wsClient,
    ),
    account,
    dangerousAccount,
  };
}
