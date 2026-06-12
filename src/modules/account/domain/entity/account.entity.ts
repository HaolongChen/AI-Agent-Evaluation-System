import z from "zod";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import { accountSchema, type AccountInfo } from "../schema/account.schema.ts";

export class AccountEntity extends Entity<typeof accountSchema> {
  constructor(data: z.infer<typeof accountSchema>, id?: string) {
    super(data, accountSchema, { id });
  }

  static createWithPhoneNumber(
    phoneNumber: string,
    password: string,
    accountInfo: AccountInfo,
  ): AccountEntity {
    return new AccountEntity({
      ...accountInfo,
      type: "phone",
      value: phoneNumber,
      password,
    });
  }

  static createWithUsername(
    username: string,
    password: string,
    accountInfo: AccountInfo,
  ): AccountEntity {
    return new AccountEntity({
      ...accountInfo,
      type: "username",
      value: username,
      password,
    });
  }
}
