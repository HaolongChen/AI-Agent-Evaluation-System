import {
  type CopilotMessageContentMap,
  type TypeNameList,
} from "../schema/copilot.schema.ts";
import { Event } from "ts-event-target";
import type { CopilotInputMessage } from "../schema/project.schema.ts";

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

export type CopilotEventType = [CopilotEventsList[keyof CopilotEventsList]];
