import { Account } from "../modules/account/application/account-handler.ts";

export function createAccount(
  phoneNumberOrUsername: string,
  password: string,
): Account {
  return new Account(phoneNumberOrUsername, password);
}

export const myAccount = createAccount(
  process.env.FUNCTORZ_PHONE_NUMBER!,
  process.env.FUNCTORZ_PASSWORD!,
);

export const dangerousAccount = createAccount(
  process.env.DANGEROUS_USERNAME!,
  process.env.DANGEROUS_PASSWORD!,
);
