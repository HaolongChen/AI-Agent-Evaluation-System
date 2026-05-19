import type z from "zod";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import { copilotJobSchema } from "../schema/copilot.schema.ts";
import {
  CopilotMessageType,
  type TaskMessage,
} from "../../../shared/domain/interface/types.ts";

export class CopilotJobEntity extends Entity<typeof copilotJobSchema> {
  private _editableText: string | undefined;
  private _tasks: TaskMessage[] = [];

  private _isTerminated: boolean = false;

  public get isTerminated(): boolean {
    return this._isTerminated;
  }

  public setTerminate() {
    this._isTerminated = true;
  }

  public addTask(task: Omit<TaskMessage, "type">): void {
    this._tasks.push({ ...task, type: CopilotMessageType.TASK });
  }

  public get tasks(): TaskMessage[] {
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
