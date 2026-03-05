import { BaseError, ErrorCode, ErrorContext, ErrorMetadata } from './BaseError.ts';

/**
 * Domain validation error
 */
export class ValidationError extends BaseError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, ErrorCode.VALIDATION, context, {
      retryable: false,
      statusCode: 400,
    });
  }
}

/**
 * Resource not found error
 */
export class NotFoundError extends BaseError {
  constructor(resource: string, identifier: string | number, context: ErrorContext = {}) {
    super(
      `${resource} with identifier '${identifier}' not found`,
      ErrorCode.DOMAIN_NOT_FOUND,
      { ...context, resource, identifier },
      {
        retryable: false,
        statusCode: 404,
      }
    );
  }
}

/**
 * Resource conflict error (duplicate, concurrent modification, etc.)
 */
export class ConflictError extends BaseError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, ErrorCode.DOMAIN_CONFLICT, context, {
      retryable: false,
      statusCode: 409,
    });
  }
}

/**
 * Invalid state transition error
 */
export class InvalidStateError extends BaseError {
  constructor(
    currentState: string,
    attemptedAction: string,
    context: ErrorContext = {}
  ) {
    super(
      `Cannot perform '${attemptedAction}' in current state '${currentState}'`,
      ErrorCode.DOMAIN_STATE,
      { ...context, currentState, attemptedAction },
      {
        retryable: false,
        statusCode: 400,
      }
    );
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends BaseError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, ErrorCode.CONFIGURATION, context, {
      retryable: false,
      statusCode: 500,
    });
  }
}
