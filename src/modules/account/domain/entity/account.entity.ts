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
  constructor(data: z.infer<typeof accountSchema>, id?: string) {
    super(data, accountSchema, id);
  }

  setAccountInfo(accountInfo: AccountInfo) {
    this.setData({ accountInfo: accountInfo });
  }

  getAccountInfo(): AccountInfo {
    const accountInfo = this.getData("accountInfo");
    if (!accountInfo) {
      throw new Error("Account info is not set");
    }
    return accountInfo;
  }

  getOrganizationExId(): string {
    const id = this.getAccountInfo().account.currentOrganization.exId;
    if (!id) {
      throw new Error("Organization ExId is not available");
    }
    return id;
  }

  clearToken() {
    this.setAccountInfo({} as AccountInfo);
  }
}
