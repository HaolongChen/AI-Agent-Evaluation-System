import { singleton } from 'tsyringe';
import { CircuitBreaker, CircuitBreakerConfig, CircuitState } from './CircuitBreaker.ts';
import { logger } from '../../utils/logger.ts';

/**
 * LLM Provider types
 */
export type LLMProvider = 'azure' | 'gemini';

/**
 * Default circuit breaker configurations for LLM providers
 */
const DEFAULT_LLM_CIRCUIT_CONFIG: Record<LLMProvider, CircuitBreakerConfig> = {
  azure: {
    name: 'azure-openai',
    failureThreshold: 5,           // Open after 5 consecutive failures
    failureTimeWindow: 60000,      // 60 second window
    resetTimeout: 30000,           // Wait 30 seconds before trying again
    successThreshold: 3,           // Need 3 successes to close from half-open
    timeout: 60000,                // 60 second timeout for individual calls
    rejectionPercentage: 100,      // Reject 100% of calls when open
  },
  gemini: {
    name: 'gemini',
    failureThreshold: 5,
    failureTimeWindow: 60000,
    resetTimeout: 30000,
    successThreshold: 3,
    timeout: 60000,
    rejectionPercentage: 100,
  },
};

/**
 * LLM Circuit Breaker Manager
 * 
 * Manages circuit breakers for different LLM providers
 * Provides graceful degradation and fallback strategies
 */
@singleton()
export class LLMCircuitBreakerManager {
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private fallbackChain: LLMProvider[] = ['azure', 'gemini'];

  constructor() {
    this.initializeCircuitBreakers();
  }

  /**
   * Initialize circuit breakers for all LLM providers
   */
  private initializeCircuitBreakers(): void {
    for (const [provider, config] of Object.entries(DEFAULT_LLM_CIRCUIT_CONFIG)) {
      const circuitBreaker = new CircuitBreaker(config);
      this.circuitBreakers.set(provider, circuitBreaker);
      logger.info(`Circuit breaker initialized for ${provider}`);
    }
  }

  /**
   * Get circuit breaker for a specific provider
   */
  getCircuitBreaker(provider: LLMProvider): CircuitBreaker {
    const circuitBreaker = this.circuitBreakers.get(provider);
    if (!circuitBreaker) {
      throw new Error(`No circuit breaker found for provider: ${provider}`);
    }
    return circuitBreaker;
  }

  /**
   * Execute LLM call with circuit breaker protection
   * 
   * @param provider - Primary LLM provider to use
   * @param fn - Function to execute (LLM call)
   * @param enableFallback - Whether to try fallback providers on failure
   * @returns Result from LLM call
   */
  async execute<T>(
    provider: LLMProvider,
    fn: (provider: LLMProvider) => Promise<T>,
    enableFallback = true,
    context?: Record<string, unknown>
  ): Promise<T> {
    const circuitBreaker = this.getCircuitBreaker(provider);

    try {
      return await circuitBreaker.execute(
        () => fn(provider),
        { ...context, provider }
      );
    } catch (error) {
      logger.warn(`LLM call failed for ${provider}`, {
        error: error instanceof Error ? error.message : String(error),
        enableFallback,
      });

      // Try fallback if enabled and available
      if (enableFallback) {
        return await this.tryFallback(provider, fn, context);
      }

      throw error;
    }
  }

  /**
   * Try fallback providers when primary fails
   */
  private async tryFallback<T>(
    failedProvider: LLMProvider,
    fn: (provider: LLMProvider) => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    const fallbackProviders = this.fallbackChain.filter(p => p !== failedProvider);

    logger.info(`Attempting fallback providers after ${failedProvider} failed`, {
      fallbackProviders,
    });

    for (const fallbackProvider of fallbackProviders) {
      const fallbackCircuit = this.getCircuitBreaker(fallbackProvider);

      // Skip if circuit is open
      if (fallbackCircuit.getState() === CircuitState.OPEN) {
        logger.warn(`Skipping fallback provider ${fallbackProvider} (circuit open)`);
        continue;
      }

      try {
        logger.info(`Trying fallback provider: ${fallbackProvider}`);
        
        const result = await fallbackCircuit.execute(
          () => fn(fallbackProvider),
          { ...context, provider: fallbackProvider, isFallback: true }
        );

        logger.info(`Fallback to ${fallbackProvider} succeeded`);
        return result;
      } catch (fallbackError) {
        logger.warn(`Fallback provider ${fallbackProvider} also failed`, {
          error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
        });
        // Continue to next fallback
      }
    }

    // All fallbacks exhausted
    throw new Error(
      `All LLM providers failed. Primary: ${failedProvider}, Fallbacks: ${fallbackProviders.join(', ')}`
    );
  }

  /**
   * Get health status of all circuit breakers
   */
  getHealthStatus(): Record<string, {
    state: CircuitState;
    metrics: any;
  }> {
    const status: Record<string, any> = {};

    for (const [provider, circuitBreaker] of this.circuitBreakers.entries()) {
      status[provider] = {
        state: circuitBreaker.getState(),
        metrics: circuitBreaker.getMetrics(),
      };
    }

    return status;
  }

  /**
   * Check if any provider is available (circuit not open)
   */
  isAnyProviderAvailable(): boolean {
    for (const circuitBreaker of this.circuitBreakers.values()) {
      if (circuitBreaker.getState() !== CircuitState.OPEN) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get available providers (circuits not open)
   */
  getAvailableProviders(): LLMProvider[] {
    const available: LLMProvider[] = [];

    for (const provider of this.fallbackChain) {
      const circuitBreaker = this.circuitBreakers.get(provider);
      if (circuitBreaker && circuitBreaker.getState() !== CircuitState.OPEN) {
        available.push(provider);
      }
    }

    return available;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    logger.info('Resetting all LLM circuit breakers');
    for (const circuitBreaker of this.circuitBreakers.values()) {
      circuitBreaker.reset();
    }
  }

  /**
   * Reset specific circuit breaker
   */
  reset(provider: LLMProvider): void {
    const circuitBreaker = this.getCircuitBreaker(provider);
    circuitBreaker.reset();
  }

  /**
   * Configure custom circuit breaker settings
   */
  configure(provider: LLMProvider, config: Partial<CircuitBreakerConfig>): void {
    const existingCircuit = this.circuitBreakers.get(provider);
    
    if (existingCircuit) {
      logger.warn(`Replacing existing circuit breaker for ${provider} with new configuration`);
    }

    const fullConfig: CircuitBreakerConfig = {
      ...DEFAULT_LLM_CIRCUIT_CONFIG[provider],
      ...config,
      name: config.name || `${provider}-custom`,
    };

    const newCircuit = new CircuitBreaker(fullConfig);
    this.circuitBreakers.set(provider, newCircuit);
    
    logger.info(`Circuit breaker reconfigured for ${provider}`, { config: fullConfig });
  }

  /**
   * Set custom fallback chain
   */
  setFallbackChain(chain: LLMProvider[]): void {
    logger.info('Setting custom fallback chain', { chain });
    this.fallbackChain = chain;
  }
}
