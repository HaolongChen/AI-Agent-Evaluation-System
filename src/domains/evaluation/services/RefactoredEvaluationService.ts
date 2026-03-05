/**
 * Example: Refactored Evaluation Service
 * 
 * This is an example showing how to structure services using the new architecture:
 * - Dependency injection
 * - Repository pattern
 * - Structured error handling
 * - Unit of Work for transactions
 */

import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../shared/container/Container.ts';
import { IEvaluationRepository } from '../repositories/IEvaluationRepository.ts';
import { IUnitOfWork } from '../../../shared/interfaces/IUnitOfWork.ts';
import { 
  NotFoundError, 
  ValidationError,
  DatabaseError,
  InvalidStateError 
} from '../../../shared/errors/index.ts';
import { SessionStatus } from '../../../../build/generated/prisma/enums.ts';
import { logger } from '../../../utils/logger.ts';

/**
 * Refactored Evaluation Service
 * 
 * Demonstrates best practices:
 * - Injectable with dependencies
 * - Uses repository interfaces
 * - Structured error handling
 * - Proper logging
 * - Transaction management
 */
@injectable()
export class RefactoredEvaluationService {
  constructor(
    @inject(TOKENS.EvaluationRepository)
    private readonly evaluationRepo: IEvaluationRepository,
    
    @inject(TOKENS.UnitOfWork)
    private readonly unitOfWork: IUnitOfWork,
    
    @inject(TOKENS.Logger)
    private readonly logger: typeof logger
  ) {}

  /**
   * Get evaluation session by ID
   * 
   * @throws NotFoundError if session doesn't exist
   * @throws DatabaseError on database failure
   */
  async getSession(sessionId: number): Promise<any> {
    try {
      this.logger.info('Fetching evaluation session', { sessionId });

      const session = await this.evaluationRepo.findById(sessionId);

      if (!session) {
        throw new NotFoundError('EvaluationSession', sessionId, {
          operationName: 'getSession',
        });
      }

      this.logger.info('Evaluation session retrieved successfully', {
        sessionId,
        status: session.status,
      });

      return session;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      this.logger.error('Failed to get evaluation session', {
        sessionId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new DatabaseError(
        `Failed to retrieve session ${sessionId}`,
        { sessionId, operationName: 'getSession' },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Create new evaluation session
   * 
   * @throws ValidationError if input is invalid
   * @throws DatabaseError on database failure
   */
  async createSession(data: {
    goldenSetId: number;
    modelName: string;
    metadata?: Record<string, unknown>;
  }): Promise<any> {
    try {
      // Validate input
      if (!data.goldenSetId || data.goldenSetId <= 0) {
        throw new ValidationError('Invalid goldenSetId', {
          goldenSetId: data.goldenSetId,
        });
      }

      if (!data.modelName || data.modelName.trim() === '') {
        throw new ValidationError('Model name is required', {
          modelName: data.modelName,
        });
      }

      this.logger.info('Creating evaluation session', {
        goldenSetId: data.goldenSetId,
        modelName: data.modelName,
      });

      const session = await this.evaluationRepo.create({
        goldenSetId: data.goldenSetId,
        modelName: data.modelName,
        sessionIdRef: null,
        startedAt: new Date(),
        completedAt: null,
        status: SessionStatus.running,
        metadata: data.metadata || null,
      });

      this.logger.info('Evaluation session created successfully', {
        sessionId: session.id,
        goldenSetId: data.goldenSetId,
      });

      return session;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }

      this.logger.error('Failed to create evaluation session', {
        data,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new DatabaseError(
        'Failed to create evaluation session',
        { goldenSetId: data.goldenSetId, operationName: 'createSession' },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Update session status with validation
   * 
   * @throws NotFoundError if session doesn't exist
   * @throws InvalidStateError if transition is invalid
   * @throws DatabaseError on database failure
   */
  async updateSessionStatus(
    sessionId: number,
    newStatus: SessionStatus
  ): Promise<void> {
    try {
      this.logger.info('Updating session status', {
        sessionId,
        newStatus,
      });

      // Get current session
      const session = await this.evaluationRepo.findById(sessionId);

      if (!session) {
        throw new NotFoundError('EvaluationSession', sessionId, {
          operationName: 'updateSessionStatus',
        });
      }

      // Validate state transition
      this.validateStatusTransition(session.status, newStatus);

      // Update status
      const completedAt = newStatus === SessionStatus.completed 
        ? new Date() 
        : undefined;

      await this.evaluationRepo.updateStatus(sessionId, newStatus, completedAt);

      this.logger.info('Session status updated successfully', {
        sessionId,
        oldStatus: session.status,
        newStatus,
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof InvalidStateError) {
        throw error;
      }

      this.logger.error('Failed to update session status', {
        sessionId,
        newStatus,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new DatabaseError(
        `Failed to update status for session ${sessionId}`,
        { sessionId, newStatus, operationName: 'updateSessionStatus' },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Delete session with cascading delete in transaction
   * 
   * @throws NotFoundError if session doesn't exist
   * @throws DatabaseError on database failure
   */
  async deleteSession(sessionId: number): Promise<void> {
    try {
      this.logger.info('Deleting evaluation session', { sessionId });

      // Use Unit of Work for transaction
      await this.unitOfWork.transaction(async () => {
        // Verify session exists
        const exists = await this.evaluationRepo.exists(sessionId);
        if (!exists) {
          throw new NotFoundError('EvaluationSession', sessionId, {
            operationName: 'deleteSession',
          });
        }

        // Delete session (cascading delete will handle related records)
        await this.evaluationRepo.delete(sessionId);

        this.logger.info('Evaluation session deleted successfully', {
          sessionId,
        });
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      this.logger.error('Failed to delete evaluation session', {
        sessionId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new DatabaseError(
        `Failed to delete session ${sessionId}`,
        { sessionId, operationName: 'deleteSession' },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Validate status transition rules
   * 
   * @throws InvalidStateError if transition is not allowed
   */
  private validateStatusTransition(
    currentStatus: SessionStatus,
    newStatus: SessionStatus
  ): void {
    // Define valid transitions
    const validTransitions: Record<SessionStatus, SessionStatus[]> = {
      [SessionStatus.pending]: [SessionStatus.running, SessionStatus.failed],
      [SessionStatus.running]: [SessionStatus.completed, SessionStatus.failed],
      [SessionStatus.completed]: [], // Terminal state
      [SessionStatus.failed]: [SessionStatus.pending], // Can retry
    };

    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new InvalidStateError(
        currentStatus,
        `transition to ${newStatus}`,
        {
          currentStatus,
          attemptedStatus: newStatus,
          allowedTransitions,
        }
      );
    }
  }

  /**
   * Get sessions by model with pagination
   */
  async getSessionsByModel(
    modelName: string,
    options?: { limit?: number; offset?: number }
  ): Promise<any[]> {
    try {
      this.logger.info('Fetching sessions by model', {
        modelName,
        limit: options?.limit,
        offset: options?.offset,
      });

      const sessions = await this.evaluationRepo.findByModelName(modelName);

      // Apply pagination if specified
      const { limit = 10, offset = 0 } = options || {};
      const paginated = sessions.slice(offset, offset + limit);

      this.logger.info('Sessions retrieved', {
        modelName,
        total: sessions.length,
        returned: paginated.length,
      });

      return paginated;
    } catch (error) {
      this.logger.error('Failed to get sessions by model', {
        modelName,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new DatabaseError(
        `Failed to retrieve sessions for model ${modelName}`,
        { modelName, operationName: 'getSessionsByModel' },
        error instanceof Error ? error : undefined
      );
    }
  }
}
