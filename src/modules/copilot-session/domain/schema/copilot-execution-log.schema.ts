export type CopilotExecutionLogType = {
  editableText?: string;
  aiResponse?: string;
  tasks: unknown[];
};

export type ResponsePolicyEnum =
  "HumanInputMessage" | "OperationMessage" | "TerminateMessage";
