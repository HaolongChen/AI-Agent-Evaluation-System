import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

dotenvExpand.expand(dotenv.config());
import { Account } from "../modules/account/application/account-handler.ts";

export const myAccount = new Account(
  process.env.FUNCTORZ_PHONE_NUMBER!,
  process.env.FUNCTORZ_PASSWORD!,
);
