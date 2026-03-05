import { WorkflowNodeError } from '../../shared/errors/index.ts';
import { logger } from '../../utils/logger.ts';

/**
 * Node execution context
 */
export interface NodeContext {
  sessionId?: number;
  threadId?: string;
  provider?: string;
  model?: string;
  skipHumanReview?: boolean;
  skipHumanEvaluation?: boolean;
  [key: string]: unknown;
}

/**
 * Node execution metadata
 */
export interface NodeMetadata {
  nodeName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  retries?: number;
}

/**
 * Base class for all LangGraph nodes
 * 
 * Provides structured error handling, logging, and metrics
 */
export abstract class BaseNode<TState, TConfig = any> {
  protected readonly nodeName: string;

  constructor(nodeName: string) {
    this.nodeName = nodeName;
  }

  /**
   * Execute the node with error handling and metrics
   */
  async execute(
    state: TState,
    config?: { configurable?: TConfig }
  ): Promise<Partial<TState>> {
    const metadata: NodeMetadata = {
      nodeName: this.nodeName,
      startTime: new Date(),
      retries: 0,
    };

    const context = this.extractContext(config);

    logger.info(`Node '${this.nodeName}' execution started`, {
      sessionId: context.sessionId,
      threadId: context.threadId,
    });

    try {
      // Execute the actual node logic
      const result = await this.executeInternal(state, config, context);

      metadata.endTime = new Date();
      metadata.duration = metadata.endTime.getTime() - metadata.startTime.getTime();

      logger.info(`Node '${this.nodeName}' execution completed`, {
        ...context,
        duration: metadata.duration,
      });

      return result;
    } catch (error) {
      metadata.endTime = new Date();
      metadata.duration = metadata.endTime.getTime() - metadata.startTime.getTime();

      this.handleError(error, state, context, metadata);

      // Re-throw as WorkflowNodeError
      throw new WorkflowNodeError(
        this.nodeName,
        error instanceof Error ? error.message : String(error),
        {
          ...context,
          duration: metadata.duration,
        },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Abstract method to be implemented by concrete nodes
   */
  protected abstract executeInternal(
    state: TState,
    config: { configurable?: TConfig } | undefined,
    context: NodeContext
  ): Promise<Partial<TState>>;

  /**
   * Extract context from config
   */
  protected extractContext(config: { configurable?: TConfig } | undefined): NodeContext {
    const configurable = config?.configurable as any;
    
    return {
      sessionId: configurable?.sessionId,
      threadId: configurable?.thread_id || configurable?.threadId,
      provider: configurable?.provider,
      model: configurable?.model,
      skipHumanReview: configurable?.skipHumanReview,
      skipHumanEvaluation: configurable?.skipHumanEvaluation,
    };
  }

  /**
   * Handle errors with proper logging
   */
  protected handleError(
    error: unknown,
    state: TState,
    context: NodeContext,
    metadata: NodeMetadata
  ): void {
    logger.error(`Node '${this.nodeName}' execution failed`, {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : String(error),
      context,
      metadata,
      state: this.sanitizeState(state),
    });
  }

  /**
   * Sanitize state for logging (remove sensitive data)
   */
  protected sanitizeState(state: TState): Partial<TState> {
    // Override in subclasses if needed
    // Default: return shallow copy
    return { ...state };
  }

  /**
   * Validate required state properties
   */
  protected validateState(
    state: TState,
    requiredProps: (keyof TState)[]
  ): void {
    const missing = requiredProps.filter(prop => {
      const value = state[prop];
      return value === undefined || value === null;
    });

    if (missing.length > 0) {
      throw new Error(
        `Missing required state properties in node '${this.nodeName}': ${missing.join(', ')}`
      );
    }
  }

  /**
   * Log node-specific information
   */
  protected log(level: 'info' | 'warn' | 'debug', message: string, data?: Record<string, unknown>): void {
    const logData = {
      node: this.nodeName,
      ...data,
    };

    switch (level) {
      case 'info':
        logger.info(message, logData);
        break;
      case 'warn':
        logger.warn(message, logData);
        break;
      case 'debug':
        logger.debug(message, logData);
        break;
    }
  }
}
