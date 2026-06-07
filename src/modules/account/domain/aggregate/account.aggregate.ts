import type { z } from "zod";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";
import { AccountEntity } from "../entity/account.entity.ts";
import { NetworkClientEntity } from "../entity/network-client.entity.ts";
import type { AccountInfo, accountSchema } from "../schema/account.schema.ts";
import {
	AccountPhoneNumberWithPasswordReceivedEvent,
	AccountUsernameWithPasswordReceivedEvent,
} from "../event/account.event.ts";

export class Account extends AggregateRoot<
	typeof accountSchema,
	{ accountInfo: AccountInfo } & EntityMetadata,
	{ networkClient: NetworkClientEntity }
  >
{
  constructor ( account: AccountEntity, networkClient: NetworkClientEntity )
  {
    super( account, {networkClient} );
  }

  static async loginWithPhoneNumber ( phoneNumber: string, password: string ): Promise<Account>
  {
    
  }
}
