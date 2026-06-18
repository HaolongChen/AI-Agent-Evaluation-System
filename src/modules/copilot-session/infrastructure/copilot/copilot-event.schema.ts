import type { CopilotArgsInput as CopilotArgumentsInput } from "../../../../graphql/generated/types.ts";
import {
  inputMessageList,
  type CopilotInputMessage,
  type CopilotResponseMessage,
} from "./copilot.schema.ts";
import { Event } from "ts-event-target";
export class CopilotResponseEvent<
  T extends keyof CopilotResponseMessage = keyof CopilotResponseMessage,
> extends Event<T> {
  constructor(readonly data: CopilotResponseMessage[T]) {
    super(data.__typename as T);
  }
}

export type CopilotResponseEventsList = {
  [K in keyof CopilotResponseMessage]: CopilotResponseEvent<K>;
};

export class CopilotInputEvent<
  T extends keyof CopilotInputMessage = keyof CopilotInputMessage,
>{
  constructor(
    private readonly type: T,
    private readonly data: CopilotInputMessage[T],
  ) {
  }

  get message(): CopilotArgumentsInput {
    return {
      copilotMessageType: inputMessageList[this.type].type,
      [inputMessageList[this.type].property]: this.data,
    };
  }
}
export type CopilotInputEventsList = {
  [K in keyof CopilotInputMessage]: CopilotInputEvent<K>;
};
