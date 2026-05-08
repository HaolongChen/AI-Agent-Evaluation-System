import type { Data } from "ws";
import {
  CopilotMessageType,
  type AIResponseMessage,
  type CopilotMessage,
  type EditableTextMessage,
  type ErrorMessage,
  type ExecErrorMessage,
  type FeedbackMessage,
  type HumanInputMessage,
  type HumanOperationMessage,
  type InitialStateMessage,
  type StateChangeMessage,
  type StopMessage,
  type SystemStatusMessage,
  type TaskMessage,
  type TaskRevertSuccessMessage,
  type TerminateMessage,
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

type MessageHandlerTypeMap = {
  [K in CopilotMessageType]: (
    message: Extract<CopilotMessage, { type: K }>,
  ) => void;
};

export class MessageHandler extends CopilotJobEntity {
  private readonly messageTypeToHandlerMap: MessageHandlerTypeMap = {
    [CopilotMessageType.AI_RESPONSE]: this.handleAIResponseMessage.bind(this),
    [CopilotMessageType.EDITABLE_TEXT]:
      this.handleEditableTextMessage.bind(this),
    [CopilotMessageType.ERROR]: this.handleErrorMessage.bind(this),
    [CopilotMessageType.EXEC_ERROR]: this.handleExecErrorMessage.bind(this),
    [CopilotMessageType.FEEDBACK]: this.handleFeedbackMessage.bind(this),
    [CopilotMessageType.HUMAN_INPUT]: this.handleHumanInputMessage.bind(this),
    [CopilotMessageType.HUMAN_OPERATION]:
      this.handleHumanOperationMessage.bind(this),
    [CopilotMessageType.INITIAL_STATE]:
      this.handleInitialStateMessage.bind(this),
    [CopilotMessageType.STATE_CHANGE]: this.handleStateChangeMessage.bind(this),
    [CopilotMessageType.STOP]: this.handleStopMessage.bind(this),
    [CopilotMessageType.SYSTEM_STATUS]:
      this.handleSystemStatusMessage.bind(this),
    [CopilotMessageType.TASK]: this.handleTaskMessage.bind(this),
    [CopilotMessageType.TASK_REVERT_SUCCESS]:
      this.handleTaskRevertSuccessMessage.bind(this),
    [CopilotMessageType.TERMINATE]: this.handleTerminateMessage.bind(this),
    [CopilotMessageType.TOOL_CALLS]: this.handleToolCallsMessage.bind(this),
    [CopilotMessageType.TOOL_RESPONSE]:
      this.handleToolResponseMessage.bind(this),
  };

  constructor(
    private readonly send: (data: CopilotMessage) => void,
    copilotJobEntity: CopilotJobEntity,
    private resolve: (result: string | PromiseLike<string>) => void,
  ) {
    super(copilotJobEntity.data, copilotJobEntity.id);
  }

  private terminate() {
    this.send({ type: CopilotMessageType.TERMINATE });
    this.setTerminate();
  }

  private messageExtractor(message: Data): CopilotMessage {
    const data: CopilotMessage[] = JSON.parse(message.toString());
    return data[0];
  }

  invoke(message: Data) {
    const data = this.messageExtractor(message);
    const handler = this.messageTypeToHandlerMap[data.type];
    if (handler && !this.isTerminated) {
      // Type assertion necessary as the mapped type isn't fully narrowed in the assignment constraint
      (handler as (message: typeof data) => void)(data);
    } else {
      console.warn(`No handler found for message: ${data}`);
    }
  }

  handleAIResponseMessage(message: AIResponseMessage) {
    console.log(message);
  }

  handleEditableTextMessage(message: EditableTextMessage) {
    this.editableText = message.content;
    this.resolve(message.content);
    this.terminate();
  }

  handleErrorMessage(message: ErrorMessage) {
    console.log(message);
    throw new Error(message.content);
  }

  handleExecErrorMessage(message: ExecErrorMessage) {
    console.log(message);
  }

  handleFeedbackMessage(message: FeedbackMessage) {
    console.log(message);
  }

  handleHumanInputMessage(message: HumanInputMessage) {
    console.log(message);
  }

  handleHumanOperationMessage(message: HumanOperationMessage) {
    console.log(message);
  }

  handleInitialStateMessage(message: InitialStateMessage) {
    if (message.terminated) {
      throw new Error(
        "Received initial state message for a terminated session. This likely indicates an issue with the backend job execution.",
      );
    }
    const response: HumanInputMessage = {
      type: CopilotMessageType.HUMAN_INPUT,
      content: this.data.query,
    };
    this.send(response);
  }

  handleStateChangeMessage(message: StateChangeMessage) {
    if (message.currentJobIsRunning === false) {
      throw new Error("Current job is not running.");
    }
  }

  handleStopMessage(message: StopMessage) {
    console.log(message);
  }

  handleSystemStatusMessage(message: SystemStatusMessage) {
    console.log(message);
  }

  handleTaskMessage(message: TaskMessage) {
    this.addTask(message);
  }

  handleTaskRevertSuccessMessage(message: TaskRevertSuccessMessage) {
    console.log(message);
  }

  handleTerminateMessage(message: TerminateMessage) {
    console.log(message);
  }

  handleToolCallsMessage(message: ToolCallsMessage) {
    const { result, successful, errorMessage } = this.runToolCalls(
      message.toolCalls,
    );
    if (successful) {
      const responseMessage: ToolResponseMessage = {
        type: CopilotMessageType.TOOL_RESPONSE,
        result: result!,
        toolCallsId: message.toolCallsId,
      };
      this.send(responseMessage);
    } else {
      console.error("Error executing tool calls:", errorMessage);
    }
  }

  handleToolResponseMessage(message: ToolResponseMessage) {
    console.log(message);
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
