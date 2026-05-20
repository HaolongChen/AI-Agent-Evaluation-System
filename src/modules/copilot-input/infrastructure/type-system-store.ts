/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unicorn/no-null */

import { gql } from "graphql-request";
import { ZTypeSystem } from "../../shared/domain/interface/type-system.ts";
import type { OpaqueSchemaGraph } from "../../shared/domain/interface/type-system.ts";
import { Crdt } from "@functorz/crdt-helper";
import { fromUint8Array } from "js-base64";
import { getSchemaModelById } from "../../shared/infrastructure/ali-oss.ts";
import {
  assertNotNull,
  genExtraContext,
  type ExtractArray,
} from "../../shared/domain/service/type-system.service.ts";
import type {
  AfCustomCodeTemplatesQuery,
  FetchAppDetailByExIdQuery,
  FetchAppDetailByExIdQueryVariables,
  ImportProjectSchemaJsonManualMutation,
  ImportProjectSchemaJsonManualMutationVariables,
  SupportedCustomModelDescriptorQuery,
} from "../../../graphql/generated/types.ts";
import type { Account } from "../../account/application/account-handler.ts";
// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

const IMPORT_PROJECT_SCHEMA = gql`
  mutation ImportProjectSchemaJsonManual(
    $schema: Json!
    $projectExId: String!
    $appExId: String
    $versionExId: String
  ) {
    importProjectSchemaJsonManual(
      schema: $schema
      projectExId: $projectExId
      appExId: $appExId
      versionExId: $versionExId
    )
  }
`;

const FETCH_APP_DETAIL_QUERY = gql`
  query FetchAppDetailByExId(
    $projectExId: String!
    $appExId: String
    $appVersionExId: String
  ) {
    fetchAppDetailByExId(
      projectExId: $projectExId
      appExId: $appExId
      appVersionExId: $appVersionExId
    ) {
      ... on WechatMiniProgramApp {
        latestSchema {
          crdtModelUrl
          crdtPatches {
            lastPatchExId
            patches {
              patchBase64
            }
          }
        }
      }
      ... on Project {
        latestSchema {
          crdtModelUrl
          crdtPatches {
            lastPatchExId
            patches {
              patchBase64
            }
          }
        }
      }
      ... on WebApp {
        latestSchema {
          crdtModelUrl
          crdtPatches {
            lastPatchExId
            patches {
              patchBase64
            }
          }
        }
      }
      ... on MobileApp {
        latestSchema {
          crdtModelUrl
          crdtPatches {
            lastPatchExId
            patches {
              patchBase64
            }
          }
        }
      }
    }
  }
`;

const AF_CUSTOM_CODE_TEMPLATES_QUERY = gql`
  query AfCustomCodeTemplates {
    visibleAfCustomCodeTemplates {
      async
      exId
      author
      displayName
      inputType {
        ... on NodeTemplateVariable {
          name
          type
          defaultValue
          required
          description
        }
      }
      logoUrl
      outputType {
        ... on NodeTemplateVariable {
          name
          type
          defaultValue
          required
          description
        }
      }
      status
      templateGroup
      updatedAt
      version
    }
  }
`;

const SUPPORTED_CUSTOM_MODEL_DESCRIPTOR_QUERY = gql`
  query SupportedCustomModelDescriptor {
    supportedCustomModelDescriptor {
      chatModelDescriptors
      embeddingModelDescriptors
    }
  }
`;

// ---------------------------------------------------------------------------
// TypeSystemStore
// ---------------------------------------------------------------------------

export class TypeSystemStore {
  private currSchemaGraph: OpaqueSchemaGraph | null = null;
  private schema: object | null = null;
  public afCustomCodeTemplates: Exclude<
    ExtractArray<
      Exclude<AfCustomCodeTemplatesQuery["visibleAfCustomCodeTemplates"], null>
    >,
    null
  >[] = [];
  public supportedCustomModelDescriptor:
    | {
        [K in keyof Exclude<
          SupportedCustomModelDescriptorQuery["supportedCustomModelDescriptor"],
          null
        >]: K extends "__typename"
          ? "SupportedCustomModelDescriptor"
          : (any | null)[] | null;
      }
    | null = null;

  get schemaGraph(): OpaqueSchemaGraph | null {
    return this.currSchemaGraph;
  }

  constructor(private account: Account) {}

  simpleSchemaIdValidation(schemaId: string): boolean {
    // Simple validation to check if the schemaId is a non-empty string
    if (schemaId.trim().length === 0) {
      console.error("Invalid schemaId: Schema ID cannot be an empty string.");
      return false;
    }
    if (!/^[0-9]+$/.test(schemaId)) {
      console.error("Invalid schemaId: Schema ID must be a numeric string.");
      return false;
    }
    return true;
  }

  async importSchemaJsonManual(
    projectExId: string,
    appExId?: string,
    versionExId?: string,
  ) {
    if (!this.schema) {
      throw new Error("No schema available to import");
    }
    const gqlClient = await this.account.getGQLClient();
    const mutationData = await gqlClient.gqlRequest<
      ImportProjectSchemaJsonManualMutation,
      ImportProjectSchemaJsonManualMutationVariables
    >(IMPORT_PROJECT_SCHEMA, {
      schema: this.schema,
      projectExId,
      appExId,
      versionExId,
    });
    if (!mutationData.importProjectSchemaJsonManual) {
      throw new Error("Failed to import project schema");
    }
    console.log(
      "Successfully imported project schema with response:",
      mutationData.importProjectSchemaJsonManual,
    );
  }

