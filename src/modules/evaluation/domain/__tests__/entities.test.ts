import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import { EvaluationSessionEntity } from "../entity/session.entity.ts";
import { EvaluationRecordEntity } from "../entity/record.entity.ts";
import { EvaluationResultEntity } from "../entity/result.entity.ts";

const validUuidV4 = "550e8400-e29b-41d4-a716-446655440000";
const validUuidV4b = "660e8400-e29b-41d4-a716-446655440001";

describe("EvaluationSessionEntity", () => {
  const validSessionData = {
    evaluatorType: "human" as const,
    copilotOutputId: validUuidV4,
    rubricId: validUuidV4b,
    evaluatorId: "test-evaluator-1",
    modelName: null,
  };

  it("should create with valid data", () => {
    const entity = new EvaluationSessionEntity(validSessionData);
    expect(entity).toBeInstanceOf(EvaluationSessionEntity);
    expect(entity.data.evaluatorType).toBe("human");
    expect(entity.data.copilotOutputId).toBe(validUuidV4);
    expect(entity.data.rubricId).toBe(validUuidV4b);
    expect(entity.data.evaluatorId).toBe("test-evaluator-1");
    expect(entity.data.modelName).toBeNull();
    expect(entity.id).toBeDefined();
    expect(typeof entity.id).toBe("string");
  });

  it("should create with agent evaluator type", () => {
    const entity = new EvaluationSessionEntity({
      ...validSessionData,
      evaluatorType: "agent",
    });
    expect(entity.data.evaluatorType).toBe("agent");
  });

  it("should accept optional modelName", () => {
    const entity = new EvaluationSessionEntity({
      ...validSessionData,
      modelName: "gpt-4",
    });
    expect(entity.data.modelName).toBe("gpt-4");
  });

  it("should accept undefined modelName", () => {
    const entity = new EvaluationSessionEntity({
      ...validSessionData,
      modelName: undefined,
    });
    expect(entity.data.modelName).toBeUndefined();
  });

  it("should accept optional id parameter", () => {
    const entity = new EvaluationSessionEntity(validSessionData, validUuidV4b);
    expect(entity.id).toBe(validUuidV4b);
  });

  it("should generate id if not provided", () => {
    const entity = new EvaluationSessionEntity(validSessionData);
    expect(entity.id).toBeDefined();
    expect(entity.id).not.toBe(validUuidV4b);
  });

  it("should throw for invalid copilotOutputId", () => {
    expect(
      () =>
        new EvaluationSessionEntity({
          ...validSessionData,
          copilotOutputId: "not-a-uuid",
        }),
    ).toThrow(ZodError);
  });

  it("should throw for invalid rubricId", () => {
    expect(
      () =>
        new EvaluationSessionEntity({
          ...validSessionData,
          rubricId: "not-a-uuid",
        }),
    ).toThrow(ZodError);
  });

  it("should throw for invalid evaluatorType", () => {
    expect(
      () =>
        new EvaluationSessionEntity({
          ...validSessionData,
          evaluatorType: "robot" as "human",
        }),
    ).toThrow(ZodError);
  });

  it("should throw for invalid session id", () => {
    expect(
      () => new EvaluationSessionEntity(validSessionData, "not-a-uuid"),
    ).toThrow(ZodError);
  });

  it("identifier getter returns evaluatorType, copilotOutputId, rubricId, evaluatorId", () => {
    const entity = new EvaluationSessionEntity(validSessionData);
    const identifier = entity.identifier;
    expect(identifier).toHaveProperty("evaluatorType", "human");
    expect(identifier).toHaveProperty("copilotOutputId", validUuidV4);
    expect(identifier).toHaveProperty("rubricId", validUuidV4b);
    expect(identifier).toHaveProperty("evaluatorId", "test-evaluator-1");
  });

  it("identifier getter returns 4 session identifier fields", () => {
    const entity = new EvaluationSessionEntity(validSessionData);
    const identifier = entity.identifier;
    // TypeScript type assertion means the type omits modelName,
    // but at runtime the underlying data object still carries it
    expect(identifier).toHaveProperty("evaluatorType", "human");
    expect(identifier).toHaveProperty("copilotOutputId", validUuidV4);
    expect(identifier).toHaveProperty("rubricId", validUuidV4b);
    expect(identifier).toHaveProperty("evaluatorId", "test-evaluator-1");
  });

  it("toJSON returns data with id, createdAt, updatedAt", () => {
    const entity = new EvaluationSessionEntity(validSessionData, validUuidV4b);
    const json = entity.toJSON();
    expect(json.evaluatorType).toBe("human");
    expect(json.copilotOutputId).toBe(validUuidV4);
    expect(json.rubricId).toBe(validUuidV4b);
    expect(json.evaluatorId).toBe("test-evaluator-1");
    expect(json.modelName).toBeNull();
    expect(json.id).toBe(validUuidV4b);
    expect(json).toHaveProperty("createdAt");
    expect(json).toHaveProperty("updatedAt");
  });

  it("equals returns true for matching id", () => {
    const entity = new EvaluationSessionEntity(validSessionData, validUuidV4);
    expect(entity.equals(validUuidV4)).toBe(true);
  });

  it("equals returns false for different id", () => {
    const entity = new EvaluationSessionEntity(validSessionData, validUuidV4);
    expect(entity.equals(validUuidV4b)).toBe(false);
  });
});

