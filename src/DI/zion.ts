import type { Account } from "../modules/account/application/account-handler.ts";
import type { ICopilotSessionSetupFactory } from "../modules/copilot-session/domain/interface/copilot-session-setup.interface.ts";
import type { ICrdtSchemaLifecycleFactory } from "../modules/copilot-session/domain/interface/crdt-schema-lifecycle.interface.ts";
import type { IZionProjectService } from "../modules/copilot-session/domain/interface/zion-project.interface.ts";
import { CopilotSessionSetupFactory } from "../modules/copilot-session/infrastructure/copilot-session-setup.ts";
import { TypeSystemStoreFactory } from "../modules/copilot-session/infrastructure/crdt-schema-manager.ts";
import { ZionProjectService } from "../modules/copilot-session/infrastructure/zion-project-repository.ts";
import { getDangerousAccount, getMyAccount } from "./account.ts";

export type ZionInjectionType = {
  zionProjectService: IZionProjectService;
  crdtSchemaLifecycleFactory: ICrdtSchemaLifecycleFactory;
  copilotSessionSetupFactory: ICopilotSessionSetupFactory;
  account: Account;
  dangerousAccount: Account;
};

export async function createZionInjectionBundle(): Promise<ZionInjectionType> {
  const account = await getMyAccount();
  const dangerousAccount = await getDangerousAccount();
  const crdtSchemaLifecycleFactory = new TypeSystemStoreFactory(
    account.gqlClient,
    dangerousAccount.gqlClient,
  );
  return {
    zionProjectService: new ZionProjectService(
      account.account,
      account.gqlClient,
      account.wsClient,
    ),
    crdtSchemaLifecycleFactory,
    copilotSessionSetupFactory: new CopilotSessionSetupFactory(
      account.gqlClient,
      account.wsClient,
      crdtSchemaLifecycleFactory,
    ),
    account,
    dangerousAccount,
  };
}
