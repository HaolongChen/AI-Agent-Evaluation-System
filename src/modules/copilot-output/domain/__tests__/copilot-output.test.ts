import { describe, it, expect } from "vitest";
import { CopilotOutputEntity } from "../entity/copilot-output.entity.ts";

describe("CopilotOutputEntity", () => {
  const validUUID = "550e8400-e29b-41d4-a716-446655440000";
  const altUUID = "550e8400-e29b-41d4-a716-446655440001";

  const baseData = {
    goldenSetId: validUUID,
    userInputId: altUUID,
    editableText: "console.log('output');",
    aiResponse: "Generated successfully",
    copilotSessionExId: "session-xyz",
  };

  // --- Construction ---

  it("should create with all required fields", () => {
    const entity = new CopilotOutputEntity(baseData);
    expect(entity.data.goldenSetId).toBe(validUUID);
    expect(entity.data.userInputId).toBe(altUUID);
    expect(entity.data.editableText).toBe("console.log('output');");
    expect(entity.data.aiResponse).toBe("Generated successfully");
    expect(entity.data.copilotSessionExId).toBe("session-xyz");
  });

  it("should accept nullable editableText as null", () => {
    const entity = new CopilotOutputEntity({
      ...baseData,
      editableText: null,
    });
    expect(entity.data.editableText).toBeNull();
  });

  it("should accept nullable editableText as string", () => {
    const entity = new CopilotOutputEntity({
      ...baseData,
      editableText: "some text",
    });
    expect(entity.data.editableText).toBe("some text");
  });

  it("should accept empty aiResponse", () => {
    const entity = new CopilotOutputEntity({
      ...baseData,
      aiResponse: "",
    });
    expect(entity.data.aiResponse).toBe("");
  });

  it("should accept an explicit id", () => {
    const customId = "44444444-4444-4444-8444-444444444444";
    const entity = new CopilotOutputEntity(baseData, customId);
    expect(entity.id).toBe(customId);
  });

  it("should auto-generate id when not provided", () => {
    const entity = new CopilotOutputEntity(baseData);
    expect(entity.id).toBeDefined();
    expect(typeof entity.id).toBe("string");
    expect(entity.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  // --- Entity base class contract ---

  it("should expose data via getter", () => {
    const entity = new CopilotOutputEntity(baseData);
    expect(entity.data.goldenSetId).toBe(validUUID);
    expect(entity.data.userInputId).toBe(altUUID);
    expect(entity.data.aiResponse).toBe("Generated successfully");
  });

  it("should produce JSON via toJSON including id and schema fields", () => {
    const entity = new CopilotOutputEntity(baseData);
    const json = entity.toJSON();
    expect(json.id).toBe(entity.id);
    expect(json.goldenSetId).toBe(validUUID);
    expect(json.userInputId).toBe(altUUID);
    expect(json.editableText).toBe("console.log('output');");
    expect(json.aiResponse).toBe("Generated successfully");
    expect(json.copilotSessionExId).toBe("session-xyz");
    expect(json).toHaveProperty("createdAt");
    expect(json).toHaveProperty("updatedAt");
  });

  it("should compare identity via equals", () => {
    const entity = new CopilotOutputEntity(baseData);
    expect(entity.equals(entity.id)).toBe(true);
    expect(entity.equals("other-id")).toBe(false);
  });

  // --- Data integrity ---

  it("should store independent instances", () => {
    const entity1 = new CopilotOutputEntity(baseData);
    const entity2 = new CopilotOutputEntity({
      goldenSetId: validUUID,
      userInputId: altUUID,
      editableText: null,
      aiResponse: "different",
      copilotSessionExId: "other-session",
    });
    expect(entity1.data.aiResponse).toBe("Generated successfully");
    expect(entity2.data.aiResponse).toBe("different");
    expect(entity1.data.editableText).toBe("console.log('output');");
    expect(entity2.data.editableText).toBeNull();
  });

  it("should validate goldenSetId as valid uuid", () => {
    expect(() => {
      new CopilotOutputEntity({
        ...baseData,
        goldenSetId: "not-a-uuid",
      });
    }).toThrow();
  });

  it("should validate userInputId as valid uuid", () => {
    expect(() => {
      new CopilotOutputEntity({
        ...baseData,
        userInputId: "also-not-a-uuid",
      });
    }).toThrow();
  });
});