describe("EvaluationRecordEntity", () => {
  const validRecordData = {
    copilotOutputId: validUuidV4,
    evaluatorType: "human" as const,
    rubricId: validUuidV4b,
    criteriaId: "660e8400-e29b-41d4-a716-446655440002",
    evaluatorId: "test-evaluator-1",
    evaluation: true,
    feedback: null,
  };

  it("should create with valid data", () => {
    const entity = new EvaluationRecordEntity(validRecordData);
    expect(entity).toBeInstanceOf(EvaluationRecordEntity);
    expect(entity.data.copilotOutputId).toBe(validUuidV4);
    expect(entity.data.evaluatorType).toBe("human");
    expect(entity.data.rubricId).toBe(validUuidV4b);
    expect(entity.data.criteriaId).toBe("660e8400-e29b-41d4-a716-446655440002");
    expect(entity.data.evaluatorId).toBe("test-evaluator-1");
    expect(entity.data.evaluation).toBe(true);
    expect(entity.data.feedback).toBeNull();
    expect(entity.id).toBeDefined();
  });

  it("should accept evaluation as false", () => {
    const entity = new EvaluationRecordEntity({
      ...validRecordData,
      evaluation: false,
    });
    expect(entity.data.evaluation).toBe(false);
  });

  it("should accept optional feedback", () => {
    const entity = new EvaluationRecordEntity({
      ...validRecordData,
      feedback: "Some feedback text",
    });
    expect(entity.data.feedback).toBe("Some feedback text");
  });

  it("should accept null feedback", () => {
    const entity = new EvaluationRecordEntity({
      ...validRecordData,
      feedback: null,
    });
    expect(entity.data.feedback).toBeNull();
  });

  it("should accept optional id parameter", () => {
    const entity = new EvaluationRecordEntity(validRecordData, validUuidV4);
    expect(entity.id).toBe(validUuidV4);
  });

  it("should throw for invalid copilotOutputId", () => {
    expect(
      () =>
        new EvaluationRecordEntity({
          ...validRecordData,
          copilotOutputId: "not-a-uuid",
        }),
    ).toThrow(ZodError);
  });

  it("should throw for invalid rubricId", () => {
    expect(
      () =>
        new EvaluationRecordEntity({
          ...validRecordData,
          rubricId: "not-a-uuid",
        }),
    ).toThrow(ZodError);
  });

  it("should throw for invalid criteriaId", () => {
    expect(
      () =>
        new EvaluationRecordEntity({
          ...validRecordData,
          criteriaId: "not-a-uuid",
        }),
    ).toThrow(ZodError);
  });

  it("should throw for invalid evaluatorType", () => {
    expect(
      () =>
        new EvaluationRecordEntity({
          ...validRecordData,
          evaluatorType: "robot" as "human",
        }),
    ).toThrow(ZodError);
  });

  it("identifier getter returns session identifier fields", () => {
    const entity = new EvaluationRecordEntity(validRecordData);
    const identifier = entity.identifier;
    expect(identifier).toHaveProperty("evaluatorType", "human");
    expect(identifier).toHaveProperty("copilotOutputId", validUuidV4);
    expect(identifier).toHaveProperty("rubricId", validUuidV4b);
    expect(identifier).toHaveProperty("evaluatorId", "test-evaluator-1");
  });

  it("toJSON returns data with id, createdAt, updatedAt", () => {
    const entity = new EvaluationRecordEntity(validRecordData, validUuidV4);
    const json = entity.toJSON();
    expect(json.copilotOutputId).toBe(validUuidV4);
    expect(json.evaluatorType).toBe("human");
    expect(json.rubricId).toBe(validUuidV4b);
    expect(json.criteriaId).toBe("660e8400-e29b-41d4-a716-446655440002");
    expect(json.evaluatorId).toBe("test-evaluator-1");
    expect(json.evaluation).toBe(true);
    expect(json.feedback).toBeNull();
    expect(json.id).toBe(validUuidV4);
    expect(json).toHaveProperty("createdAt");
    expect(json).toHaveProperty("updatedAt");
  });

  it("equals returns true for matching id", () => {
    const entity = new EvaluationRecordEntity(validRecordData, validUuidV4);
    expect(entity.equals(validUuidV4)).toBe(true);
  });

  it("equals returns false for different id", () => {
    const entity = new EvaluationRecordEntity(validRecordData, validUuidV4);
    expect(entity.equals(validUuidV4b)).toBe(false);
  });
});

