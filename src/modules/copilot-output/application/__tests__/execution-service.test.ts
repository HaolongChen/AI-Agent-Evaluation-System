import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ExecuteCopilotUseCase } from "../execution-service.ts";
import type { ICopilotOutputRepository } from "../../domain/interface/copilot-output.interface.ts";
import type { IGoldenSetRepository } from "../../../copilot-input/domain/interface/golden-set.interface.ts";
import type { IProjectLifecycle } from "../../../copilot-input/domain/interface/project-lifecycle.interface.ts";
import type { Account } from "../../../account/application/account-handler.ts";
import { GoldenSetEntity } from "../../../copilot-input/domain/entity/golden-set.entity.ts";
import { UserInputEntity } from "../../../copilot-input/domain/entity/user-input.entity.ts";
import { CopilotJobEntity } from "../../domain/entity/copilot-job.entity.ts";
import { CopilotOutputEntity } from "../../domain/entity/copilot-output.entity.ts";
import type { OpaqueSchemaGraph } from "../../../shared/domain/interface/type-system.ts";

const validUUID = "550e8400-e29b-41d4-a716-446655440000";

describe("ExecuteCopilotUseCase", () => {
  let capturedProjectName: string;
  let clearWsClientCalled: boolean;
  let deleteTemporaryProjectCalled: boolean;
  let savedOutputs: CopilotOutputEntity[];

  // Mocks shared across tests
  const mockGQLClient = {
    gqlRequest: async <T>(_query: string, _variables?: unknown): Promise<T> => {
      return { createCopilotSession: "test-session-ex-id" } as unknown as T;
    },
  };

  const mockCopilotOutputRepository: ICopilotOutputRepository = {
    save: async (entity: CopilotOutputEntity) => {
      savedOutputs.push(entity);
    },
    findById: async () => {
      throw new Error("Not implemented in test");
    },
    getByGoldenSetIdAndUserInputId: async () => [],
  };

  const mockGoldenSetRepository: IGoldenSetRepository = {
    save: async () => {},
    findById: async (id?: string) =>
      new GoldenSetEntity(
        {
          schemaId: "schema-1",
          copilotType: "dataModelBuilder",
          modelName: "undefined",
        },
        id,
      ),
    getByUserInputId: async () => [],
    getByFilters: async () => [],
    addUserInputAssociation: async () => {},
    getCopilotInputByGoldenSetIdAndUserInputId: async () => ({
      goldenSetEntity: new GoldenSetEntity({
        schemaId: "schema-1",
        copilotType: "dataModelBuilder",
        modelName: "undefined",
      }),
      userInputEntity: new UserInputEntity({
        content: "test query",
        createdBy: "test",
      }),
    }),
  };

  const mockProjectLifecycle: IProjectLifecycle = {
    createTemporaryProject: async (projectName: string) => {
      capturedProjectName = projectName;
      return {
        projectExId: "proj-1",
        schemaGraph: {} as OpaqueSchemaGraph,
      };
    },
    importExistingProject: async (projectExId: string) => ({
      projectExId,
      schemaGraph: {} as OpaqueSchemaGraph,
    }),
    deleteTemporaryProject: async () => {
      deleteTemporaryProjectCalled = true;
    },
  };

  beforeEach(() => {
    capturedProjectName = "";
    clearWsClientCalled = false;
    deleteTemporaryProjectCalled = false;
    savedOutputs = [];
    process.env.SUBSCRIPTION_GRAPHQL_URL = "https://example.com/graphql";
  });

  afterEach(() => {
    (process.env as Record<string, string | undefined>).SUBSCRIPTION_GRAPHQL_URL = undefined;
  });

  // ---------------------------------------------------------------------------
  // generateProjectName
  // ---------------------------------------------------------------------------

  describe("generateProjectName", () => {
    it("should produce the format temp-project-{goldenSetId[0]}-{userInputId[0]}-{timestamp}", async () => {
      const mockWsClient = {
        gqlSubscribe: () => {
          return () => {
            throw new Error("Not reached in this test path");
          };
        },
        close: () => {},
      };

      const mockAccount = {
        getGQLClient: async () => mockGQLClient,
        getWsClient: async () => mockWsClient,
        clearWsClient: () => {},
      } as unknown as Account;

      const useCase = new ExecuteCopilotUseCase(
        {
          copilotOutputRepository: mockCopilotOutputRepository,
          goldenSetRepository: mockGoldenSetRepository,
        },
        mockProjectLifecycle,
        mockAccount,
      );

      await expect(
        useCase.setupEnvironment({
          goldenSetId: validUUID,
          userInputId: validUUID,
        }),
      ).resolves.toBeInstanceOf(CopilotJobEntity);

      expect(capturedProjectName).toMatch(
        /^temp-project-5-5-\d+$/,
      );
    });

    it("should include first characters of IDs in the project name", async () => {
      const mockWsClient = {
        gqlSubscribe: () => {
          return () => {
            throw new Error("Not reached in this test path");
          };
        },
        close: () => {},
      };

      const mockAccount = {
        getGQLClient: async () => mockGQLClient,
        getWsClient: async () => mockWsClient,
        clearWsClient: () => {},
      } as unknown as Account;

      const useCase = new ExecuteCopilotUseCase(
        {
          copilotOutputRepository: mockCopilotOutputRepository,
          goldenSetRepository: mockGoldenSetRepository,
        },
        mockProjectLifecycle,
        mockAccount,
      );

      await useCase.setupEnvironment({
        goldenSetId: validUUID,
        userInputId: validUUID,
      });

      expect(capturedProjectName).toContain("temp-project-5-5-");
    });

    it("should work with different IDs producing different first chars", async () => {
      const differentGsId = "abcdef00-e29b-41d4-a716-446655440000";
      const differentUiId = "12345678-e29b-41d4-a716-446655440000";

      const mockWsClient = {
        gqlSubscribe: () => {
          return () => {
            throw new Error("Not reached in this test path");
          };
        },
        close: () => {},
      };

      const mockAccount = {
        getGQLClient: async () => mockGQLClient,
        getWsClient: async () => mockWsClient,
        clearWsClient: () => {},
      } as unknown as Account;

      const useCase = new ExecuteCopilotUseCase(
        {
          copilotOutputRepository: mockCopilotOutputRepository,
          goldenSetRepository: mockGoldenSetRepository,
        },
        mockProjectLifecycle,
        mockAccount,
      );

      await useCase.setupEnvironment({
        goldenSetId: differentGsId,
        userInputId: differentUiId,
      });

      expect(capturedProjectName).toContain("temp-project-a-1-");
    });
  });

  // ---------------------------------------------------------------------------
  // jobEntityToOutputEntity
  // ---------------------------------------------------------------------------

  describe("jobEntityToOutputEntity", () => {
    it("should convert a job with aiResponse into a CopilotOutputEntity", () => {
      const mockAccount = {
        getGQLClient: async () => mockGQLClient,
        getWsClient: async () => ({ gqlSubscribe: () => () => {}, close: () => {} }),
        clearWsClient: () => {},
      } as unknown as Account;

      const useCase = new ExecuteCopilotUseCase(
        {
          copilotOutputRepository: mockCopilotOutputRepository,
          goldenSetRepository: mockGoldenSetRepository,
        },
        mockProjectLifecycle,
        mockAccount,
      );

      const jobEntity = new CopilotJobEntity({
        projectExId: "proj-1",
        copilotSessionExId: "session-abc",
        wsUrl: "https://example.com/ws",
        query: "test query",
        schemaGraph: {} as OpaqueSchemaGraph,
      });
      jobEntity.aiResponse = "Generated result";
      jobEntity.editableText = "editable output";

      const output = (useCase as unknown as { jobEntityToOutputEntity: (job: CopilotJobEntity, gsId: string, uiId: string) => CopilotOutputEntity }).jobEntityToOutputEntity(
        jobEntity,
        validUUID,
        validUUID,
      );

      expect(output).toBeInstanceOf(CopilotOutputEntity);
      expect(output.data.goldenSetId).toBe(validUUID);
      expect(output.data.userInputId).toBe(validUUID);
      expect(output.data.aiResponse).toBe("Generated result");
      expect(output.data.editableText).toBe("editable output");
      expect(output.data.copilotSessionExId).toBe("session-abc");
    });

    it("should use null for editableText when job has no editableText", () => {
      const mockAccount = {
        getGQLClient: async () => mockGQLClient,
        getWsClient: async () => ({ gqlSubscribe: () => () => {}, close: () => {} }),
        clearWsClient: () => {},
      } as unknown as Account;

      const useCase = new ExecuteCopilotUseCase(
        {
          copilotOutputRepository: mockCopilotOutputRepository,
          goldenSetRepository: mockGoldenSetRepository,
        },
        mockProjectLifecycle,
        mockAccount,
      );

      const jobEntity = new CopilotJobEntity({
        projectExId: "proj-1",
        copilotSessionExId: "session-abc",
        wsUrl: "https://example.com/ws",
        query: "test query",
        schemaGraph: {} as OpaqueSchemaGraph,
      });
      jobEntity.aiResponse = "Generated result";
      // editableText remains undefined

      const output = (useCase as unknown as { jobEntityToOutputEntity: (job: CopilotJobEntity, gsId: string, uiId: string) => CopilotOutputEntity }).jobEntityToOutputEntity(
        jobEntity,
        validUUID,
        validUUID,
      );

      expect(output.data.editableText).toBeNull();
    });

    it("should throw when aiResponse is empty", () => {
      const mockAccount = {
        getGQLClient: async () => mockGQLClient,
        getWsClient: async () => ({ gqlSubscribe: () => () => {}, close: () => {} }),
        clearWsClient: () => {},
      } as unknown as Account;

      const useCase = new ExecuteCopilotUseCase(
        {
          copilotOutputRepository: mockCopilotOutputRepository,
          goldenSetRepository: mockGoldenSetRepository,
        },
        mockProjectLifecycle,
        mockAccount,
      );

      const jobEntity = new CopilotJobEntity({
        projectExId: "proj-1",
        copilotSessionExId: "session-abc",
        wsUrl: "https://example.com/ws",
        query: "test query",
        schemaGraph: {} as OpaqueSchemaGraph,
      });
      // aiResponse is NOT set

      expect(() =>
        (useCase as unknown as { jobEntityToOutputEntity: (job: CopilotJobEntity, gsId: string, uiId: string) => CopilotOutputEntity }).jobEntityToOutputEntity(
          jobEntity,
          validUUID,
          validUUID,
        ),
      ).toThrow("AI response is empty");
    });
  });

  // ---------------------------------------------------------------------------
  // Error handling
  // ---------------------------------------------------------------------------

  describe("executeV2 error handling", () => {
    it("should call clearWsClient and deleteTemporaryProject when a WebSocket error occurs", async () => {
      const throwingWsClient = {
        gqlSubscribe: () => {
          return () => {
            throw new Error("WebSocket subscription failed");
          };
        },
        close: () => {},
      };

      const mockAccount = {
        getGQLClient: async () => mockGQLClient,
        getWsClient: async () => throwingWsClient,
        clearWsClient: () => {
          clearWsClientCalled = true;
        },
      } as unknown as Account;

      const useCase = new ExecuteCopilotUseCase(
        {
          copilotOutputRepository: mockCopilotOutputRepository,
          goldenSetRepository: mockGoldenSetRepository,
        },
        mockProjectLifecycle,
        mockAccount,
      );

      await expect(
        useCase.executeV2({
          goldenSetId: validUUID,
          userInputId: validUUID,
        }),
      ).rejects.toThrow();

      expect(clearWsClientCalled).toBe(true);
      expect(deleteTemporaryProjectCalled).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // setupEnvironment with existing project
  // ---------------------------------------------------------------------------

  describe("setupEnvironment with existing project", () => {
    it("should call importExistingProject when projectExId is provided", async () => {
      let importExistingProjectCalled = false;
      const lifecycleWithImport: IProjectLifecycle = {
        createTemporaryProject: async () => {
          throw new Error("Should not be called");
        },
        importExistingProject: async (exId: string) => {
          importExistingProjectCalled = true;
          return {
            projectExId: exId,
            schemaGraph: {} as OpaqueSchemaGraph,
          };
        },
        deleteTemporaryProject: async () => {},
      };

      const mockAccount = {
        getGQLClient: async () => mockGQLClient,
        getWsClient: async () => ({ gqlSubscribe: () => () => {}, close: () => {} }),
        clearWsClient: () => {},
      } as unknown as Account;

      const useCase = new ExecuteCopilotUseCase(
        {
          copilotOutputRepository: mockCopilotOutputRepository,
          goldenSetRepository: mockGoldenSetRepository,
        },
        lifecycleWithImport,
        mockAccount,
      );

      await useCase.setupEnvironment({
        goldenSetId: validUUID,
        userInputId: validUUID,
        projectExId: "existing-proj-1",
      });

      expect(importExistingProjectCalled).toBe(true);
    });
  });
});
