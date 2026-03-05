import { BaseError, ErrorCode, ErrorContext } from './BaseError.ts';

/**
 * Workflow execution error
 */
export class WorkflowExecutionError extends BaseError {
  constructor(
    workflowName: string,
    message: string,
    context: ErrorContext = {},
    originalError?: Error
  ) {
    super(
      `Workflow '${workflowName}' execution failed: ${message}`,
      ErrorCode.WORKFLOW_EXECUTION,
      { ...context, workflowName },
      {
        retryable: false,
        statusCode: 500,
        originalError,
      }
    );
  }
}

/**
 * Workflow state error
 */
export class WorkflowStateError extends BaseError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, ErrorCode.WORKFLOW_STATE, context, {
      retryable: false,
      statusCode: 400,
    });
  }
}

/**
 * Workflow node error
 */
export class WorkflowNodeError extends BaseError {
  constructor(
    nodeName: string,
    message: string,
    context: ErrorContext = {},
    originalError?: Error
  ) {
    super(
      `Node '${nodeName}' failed: ${message}`,
      ErrorCode.WORKFLOW_NODE,
      { ...context, nodeName },
      {
        retryable: false,
        statusCode: 500,
        originalError,
      }
    );
  }
}

/**
 * Workflow interrupt error
 */
export class WorkflowInterruptError extends BaseError {
  constructor(reason: string, context: ErrorContext = {}) {
    super(
      `Workflow interrupted: ${reason}`,
      ErrorCode.WORKFLOW_INTERRUPT,
      context,
      {
        retryable: false,
        statusCode: 400,
      }
    );
  }
}
