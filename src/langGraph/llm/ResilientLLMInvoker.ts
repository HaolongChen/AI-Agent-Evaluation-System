import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { BaseMessage } from '@langchain/core/messages';
import { LLMCircuitBreakerManager, LLMProvider } from '../../shared/resilience/LLMCircuitBreakerManager.ts';
import { getLLM, LLMConfig } from './index.ts';
import { 
  LLMProviderError, 
  LLMTimeoutError, 
  LLMRateLimitError,
  LLMDeploymentNotFoundError 
} from '../../shared/errors/index.ts';
import { logger } from '../../utils/logger.ts';

/**
 * Resilient LLM Invoker
 * 
 * Wraps LLM calls with circuit breaker protection, retry logic,
 * and automatic fallback to alternative providers.
 */
export class ResilientLLMInvoker {
  private circuitBreakerManager: LLMCircuitBreakerManager;

  constructor(circuitBreakerManager?: LLMCircuitBreakerManager) {
    this.circuitBreakerManager = circuitBreakerManager || new LLMCircuitBreakerManager();
  }

  /**
   * Invoke LLM with circuit breaker protection and fallback
   */
  async invoke(
    messages: BaseMessage[],
    config: LLMConfig,
    options: {
      enableFallback?: boolean;
      retries?: number;
      operationName?: string;
      context?: Record<string, unknown>;
    } = {}
  ): Promise<BaseMessage> {
    const {
      enableFallback = true,
      retries = 3,
      operationName = 'llm-invoke',
      context = {},
    } = options;

    const provider = this.mapProviderType(config.provider);

    logger.info(`Invoking LLM with circuit breaker`, {
      provider,
      model: config.model,
      operationName,
      enableFallback,
    });

    try {
      return await this.circuitBreakerManager.execute(
        provider,
        async (activeProvider) => {
          // Update config with active provider (may be fallback)
          const activeConfig: LLMConfig = {
            ...config,
            provider: activeProvider,
          };

          return await this.invokeWithRetry(
            messages,
            activeConfig,
            retries,
            operationName,
            context
          );
        },
        enableFallback,
        { ...context, operationName }
      );
    } catch (error) {
      logger.error(`LLM invocation failed after all retries and fallbacks`, {
        provider,
        model: config.model,
        operationName,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Invoke with retry logic
   */
  private async invokeWithRetry(
    messages: BaseMessage[],
    config: LLMConfig,
    retries: number,
    operationName: string,
    context: Record<string, unknown>
  ): Promise<BaseMessage> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const llm = getLLM(config);
        const result = await llm.invoke(messages);
        
        logger.info(`LLM invocation succeeded`, {
          provider: config.provider,
          model: config.model,
          attempt: attempt + 1,
          operationName,
        });

        return result;
      } catch (error) {
        lastError = this.categorizeError(error, config);

        const shouldRetry = this.shouldRetry(lastError, attempt, retries);

        logger.warn(`LLM invocation failed`, {
          provider: config.provider,
          model: config.model,
          attempt: attempt + 1,
          totalRetries: retries,
          willRetry: shouldRetry,
          error: lastError.message,
          errorType: lastError.constructor.name,
        });

        if (!shouldRetry) {
          throw lastError;
        }

        // Exponential backoff
        const delay = this.calculateBackoff(attempt);
        await this.sleep(delay);
      }
    }

    throw lastError || new Error('Unknown LLM invocation error');
  }

  /**
   * Categorize raw error into structured error type
   */
  private categorizeError(error: unknown, config: LLMConfig): Error {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = this.getErrorCode(error);

    // Deployment not found (Azure specific)
    if (
      errorCode === 'DeploymentNotFound' ||
      errorCode === 'MODEL_NOT_FOUND' ||
      errorMessage.includes('DeploymentNotFound')
    ) {
      return new LLMDeploymentNotFoundError(
        config.model,
        'Azure OpenAI endpoint',
        { provider: config.provider, model: config.model }
      );
    }

    // Rate limit errors
    if (
      errorCode === 'rate_limit_exceeded' ||
      errorCode === '429' ||
      errorMessage.includes('rate limit')
    ) {
      return new LLMRateLimitError(
        config.provider,
        undefined,
        { provider: config.provider, model: config.model }
      );
    }

    // Timeout errors
    if (
      errorMessage.includes('timeout') ||
      errorMessage.includes('ETIMEDOUT')
    ) {
      return new LLMTimeoutError(
        config.provider,
        60000, // Default timeout
        { provider: config.provider, model: config.model }
      );
    }

    // Generic provider error
    return new LLMProviderError(
      config.provider,
      errorMessage,
      { provider: config.provider, model: config.model },
      error instanceof Error ? error : undefined
    );
  }

  /**
   * Extract error code from various error formats
   */
  private getErrorCode(error: unknown): string | undefined {
    if (typeof error !== 'object' || error === null) return undefined;

    const errorObj = error as any;

    // Check nested error codes
    return (
      errorObj.error?.code ||
      errorObj.code ||
      errorObj.lc_error_code ||
      errorObj.status
    );
  }

  /**
   * Determine if error should be retried
   */
  private shouldRetry(error: Error, attempt: number, maxRetries: number): boolean {
    // Don't retry if max retries reached
    if (attempt >= maxRetries) return false;

    // Check if error is retryable
    if ('isRetryable' in error && typeof error.isRetryable === 'function') {
      return (error as any).isRetryable();
    }

    // Retry deployment not found (may be propagation delay)
    if (error instanceof LLMDeploymentNotFoundError) return true;

    // Retry timeout errors
    if (error instanceof LLMTimeoutError) return true;

    // Retry rate limit errors
    if (error instanceof LLMRateLimitError) return true;

    // Retry generic provider errors
    if (error instanceof LLMProviderError) return true;

    // Don't retry unknown errors
    return false;
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoff(attempt: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 20000; // 20 seconds
    const delay = Math.min(maxDelay, baseDelay * Math.pow(2, attempt));
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 1000;
    return delay + jitter;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Map LLMConfig provider to circuit breaker provider type
   */
  private mapProviderType(provider: string): LLMProvider {
    if (provider === 'azure' || provider === 'openai') return 'azure';
    if (provider === 'gemini') return 'gemini';
    
    // Default to azure
    logger.warn(`Unknown provider '${provider}', defaulting to azure`);
    return 'azure';
  }

  /**
   * Get circuit breaker health status
   */
  getHealthStatus(): Record<string, any> {
    return this.circuitBreakerManager.getHealthStatus();
  }

  /**
   * Reset circuit breakers
   */
  resetCircuitBreakers(): void {
    this.circuitBreakerManager.resetAll();
  }
}

/**
 * Singleton instance for application-wide use
 */
export const resilientLLMInvoker = new ResilientLLMInvoker();
