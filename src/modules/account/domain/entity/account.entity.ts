import type z from "zod";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import { accountSchema, type AccountInfo } from "../schema/account.schema.js";

export class AccountEntity extends Entity<typeof accountSchema> {
  private accountInfo: AccountInfo | undefined;
  constructor(data: z.infer<typeof accountSchema>, id?: string) {
    super(data, accountSchema, id);
  }

  setAccountInfo(accountInfo: AccountInfo) {
    this.accountInfo = { ...this.accountInfo, ...accountInfo };
  }

  getAccountInfo(): AccountInfo | undefined {
    return this.accountInfo;
  }

  clearToken() {
    this.accountInfo = undefined;
  }
}
