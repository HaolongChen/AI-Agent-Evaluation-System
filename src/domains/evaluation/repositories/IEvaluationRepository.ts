import { IRepository } from '../../../shared/interfaces/IRepository.ts';
import { CopilotType, SessionStatus } from '../../../../build/generated/prisma/enums.ts';

/**
 * Evaluation Session domain model
 */
export interface EvaluationSession {
  id: number;
  goldenSetId: number;
  modelName: string;
  sessionIdRef: number | null;
  startedAt: Date;
  completedAt: Date | null;
  status: SessionStatus;
  metadata: Record<string, unknown> | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Evaluation repository interface
 * 
 * Domain-specific operations for evaluation sessions
 */
export interface IEvaluationRepository extends IRepository<EvaluationSession> {
  /**
   * Find sessions by golden set ID
   */
  findByGoldenSetId(goldenSetId: number): Promise<EvaluationSession[]>;

  /**
   * Find sessions by model name
   */
  findByModelName(modelName: string): Promise<EvaluationSession[]>;

  /**
   * Find sessions by status
   */
  findByStatus(status: SessionStatus): Promise<EvaluationSession[]>;

  /**
   * Find sessions with rubrics included
   */
  findByIdWithRubrics(id: number): Promise<EvaluationSession & {
    rubrics: Array<{
      id: number;
      title: string;
      content: string;
      expectedAnswer: boolean;
      weight: number;
    }>;
  } | null>;

  /**
   * Update session status
   */
  updateStatus(id: number, status: SessionStatus, completedAt?: Date): Promise<void>;

  /**
   * Get sessions with filters
   */
  findWithFilters(filters: {
    copilotType?: CopilotType;
    modelName?: string;
    status?: SessionStatus;
  }): Promise<EvaluationSession[]>;
}
