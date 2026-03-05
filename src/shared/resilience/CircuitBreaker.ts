import { CircuitBreakerOpenError, CircuitBreakerTimeoutError } from '../errors/index.ts';
import { logger } from '../../utils/logger.ts';

/**
 * Circuit Breaker States
 */
export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation, requests pass through
  OPEN = 'OPEN',         // Circuit is open, reject all requests
  HALF_OPEN = 'HALF_OPEN' // Testing if service has recovered
}

/**
 * Circuit Breaker Configuration
 */
export interface CircuitBreakerConfig {
  /** Name of the circuit for logging */
  name: string;
  
  /** Number of failures before opening circuit */
  failureThreshold: number;
  
  /** Time window for counting failures (ms) */
  failureTimeWindow: number;
  
  /** Time to wait before attempting to close circuit (ms) */
  resetTimeout: number;
  
  /** Number of successful calls in HALF_OPEN before closing */
  successThreshold: number;
  
  /** Timeout for individual operations (ms) */
  timeout?: number;
  
  /** Percentage of calls to reject when circuit is open (0-100) */
  rejectionPercentage?: number;
}

/**
 * Circuit Breaker Metrics
 */
export interface CircuitBreakerMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  rejectedCalls: number;
  state: CircuitState;
  lastStateChange: Date;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
}

/**
 * Circuit Breaker Implementation
 * 
 * Implements the Circuit Breaker pattern to prevent cascading failures
 * when calling external services (like LLM providers).
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: Date | null = null;
  private nextAttemptTime: Date | null = null;
  private metrics: CircuitBreakerMetrics;

  constructor(private readonly config: CircuitBreakerConfig) {
    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      rejectedCalls: 0,
      state: CircuitState.CLOSED,
      lastStateChange: new Date(),
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
    };

    logger.info(`Circuit breaker '${config.name}' initialized`, {
      config: this.config,
    });
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>, context?: Record<string, unknown>): Promise<T> {
    this.checkState();
    this.metrics.totalCalls++;

    // Reject if circuit is open
    if (this.state === CircuitState.OPEN) {
      this.metrics.rejectedCalls++;
      logger.warn(`Circuit breaker '${this.config.name}' is OPEN, rejecting call`, {
        nextAttemptTime: this.nextAttemptTime?.toISOString(),
        context,
      });
      
      throw new CircuitBreakerOpenError(
        this.config.name,
        this.nextAttemptTime || new Date(),
        context
      );
    }

    try {
      // Execute with timeout if configured
      const result = this.config.timeout
        ? await this.executeWithTimeout(fn, this.config.timeout)
        : await fn();

      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  /**
   * Execute function with timeout
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new CircuitBreakerTimeoutError(this.config.name, timeoutMs)),
          timeoutMs
        )
      ),
    ]);
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.failureCount = 0;
    this.successCount++;
    this.metrics.successfulCalls++;
    this.metrics.consecutiveSuccesses++;
    this.metrics.consecutiveFailures = 0;

    // Transition from HALF_OPEN to CLOSED if threshold met
    if (
      this.state === CircuitState.HALF_OPEN &&
      this.successCount >= this.config.successThreshold
    ) {
      this.transitionTo(CircuitState.CLOSED);
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(error: unknown): void {
    this.failureCount++;
    this.successCount = 0;
    this.lastFailureTime = new Date();
    this.metrics.failedCalls++;
    this.metrics.consecutiveFailures++;
    this.metrics.consecutiveSuccesses = 0;

    logger.warn(`Circuit breaker '${this.config.name}' recorded failure`, {
      failureCount: this.failureCount,
      threshold: this.config.failureThreshold,
      error: error instanceof Error ? error.message : String(error),
    });

    // Open circuit if threshold exceeded
    if (this.failureCount >= this.config.failureThreshold) {
      this.transitionTo(CircuitState.OPEN);
    }
  }

  /**
   * Check and update circuit state based on time
   */
  private checkState(): void {
    if (this.state === CircuitState.OPEN && this.shouldAttemptReset()) {
      this.transitionTo(CircuitState.HALF_OPEN);
    }

    // Reset failure count if outside time window
    if (
      this.lastFailureTime &&
      Date.now() - this.lastFailureTime.getTime() > this.config.failureTimeWindow
    ) {
      this.failureCount = 0;
    }
  }

  /**
   * Check if enough time has passed to attempt reset
   */
  private shouldAttemptReset(): boolean {
    if (!this.nextAttemptTime) return false;
    return Date.now() >= this.nextAttemptTime.getTime();
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;
    this.metrics.state = newState;
    this.metrics.lastStateChange = new Date();

    switch (newState) {
      case CircuitState.OPEN:
        this.nextAttemptTime = new Date(Date.now() + this.config.resetTimeout);
        logger.warn(`Circuit breaker '${this.config.name}' opened`, {
          failureCount: this.failureCount,
          nextAttemptTime: this.nextAttemptTime.toISOString(),
        });
        break;

      case CircuitState.HALF_OPEN:
        this.successCount = 0;
        this.failureCount = 0;
        logger.info(`Circuit breaker '${this.config.name}' half-open, testing recovery`);
        break;

      case CircuitState.CLOSED:
        this.failureCount = 0;
        this.successCount = 0;
        this.nextAttemptTime = null;
        logger.info(`Circuit breaker '${this.config.name}' closed, normal operation resumed`);
        break;
    }

    logger.info(`Circuit breaker '${this.config.name}' state transition`, {
      from: oldState,
      to: newState,
      metrics: this.metrics,
    });
  }

  /**
   * Get current circuit breaker metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    return { ...this.metrics };
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    this.checkState();
    return this.state;
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    logger.info(`Circuit breaker '${this.config.name}' manually reset`);
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.transitionTo(CircuitState.CLOSED);
  }

  /**
   * Manually open the circuit breaker
   */
  open(): void {
    logger.info(`Circuit breaker '${this.config.name}' manually opened`);
    this.transitionTo(CircuitState.OPEN);
  }
}
