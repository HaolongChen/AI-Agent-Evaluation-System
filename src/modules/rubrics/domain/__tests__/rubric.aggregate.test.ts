import { describe, it, expect } from "vitest";
import { RubricEntity, CriteriaEntity } from "../entity/rubric.entity.ts";
import { RubricAggregate } from "../aggregate/rubric.aggregate.ts";

const validUuidV4 = "550e8400-e29b-41d4-a716-446655440000";

describe("RubricAggregate", () => {
  const rubricEntity = new RubricEntity({
    goldenSetId: validUuidV4,
    userInputId: validUuidV4,
  });

  it("should construct with a RubricEntity", () => {
    const aggregate = new RubricAggregate(rubricEntity);
    expect(aggregate).toBeInstanceOf(RubricAggregate);
  });

  it("should start with an empty criterion array", () => {
    const aggregate = new RubricAggregate(rubricEntity);
    expect(aggregate.criterion).toEqual([]);
  });

  it("should add a single criterion via addCriteria", () => {
    const aggregate = new RubricAggregate(rubricEntity);
    const criteria = new CriteriaEntity({
      rubricId: validUuidV4,
      content: "Test criterion",
      expectedAnswer: true,
      weight: 0.5,
    });
    aggregate.addCriteria(criteria);
    expect(aggregate.criterion).toHaveLength(1);
    expect(aggregate.criterion[0]).toBe(criteria);
  });

  it("should accumulate totalWeight across multiple criteria", () => {
    const aggregate = new RubricAggregate(rubricEntity);
    const criteria1 = new CriteriaEntity({
      rubricId: validUuidV4,
      content: "First criterion",
      expectedAnswer: true,
      weight: 0.3,
    });
    const criteria2 = new CriteriaEntity({
      rubricId: validUuidV4,
      content: "Second criterion",
      expectedAnswer: false,
      weight: 0.7,
    });
    aggregate.addCriteria(criteria1);
    aggregate.addCriteria(criteria2);
    expect(aggregate.criterion).toHaveLength(2);
    expect(aggregate.criterion[0].data.weight).toBe(0.3);
    expect(aggregate.criterion[1].data.weight).toBe(0.7);
  });

  it("should add multiple criteria preserving insertion order", () => {
    const aggregate = new RubricAggregate(rubricEntity);
    const criteriaA = new CriteriaEntity({
      rubricId: validUuidV4,
      content: "A",
      expectedAnswer: true,
      weight: 0.2,
    });
    const criteriaB = new CriteriaEntity({
      rubricId: validUuidV4,
      content: "B",
      expectedAnswer: false,
      weight: 0.3,
    });
    const criteriaC = new CriteriaEntity({
      rubricId: validUuidV4,
      content: "C",
      expectedAnswer: true,
      weight: 0.5,
    });
    aggregate.addCriteria(criteriaA);
    aggregate.addCriteria(criteriaB);
    aggregate.addCriteria(criteriaC);
    expect(aggregate.criterion).toEqual([criteriaA, criteriaB, criteriaC]);
  });

  it("toJSON should return entity data with id, timestamps, and criterion array", () => {
    const aggregate = new RubricAggregate(rubricEntity);
    const criteria = new CriteriaEntity({
      rubricId: validUuidV4,
      content: "JSON test",
      expectedAnswer: true,
      weight: 1,
    });
    aggregate.addCriteria(criteria);

    const json = aggregate.toJSON();
    expect(json.goldenSetId).toBe(validUuidV4);
    expect(json.userInputId).toBe(validUuidV4);
    expect(json).toHaveProperty("id");
    expect(typeof json.id).toBe("string");
    expect(json).toHaveProperty("createdAt");
    expect(json).toHaveProperty("updatedAt");
    expect(json).toHaveProperty("criterion");
    expect(json.criterion).toHaveLength(1);
    expect(json.criterion[0]).toHaveProperty("content", "JSON test");
    expect(json.criterion[0]).toHaveProperty("weight", 1);
    expect(json.criterion[0]).toHaveProperty("expectedAnswer", true);
    expect(json.criterion[0]).toHaveProperty("rubricId");
    expect(json.criterion[0]).toHaveProperty("id");
  });

  it("toJSON should map each criteria to its own toJSON", () => {
    const aggregate = new RubricAggregate(rubricEntity);
    const criteria1 = new CriteriaEntity({
      rubricId: validUuidV4,
      content: "First",
      expectedAnswer: true,
      weight: 0.4,
    });
    const criteria2 = new CriteriaEntity({
      rubricId: validUuidV4,
      content: "Second",
      expectedAnswer: false,
      weight: 0.6,
    });
    aggregate.addCriteria(criteria1);
    aggregate.addCriteria(criteria2);

    const json = aggregate.toJSON();
    expect(json.criterion).toHaveLength(2);
    expect(json.criterion[0].content).toBe("First");
    expect(json.criterion[0].weight).toBe(0.4);
    expect(json.criterion[1].content).toBe("Second");
    expect(json.criterion[1].weight).toBe(0.6);
  });
});