  getSchemaIdFromCrdtModelUrl(crdtModelUrl: string): string {
    const path = new URL(crdtModelUrl).pathname.split("/");
    if (this.simpleSchemaIdValidation(path[2])) {
      return path[2];
    }
    throw new Error(`Invalid schemaId extracted from crdtModelUrl: ${path[2]}`);
  }

  async fetchAppDetailByExId(projectExId: string) {
    try {
      const gqlClient = await this.account.getGQLClient();
      const data = await gqlClient.gqlRequest<
        FetchAppDetailByExIdQuery,
        FetchAppDetailByExIdQueryVariables
      >(FETCH_APP_DETAIL_QUERY, {
        projectExId,
      });
      if (!data || !data.fetchAppDetailByExId) {
        throw new Error(
          `No data returned for fetchAppDetailByExId with projectExId: ${projectExId}`,
        );
      }

      const latestSchema = data.fetchAppDetailByExId?.latestSchema;
      console.info("GraphQL response for fetchAppDetailByExId:", data);

      if (latestSchema) {
        console.info("Fetched latestSchema:", latestSchema);
        return latestSchema;
      } else {
        throw new Error(
          `No latestSchema found in fetchAppDetailByExId response for projectExId: ${projectExId}`,
        );
      }
    } catch (error) {
      console.error("Error fetching app detail:", error);
      throw error;
    }
  }

  async getAFCustomCodeTemplates(): Promise<
    Exclude<
      ExtractArray<
        Exclude<
          AfCustomCodeTemplatesQuery["visibleAfCustomCodeTemplates"],
          null
        >
      >,
      null
    >[]
  > {
    try {
      if (this.afCustomCodeTemplates.length > 0)
        return this.afCustomCodeTemplates;
      const gqlClient = await this.account.getGQLClient();
      const data = await gqlClient.gqlRequest<AfCustomCodeTemplatesQuery>(
        AF_CUSTOM_CODE_TEMPLATES_QUERY,
      );
      if (!data.visibleAfCustomCodeTemplates) {
        throw new Error("No data returned for visibleAfCustomCodeTemplates");
      }
      this.afCustomCodeTemplates = data.visibleAfCustomCodeTemplates.filter(
        (item) => item !== null,
      );
      return this.afCustomCodeTemplates;
    } catch (error) {
      console.error("Error fetching AF custom code templates:", error);
      throw error;
    }
  }

  async getSupportedCustomModelDescriptor(): Promise<
    typeof this.supportedCustomModelDescriptor
  > {
    try {
      if (this.supportedCustomModelDescriptor)
        return this.supportedCustomModelDescriptor;
      const gqlClient = await this.account.getGQLClient();
      const SupportedCustomModelDescriptor =
        await gqlClient.gqlRequest<SupportedCustomModelDescriptorQuery>(
          SUPPORTED_CUSTOM_MODEL_DESCRIPTOR_QUERY,
        );

      this.supportedCustomModelDescriptor =
        SupportedCustomModelDescriptor.supportedCustomModelDescriptor;
      return this.supportedCustomModelDescriptor;
    } catch (error) {
      console.error("Error fetching supported custom model descriptor:", error);
      throw error;
    }
  }

  async rehydrate(schemaId: string): Promise<OpaqueSchemaGraph> {
    const arrayBuffer = await getSchemaModelById(schemaId);
    const modelBinary = new Uint8Array(arrayBuffer);

    console.debug("step 2 done, modelBinary length: " + modelBinary.length);

    const binaryBase64 = fromUint8Array(modelBinary);
    // Use Crdt.initModel which handles base64 conversion internally
    const model = Crdt.initModel(binaryBase64);

    // 4. Get the schema JSON
    const schemaJson = model.view();

    // 5. Merge with backend-only schema if needed
    this.schema = {
      ...schemaJson,
      // server: latestBackendOnlyAppSchema, // For non-backend-editable apps
    };

    // 6. Parse to ZSchema and create SchemaGraph
    const zSchema = ZTypeSystem.parseZSchemaFromJsObject(this.schema);
    const schemaGraph = this.withEnabledFeatures(() => {
      const extraContext = genExtraContext(
        {
          chatModelDescriptors:
            this.supportedCustomModelDescriptor?.chatModelDescriptors ?? null,
          embeddingModelDescriptors:
            this.supportedCustomModelDescriptor?.embeddingModelDescriptors ??
            null,
          __typename:
            this.supportedCustomModelDescriptor?.__typename ??
            "SupportedCustomModelDescriptor",
        },
        this.afCustomCodeTemplates,
      );
      return ZTypeSystem.resolveZSchemaToSchemaGraph(
        assertNotNull(zSchema),
        extraContext,
      );
    });
    this.currSchemaGraph = schemaGraph;
    return schemaGraph;
  }

  public withEnabledFeatures = <T>(function_: () => T): T => {
    return ZTypeSystem.withEnabledFeatures<T>([], function_);
  };
}

export const getTypeSystemStoreForCopilot = async (
  schemaId: string,
  account: Account,
): Promise<TypeSystemStore> => {
  const typeSystemStore = new TypeSystemStore(account);
  await Promise.all([
    typeSystemStore.getAFCustomCodeTemplates(),
    typeSystemStore.getSupportedCustomModelDescriptor(),
    typeSystemStore.rehydrate(schemaId),
  ]);
  return typeSystemStore;
};
