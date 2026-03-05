/**
 * Unit tests for EvaluationRepository
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockEvaluationRepository } from '../../helpers/mockRepositories.ts';
import { SessionStatus } from '../../../build/generated/prisma/enums.ts';

describe('EvaluationRepository', () => {
  let repository: MockEvaluationRepository;

  beforeEach(() => {
    repository = new MockEvaluationRepository();
  });

  describe('create', () => {
    it('should create a new evaluation session', async () => {
      const session = await repository.create({
        goldenSetId: 1,
        modelName: 'gpt-4',
        sessionIdRef: null,
        startedAt: new Date(),
        completedAt: null,
        status: SessionStatus.running,
        metadata: { test: true },
      });

      expect(session.id).toBeDefined();
      expect(session.goldenSetId).toBe(1);
      expect(session.modelName).toBe('gpt-4');
      expect(session.status).toBe(SessionStatus.running);
    });

    it('should auto-increment IDs', async () => {
      const session1 = await repository.create({
        goldenSetId: 1,
        modelName: 'gpt-4',
        sessionIdRef: null,
        startedAt: new Date(),
        completedAt: null,
        status: SessionStatus.running,
        metadata: null,
      });

      const session2 = await repository.create({
        goldenSetId: 1,
        modelName: 'gpt-4',
        sessionIdRef: null,
        startedAt: new Date(),
        completedAt: null,
        status: SessionStatus.running,
        metadata: null,
      });

      expect(session2.id).toBe(session1.id + 1);
    });
  });

  describe('findById', () => {
    it('should find session by ID', async () => {
      const created = await repository.create({
        goldenSetId: 1,
        modelName: 'gpt-4',
        sessionIdRef: null,
        startedAt: new Date(),
        completedAt: null,
        status: SessionStatus.running,
        metadata: null,
      });

      const found = await repository.findById(created.id);

      expect(found).toEqual(created);
    });

    it('should return null for non-existent ID', async () => {
      const found = await repository.findById(999);
      expect(found).toBeNull();
    });
  });

  describe('findMany', () => {
    beforeEach(async () => {
      await repository.create({
        goldenSetId: 1,
        modelName: 'gpt-4',
        sessionIdRef: null,
        startedAt: new Date(),
        completedAt: null,
        status: SessionStatus.running,
        metadata: null,
      });

      await repository.create({
        goldenSetId: 1,
        modelName: 'gpt-3.5-turbo',
        sessionIdRef: null,
        startedAt: new Date(),
        completedAt: null,
        status: SessionStatus.completed,
        metadata: null,
      });

      await repository.create({
        goldenSetId: 2,
        modelName: 'gpt-4',
        sessionIdRef: null,
        startedAt: new Date(),
        completedAt: null,
        status: SessionStatus.running,
        metadata: null,
      });
    });

    it('should find all sessions', async () => {
      const sessions = await repository.findMany();
      expect(sessions).toHaveLength(3);
    });

    it('should filter by golden set ID', async () => {
      const sessions = await repository.findMany({ goldenSetId: 1 });
      expect(sessions).toHaveLength(2);
      expect(sessions.every(s => s.goldenSetId === 1)).toBe(true);
    });

    it('should filter by model name', async () => {
      const sessions = await repository.findMany({ modelName: 'gpt-4' });
      expect(sessions).toHaveLength(2);
      expect(sessions.every(s => s.modelName === 'gpt-4')).toBe(true);
    });

    it('should filter by status', async () => {
      const sessions = await repository.findMany({ status: SessionStatus.running });
      expect(sessions).toHaveLength(2);
      expect(sessions.every(s => s.status === SessionStatus.running)).toBe(true);
    });
  });

  describe('update', () => {
    it('should update session', async () => {
      const created = await repository.create({
        goldenSetId: 1,
        modelName: 'gpt-4',
        sessionIdRef: null,
        startedAt: new Date(),
        completedAt: null,
        status: SessionStatus.running,
        metadata: null,
      });

      const updated = await repository.update(created.id, {
        status: SessionStatus.completed,
        completedAt: new Date(),
      });

      expect(updated.id).toBe(created.id);
      expect(updated.status).toBe(SessionStatus.completed);
      expect(updated.completedAt).toBeDefined();
    });

    it('should throw error for non-existent session', async () => {
      await expect(repository.update(999, { status: SessionStatus.completed }))
        .rejects.toThrow('Session 999 not found');
    });
  });

  describe('delete', () => {
    it('should delete session', async () => {
      const created = await repository.create({
        goldenSetId: 1,
        modelName: 'gpt-4',
        sessionIdRef: null,
        startedAt: new Date(),
        completedAt: null,
        status: SessionStatus.running,
        metadata: null,
      });

      await repository.delete(created.id);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });
  });

  describe('exists', () => {
    it('should return true for existing session', async () => {
      const created = await repository.create({
        goldenSetId: 1,
        modelName: 'gpt-4',
        sessionIdRef: null,
        startedAt: new Date(),
        completedAt: null,
        status: SessionStatus.running,
        metadata: null,
      });

      const exists = await repository.exists(created.id);
      expect(exists).toBe(true);
    });

    it('should return false for non-existent session', async () => {
      const exists = await repository.exists(999);
      expect(exists).toBe(false);
    });
  });

  describe('updateStatus', () => {
    it('should update session status', async () => {
      const created = await repository.create({
        goldenSetId: 1,
        modelName: 'gpt-4',
        sessionIdRef: null,
        startedAt: new Date(),
        completedAt: null,
        status: SessionStatus.running,
        metadata: null,
      });

      const completedAt = new Date();
      await repository.updateStatus(created.id, SessionStatus.completed, completedAt);

      const updated = await repository.findById(created.id);
      expect(updated?.status).toBe(SessionStatus.completed);
      expect(updated?.completedAt).toEqual(completedAt);
    });
  });
});
