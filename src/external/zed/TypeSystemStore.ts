/* eslint-disable unicorn/filename-case */
/* eslint-disable unicorn/no-null */

import { gql } from "graphql-request";
import { ZTypeSystem } from "./TypeSystem.ts";
import type { OpaqueSchemaGraph } from "./TypeSystem.ts";
import { Crdt } from "@functorz/crdt-helper";
import { fromUint8Array } from "js-base64";
import { getSchemaModelById } from "../../modules/shared/infrastructure/ali-oss.ts";
import {
  assertNotNull,
  genExtraContext,
  type ExtractArray,
} from "./helpers.ts";
import type { Account } from "../../modules/account/application/account-handler.ts";
import type {
  AfCustomCodeTemplatesQuery,
  FetchAppDetailByExIdQuery,
  FetchAppDetailByExIdQueryVariables,
  SupportedCustomModelDescriptorQuery,
} from "../../graphql/generated/types.ts";
// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

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
  public afCustomCodeTemplates: Exclude<
    ExtractArray<
      Exclude<AfCustomCodeTemplatesQuery["visibleAfCustomCodeTemplates"], null>
    >,
    null
  >[] = [];
  public supportedCustomModelDescriptor:
    | SupportedCustomModelDescriptorQuery["supportedCustomModelDescriptor"]
    | null = null;

  get schemaGraph(): OpaqueSchemaGraph | null {
    return this.currSchemaGraph;
  }

  constructor(private account: Account) {}

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
    SupportedCustomModelDescriptorQuery["supportedCustomModelDescriptor"]
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
    const fullSchema = {
      ...schemaJson,
      // server: latestBackendOnlyAppSchema, // For non-backend-editable apps
    };

    // 6. Parse to ZSchema and create SchemaGraph
    const zSchema = ZTypeSystem.parseZSchemaFromJsObject(fullSchema);
    const schemaGraph = this.withEnabledFeatures(() => {
      const extraContext = genExtraContext(
        {
          chatModelDescriptors:
            this.supportedCustomModelDescriptor?.chatModelDescriptors,
          embeddingModelDescriptors:
            this.supportedCustomModelDescriptor?.embeddingModelDescriptors,
          __typename: this.supportedCustomModelDescriptor?.__typename,
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
