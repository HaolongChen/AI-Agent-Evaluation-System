/**
 * Error Hierarchy for AI Agent Evaluation System
 * 
 * Base error class with structured error codes, context, and metadata.
 */

export enum ErrorCode {
  // Domain Errors (1xxx)
  DOMAIN_VALIDATION = 'DOMAIN_VALIDATION_ERROR',
  DOMAIN_NOT_FOUND = 'DOMAIN_NOT_FOUND_ERROR',
  DOMAIN_CONFLICT = 'DOMAIN_CONFLICT_ERROR',
  DOMAIN_STATE = 'DOMAIN_STATE_ERROR',

  // Infrastructure Errors (2xxx)
  DATABASE = 'DATABASE_ERROR',
  DATABASE_CONNECTION = 'DATABASE_CONNECTION_ERROR',
  DATABASE_TRANSACTION = 'DATABASE_TRANSACTION_ERROR',
  DATABASE_QUERY = 'DATABASE_QUERY_ERROR',

  // External Service Errors (3xxx)
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR',
  LLM_PROVIDER = 'LLM_PROVIDER_ERROR',
  LLM_TIMEOUT = 'LLM_TIMEOUT_ERROR',
  LLM_RATE_LIMIT = 'LLM_RATE_LIMIT_ERROR',
  LLM_DEPLOYMENT_NOT_FOUND = 'LLM_DEPLOYMENT_NOT_FOUND_ERROR',
  WEBSOCKET = 'WEBSOCKET_ERROR',
  KUBERNETES = 'KUBERNETES_ERROR',

  // Application Errors (4xxx)
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  CONFIGURATION = 'CONFIGURATION_ERROR',

  // Workflow Errors (5xxx)
  WORKFLOW_EXECUTION = 'WORKFLOW_EXECUTION_ERROR',
  WORKFLOW_STATE = 'WORKFLOW_STATE_ERROR',
  WORKFLOW_NODE = 'WORKFLOW_NODE_ERROR',
  WORKFLOW_INTERRUPT = 'WORKFLOW_INTERRUPT_ERROR',

  // Circuit Breaker Errors (6xxx)
  CIRCUIT_OPEN = 'CIRCUIT_OPEN_ERROR',
  CIRCUIT_TIMEOUT = 'CIRCUIT_TIMEOUT_ERROR',

  // Unknown
  UNKNOWN = 'UNKNOWN_ERROR',
}

export interface ErrorContext {
  [key: string]: unknown;
  timestamp?: string;
  userId?: string;
  sessionId?: number;
  threadId?: string;
  operationName?: string;
  retryAttempt?: number;
}

export interface ErrorMetadata {
  retryable: boolean;
  statusCode: number;
  correlationId?: string;
  originalError?: Error;
}

/**
 * Base application error with structured error handling
 */
export class BaseError extends Error {
  public readonly code: ErrorCode;
  public readonly context: ErrorContext;
  public readonly metadata: ErrorMetadata;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN,
    context: ErrorContext = {},
    metadata?: Partial<ErrorMetadata>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = {
      ...context,
      timestamp: context.timestamp || new Date().toISOString(),
    };
    this.metadata = {
      retryable: metadata?.retryable ?? false,
      statusCode: metadata?.statusCode ?? 500,
      correlationId: metadata?.correlationId,
      originalError: metadata?.originalError,
    };
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Serialize error for logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      metadata: {
        ...this.metadata,
        originalError: this.metadata.originalError?.message,
      },
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    return this.metadata.retryable;
  }

  /**
   * Get HTTP status code
   */
  getStatusCode(): number {
    return this.metadata.statusCode;
  }
}
