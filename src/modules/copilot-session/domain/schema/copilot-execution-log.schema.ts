export type CopilotExecutionLogType = {
  editableText?: string;
  aiResponse?: string;
  tasks: unknown[];
};

type ResponsePolicyEnum = {
  HumanInputMessage: "HumanInputMessage";
  OperationMessage: "OperationMessage";
  TerminateMessage: "TerminateMessage";
};

export type CopilotExecutionResponsePolicy<T extends CopilotExecutionLogType> =
  T["editableText"] extends undefined
    ? ResponsePolicyEnum["HumanInputMessage"]
    : T["aiResponse"] extends undefined
      ? ResponsePolicyEnum["OperationMessage"]
      : ResponsePolicyEnum["TerminateMessage"];
