import type { AccountInfo } from "../schema/account.schema.ts";

export interface ILoginService {
  login(phoneNumber: string, password: string): Promise<AccountInfo>;
  login(username: string, password: string): Promise<AccountInfo>;
}
