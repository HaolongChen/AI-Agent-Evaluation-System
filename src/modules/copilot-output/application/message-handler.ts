import type { Data } from "ws";
import {
  CopilotMessageType,
  type CopilotMessage,
  type EditableTextMessage,
  type HumanInputMessage,
  type InitialStateMessage,
  type StateChangeMessage,
  type ToolCall,
  type ToolCallsMessage,
  type ToolResponseMessage,
} from "../../../external/types.ts";
import { CopilotJobEntity } from "../domain/entity/copilot-job.entity.ts";
import {
  ClientType,
  CopilotJs,
  Locale,
  Product,
  type CopilotApiResultJs,
} from "../../../external/zed/TypeSystem.ts";
import type { ToolResult } from "../../shared/domain/interface/graph-states.ts";

export interface MessageHandlerResponse {
  messagesToSend: CopilotMessage[];
  shouldTerminate?: boolean;
  result?: string;
}

export class MessageHandler extends CopilotJobEntity {
  constructor(copilotJobEntity: CopilotJobEntity) {
    super(copilotJobEntity.data, copilotJobEntity.id);
  }

  private messageExtractor(message: Data): CopilotMessage {
    const data: CopilotMessage[] = JSON.parse(message.toString());
    return data[0];
  }

  invoke(message: Data): MessageHandlerResponse | undefined {
    if (this.isTerminated) {
      return;
    }
    const data = this.messageExtractor(message);

    switch (data.type) {
      case CopilotMessageType.EDITABLE_TEXT: {
        return this.handleEditableTextMessage(data);
        break;
      }
      case CopilotMessageType.INITIAL_STATE: {
        return this.handleInitialStateMessage(data);
        break;
      }
      case CopilotMessageType.STATE_CHANGE: {
        return this.handleStateChangeMessage(data);
        break;
      }
      case CopilotMessageType.TOOL_CALLS: {
        return this.handleToolCallsMessage(data);
        break;
      }
      case CopilotMessageType.TOOL_RESPONSE: {
        return this.handleToolResponseMessage(data);
        break;
      }
      default: {
        console.warn("Unhandled message type:", data.type);
        console.warn("Full message:", data);
        break;
      }
    }
  }

  handleEditableTextMessage(
    message: EditableTextMessage,
  ): MessageHandlerResponse {
    this.editableText = message.content;
    this.setTerminate();
    return {
      messagesToSend: [],
      result: message.content,
      shouldTerminate: true,
    };
  }

  handleInitialStateMessage(
    message: InitialStateMessage,
  ): MessageHandlerResponse {
    if (message.terminated) {
      throw new Error(
        "Received initial state message for a terminated session. This likely indicates an issue with the backend job execution.",
      );
    }
    const response: HumanInputMessage = {
      type: CopilotMessageType.HUMAN_INPUT,
      content: this.data.query,
    };
    return { messagesToSend: [response] };
  }

  handleStateChangeMessage(
    message: StateChangeMessage,
  ): MessageHandlerResponse {
    if (message.currentJobIsRunning === false) {
      throw new Error("Current job is not running.");
    }
    return { messagesToSend: [], shouldTerminate: false };
  }

  handleToolCallsMessage(message: ToolCallsMessage): MessageHandlerResponse {
    const { result, successful, errorMessage } = this.runToolCalls(
      message.toolCalls,
    );
    if (successful) {
      const responseMessage: ToolResponseMessage = {
        type: CopilotMessageType.TOOL_RESPONSE,
        result: result!,
        toolCallsId: message.toolCallsId,
      };
      return { messagesToSend: [responseMessage], shouldTerminate: false };
    } else {
      console.error("Error executing tool calls:", errorMessage);
      this.setTerminate();
      return {
        messagesToSend: [],
        shouldTerminate: true,
        result: `Error executing tool calls: ${errorMessage}`,
      };
    }
  }

  handleToolResponseMessage(
    message: ToolResponseMessage,
  ): MessageHandlerResponse {
    console.log(message);
    return { messagesToSend: [], shouldTerminate: false };
  }

  private runToolCalls(toolCalls: ToolCall[]) {
    const product = Product.ZION;
    const clientType = ClientType.WEB;
    const locale = Locale.ZH;
    try {
      const result: CopilotApiResultJs = CopilotJs.toolCalls(
        this.data.schemaGraph,
        undefined,
        product,
        clientType,
        "WEB", // clientExId: wechat mini program, web, etc.
        locale,
        toolCalls,
      );
      // probably not necessary to apply schema diff in evaluation job runner
      return { result: result as unknown as ToolResult, successful: true };
    } catch (error: unknown) {
      console.error("toolCall---error:", error, toolCalls);
      return {
        successful: false,
        errorMessage: error instanceof Error ? error.message : String(error),
        result: (error as { result?: ToolResult }).result,
      };
    }
  }
}
