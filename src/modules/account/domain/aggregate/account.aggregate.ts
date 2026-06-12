import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";
import type { AccountEntity } from "../entity/account.entity.ts";
import type { NetworkClientEntity } from "../entity/network-client.entity.ts";
import type { accountSchema } from "../schema/account.schema.ts";

export class Account extends AggregateRoot<
  typeof accountSchema,
  EntityMetadata,
  { networkClient: NetworkClientEntity }
> {
  constructor(account: AccountEntity, networkClient: NetworkClientEntity) {
    super(account, { networkClient });
    this.getEntity("networkClient").setHeader(
      "Authorization",
      account.getData("accessToken"),
    );
  }

  get loginParameters() {
    return {
      username: this.getData("username"),
      password: this.getData("password"),
    };
  }
}
