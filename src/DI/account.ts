import { Account } from "../modules/account/application/account-handler.ts";
import type { ILoginService } from "../modules/account/domain/interface/login.interface.ts";
import { LoginService } from "../modules/account/infrastructure/login.ts";
import { NetworkClientEntity } from "../modules/shared/domain/entity/network-client.entity.ts";

export async function createAccount(
  phoneNumberOrUsername: string,
  password: string,
  loginService: ILoginService,
  networkClient: NetworkClientEntity,
): Promise<Account> {
  const account = new Account(
    loginService,
    phoneNumberOrUsername,
    password,
    networkClient,
  );
  await account.ensureLoggedIn();
  return account;
}

export async function getMyAccount(
  networkClient: NetworkClientEntity = new NetworkClientEntity({}),
  loginService: ILoginService = new LoginService(),
): Promise<Account> {
  return await createAccount(
    process.env.FUNCTORZ_PHONE_NUMBER,
    process.env.FUNCTORZ_PASSWORD,
    loginService,
    networkClient,
  );
}

export async function getDangerousAccount(
  networkClient: NetworkClientEntity = new NetworkClientEntity({}),
  loginService: ILoginService = new LoginService(),
): Promise<Account> {
  return await createAccount(
    process.env.DANGEROUS_USERNAME,
    process.env.DANGEROUS_PASSWORD,
    loginService,
    networkClient,
  );
}
