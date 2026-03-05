import { BaseError, ErrorCode, ErrorContext } from './BaseError.ts';

/**
 * Generic LLM provider error
 */
export class LLMProviderError extends BaseError {
  constructor(
    provider: string,
    message: string,
    context: ErrorContext = {},
    originalError?: Error
  ) {
    super(
      `${provider} LLM error: ${message}`,
      ErrorCode.LLM_PROVIDER,
      { ...context, provider },
      {
        retryable: true,
        statusCode: 502,
        originalError,
      }
    );
  }
}

/**
 * LLM timeout error
 */
export class LLMTimeoutError extends BaseError {
  constructor(provider: string, timeoutMs: number, context: ErrorContext = {}) {
    super(
      `${provider} LLM request timed out after ${timeoutMs}ms`,
      ErrorCode.LLM_TIMEOUT,
      { ...context, provider, timeoutMs },
      {
        retryable: true,
        statusCode: 504,
      }
    );
  }
}

/**
 * LLM rate limit error
 */
export class LLMRateLimitError extends BaseError {
  constructor(
    provider: string,
    retryAfter?: number,
    context: ErrorContext = {}
  ) {
    super(
      `${provider} LLM rate limit exceeded${retryAfter ? `. Retry after ${retryAfter}s` : ''}`,
      ErrorCode.LLM_RATE_LIMIT,
      { ...context, provider, retryAfter },
      {
        retryable: true,
        statusCode: 429,
      }
    );
  }
}

/**
 * Azure deployment not found error
 */
export class LLMDeploymentNotFoundError extends BaseError {
  constructor(
    deploymentName: string,
    endpoint: string,
    context: ErrorContext = {}
  ) {
    super(
      `Azure OpenAI deployment '${deploymentName}' not found at endpoint '${endpoint}'`,
      ErrorCode.LLM_DEPLOYMENT_NOT_FOUND,
      { ...context, deploymentName, endpoint },
      {
        retryable: true, // Retryable due to propagation delays
        statusCode: 404,
      }
    );
  }
}

/**
 * Circuit breaker open error
 */
export class CircuitBreakerOpenError extends BaseError {
  constructor(
    circuitName: string,
    nextAttemptAt: Date,
    context: ErrorContext = {}
  ) {
    super(
      `Circuit breaker '${circuitName}' is OPEN. Next attempt at ${nextAttemptAt.toISOString()}`,
      ErrorCode.CIRCUIT_OPEN,
      { ...context, circuitName, nextAttemptAt: nextAttemptAt.toISOString() },
      {
        retryable: false, // Don't retry when circuit is open
        statusCode: 503,
      }
    );
  }
}

/**
 * Circuit breaker timeout error
 */
export class CircuitBreakerTimeoutError extends BaseError {
  constructor(
    circuitName: string,
    timeoutMs: number,
    context: ErrorContext = {}
  ) {
    super(
      `Circuit breaker '${circuitName}' operation timed out after ${timeoutMs}ms`,
      ErrorCode.CIRCUIT_TIMEOUT,
      { ...context, circuitName, timeoutMs },
      {
        retryable: true,
        statusCode: 504,
      }
    );
  }
}
