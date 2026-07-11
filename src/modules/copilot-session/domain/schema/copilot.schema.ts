import { z } from "zod";
import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import type { Account } from "../../../account/domain/entity/account.entity.ts";

export type CopilotExecutionStatus =
  | "pending"
  | "initializing"
  | "running"
  | "completed"
  | "failed";
export const copilotExecutionSchema = z.object({
  projectExId: z.string(),
  userInputContent: z.string(),
  copilotSessionExId: z.string().optional(),
  status: z
    .enum(["pending", "initializing", "running", "completed", "failed"])
    .default("pending"),
});

export type ProjectTypeOfCopilotExecution = {
  projectExId: string;
  copilotInputId: string;
  projectNetwork: NetworkClient;
  account: Account;
};
