import { describe, it, expect } from "vitest";
import { CreateGoldenSetUseCase } from "../create-golden-set.ts";
import { CreateUserInputUseCase } from "../create-user-input.ts";
import { FormCopilotInputUseCase } from "../form-copilot-input.ts";
import { GoldenSetEntity } from "../../domain/entity/golden-set.entity.ts";
import { UserInputEntity } from "../../domain/entity/user-input.entity.ts";
import type { IGoldenSetRepository } from "../../domain/interface/golden-set.interface.ts";
import type { IUserInputRepository } from "../../domain/interface/user-input.interface.ts";

// ---------------------------------------------------------------------------
// Manual mock: IGoldenSetRepository
// ---------------------------------------------------------------------------
interface MockGoldenSetRepository extends IGoldenSetRepository {
  _saved: Array<GoldenSetEntity>;
  _addUserInputAssociationCalls: Array<{
    goldenSetId: string;
    userInputId: string;
  }>;
}

function createMockGoldenSetRepository(
  overrides?: Partial<
    Pick<IGoldenSetRepository, "getByUserInputId">
  >,
): MockGoldenSetRepository {
  const _saved: Array<GoldenSetEntity> = [];
  const _addUserInputAssociationCalls: Array<{
    goldenSetId: string;
    userInputId: string;
  }> = [];

  return {
    _saved,
    _addUserInputAssociationCalls,

    async save(entity: GoldenSetEntity): Promise<void> {
      _saved.push(entity);
    },

    async findById(id: string): Promise<GoldenSetEntity> {
      const found = _saved.find((e) => e.id === id);
      if (!found) {
        throw new Error(`GoldenSetEntity not found: ${id}`);
      }
      return found;
    },

    async getByUserInputId(
      userInputId: string,
    ): Promise<Array<GoldenSetEntity>> {
      if (overrides?.getByUserInputId) {
        return overrides.getByUserInputId(userInputId);
      }
      return [];
    },

    async getByFilters(): Promise<Array<GoldenSetEntity>> {
      return [];
    },

    async addUserInputAssociation(
      goldenSetId: string,
      userInputId: string,
    ): Promise<void> {
      _addUserInputAssociationCalls.push({ goldenSetId, userInputId });
    },

    async getCopilotInputByGoldenSetIdAndUserInputId(): Promise<{
      goldenSetEntity: GoldenSetEntity;
      userInputEntity: UserInputEntity;
    }> {
      throw new Error("Not implemented in mock");
    },
  };
}

// ---------------------------------------------------------------------------
// Manual mock: IUserInputRepository
// ---------------------------------------------------------------------------
interface MockUserInputRepository extends IUserInputRepository {
  _saved: Array<UserInputEntity>;
  _addGoldenSetAssociationCalls: Array<{
    userInputId: string;
    goldenSetId: string;
  }>;
}

function createMockUserInputRepository(): MockUserInputRepository {
  const _saved: Array<UserInputEntity> = [];
  const _addGoldenSetAssociationCalls: Array<{
    userInputId: string;
    goldenSetId: string;
  }> = [];

  return {
    _saved,
    _addGoldenSetAssociationCalls,

    async save(entity: UserInputEntity): Promise<void> {
      _saved.push(entity);
    },

    async findById(id: string): Promise<UserInputEntity> {
      const found = _saved.find((e) => e.id === id);
      if (!found) {
        throw new Error(`UserInputEntity not found: ${id}`);
      }
      return found;
    },

    async getByGoldenSetId(): Promise<Array<UserInputEntity>> {
      return [];
    },

    async addGoldenSetAssociation(
      userInputId: string,
      goldenSetId: string,
    ): Promise<void> {
      _addGoldenSetAssociationCalls.push({ userInputId, goldenSetId });
    },

    async getAll(): Promise<Array<UserInputEntity>> {
      return [];
    },
  };
}

