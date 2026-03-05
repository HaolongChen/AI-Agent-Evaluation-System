/**
 * Mock repository implementations for testing
 */

import { IEvaluationRepository, EvaluationSession } from '../../src/domains/evaluation/repositories/IEvaluationRepository.ts';
import { SessionStatus } from '../../build/generated/prisma/enums.ts';
import { vi } from 'vitest';

/**
 * Mock Evaluation Repository
 */
export class MockEvaluationRepository implements IEvaluationRepository {
  private sessions: Map<number, EvaluationSession> = new Map();
  private nextId = 1;

  // Mock implementations
  findById = vi.fn(async (id: number): Promise<EvaluationSession | null> => {
    return this.sessions.get(id) || null;
  });

  findMany = vi.fn(async (criteria?: Partial<EvaluationSession>): Promise<EvaluationSession[]> => {
    let results = Array.from(this.sessions.values());

    if (criteria) {
      if (criteria.goldenSetId) {
        results = results.filter(s => s.goldenSetId === criteria.goldenSetId);
      }
      if (criteria.modelName) {
        results = results.filter(s => s.modelName === criteria.modelName);
      }
      if (criteria.status) {
        results = results.filter(s => s.status === criteria.status);
      }
    }

    return results;
  });

  create = vi.fn(async (data: Omit<EvaluationSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<EvaluationSession> => {
    const session: EvaluationSession = {
      id: this.nextId++,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.sessions.set(session.id, session);
    return session;
  });

  update = vi.fn(async (id: number, data: Partial<EvaluationSession>): Promise<EvaluationSession> => {
    const existing = this.sessions.get(id);
    if (!existing) {
      throw new Error(`Session ${id} not found`);
    }

    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };

    this.sessions.set(id, updated);
    return updated;
  });

  delete = vi.fn(async (id: number): Promise<void> => {
    this.sessions.delete(id);
  });

  exists = vi.fn(async (id: number): Promise<boolean> => {
    return this.sessions.has(id);
  });

  findByGoldenSetId = vi.fn(async (goldenSetId: number): Promise<EvaluationSession[]> => {
    return this.findMany({ goldenSetId });
  });

  findByModelName = vi.fn(async (modelName: string): Promise<EvaluationSession[]> => {
    return this.findMany({ modelName });
  });

  findByStatus = vi.fn(async (status: SessionStatus): Promise<EvaluationSession[]> => {
    return this.findMany({ status });
  });

  findByIdWithRubrics = vi.fn(async (id: number): Promise<any> => {
    const session = this.sessions.get(id);
    if (!session) return null;

    return {
      ...session,
      rubrics: [], // Mock empty rubrics
    };
  });

  updateStatus = vi.fn(async (id: number, status: SessionStatus, completedAt?: Date): Promise<void> => {
    await this.update(id, { status, completedAt });
  });

  findWithFilters = vi.fn(async (filters: any): Promise<EvaluationSession[]> => {
    return this.findMany(filters);
  });

  // Test helpers
  reset(): void {
    this.sessions.clear();
    this.nextId = 1;
    vi.clearAllMocks();
  }

  seed(sessions: EvaluationSession[]): void {
    sessions.forEach(session => {
      this.sessions.set(session.id, session);
      if (session.id >= this.nextId) {
        this.nextId = session.id + 1;
      }
    });
  }
}
