import type z from "zod";
import {
  Entity,
  type EntityMetadata,
} from "../../../shared/domain/entity/entity.ts";
import { accountSchema, type AccountInfo } from "../schema/account.schema.js";

export class AccountEntity extends Entity<
  typeof accountSchema,
  { accountInfo?: AccountInfo } & EntityMetadata
> {
  private isLoggedIn: boolean = false;
  constructor(entity: AccountEntity);
  constructor(data: z.infer<typeof accountSchema>, id?: string);
  constructor(
    argument1: AccountEntity | z.infer<typeof accountSchema>,
    argument2?: string,
  ) {
    if (argument1 instanceof AccountEntity) {
      super(argument1);
      this.isLoggedIn = argument1.isLoggedIn;
    } else {
      super(argument1, accountSchema, { id: argument2 });
    }
  }

  protected setAccountInfo(accountInfo: AccountInfo) {
    this.setData({ accountInfo: accountInfo });
    this.isLoggedIn = true;
  }

  private getAccountInfo(): AccountInfo {
    const accountInfo = this.getData("accountInfo");
    if (!accountInfo) {
      throw new Error("Account info is not set");
    }
    return accountInfo;
  }

  protected getLoginParameters(): z.infer<typeof accountSchema> {
    return {
      phoneNumber: this.getData("phoneNumber"),
      password: this.getData("password"),
    };
  }

  getOrganizationExId(): string {
    const id = this.getAccountInfo().account.currentOrganization.exId;
    if (!id) {
      throw new Error("Organization ExId is not available");
    }
    return id;
  }

  getUsername(): string {
    const username = this.getAccountInfo().account.username;
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

  protected clearToken() {
    this.setAccountInfo({} as AccountInfo);
    this.isLoggedIn = false;
  }
}
