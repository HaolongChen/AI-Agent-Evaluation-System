import {
  type CopilotMessageContentMap,
  type TypeNameList,
} from "../schema/copilot.schema.ts";
import { Event } from "ts-event-target";

export class CopilotEvent<T extends keyof TypeNameList> extends Event<T> {
  constructor(
    type: T,
    readonly data: CopilotMessageContentMap[T],
  ) {
    super(type);
  }
}
export type CopilotEventsList = { [K in keyof TypeNameList]: CopilotEvent<K> };

export type CopilotEventType = [CopilotEventsList[keyof CopilotEventsList]];
