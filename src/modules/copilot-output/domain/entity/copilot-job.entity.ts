import type z from "zod";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import { copilotJobSchema } from "../schema/copilot.schema.ts";
import type { CopilotTaskMessageFragment } from "../../../../graphql/generated/types.ts";

export class CopilotJobEntity extends Entity<typeof copilotJobSchema> {
  private _editableText: string | undefined;
  private _tasks: Array<
    Omit<CopilotTaskMessageFragment, "__typename" | "messageType">
  > = [];

  private _isTerminated: boolean = false;

  public get isTerminated(): boolean {
    return this._isTerminated;
  }

  public setTerminate() {
    this._isTerminated = true;
  }

  public addTask(task: (typeof this._tasks)[number]): void {
    this._tasks.push(task);
  }

  public get tasks(): typeof this._tasks {
    return this._tasks;
  }

  get editableText(): string | undefined {
    return this._editableText;
  }

  set editableText(value: string) {
    this._editableText = value;
  }
  constructor(data: z.infer<typeof copilotJobSchema>, id?: string) {
    super(data, copilotJobSchema, id);
  }
}
