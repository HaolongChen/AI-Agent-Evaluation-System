/**
 * Unit tests for BaseError and error hierarchy
 */

import { describe, it, expect } from 'vitest';
import {
  BaseError,
  ErrorCode,
  ValidationError,
  NotFoundError,
  ConflictError,
  LLMProviderError,
  CircuitBreakerOpenError,
  WorkflowNodeError,
} from '../../../src/shared/errors/index.ts';

describe('BaseError', () => {
  it('should create error with message and code', () => {
    const error = new BaseError(
      'Test error',
      ErrorCode.UNKNOWN,
      { key: 'value' }
    );

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Test error');
    expect(error.code).toBe(ErrorCode.UNKNOWN);
    expect(error.context.key).toBe('value');
  });

  it('should include timestamp in context', () => {
    const error = new BaseError('Test error');
    
    expect(error.context.timestamp).toBeDefined();
    expect(typeof error.context.timestamp).toBe('string');
  });

  it('should serialize to JSON', () => {
    const error = new BaseError(
      'Test error',
      ErrorCode.VALIDATION,
      { sessionId: 123 }
    );

    const json = error.toJSON();

    expect(json.name).toBe('BaseError');
    expect(json.message).toBe('Test error');
    expect(json.code).toBe(ErrorCode.VALIDATION);
    expect(json.context.sessionId).toBe(123);
    expect(json.timestamp).toBeDefined();
  });

  it('should support retryable flag', () => {
    const retryable = new BaseError('Retryable', ErrorCode.DATABASE, {}, {
      retryable: true,
      statusCode: 500,
    });

    const nonRetryable = new BaseError('Non-retryable', ErrorCode.VALIDATION, {}, {
      retryable: false,
      statusCode: 400,
    });

    expect(retryable.isRetryable()).toBe(true);
    expect(nonRetryable.isRetryable()).toBe(false);
  });

  it('should return correct status codes', () => {
    const serverError = new BaseError('Server', ErrorCode.DATABASE, {}, {
      retryable: false,
      statusCode: 500,
    });

    const clientError = new BaseError('Client', ErrorCode.VALIDATION, {}, {
      retryable: false,
      statusCode: 400,
    });

    expect(serverError.getStatusCode()).toBe(500);
    expect(clientError.getStatusCode()).toBe(400);
  });
});

describe('ValidationError', () => {
  it('should create validation error with 400 status', () => {
    const error = new ValidationError('Invalid input', { field: 'email' });

    expect(error).toBeInstanceOf(BaseError);
    expect(error.code).toBe(ErrorCode.VALIDATION);
    expect(error.getStatusCode()).toBe(400);
    expect(error.isRetryable()).toBe(false);
    expect(error.context.field).toBe('email');
  });
});

describe('NotFoundError', () => {
  it('should create not found error with resource info', () => {
    const error = new NotFoundError('User', 123);

    expect(error).toBeInstanceOf(BaseError);
    expect(error.message).toBe("User with identifier '123' not found");
    expect(error.code).toBe(ErrorCode.DOMAIN_NOT_FOUND);
    expect(error.getStatusCode()).toBe(404);
    expect(error.context.resource).toBe('User');
    expect(error.context.identifier).toBe(123);
  });
});

describe('ConflictError', () => {
  it('should create conflict error', () => {
    const error = new ConflictError('Resource already exists', { id: 456 });

    expect(error).toBeInstanceOf(BaseError);
    expect(error.code).toBe(ErrorCode.DOMAIN_CONFLICT);
    expect(error.getStatusCode()).toBe(409);
    expect(error.isRetryable()).toBe(false);
  });
});

describe('LLMProviderError', () => {
  it('should create LLM provider error with provider info', () => {
    const error = new LLMProviderError(
      'azure',
      'Connection failed',
      { model: 'gpt-4' }
    );

    expect(error).toBeInstanceOf(BaseError);
    expect(error.message).toBe('azure LLM error: Connection failed');
    expect(error.code).toBe(ErrorCode.LLM_PROVIDER);
    expect(error.getStatusCode()).toBe(502);
    expect(error.isRetryable()).toBe(true);
    expect(error.context.provider).toBe('azure');
  });
});

describe('CircuitBreakerOpenError', () => {
  it('should create circuit breaker open error', () => {
    const nextAttempt = new Date('2026-03-05T12:00:00Z');
    const error = new CircuitBreakerOpenError(
      'azure-llm',
      nextAttempt,
      { attempts: 5 }
    );

    expect(error).toBeInstanceOf(BaseError);
    expect(error.code).toBe(ErrorCode.CIRCUIT_OPEN);
    expect(error.getStatusCode()).toBe(503);
    expect(error.isRetryable()).toBe(false);
    expect(error.context.circuitName).toBe('azure-llm');
    expect(error.context.nextAttemptAt).toBe(nextAttempt.toISOString());
  });
});

describe('WorkflowNodeError', () => {
  it('should create workflow node error with node name', () => {
    const originalError = new Error('Node failed');
    const error = new WorkflowNodeError(
      'RubricDrafter',
      'Generation failed',
      { sessionId: 789 },
      originalError
    );

    expect(error).toBeInstanceOf(BaseError);
    expect(error.message).toBe("Node 'RubricDrafter' failed: Generation failed");
    expect(error.code).toBe(ErrorCode.WORKFLOW_NODE);
    expect(error.context.nodeName).toBe('RubricDrafter');
    expect(error.metadata.originalError).toBe(originalError);
  });
});
