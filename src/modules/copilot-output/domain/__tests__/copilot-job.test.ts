import { describe, it, expect } from "vitest";
import { CopilotJobEntity } from "../entity/copilot-job.entity.ts";

describe("CopilotJobEntity", () => {
  const validData = {
    projectExId: "proj-42",
    copilotSessionExId: "session-abc",
    wsUrl: "ws://example.com/copilot",
    query: "Generate a login page with email and password",
    schemaGraph: { version: "1.0", nodes: [] },
  };

  // --- Construction ---

  it("should create with all required fields", () => {
    const job = new CopilotJobEntity(validData);
    expect(job.data.projectExId).toBe("proj-42");
    expect(job.data.copilotSessionExId).toBe("session-abc");
    expect(job.data.wsUrl).toBe("ws://example.com/copilot");
    expect(job.data.query).toBe(
      "Generate a login page with email and password",
    );
    expect(job.data.schemaGraph).toEqual({ version: "1.0", nodes: [] });
  });

  it("should accept an explicit id", () => {
    const customId = "33333333-3333-4333-8333-333333333333";
    const job = new CopilotJobEntity(validData, customId);
    expect(job.id).toBe(customId);
  });

  it("should auto-generate id when not provided", () => {
    const job = new CopilotJobEntity(validData);
    expect(job.id).toBeDefined();
    expect(typeof job.id).toBe("string");
    expect(job.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  // --- Initial state ---

  it("should have undefined editableText initially", () => {
    const job = new CopilotJobEntity(validData);
    expect(job.editableText).toBeUndefined();
  });

  it("should have undefined aiResponse initially", () => {
    const job = new CopilotJobEntity(validData);
    expect(job.aiResponse).toBeUndefined();
  });

  it("should have empty tasks initially", () => {
    const job = new CopilotJobEntity(validData);
    expect(job.tasks).toEqual([]);
  });

  it("should not be finished initially", () => {
    const job = new CopilotJobEntity(validData);
    expect(job.isFinished()).toBe(false);
  });

  // --- aiResponse ---

  it("should set and get aiResponse", () => {
    const job = new CopilotJobEntity(validData);
    job.aiResponse = "Here is the generated login page.";
    expect(job.aiResponse).toBe("Here is the generated login page.");
  });

  it("should mark as finished after setting aiResponse", () => {
    const job = new CopilotJobEntity(validData);
    expect(job.isFinished()).toBe(false);
    job.aiResponse = "done";
    expect(job.isFinished()).toBe(true);
  });

  it("should remain finishable through multiple aiResponse updates", () => {
    const job = new CopilotJobEntity(validData);
    job.aiResponse = "first draft";
    expect(job.isFinished()).toBe(true);
    job.aiResponse = "revised draft";
    expect(job.aiResponse).toBe("revised draft");
    expect(job.isFinished()).toBe(true);
  });

  // --- editableText ---

  it("should set and get editableText", () => {
    const job = new CopilotJobEntity(validData);
    job.editableText = "console.log('hello');";
    expect(job.editableText).toBe("console.log('hello');");
  });

  it("should overwrite editableText", () => {
    const job = new CopilotJobEntity(validData);
    job.editableText = "first version";
    job.editableText = "second version";
    expect(job.editableText).toBe("second version");
  });

  it("should not affect isFinished when setting editableText", () => {
    const job = new CopilotJobEntity(validData);
    job.editableText = "some code";
    expect(job.isFinished()).toBe(false);
  });

  it("should allow setting editableText to undefined", () => {
    const job = new CopilotJobEntity(validData);
    job.editableText = "text";
    job.editableText = undefined as unknown as string;
    expect(job.editableText).toBeUndefined();
  });

  // --- tasks ---

  it("should add a task to the tasks list", () => {
    const job = new CopilotJobEntity(validData);
    const task = {
      taskId: "task-1",
      name: "create-file",
      description: null,
      diff: {},
      isDiffReverted: null,
    };
    job.addTask(task);
    expect(job.tasks).toHaveLength(1);
    expect(job.tasks[0].taskId).toBe("task-1");
    expect(job.tasks[0].name).toBe("create-file");
  });

  it("should accumulate multiple tasks", () => {
    const job = new CopilotJobEntity(validData);
    job.addTask({
      taskId: "task-1",
      name: "create-file",
      description: "Create src/index.ts",
      diff: {},
      isDiffReverted: null,
    });
    job.addTask({
      taskId: "task-2",
      name: "update-config",
      description: null,
      diff: {},
      isDiffReverted: false,
    });
    expect(job.tasks).toHaveLength(2);
    expect(job.tasks[0].taskId).toBe("task-1");
    expect(job.tasks[1].taskId).toBe("task-2");
  });

  it("should return a reference to the internal tasks array", () => {
    const job = new CopilotJobEntity(validData);
    const tasks = job.tasks;
    expect(Array.isArray(tasks)).toBe(true);
    // Mutating the returned array should affect internal state
    tasks.push({
      taskId: "mutated",
      name: "mutated",
      description: null,
      diff: null,
      isDiffReverted: null,
    });
    expect(job.tasks).toHaveLength(1);
  });

  // --- Entity base class contract ---

  it("should expose data via getter", () => {
    const job = new CopilotJobEntity(validData);
    expect(job.data.projectExId).toBe("proj-42");
  });

  it("should produce JSON via toJSON including id and schema fields", () => {
    const job = new CopilotJobEntity(validData);
    const json = job.toJSON();
    expect(json.id).toBe(job.id);
    expect(json.projectExId).toBe("proj-42");
    expect(json.query).toBe(validData.query);
    expect(json).toHaveProperty("createdAt");
    expect(json).toHaveProperty("updatedAt");
  });

  it("should compare identity via equals", () => {
    const job = new CopilotJobEntity(validData);
    expect(job.equals(job.id)).toBe(true);
    expect(job.equals("other-id")).toBe(false);
  });
});
