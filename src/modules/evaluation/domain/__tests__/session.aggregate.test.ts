import { describe, it, expect } from "vitest";
import { EvaluationSessionEntity } from "../entity/session.entity.ts";
import { EvaluationRecordEntity } from "../entity/record.entity.ts";
import { EvaluationResultEntity } from "../entity/result.entity.ts";
import { EvaluationSessionAggregate } from "../aggregate/session.aggregate.ts";

const validUuidV4 = "550e8400-e29b-41d4-a716-446655440000";
const validUuidV4b = "660e8400-e29b-41d4-a716-446655440001";
const validUuidV4c = "770e8400-e29b-41d4-a716-446655440002";

/**
 * Helper to make two entities share the same internal _data reference.
 *
 * EvaluationSessionAggregate.validateExternalEntity uses `==` on
 * entity.identifier, which for objects compares reference identity.
 * This helper ensures the target entity's _data is the SAME object
 * as the source's _data so that `==` returns true when identifier
 * values match.
 */
function shareDataReference(
  target:
    | EvaluationRecordEntity
    | EvaluationResultEntity,
  source: EvaluationSessionEntity,
): void {
  // TypeScript 'private' is compile-time-only; runtime access is fine in tests
  const sourceData = (source as unknown as { _data: Record<string, unknown> })._data;
  (target as unknown as { _data: Record<string, unknown> })._data = sourceData;
}

