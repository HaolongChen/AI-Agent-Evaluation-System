import { BaseError, ErrorCode, ErrorContext } from './BaseError.ts';

/**
 * Database error
 */
export class DatabaseError extends BaseError {
  constructor(message: string, context: ErrorContext = {}, originalError?: Error) {
    super(message, ErrorCode.DATABASE, context, {
      retryable: true,
      statusCode: 500,
      originalError,
    });
  }
}

/**
 * Database connection error
 */
export class DatabaseConnectionError extends BaseError {
  constructor(message: string, context: ErrorContext = {}, originalError?: Error) {
    super(message, ErrorCode.DATABASE_CONNECTION, context, {
      retryable: true,
      statusCode: 503,
      originalError,
    });
  }
}

/**
 * Database transaction error
 */
export class DatabaseTransactionError extends BaseError {
  constructor(message: string, context: ErrorContext = {}, originalError?: Error) {
    super(message, ErrorCode.DATABASE_TRANSACTION, context, {
      retryable: true,
      statusCode: 500,
      originalError,
    });
  }
}

/**
 * External service error (generic)
 */
export class ExternalServiceError extends BaseError {
  constructor(
    serviceName: string,
    message: string,
    context: ErrorContext = {},
    originalError?: Error
  ) {
    super(
      `${serviceName}: ${message}`,
      ErrorCode.EXTERNAL_SERVICE,
      { ...context, serviceName },
      {
        retryable: true,
        statusCode: 502,
        originalError,
      }
    );
  }
}

/**
 * WebSocket connection error
 */
export class WebSocketError extends BaseError {
  constructor(message: string, context: ErrorContext = {}, originalError?: Error) {
    super(message, ErrorCode.WEBSOCKET, context, {
      retryable: true,
      statusCode: 503,
      originalError,
    });
  }
}

/**
 * Kubernetes job error
 */
export class KubernetesError extends BaseError {
  constructor(message: string, context: ErrorContext = {}, originalError?: Error) {
    super(message, ErrorCode.KUBERNETES, context, {
      retryable: true,
      statusCode: 500,
      originalError,
    });
  }
}
