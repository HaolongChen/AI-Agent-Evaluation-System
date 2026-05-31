import { Account } from "../modules/account/application/account-handler.ts";
import type { ILoginService } from "../modules/account/domain/interface/login.interface.ts";
import { LoginService } from "../modules/account/infrastructure/login.ts";

export async function createAccount(
  phoneNumberOrUsername: string,
  password: string,
  loginService: ILoginService,
): Promise<Account> {
  const account = new Account(loginService, phoneNumberOrUsername, password);
  await account.ensureLoggedIn();
  return account;
}

export async function getMyAccount(
  loginService: ILoginService = new LoginService(),
): Promise<Account> {
  return await createAccount(
    process.env.FUNCTORZ_PHONE_NUMBER,
    process.env.FUNCTORZ_PASSWORD,
    loginService,
  );
}

export async function getDangerousAccount(
  loginService: ILoginService = new LoginService(),
): Promise<Account> {
  return await createAccount(
    process.env.DANGEROUS_USERNAME,
    process.env.DANGEROUS_PASSWORD,
    loginService,
  );
}
