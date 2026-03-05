import { injectable, inject } from 'tsyringe';
import { PrismaClient } from '../../../../build/generated/prisma/client.ts';
import { CopilotType, SessionStatus } from '../../../../build/generated/prisma/enums.ts';
import { IEvaluationRepository, EvaluationSession } from './IEvaluationRepository.ts';
import { TOKENS } from '../../../shared/container/Container.ts';
import { DatabaseError, NotFoundError } from '../../../shared/errors/index.ts';
import { logger } from '../../../utils/logger.ts';

/**
 * Prisma implementation of Evaluation Repository
 */
@injectable()
export class EvaluationRepository implements IEvaluationRepository {
  constructor(
    @inject(TOKENS.PrismaClient) private readonly prisma: PrismaClient
  ) {}

  async findById(id: number): Promise<EvaluationSession | null> {
    try {
      const session = await this.prisma.evaluationSession.findUnique({
        where: { id },
      });

      if (!session) return null;

      return this.mapToModel(session);
    } catch (error) {
      logger.error('Error finding evaluation session by ID:', error);
      throw new DatabaseError(
        `Failed to find evaluation session ${id}`,
        { sessionId: id },
        error instanceof Error ? error : undefined
      );
    }
  }

  async findMany(criteria?: Partial<EvaluationSession>): Promise<EvaluationSession[]> {
    try {
      const sessions = await this.prisma.evaluationSession.findMany({
        where: criteria ? {
          ...(criteria.goldenSetId && { goldenSetId: criteria.goldenSetId }),
          ...(criteria.modelName && { modelName: criteria.modelName }),
          ...(criteria.status && { status: criteria.status }),
        } : undefined,
        orderBy: { startedAt: 'desc' },
      });

      return sessions.map(this.mapToModel);
    } catch (error) {
      logger.error('Error finding evaluation sessions:', error);
      throw new DatabaseError(
        'Failed to find evaluation sessions',
        { criteria },
        error instanceof Error ? error : undefined
      );
    }
  }

  async create(data: Omit<EvaluationSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<EvaluationSession> {
    try {
      const session = await this.prisma.evaluationSession.create({
        data: {
          goldenSetId: data.goldenSetId,
          modelName: data.modelName,
          sessionIdRef: data.sessionIdRef,
          startedAt: data.startedAt,
          completedAt: data.completedAt,
          status: data.status,
          metadata: data.metadata as any,
        },
      });

      logger.info('Evaluation session created', { sessionId: session.id });
      return this.mapToModel(session);
    } catch (error) {
      logger.error('Error creating evaluation session:', error);
      throw new DatabaseError(
        'Failed to create evaluation session',
        { data },
        error instanceof Error ? error : undefined
      );
    }
  }

  async update(id: number, data: Partial<EvaluationSession>): Promise<EvaluationSession> {
    try {
      const session = await this.prisma.evaluationSession.update({
        where: { id },
        data: {
          ...(data.status && { status: data.status }),
          ...(data.completedAt !== undefined && { completedAt: data.completedAt }),
          ...(data.metadata !== undefined && { metadata: data.metadata as any }),
        },
      });

      logger.info('Evaluation session updated', { sessionId: id });
      return this.mapToModel(session);
    } catch (error) {
      logger.error('Error updating evaluation session:', error);
      throw new DatabaseError(
        `Failed to update evaluation session ${id}`,
        { sessionId: id, data },
        error instanceof Error ? error : undefined
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.evaluationSession.delete({
        where: { id },
      });

      logger.info('Evaluation session deleted', { sessionId: id });
    } catch (error) {
      logger.error('Error deleting evaluation session:', error);
      throw new DatabaseError(
        `Failed to delete evaluation session ${id}`,
        { sessionId: id },
        error instanceof Error ? error : undefined
      );
    }
  }

  async exists(id: number): Promise<boolean> {
    try {
      const count = await this.prisma.evaluationSession.count({
        where: { id },
      });
      return count > 0;
    } catch (error) {
      logger.error('Error checking evaluation session existence:', error);
      throw new DatabaseError(
        `Failed to check if evaluation session ${id} exists`,
        { sessionId: id },
        error instanceof Error ? error : undefined
      );
    }
  }

  async findByGoldenSetId(goldenSetId: number): Promise<EvaluationSession[]> {
    return this.findMany({ goldenSetId });
  }

  async findByModelName(modelName: string): Promise<EvaluationSession[]> {
    return this.findMany({ modelName });
  }

  async findByStatus(status: SessionStatus): Promise<EvaluationSession[]> {
    return this.findMany({ status });
  }

  async findByIdWithRubrics(id: number): Promise<any> {
    try {
      const session = await this.prisma.evaluationSession.findUnique({
        where: { id },
        include: {
          rubrics: {
            where: { isActive: true },
            orderBy: { id: 'asc' },
            select: {
              id: true,
              title: true,
              content: true,
              expectedAnswer: true,
              weight: true,
            },
          },
        },
      });

      if (!session) return null;

      return {
        ...this.mapToModel(session),
        rubrics: session.rubrics.map(r => ({
          ...r,
          weight: Number(r.weight),
        })),
      };
    } catch (error) {
      logger.error('Error finding evaluation session with rubrics:', error);
      throw new DatabaseError(
        `Failed to find evaluation session ${id} with rubrics`,
        { sessionId: id },
        error instanceof Error ? error : undefined
      );
    }
  }

  async updateStatus(id: number, status: SessionStatus, completedAt?: Date): Promise<void> {
    try {
      await this.prisma.evaluationSession.update({
        where: { id },
        data: {
          status,
          ...(completedAt && { completedAt }),
        },
      });

      logger.info('Evaluation session status updated', { sessionId: id, status });
    } catch (error) {
      logger.error('Error updating evaluation session status:', error);
      throw new DatabaseError(
        `Failed to update status for evaluation session ${id}`,
        { sessionId: id, status },
        error instanceof Error ? error : undefined
      );
    }
  }

  async findWithFilters(filters: {
    copilotType?: CopilotType;
    modelName?: string;
    status?: SessionStatus;
  }): Promise<EvaluationSession[]> {
    try {
      const sessions = await this.prisma.evaluationSession.findMany({
        where: {
          ...(filters.modelName && { modelName: filters.modelName }),
          ...(filters.status && { status: filters.status }),
        },
        orderBy: { startedAt: 'desc' },
      });

      return sessions.map(this.mapToModel);
    } catch (error) {
      logger.error('Error finding evaluation sessions with filters:', error);
      throw new DatabaseError(
        'Failed to find evaluation sessions with filters',
        { filters },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Map Prisma model to domain model
   */
  private mapToModel(session: any): EvaluationSession {
    return {
      id: session.id,
      goldenSetId: session.goldenSetId,
      modelName: session.modelName,
      sessionIdRef: session.sessionIdRef,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      status: session.status,
      metadata: session.metadata,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }
}