// ---------------------------------------------------------------------------
// CreateGoldenSetUseCase
// ---------------------------------------------------------------------------
describe("CreateGoldenSetUseCase", () => {
  it("should save with defaults when only schemaId is provided", async () => {
    const mockRepo = createMockGoldenSetRepository();
    const useCase = new CreateGoldenSetUseCase(mockRepo);

    const result = await useCase.execute("schema-1");

    expect(mockRepo._saved).toHaveLength(1);
    const saved = mockRepo._saved[0]!;
    expect(saved.data.schemaId).toBe("schema-1");
    expect(saved.data.copilotType).toBe("dataModelBuilder");
    expect(saved.data.modelName).toBe("undefined");
    expect(saved).toBeInstanceOf(GoldenSetEntity);

    expect(result.id).toBe(saved.id);
    expect(result.schemaId).toBe("schema-1");
    expect(result.copilotType).toBe("dataModelBuilder");
    expect(result.modelName).toBe("undefined");
    expect(result).toHaveProperty("createdAt");
    expect(result).toHaveProperty("updatedAt");
  });

  it("should save with explicit copilotType and modelName", async () => {
    const mockRepo = createMockGoldenSetRepository();
    const useCase = new CreateGoldenSetUseCase(mockRepo);

    const result = await useCase.execute("schema-2", "uiBuilder", "gpt-4");

    expect(mockRepo._saved).toHaveLength(1);
    const saved = mockRepo._saved[0]!;
    expect(saved.data.schemaId).toBe("schema-2");
    expect(saved.data.copilotType).toBe("uiBuilder");
    expect(saved.data.modelName).toBe("gpt-4");

    expect(result.id).toBe(saved.id);
    expect(result.schemaId).toBe("schema-2");
    expect(result.copilotType).toBe("uiBuilder");
    expect(result.modelName).toBe("gpt-4");
    expect(result).toHaveProperty("createdAt");
    expect(result).toHaveProperty("updatedAt");
  });

  it("should return correct fields from toJSON", async () => {
    const mockRepo = createMockGoldenSetRepository();
    const useCase = new CreateGoldenSetUseCase(mockRepo);

    const result = await useCase.execute(
      "schema-3",
      "agentBuilder",
      "claude-3",
    );

    expect(result).toMatchObject({
      schemaId: "schema-3",
      copilotType: "agentBuilder",
      modelName: "claude-3",
    });
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe("string");
    expect(result.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(result).toHaveProperty("createdAt");
    expect(result).toHaveProperty("updatedAt");
  });
});

// ---------------------------------------------------------------------------
// CreateUserInputUseCase
// ---------------------------------------------------------------------------
describe("CreateUserInputUseCase", () => {
  it("should save with default createdBy when not provided", async () => {
    const mockRepo = createMockUserInputRepository();
    const useCase = new CreateUserInputUseCase(mockRepo);

    const result = await useCase.execute("Hello, world!");

    expect(mockRepo._saved).toHaveLength(1);
    const saved = mockRepo._saved[0]!;
    expect(saved.data.content).toBe("Hello, world!");
    expect(saved.data.createdBy).toBe("unknown");
    expect(saved).toBeInstanceOf(UserInputEntity);

    expect(result.id).toBe(saved.id);
    expect(result.content).toBe("Hello, world!");
    expect(result.createdBy).toBe("unknown");
    expect(result).toHaveProperty("createdAt");
    expect(result).toHaveProperty("updatedAt");
  });

  it("should save with explicit createdBy", async () => {
    const mockRepo = createMockUserInputRepository();
    const useCase = new CreateUserInputUseCase(mockRepo);

    const result = await useCase.execute("Build a login page", "test-user");

    expect(mockRepo._saved).toHaveLength(1);
    const saved = mockRepo._saved[0]!;
    expect(saved.data.content).toBe("Build a login page");
    expect(saved.data.createdBy).toBe("test-user");

    expect(result.id).toBe(saved.id);
    expect(result.content).toBe("Build a login page");
    expect(result.createdBy).toBe("test-user");
    expect(result).toHaveProperty("createdAt");
    expect(result).toHaveProperty("updatedAt");
  });

  it("should save entity via mock save method", async () => {
    const mockRepo = createMockUserInputRepository();
    const useCase = new CreateUserInputUseCase(mockRepo);

    await useCase.execute("Verify save is called");

    expect(mockRepo._saved).toHaveLength(1);
    const saved = mockRepo._saved[0]!;
    expect(saved.data.content).toBe("Verify save is called");
  });
});

// ---------------------------------------------------------------------------
// FormCopilotInputUseCase
// ---------------------------------------------------------------------------
describe("FormCopilotInputUseCase", () => {
  const GOLDEN_SET_ID = "22222222-2222-4222-8222-222222222222";
  const USER_INPUT_ID = "33333333-3333-4333-8333-333333333333";

  it("should add association when no existing association found", async () => {
    const goldenSetRepo = createMockGoldenSetRepository({
      getByUserInputId: async () => [],
    });
    const userInputRepo = createMockUserInputRepository();
    const useCase = new FormCopilotInputUseCase({
      goldenSetRepository: goldenSetRepo,
      userInputRepository: userInputRepo,
    });

    await useCase.execute(GOLDEN_SET_ID, USER_INPUT_ID);

    expect(
      userInputRepo._addGoldenSetAssociationCalls,
    ).toHaveLength(1);
    expect(
      userInputRepo._addGoldenSetAssociationCalls[0],
    ).toEqual({
      userInputId: USER_INPUT_ID,
      goldenSetId: GOLDEN_SET_ID,
    });
  });

  it("should NOT add association when association already exists (idempotent)", async () => {
    const existingGoldenSet = new GoldenSetEntity(
      {
        schemaId: "existing-schema",
        copilotType: "dataModelBuilder",
        modelName: "undefined",
      },
      GOLDEN_SET_ID,
    );

    const goldenSetRepo = createMockGoldenSetRepository({
      getByUserInputId: async () => [existingGoldenSet],
    });
    const userInputRepo = createMockUserInputRepository();
    const useCase = new FormCopilotInputUseCase({
      goldenSetRepository: goldenSetRepo,
      userInputRepository: userInputRepo,
    });

    await useCase.execute(GOLDEN_SET_ID, USER_INPUT_ID);

    expect(
      userInputRepo._addGoldenSetAssociationCalls,
    ).toHaveLength(0);
  });
});
