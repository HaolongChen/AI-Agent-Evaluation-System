import type { CopilotArgsInput as CopilotArgumentsInput } from "../../../../graphql/generated/types.ts";
import {
  inputMessageList,
  type CopilotInputMessage,
  type CopilotMessageContentMap,
  type CopilotResponseMessage,
} from "./copilot-event.schema.ts";

type CoreInfo =
  | {
      type: "record";
      content:
        | {
            editableText: string;
          }
        | {
            aiResponse: string;
          }
        | {
            tasks: unknown[];
          };
    }
  | {
      type: "stateChange";
      significance: CopilotMessageContentMap["CopilotStateChangeMessage"]["currentJobIsRunning"];
    }
  | {
      type: "toolCallBatch";
      toolCalls: CopilotMessageContentMap["CopilotToolCallBatchMessage"]["toolCalls"];
      id: string;
    }
  | undefined;

export class CopilotMessageEvent<
  T extends keyof CopilotMessageContentMap = keyof CopilotMessageContentMap,
> {
  constructor(private readonly data: CopilotMessageContentMap[T]) {}

  get coreInfo(): CoreInfo {
    switch (this.data.__typename) {
      case "CopilotAiResponseMessage": {
        return { type: "record", content: { aiResponse: this.data.content } };
      }
      case "CopilotEditableTextMessage": {
        return { type: "record", content: { editableText: this.data.content } };
      }
      case "CopilotTaskMessage": {
        return { type: "record", content: { tasks: [this.data.diff] } };
      }
      case "CopilotStateChangeMessage": {
        return {
          type: "stateChange",
          significance: this.data.currentJobIsRunning,
        };
      }
      case "CopilotToolCallBatchMessage": {
        return {
          type: "toolCallBatch",
          toolCalls: this.data.toolCalls,
          id: this.data.toolCallBatchId,
        };
      }
      default: {
        return undefined;
      }
    }
  }
}

export type CopilotResponseEventsList = {
  [K in keyof CopilotResponseMessage]: CopilotMessageEvent<K>;
};

export class CopilotInputEvent<
  T extends keyof CopilotInputMessage = keyof CopilotInputMessage,
> {
  constructor(
    private readonly type: T,
    private readonly data: CopilotInputMessage[T],
  ) {}

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
