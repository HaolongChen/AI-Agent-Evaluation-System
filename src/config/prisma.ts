import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

dotenvExpand.expand(dotenv.config());
import { PrismaClient } from "../prisma/build/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL_DEVELOPMENT;
const adapter = new PrismaPg({
  connectionString,
});
export const prisma = new PrismaClient({ adapter, errorFormat: "pretty" });
