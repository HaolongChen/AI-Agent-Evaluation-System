import type z from "zod";
import {
  Entity,
  type EntityMetadata,
} from "../../../shared/domain/entity/entity.ts";
import { accountSchema, unauthorizedAccountSchema, type AccountInfo } from "../schema/account.schema.js";

export class UnauthorizedAccountEntity<T extends keyof typeof unauthorizedAccountSchema> extends Entity<typeof unauthorizedAccountSchema[ T ]>
{
  constructor(data: z.infer<typeof unauthorizedAccountSchema[ T ]>, id?: string) {
    super(data, T ], { id });
  }
}

export class UnauthorizedPhoneAccount extends Entity<
  typeof accountSchema
> {
  constructor(data: z.infer<typeof accountSchema>, id?: string) {
    super(data, accountSchema, { id });
  }

  login ( accountInfo: AccountInfo ): AccountEntity
  {
    return new AccountEntity(this.getData(), { id: this.getData("id"), accountInfo });
  }
}

export class UnauthorizedUsernameAccount extends Entity<

export class AccountEntity extends Entity<
  typeof accountSchema,
  { accountInfo: AccountInfo } & EntityMetadata
> {
  public isLoggedIn: boolean = false;

  constructor(data: z.infer<typeof accountSchema>, metadata: {id: string, accountInfo: AccountInfo}) {
    super(data, accountSchema, { ...metadata });
  }

  private getAccountInfo(): AccountInfo {
    const accountInfo = this.getData("accountInfo");
    if (!accountInfo) {
      throw new Error("Account info is not set");
    }
    return accountInfo;
  }

  getLoginParameters(): z.infer<typeof accountSchema> {
    return {
      phoneNumber: this.getData("phoneNumber"),
      password: this.getData("password"),
    };
  }

  getOrganizationExId(): string {
    const id = this.getAccountInfo().organizationExId
    if (!id) {
      throw new Error("Organization ExId is not available");
    }
    return id;
  }

  getUsername(): string {
    const username = this.getAccountInfo().username;
    if (!username) {
      throw new Error("Username is not available");
    }
    return username;
  }

  getAccessToken(): string {
    const token = this.getAccountInfo().accessToken;
    if (!token) {
      throw new Error("Access token is not available");
    }
    return token;
  }
}
