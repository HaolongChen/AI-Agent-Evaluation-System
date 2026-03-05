import { IRepository } from '../../../shared/interfaces/IRepository.ts';
import { RubricReviewStatus } from '../../../../build/generated/prisma/enums.ts';

/**
 * Adaptive Rubric domain model
 */
export interface AdaptiveRubric {
  id: number;
  sessionId: number;
  version: string;
  title: string;
  content: string;
  expectedAnswer: boolean;
  weight: number;
  reviewStatus: RubricReviewStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
}

/**
 * Rubric question (lightweight model)
 */
export interface RubricQuestion {
  id: number;
  title: string;
  content: string;
  expectedAnswer: boolean;
  weight: number;
}

/**
 * Rubric repository interface
 * 
 * Domain-specific operations for adaptive rubrics
 */
export interface IRubricRepository extends IRepository<AdaptiveRubric, [number, number]> {
  /**
   * Find rubrics by session ID
   */
  findBySessionId(sessionId: number): Promise<AdaptiveRubric[]>;

  /**
   * Find active rubrics for a session
   */
  findActiveBySessionId(sessionId: number): Promise<AdaptiveRubric[]>;

  /**
   * Batch create rubrics for a session
   */
  createMany(sessionId: number, rubrics: Omit<AdaptiveRubric, 'id' | 'sessionId' | 'createdAt' | 'updatedAt'>[]): Promise<AdaptiveRubric[]>;

  /**
   * Update rubric question
   */
  updateQuestion(
    id: number,
    sessionId: number,
    updates: Partial<RubricQuestion>
  ): Promise<void>;

  /**
   * Approve rubrics for a session
   */
  approveAll(sessionId: number, reviewedBy: string): Promise<void>;

  /**
   * Delete all rubrics for a session
   */
  deleteBySessionId(sessionId: number): Promise<void>;

  /**
   * Get rubric with judge record
   */
  findByIdWithJudgeRecord(id: number, sessionId: number): Promise<AdaptiveRubric & {
    judgeRecord: {
      answer: boolean;
      comment: string | null;
      timestamp: Date;
    } | null;
  } | null>;
}
