import { Account } from "../modules/account/application/account-handler.ts";

export async function createAccount(
  phoneNumberOrUsername: string,
  password: string,
): Promise<Account> {
  const account = new Account(phoneNumberOrUsername, password);
  await account.getWsClient();
  return account;
}

export async function getMyAccount(): Promise<Account> {
  return await createAccount(
    process.env.FUNCTORZ_PHONE_NUMBER,
    process.env.FUNCTORZ_PASSWORD,
  );
}

export async function getDangerousAccount(): Promise<Account> {
  return await createAccount(
    process.env.DANGEROUS_USERNAME,
    process.env.DANGEROUS_PASSWORD,
  );
}
