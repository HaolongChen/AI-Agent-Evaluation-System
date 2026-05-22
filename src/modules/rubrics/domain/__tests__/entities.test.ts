import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import { RubricEntity, CriteriaEntity } from "../entity/rubric.entity.ts";
import { AgentFeedbackEntity } from "../entity/agent-feedback.entity.ts";

const validUuidV4 = "550e8400-e29b-41d4-a716-446655440000";

describe("RubricEntity", () => {
  it("should create with goldenSetId and userInputId as uuid", () => {
    const rubric = new RubricEntity({
      goldenSetId: validUuidV4,
      userInputId: validUuidV4,
    });
    expect(rubric).toBeInstanceOf(RubricEntity);
    expect(rubric.data.goldenSetId).toBe(validUuidV4);
    expect(rubric.data.userInputId).toBe(validUuidV4);
    expect(rubric.id).toBeDefined();
  });

  it("should accept optional id parameter", () => {
    const rubric = new RubricEntity(
      { goldenSetId: validUuidV4, userInputId: validUuidV4 },
      validUuidV4,
    );
    expect(rubric.id).toBe(validUuidV4);
  });

  it("should throw for invalid goldenSetId", () => {
    expect(
      () =>
        new RubricEntity({
          goldenSetId: "not-a-uuid",
          userInputId: validUuidV4,
        }),
    ).toThrow(ZodError);
  });

  it("should throw for invalid userInputId", () => {
    expect(
      () =>
        new RubricEntity({
          goldenSetId: validUuidV4,
          userInputId: "not-a-uuid",
        }),
    ).toThrow(ZodError);
  });
});

describe("CriteriaEntity", () => {
  const validCriteria = {
    rubricId: validUuidV4,
    content: "Test criterion",
    expectedAnswer: true,
    weight: 0.5,
  };

  it("should create with valid data", () => {
    const criteria = new CriteriaEntity(validCriteria);
    expect(criteria).toBeInstanceOf(CriteriaEntity);
    expect(criteria.data.rubricId).toBe(validUuidV4);
    expect(criteria.data.content).toBe("Test criterion");
    expect(criteria.data.expectedAnswer).toBe(true);
    expect(criteria.data.weight).toBe(0.5);
  });

  it("should accept weight of 1 (max boundary)", () => {
    const criteria = new CriteriaEntity({ ...validCriteria, weight: 1 });
    expect(criteria.data.weight).toBe(1);
  });

  it("should accept weight of 0.5", () => {
    const criteria = new CriteriaEntity({ ...validCriteria, weight: 0.5 });
    expect(criteria.data.weight).toBe(0.5);
  });

  it("should accept weight of 0.01 (minimum positive multiple of 0.01)", () => {
    const criteria = new CriteriaEntity({ ...validCriteria, weight: 0.01 });
    expect(criteria.data.weight).toBe(0.01);
  });

  it("should accept expectedAnswer of false", () => {
    const criteria = new CriteriaEntity({ ...validCriteria, expectedAnswer: false });
    expect(criteria.data.expectedAnswer).toBe(false);
  });

  it("should create with optional reasoning", () => {
    const criteria = new CriteriaEntity({
      ...validCriteria,
      reasoning: "Some reasoning",
    });
    expect(criteria.data.reasoning).toBe("Some reasoning");
  });

  it("should create without reasoning", () => {
    const criteria = new CriteriaEntity(validCriteria);
    expect(criteria.data.reasoning).toBeUndefined();
  });

  it("should throw for weight of 0 (not positive)", () => {
    expect(() => new CriteriaEntity({ ...validCriteria, weight: 0 })).toThrow(
      ZodError,
    );
  });

  it("should throw for weight of 1.5 (exceeds max of 1)", () => {
    expect(() =>
      new CriteriaEntity({ ...validCriteria, weight: 1.5 }),
    ).toThrow(ZodError);
  });

  it("should throw for weight of 0.005 (not multiple of 0.01)", () => {
    expect(() =>
      new CriteriaEntity({ ...validCriteria, weight: 0.005 }),
    ).toThrow(ZodError);
  });
});

describe("AgentFeedbackEntity", () => {
  const baseFeedback = {
    rubricId: validUuidV4,
    feedback: ["Great job", "Needs improvement"],
  };

  it("should create with agent name: rubrics-generator-agent", () => {
    const feedback = new AgentFeedbackEntity({
      ...baseFeedback,
      agentName: "rubrics-generator-agent",
    });
    expect(feedback).toBeInstanceOf(AgentFeedbackEntity);
    expect(feedback.data.agentName).toBe("rubrics-generator-agent");
    expect(feedback.data.feedback).toEqual(["Great job", "Needs improvement"]);
  });

  it("should create with agent name: documentations-lookup-agent", () => {
    const feedback = new AgentFeedbackEntity({
      ...baseFeedback,
      agentName: "documentations-lookup-agent",
    });
    expect(feedback.data.agentName).toBe("documentations-lookup-agent");
  });

  it("should create with agent name: schema-lookup-agent", () => {
    const feedback = new AgentFeedbackEntity({
      ...baseFeedback,
      agentName: "schema-lookup-agent",
    });
    expect(feedback.data.agentName).toBe("schema-lookup-agent");
  });

  it("should throw for invalid agent name", () => {
    expect(
      () =>
        new AgentFeedbackEntity({
          ...baseFeedback,
          agentName: "invalid-agent" as "rubrics-generator-agent",
        }),
    ).toThrow(ZodError);
  });

  it("should throw for empty agent name string", () => {
    expect(
      () =>
        new AgentFeedbackEntity({
          ...baseFeedback,
          agentName: "" as "rubrics-generator-agent",
        }),
    ).toThrow(ZodError);
  });

  it("should accept empty feedback array", () => {
    const feedback = new AgentFeedbackEntity({
      ...baseFeedback,
      feedback: [],
      agentName: "rubrics-generator-agent",
    });
    expect(feedback.data.feedback).toEqual([]);
  });
});