describe("EvaluationResultEntity", () => {
  const validResultData = {
    evaluatorId: "test-evaluator-1",
    copilotOutputId: validUuidV4,
    rubricId: validUuidV4b,
    evaluatorType: "human" as const,
    overallScore: 0.85,
    analysis: "The agent performed well overall.",
  };

  it("should create with valid data", () => {
    const entity = new EvaluationResultEntity(validResultData);
    expect(entity).toBeInstanceOf(EvaluationResultEntity);
    expect(entity.data.evaluatorId).toBe("test-evaluator-1");
    expect(entity.data.copilotOutputId).toBe(validUuidV4);
    expect(entity.data.rubricId).toBe(validUuidV4b);
    expect(entity.data.evaluatorType).toBe("human");
    expect(entity.data.overallScore).toBe(0.85);
    expect(entity.data.analysis).toBe("The agent performed well overall.");
    expect(entity.id).toBeDefined();
  });

  it("should accept agent evaluatorType", () => {
    const entity = new EvaluationResultEntity({
      ...validResultData,
      evaluatorType: "agent",
    });
    expect(entity.data.evaluatorType).toBe("agent");
  });

  it("should accept zero overallScore", () => {
    const entity = new EvaluationResultEntity({
      ...validResultData,
      overallScore: 0,
    });
    expect(entity.data.overallScore).toBe(0);
  });

  it("should accept negative overallScore", () => {
    const entity = new EvaluationResultEntity({
      ...validResultData,
      overallScore: -1,
    });
    expect(entity.data.overallScore).toBe(-1);
  });

  it("should accept optional id parameter", () => {
    const entity = new EvaluationResultEntity(validResultData, validUuidV4);
    expect(entity.id).toBe(validUuidV4);
  });

  it("should throw for invalid copilotOutputId", () => {
    expect(
      () =>
        new EvaluationResultEntity({
          ...validResultData,
          copilotOutputId: "not-a-uuid",
        }),
    ).toThrow(ZodError);
  });

  it("should throw for invalid rubricId", () => {
    expect(
      () =>
        new EvaluationResultEntity({
          ...validResultData,
          rubricId: "not-a-uuid",
        }),
    ).toThrow(ZodError);
  });

  it("should throw for invalid evaluatorType", () => {
    expect(
      () =>
        new EvaluationResultEntity({
          ...validResultData,
          evaluatorType: "robot" as "human",
        }),
    ).toThrow(ZodError);
  });

  it("identifier getter returns session identifier fields", () => {
    const entity = new EvaluationResultEntity(validResultData);
    const identifier = entity.identifier;
    expect(identifier).toHaveProperty("evaluatorType", "human");
    expect(identifier).toHaveProperty("copilotOutputId", validUuidV4);
    expect(identifier).toHaveProperty("rubricId", validUuidV4b);
    expect(identifier).toHaveProperty("evaluatorId", "test-evaluator-1");
  });

  it("toJSON returns data with id, createdAt, updatedAt", () => {
    const entity = new EvaluationResultEntity(validResultData, validUuidV4);
    const json = entity.toJSON();
    expect(json.evaluatorId).toBe("test-evaluator-1");
    expect(json.copilotOutputId).toBe(validUuidV4);
    expect(json.rubricId).toBe(validUuidV4b);
    expect(json.evaluatorType).toBe("human");
    expect(json.overallScore).toBe(0.85);
    expect(json.analysis).toBe("The agent performed well overall.");
    expect(json.id).toBe(validUuidV4);
    expect(json).toHaveProperty("createdAt");
    expect(json).toHaveProperty("updatedAt");
  });

  it("equals returns true for matching id", () => {
    const entity = new EvaluationResultEntity(validResultData, validUuidV4);
    expect(entity.equals(validUuidV4)).toBe(true);
  });

  it("equals returns false for different id", () => {
    const entity = new EvaluationResultEntity(validResultData, validUuidV4);
    expect(entity.equals(validUuidV4b)).toBe(false);
  });
});
