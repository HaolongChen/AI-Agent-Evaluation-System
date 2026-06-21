import type { z } from "zod";
import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { CopilotExecutionAggregate } from "../aggregate/copilot-execution.aggregate.ts";
import { copilotExecutionSchema } from "../schema/copilot.schema.ts";
import { type ProjectMetadata } from "../schema/project.schema.ts";

export interface ICopilotRepository extends IRepository<CopilotExecutionAggregate> {
  getByCopilotInputAndCopilotServer(
    copilotInputId: string,
    copilotServerId: string,
  ): Promise<CopilotExecutionInfo<"withProject" | "withSession">[]>;
}

export type CopilotExecutionLogEnum = "base" | "withProject" | "withSession";

type BaseCopilotExecutionInfo = {
  id: string;
  copilotServerId: string;
  status: z.infer<typeof copilotExecutionSchema.shape.status>;
  tasks: unknown[];
};

type CopilotExecutionWithProjectInfo = BaseCopilotExecutionInfo & {
  projectExId: string;
  project: {
    id: string;
    copilotInputId: string;
    projectName: string;
    projectExId: string;
    status: ProjectMetadata["state"]["status"];
  };
};

type RunningCopilotExecutionInfo = CopilotExecutionWithProjectInfo & {
  copilotSessionExId: string;
  aiResponse?: string;
  editableText?: string;
};

export type CopilotExecutionInfo<
  T extends CopilotExecutionLogEnum = CopilotExecutionLogEnum,
> = T extends "base"
  ? BaseCopilotExecutionInfo
  : T extends "withProject"
    ? CopilotExecutionWithProjectInfo
    : T extends "withSession"
      ? RunningCopilotExecutionInfo
      : never;
