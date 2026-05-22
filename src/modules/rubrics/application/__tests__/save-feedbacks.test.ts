import { describe, it, expect } from "vitest";
import { SaveFeedbacksUseCase } from "../save-feedbacks.ts";
import {
  Feedback,
  type Feedbacks,
} from "../../domain/service/feedback.service.ts";
import { AgentFeedbackEntity } from "../../domain/entity/agent-feedback.entity.ts";
import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";

const validRubricId = "550e8400-e29b-41d4-a716-446655440000";

describe("SaveFeedbacksUseCase", () => {
  it("should save feedback for all 3 agents with correct data", async () => {
    const savedEntities: AgentFeedbackEntity[] = [];
    const mockRepository: IRepository<AgentFeedbackEntity> = {
      save: async (entity: AgentFeedbackEntity) => {
        savedEntities.push(entity);
      },
      findById: async () => {
        throw new Error("Not implemented in test");
      },
    };

    const useCase = new SaveFeedbacksUseCase(mockRepository);
    const rubricId = validRubricId;

    const feedbacks: Feedbacks = {
      "rubrics-generator-agent": new Feedback(
        "rubrics-generator-agent",
        rubricId,
      ),
      "documentations-lookup-agent": new Feedback(
        "documentations-lookup-agent",
        rubricId,
      ),
      "schema-lookup-agent": new Feedback("schema-lookup-agent", rubricId),
    };

    feedbacks["rubrics-generator-agent"].addFeedback("Great job on the rubric");
    feedbacks["rubrics-generator-agent"].addFeedback("Could improve clarity");
    feedbacks["documentations-lookup-agent"].addFeedback(
      "Documentation was thorough",
    );
    feedbacks["schema-lookup-agent"].addFeedback("Schema parsing error");
    feedbacks["schema-lookup-agent"].addFeedback("Missing field definition");

    await useCase.execute(feedbacks, rubricId);

    expect(savedEntities).toHaveLength(3);

    const rubricsFeedback = savedEntities.find(
      (e) => e.data.agentName === "rubrics-generator-agent",
    )!;
    expect(rubricsFeedback.data.rubricId).toBe(rubricId);
    expect(rubricsFeedback.data.feedback).toEqual([
      "Great job on the rubric",
      "Could improve clarity",
    ]);

    const docsFeedback = savedEntities.find(
      (e) => e.data.agentName === "documentations-lookup-agent",
    )!;
    expect(docsFeedback.data.rubricId).toBe(rubricId);
    expect(docsFeedback.data.feedback).toEqual(["Documentation was thorough"]);

    const schemaFeedback = savedEntities.find(
      (e) => e.data.agentName === "schema-lookup-agent",
    )!;
    expect(schemaFeedback.data.rubricId).toBe(rubricId);
    expect(schemaFeedback.data.feedback).toEqual([
      "Schema parsing error",
      "Missing field definition",
    ]);
  });

  it("should save with empty feedback arrays when no feedback has been added", async () => {
    const savedEntities: AgentFeedbackEntity[] = [];
    const mockRepository: IRepository<AgentFeedbackEntity> = {
      save: async (entity: AgentFeedbackEntity) => {
        savedEntities.push(entity);
      },
      findById: async () => {
        throw new Error("Not implemented in test");
      },
    };

    const useCase = new SaveFeedbacksUseCase(mockRepository);
    const rubricId = validRubricId;

    const feedbacks: Feedbacks = {
      "rubrics-generator-agent": new Feedback(
        "rubrics-generator-agent",
        rubricId,
      ),
      "documentations-lookup-agent": new Feedback(
        "documentations-lookup-agent",
        rubricId,
      ),
      "schema-lookup-agent": new Feedback("schema-lookup-agent", rubricId),
    };

    // No feedback added — all three agents have empty feedback arrays
    await useCase.execute(feedbacks, rubricId);

    expect(savedEntities).toHaveLength(3);
    for (const entity of savedEntities) {
      expect(entity.data.rubricId).toBe(rubricId);
      expect(entity.data.feedback).toEqual([]);
    }
  });

  it("should pass the correct rubricId to every saved entity", async () => {
    const savedEntities: AgentFeedbackEntity[] = [];
    const mockRepository: IRepository<AgentFeedbackEntity> = {
      save: async (entity: AgentFeedbackEntity) => {
        savedEntities.push(entity);
      },
      findById: async () => {
        throw new Error("Not implemented in test");
      },
    };

    const useCase = new SaveFeedbacksUseCase(mockRepository);
    const rubricId = validRubricId;

    const feedbacks: Feedbacks = {
      "rubrics-generator-agent": new Feedback(
        "rubrics-generator-agent",
        rubricId,
      ),
      "documentations-lookup-agent": new Feedback(
        "documentations-lookup-agent",
        rubricId,
      ),
      "schema-lookup-agent": new Feedback("schema-lookup-agent", rubricId),
    };

    feedbacks["rubrics-generator-agent"].addFeedback("Some feedback");

    await useCase.execute(feedbacks, rubricId);

    expect(savedEntities).toHaveLength(3);
    for (const entity of savedEntities) {
      expect(entity.data.rubricId).toBe(rubricId);
    }
  });

  it("should call save for each agent exactly once", async () => {
    const saveCallCounts: Record<string, number> = {};
    const mockRepository: IRepository<AgentFeedbackEntity> = {
      save: async (entity: AgentFeedbackEntity) => {
        const name = entity.data.agentName;
        saveCallCounts[name] = (saveCallCounts[name] ?? 0) + 1;
      },
      findById: async () => {
        throw new Error("Not implemented in test");
      },
    };

    const useCase = new SaveFeedbacksUseCase(mockRepository);
    const rubricId = validRubricId;

    const feedbacks: Feedbacks = {
      "rubrics-generator-agent": new Feedback(
        "rubrics-generator-agent",
        rubricId,
      ),
      "documentations-lookup-agent": new Feedback(
        "documentations-lookup-agent",
        rubricId,
      ),
      "schema-lookup-agent": new Feedback("schema-lookup-agent", rubricId),
    };

    await useCase.execute(feedbacks, rubricId);

    expect(saveCallCounts["rubrics-generator-agent"]).toBe(1);
    expect(saveCallCounts["documentations-lookup-agent"]).toBe(1);
    expect(saveCallCounts["schema-lookup-agent"]).toBe(1);
  });
});
