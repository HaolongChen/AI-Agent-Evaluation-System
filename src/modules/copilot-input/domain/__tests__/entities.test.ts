import { describe, it, expect } from "vitest";
import { GoldenSetEntity } from "../entity/golden-set.entity.ts";
import { UserInputEntity } from "../entity/user-input.entity.ts";
import { ProjectEntity } from "../entity/project.entity.ts";
import { goldenSetSchema } from "../schema/golden-set.schema.ts";

// ---------------------------------------------------------------------------
// GoldenSetEntity
// ---------------------------------------------------------------------------
describe("GoldenSetEntity", () => {
  it("should create with all fields explicitly provided", () => {
    const entity = new GoldenSetEntity({
      schemaId: "schema-123",
      copilotType: "uiBuilder",
      modelName: "gpt-4",
    });
    expect(entity.data.schemaId).toBe("schema-123");
    expect(entity.data.copilotType).toBe("uiBuilder");
    expect(entity.data.modelName).toBe("gpt-4");
  });

  it("should default copilotType to dataModelBuilder", () => {
    const entity = new GoldenSetEntity({
      schemaId: "schema-1",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(entity.data.copilotType).toBe("dataModelBuilder");
  });

  it("should default modelName to 'undefined' string", () => {
    const entity = new GoldenSetEntity({
      schemaId: "schema-1",
      copilotType: "uiBuilder",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(entity.data.modelName).toBe("undefined");
  });

  it("should use defaults when both optional fields are omitted", () => {
    const entity = new GoldenSetEntity({
      schemaId: "schema-1",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(entity.data.copilotType).toBe("dataModelBuilder");
    expect(entity.data.modelName).toBe("undefined");
  });

  it("should support schema-level parse with defaults", () => {
    const data = goldenSetSchema.parse({ schemaId: "manual" });
    expect(data.copilotType).toBe("dataModelBuilder");
    expect(data.modelName).toBe("undefined");
  });

  // --- Entity base class contract ---

  it("should provide an auto-generated id", () => {
    const entity = new GoldenSetEntity({
      schemaId: "s1",
      copilotType: "agentBuilder",
      modelName: "claude",
    });
    expect(entity.id).toBeDefined();
    expect(typeof entity.id).toBe("string");
    // UUID v4 format: 8-4-4-4-12 hex chars
    expect(entity.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("should expose data via getter", () => {
    const entity = new GoldenSetEntity({
      schemaId: "s2",
      copilotType: "logAnalyzer",
      modelName: "gemini",
    });
    expect(entity.data.schemaId).toBe("s2");
    expect(entity.data.copilotType).toBe("logAnalyzer");
    expect(entity.data.modelName).toBe("gemini");
  });

  it("should produce JSON via toJSON including id and schema fields", () => {
    const entity = new GoldenSetEntity({
      schemaId: "s3",
      copilotType: "dataModelBuilder",
      modelName: "undefined",
    });
    const json = entity.toJSON();
    expect(json.id).toBe(entity.id);
    expect(json.schemaId).toBe("s3");
    expect(json.copilotType).toBe("dataModelBuilder");
    expect(json.modelName).toBe("undefined");
    expect(json).toHaveProperty("createdAt");
    expect(json).toHaveProperty("updatedAt");
  });

  it("should compare identity via equals", () => {
    const entity = new GoldenSetEntity({
      schemaId: "s4",
      copilotType: "dataModelBuilder",
      modelName: "undefined",
    });
    expect(entity.equals(entity.id)).toBe(true);
    expect(entity.equals("some-other-id")).toBe(false);
  });

  it("should accept an explicit id", () => {
    const customId = "11111111-1111-4111-8111-111111111111";
    const entity = new GoldenSetEntity(
      {
        schemaId: "s5",
        copilotType: "actionFlowBuilder",
        modelName: "o1",
      },
      customId,
    );
    expect(entity.id).toBe(customId);
  });
});

// ---------------------------------------------------------------------------
// UserInputEntity
// ---------------------------------------------------------------------------
describe("UserInputEntity", () => {
  it("should create with content and createdBy", () => {
    const entity = new UserInputEntity({
      content: "Build a login form",
      createdBy: "alice",
    });
    expect(entity.data.content).toBe("Build a login form");
    expect(entity.data.createdBy).toBe("alice");
  });

  it("should default createdBy to unknown", () => {
    const entity = new UserInputEntity({
      content: "Hello world",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(entity.data.createdBy).toBe("unknown");
  });

  it("should accept content with minimal fields", () => {
    const entity = new UserInputEntity({
      content: "Generate API endpoint",
    } as any);
    expect(entity.data.content).toBe("Generate API endpoint");
    expect(entity.data.createdBy).toBe("unknown");
  });

  // --- Entity base class contract ---

  it("should provide auto-generated id", () => {
    const entity = new UserInputEntity({ content: "test" } as any);
    expect(entity.id).toBeDefined();
    expect(typeof entity.id).toBe("string");
  });

  it("should expose data via getter", () => {
    const entity = new UserInputEntity({
      content: "data content",
      createdBy: "bob",
    });
    expect(entity.data.content).toBe("data content");
    expect(entity.data.createdBy).toBe("bob");
  });

  it("should include all fields in toJSON", () => {
    const entity = new UserInputEntity({
      content: "json content",
      createdBy: "carol",
    });
    const json = entity.toJSON();
    expect(json.id).toBe(entity.id);
    expect(json.content).toBe("json content");
    expect(json.createdBy).toBe("carol");
  });

  it("should compare identity via equals", () => {
    const entity = new UserInputEntity({ content: "eq test" } as any);
    expect(entity.equals(entity.id)).toBe(true);
    expect(entity.equals("wrong-id")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ProjectEntity
// ---------------------------------------------------------------------------
describe("ProjectEntity", () => {
  it("should create with all fields explicitly provided", () => {
    const entity = new ProjectEntity({
      name: "My Project",
      projectExId: "proj-ex-1",
      schemaId: "schema-p1",
      createdBy: "admin",
    });
    expect(entity.data.name).toBe("My Project");
    expect(entity.data.projectExId).toBe("proj-ex-1");
    expect(entity.data.schemaId).toBe("schema-p1");
    expect(entity.data.createdBy).toBe("admin");
  });

  it("should default createdBy to unknown", () => {
    const entity = new ProjectEntity({
      name: "Anonymous Project",
      projectExId: "proj-ex-2",
      schemaId: "schema-p2",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(entity.data.createdBy).toBe("unknown");
  });

  it("should require all mandatory fields", () => {
    const entity = new ProjectEntity({
      name: "Minimal",
      projectExId: "proj-ex-3",
      schemaId: "schema-p3",
      createdBy: "dev",
    });
    expect(entity.data.name).toBe("Minimal");
    expect(entity.data.projectExId).toBe("proj-ex-3");
    expect(entity.data.schemaId).toBe("schema-p3");
  });

  // --- Entity base class contract ---

  it("should provide auto-generated id", () => {
    const entity = new ProjectEntity({
      name: "P",
      projectExId: "p-ex-1",
      schemaId: "s-p-1",
      createdBy: "u",
    });
    expect(entity.id).toBeDefined();
    expect(typeof entity.id).toBe("string");
  });

  it("should expose data via getter", () => {
    const entity = new ProjectEntity({
      name: "Getter Test",
      projectExId: "ex-1",
      schemaId: "sch-1",
      createdBy: "tester",
    });
    expect(entity.data.name).toBe("Getter Test");
    expect(entity.data.projectExId).toBe("ex-1");
    expect(entity.data.schemaId).toBe("sch-1");
    expect(entity.data.createdBy).toBe("tester");
  });

  it("should include all fields in toJSON", () => {
    const entity = new ProjectEntity({
      name: "JSON Test",
      projectExId: "ex-json",
      schemaId: "sch-json",
      createdBy: "author",
    });
    const json = entity.toJSON();
    expect(json.id).toBe(entity.id);
    expect(json.name).toBe("JSON Test");
    expect(json.projectExId).toBe("ex-json");
    expect(json.schemaId).toBe("sch-json");
    expect(json.createdBy).toBe("author");
  });

  it("should compare identity via equals", () => {
    const entity = new ProjectEntity({
      name: "EQ",
      projectExId: "ex-eq",
      schemaId: "sch-eq",
      createdBy: "me",
    });
    expect(entity.equals(entity.id)).toBe(true);
    expect(entity.equals("different-id")).toBe(false);
  });

  it("should accept an explicit id", () => {
    const customId = "22222222-2222-4222-8222-222222222222";
    const entity = new ProjectEntity(
      {
        name: "Custom ID",
        projectExId: "ex-custom",
        schemaId: "sch-custom",
        createdBy: "root",
      },
      customId,
    );
    expect(entity.id).toBe(customId);
  });
});