describe("EvaluationSessionAggregate", () => {
  const sessionData = {
    evaluatorType: "human" as const,
    copilotOutputId: validUuidV4,
    rubricId: validUuidV4b,
    evaluatorId: "test-evaluator-1",
    modelName: null,
  };

  const recordData = {
    copilotOutputId: validUuidV4,
    evaluatorType: "human" as const,
    rubricId: validUuidV4b,
    criteriaId: validUuidV4c,
    evaluatorId: "test-evaluator-1",
    evaluation: true,
    feedback: null,
  };

  const resultData = {
    evaluatorId: "test-evaluator-1",
    copilotOutputId: validUuidV4,
    rubricId: validUuidV4b,
    evaluatorType: "human" as const,
    overallScore: 0.92,
    analysis: "Good performance.",
  };

  it("should construct with an EvaluationSessionEntity", () => {
    const sessionEntity = new EvaluationSessionEntity(sessionData);
    const aggregate = new EvaluationSessionAggregate(sessionEntity);
    expect(aggregate).toBeInstanceOf(EvaluationSessionAggregate);
  });

  it("should store the session entity", () => {
    const sessionEntity = new EvaluationSessionEntity(sessionData);
    const aggregate = new EvaluationSessionAggregate(sessionEntity);
    expect(aggregate.entity).toBe(sessionEntity);
    expect(aggregate.entity.data.evaluatorType).toBe("human");
  });

  describe("addRecordEntity", () => {
    it("should add a record with matching session identifier", () => {
      const sessionEntity = new EvaluationSessionEntity(sessionData);
      const aggregate = new EvaluationSessionAggregate(sessionEntity);
      const recordEntity = new EvaluationRecordEntity(recordData);

      // Share data reference so that entity.identifier == recordEntity.identifier
      shareDataReference(recordEntity, sessionEntity);

      aggregate.addRecordEntity(recordEntity);
      expect(aggregate.recordsEntities).toHaveLength(1);
      expect(aggregate.recordsEntities[0]).toBe(recordEntity);
    });

    it("should throw for record with mismatched copilotOutputId", () => {
      const sessionEntity = new EvaluationSessionEntity(sessionData);
      const aggregate = new EvaluationSessionAggregate(sessionEntity);
      const recordEntity = new EvaluationRecordEntity({
        ...recordData,
        copilotOutputId: validUuidV4c,
      });

      expect(() => aggregate.addRecordEntity(recordEntity)).toThrow(
        "The record entity does not belong to this session.",
      );
    });

    it("should throw for record with mismatched rubricId", () => {
      const sessionEntity = new EvaluationSessionEntity(sessionData);
      const aggregate = new EvaluationSessionAggregate(sessionEntity);
      const recordEntity = new EvaluationRecordEntity({
        ...recordData,
        rubricId: validUuidV4c,
      });

      expect(() => aggregate.addRecordEntity(recordEntity)).toThrow(
        "The record entity does not belong to this session.",
      );
    });

    it("should throw for record with mismatched evaluatorId", () => {
      const sessionEntity = new EvaluationSessionEntity(sessionData);
      const aggregate = new EvaluationSessionAggregate(sessionEntity);
      const recordEntity = new EvaluationRecordEntity({
        ...recordData,
        evaluatorId: "different-evaluator",
      });

      expect(() => aggregate.addRecordEntity(recordEntity)).toThrow(
        "The record entity does not belong to this session.",
      );
    });

    it("should throw for record with mismatched evaluatorType", () => {
      const sessionEntity = new EvaluationSessionEntity(sessionData);
      const aggregate = new EvaluationSessionAggregate(sessionEntity);
      const recordEntity = new EvaluationRecordEntity({
        ...recordData,
        evaluatorType: "agent",
      });

      expect(() => aggregate.addRecordEntity(recordEntity)).toThrow(
        "The record entity does not belong to this session.",
      );
    });

    it("should support adding multiple records", () => {
      const sessionEntity = new EvaluationSessionEntity(sessionData);
      const aggregate = new EvaluationSessionAggregate(sessionEntity);

      const record1 = new EvaluationRecordEntity(recordData);
      shareDataReference(record1, sessionEntity);

      const record2 = new EvaluationRecordEntity({
        ...recordData,
        criteriaId: validUuidV4,
        evaluation: false,
        feedback: "Needs improvement",
      });
      shareDataReference(record2, sessionEntity);

      aggregate.addRecordEntity(record1);
      aggregate.addRecordEntity(record2);

      expect(aggregate.recordsEntities).toHaveLength(2);
      expect(aggregate.recordsEntities[0]).toBe(record1);
      expect(aggregate.recordsEntities[1]).toBe(record2);
    });
  });

  describe("recordsEntities getter", () => {
    it("should return an empty array initially", () => {
      const sessionEntity = new EvaluationSessionEntity(sessionData);
      const aggregate = new EvaluationSessionAggregate(sessionEntity);
      expect(aggregate.recordsEntities).toEqual([]);
    });

    it("should return all added records", () => {
      const sessionEntity = new EvaluationSessionEntity(sessionData);
      const aggregate = new EvaluationSessionAggregate(sessionEntity);

      const record = new EvaluationRecordEntity(recordData);
      shareDataReference(record, sessionEntity);
      aggregate.addRecordEntity(record);

      const entities = aggregate.recordsEntities;
      expect(entities).toHaveLength(1);
      expect(entities[0]).toBe(record);
    });
  });

  describe("resultEntity setter", () => {
    it("should set result with matching session identifier", () => {
      const sessionEntity = new EvaluationSessionEntity(sessionData);
      const aggregate = new EvaluationSessionAggregate(sessionEntity);
      const resultEntity = new EvaluationResultEntity(resultData);

      shareDataReference(resultEntity, sessionEntity);

      aggregate.resultEntity = resultEntity;
      expect(aggregate.resultEntity).toBe(resultEntity);
    });

    it("should throw for result with mismatched copilotOutputId", () => {
      const sessionEntity = new EvaluationSessionEntity(sessionData);
      const aggregate = new EvaluationSessionAggregate(sessionEntity);
      const resultEntity = new EvaluationResultEntity({
        ...resultData,
        copilotOutputId: validUuidV4c,
      });

      expect(() => {
        aggregate.resultEntity = resultEntity;
      }).toThrow("The result entity does not belong to this session.");
    });

    it("should throw for result with mismatched rubricId", () => {
      const sessionEntity = new EvaluationSessionEntity(sessionData);
      const aggregate = new EvaluationSessionAggregate(sessionEntity);
      const resultEntity = new EvaluationResultEntity({
        ...resultData,
        rubricId: validUuidV4c,
      });

      expect(() => {
        aggregate.resultEntity = resultEntity;
      }).toThrow("The result entity does not belong to this session.");
    });

    it("should throw for result with mismatched evaluatorType", () => {
      const sessionEntity = new EvaluationSessionEntity(sessionData);
      const aggregate = new EvaluationSessionAggregate(sessionEntity);
      const resultEntity = new EvaluationResultEntity({
        ...resultData,
        evaluatorType: "agent",
      });

      expect(() => {
        aggregate.resultEntity = resultEntity;
      }).toThrow("The result entity does not belong to this session.");
    });

    it("should throw for result with mismatched evaluatorId", () => {
      const sessionEntity = new EvaluationSessionEntity(sessionData);
      const aggregate = new EvaluationSessionAggregate(sessionEntity);
      const resultEntity = new EvaluationResultEntity({
        ...resultData,
        evaluatorId: "different-evaluator",
      });

      expect(() => {
        aggregate.resultEntity = resultEntity;
      }).toThrow("The result entity does not belong to this session.");
    });
  });

  describe("resultEntity getter", () => {
    it("should return undefined when no result is set", () => {
      const sessionEntity = new EvaluationSessionEntity(sessionData);
      const aggregate = new EvaluationSessionAggregate(sessionEntity);
      expect(aggregate.resultEntity).toBeUndefined();
    });

    it("should return the stored result entity", () => {
      const sessionEntity = new EvaluationSessionEntity(sessionData);
      const aggregate = new EvaluationSessionAggregate(sessionEntity);
      const resultEntity = new EvaluationResultEntity(resultData);

      shareDataReference(resultEntity, sessionEntity);
      aggregate.resultEntity = resultEntity;

      const stored = aggregate.resultEntity;
      expect(stored).toBe(resultEntity);
    });
  });
});
