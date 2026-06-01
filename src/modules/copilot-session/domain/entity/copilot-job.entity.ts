import type z from "zod";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import {
  copilotJobSchema,
  type CopilotInputMessage,
  type CopilotMessageContentMap,
  type TypeNameList,
} from "../schema/copilot.schema.ts";
import type { CopilotTaskMessageFragment } from "../../../../graphql/generated/types.ts";
import { Event } from "ts-event-target";

export class CopilotJobEntity extends Entity<typeof copilotJobSchema> {
  private _editableText: string | undefined;
  private _aiResponse: string | undefined;
  private _tasks: Array<
    Omit<CopilotTaskMessageFragment, "__typename" | "messageType">
  > = [];

  isFinished(): boolean {
    return !!this._aiResponse;
  }

  set aiResponse(response: string) {
    this._aiResponse = response;
  }

  get aiResponse(): string | undefined {
    return this._aiResponse;
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
    super(data, copilotJobSchema, {id});
  }
}

export class CopilotEvent<T extends keyof TypeNameList> extends Event<T> {
  constructor(
    type: T,
    readonly data: CopilotMessageContentMap[T],
  ) {
    super(type);
  }
}

export class CopilotInputEvent<
  T extends keyof CopilotInputMessage,
> extends Event<T> {
  constructor(
    type: T,
    readonly data: CopilotInputMessage[T],
  ) {
    super(type);
  }
}

export type CopilotEventsList = { [K in keyof TypeNameList]: CopilotEvent<K> };
export type CopilotInputEventsList = {
  [K in keyof CopilotInputMessage]: CopilotInputEvent<K>;
};

export type CopilotInputEventType = [
  CopilotInputEventsList[keyof CopilotInputEventsList],
  Event<"unsubscribe">,
];

export type CopilotEventType = [CopilotEventsList[keyof CopilotEventsList]];
