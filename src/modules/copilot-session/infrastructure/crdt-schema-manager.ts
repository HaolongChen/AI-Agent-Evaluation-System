/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unicorn/no-null */

import { gql } from "graphql-tag";
import { ZTypeCoreApi } from "../../shared/domain/interface/type-system.ts";
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
  ImportProjectSchemaManualMutation,
  ImportProjectSchemaManualMutationVariables,
  SupportedCustomModelDescriptorQuery,
} from "../../../graphql/generated/types.ts";
import { logger } from "../../shared/infrastructure/logger.ts";
import type { IGQLClient } from "../../shared/domain/interface/graphql-client.interface.ts";
import type {
  ICrdtSchemaLifecycle,
  ICrdtSchemaLifecycleFactory,
} from "../domain/interface/crdt-schema-lifecycle.interface.ts";
// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

const PROJECT_APP_DETAIL_FRAGMENT = gql`
  fragment ProjectAppDetail on Project {
    latestSchema {
      crdtModelUrl
      crdtPatches {
        lastPatchExId
        patches {
          patchBase64
        }
      }
    }
    projectExId
    schemaExId
    zeroUrl
    zeroSubscriptionUrl
    projectName
    appExId
    adminToken
    category
    type
    projectSpace {
      projectSpaceType
    }
  }
`.definitions;

const WECHAT_MINI_PROGRAM_APP_DETAIL_FRAGMENT = gql`
  fragment WechatMiniProgramAppDetail on WechatMiniProgramApp {
    latestSchema {
      crdtModelUrl
      crdtPatches {
        lastPatchExId
        patches {
          patchBase64
        }
      }
    }
    exId
    projectExId
    name
    appExId
    project {
      ...ProjectAppDetail
    }
  }
  ${PROJECT_APP_DETAIL_FRAGMENT}
`;

const WEB_APP_DETAIL_FRAGMENT = gql`
  fragment WebAppDetail on WebApp {
    latestSchema {
      crdtModelUrl
      crdtPatches {
        lastPatchExId
        patches {
          patchBase64
        }
      }
    }
    exId
    name
    projectExId
    appExId
    project {
      ...ProjectAppDetail
    }
  }
  ${PROJECT_APP_DETAIL_FRAGMENT}
`;

const MOBILE_APP_DETAIL_FRAGMENT = gql`
  fragment MobileAppDetail on MobileApp {
    latestSchema {
      crdtModelUrl
      crdtPatches {
        lastPatchExId
        patches {
          patchBase64
        }
      }
    }
    exId
    name
    projectExId
    appExId
    project {
      ...ProjectAppDetail
    }
  }
  ${PROJECT_APP_DETAIL_FRAGMENT}
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
      __typename
      ...WechatMiniProgramAppDetail
      ...WebAppDetail
      ...ProjectAppDetail
      ...MobileAppDetail
    }
  }

  ${WECHAT_MINI_PROGRAM_APP_DETAIL_FRAGMENT}
  ${WEB_APP_DETAIL_FRAGMENT}
  ${PROJECT_APP_DETAIL_FRAGMENT}
  ${MOBILE_APP_DETAIL_FRAGMENT}
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

const IMPORT_PROJECT_SCHEMA_MANUAL = gql`
  mutation ImportProjectSchemaManual(
    $projectExId: String!
    $crdtModel: Base64String!
    $appExId: String
    $versionExId: String
  ) {
    importProjectSchemaManual(
      projectExId: $projectExId
      crdtModel: $crdtModel
      appExId: $appExId
      versionExId: $versionExId
    )
  }
`;

export type AfCustomCodeTemplates = Exclude<
  ExtractArray<
    Exclude<AfCustomCodeTemplatesQuery["visibleAfCustomCodeTemplates"], null>
  >,
  null
>[];

export type SupportedCustomModelDescriptor =
  | {
      [K in keyof Exclude<
        SupportedCustomModelDescriptorQuery["supportedCustomModelDescriptor"],
        null
      >]: K extends "__typename"
        ? "SupportedCustomModelDescriptor"
        : (any | null)[] | null;
    }
  | null;

// ---------------------------------------------------------------------------
// TypeSystemStore
// ---------------------------------------------------------------------------

export class TypeSystemStoreFactory implements ICrdtSchemaLifecycleFactory {
  constructor(
    private gqlClient: IGQLClient,
    private dangerousGQLClient: IGQLClient,
  ) {}
  create(projectExId: string): ICrdtSchemaLifecycle {
    return new TypeSystemStore(
      projectExId,
      this.dangerousGQLClient,
      this.gqlClient,
    );
  }
}

export class TypeSystemStore implements ICrdtSchemaLifecycle {
  private currSchemaGraph: OpaqueSchemaGraph | null = null;
  private schema: object | null = null;
  private crdtSchemaModel: string | null = null;
  private appDetail: FetchAppDetailByExIdQuery["fetchAppDetailByExId"] = null;
  public afCustomCodeTemplates: AfCustomCodeTemplates = [];
  public supportedCustomModelDescriptor: SupportedCustomModelDescriptor = null;

  async schemaGraph(): Promise<OpaqueSchemaGraph> {
    if (this.currSchemaGraph) {
      return this.currSchemaGraph;
    }
    return this.rehydrate();
  }

  async getProjectInfo() {
    if (!this.appDetail) {
      logger.error(
        "App detail is not initialized when getting project info for projectExId:",
        this.projectExId,
      );
      await this.fetchAppDetailByExId();
      if (!this.appDetail) {
        throw new Error(
          "Failed to fetch app detail for projectExId: " + this.projectExId,
        );
      }
    }
    return this.appDetail.__typename === "Project"
      ? this.appDetail
      : this.appDetail.project;
  }

  constructor(
    private projectExId: string,
    private dangerousGQLClient: IGQLClient,
    private gqlClient: IGQLClient,
  ) {}

  async importSchemaManual(schemaId: string): Promise<void> {
    if (!this.appDetail) {
      throw new Error("App detail is required for importing schema");
    }
    await this.rehydrate(schemaId);
    const mutationData = await this.dangerousGQLClient.gqlRequest<
      ImportProjectSchemaManualMutation,
      ImportProjectSchemaManualMutationVariables
    >(IMPORT_PROJECT_SCHEMA_MANUAL, {
      crdtModel: this.crdtSchemaModel,
      projectExId: this.projectExId,
      appExId: this.appDetail.appExId ?? undefined,
    });

    if (!mutationData.importProjectSchemaManual) {
      throw new Error("Failed to import project schema using CRDT model");
    }

    logger.info(
      "Successfully imported project schema using CRDT model with response:",
      mutationData.importProjectSchemaManual,
    );
  }

  async getSchemaId(): Promise<string> {
    if (!this.appDetail?.latestSchema?.crdtModelUrl) {
      logger.error("App detail or CRDT model URL is missing:", {
        appDetail: this.appDetail,
      });
      await this.fetchAppDetailByExId();
      if (!this.appDetail?.latestSchema?.crdtModelUrl) {
        throw new Error("CRDT model URL is missing in app detail");
      }
    }
    const path = new URL(
      this.appDetail.latestSchema.crdtModelUrl,
    ).pathname.split("/");
    return path[2];
  }

  async fetchAppDetailByExId() {
    try {
      const data = await this.gqlClient.gqlRequest<
        FetchAppDetailByExIdQuery,
        FetchAppDetailByExIdQueryVariables
      >(FETCH_APP_DETAIL_QUERY, {
        projectExId: this.projectExId,
      });
      if (!data || !data.fetchAppDetailByExId) {
        throw new Error(
          `No data returned for fetchAppDetailByExId with projectExId: ${this.projectExId}`,
        );
      }

      this.appDetail = data.fetchAppDetailByExId;
      logger.info("fetched app detail:", this.appDetail);
    } catch (error) {
      logger.error("Error fetching app detail:", error);
      throw error;
    }
  }

  private async getAFCustomCodeTemplates(): Promise<AfCustomCodeTemplates> {
    try {
      if (this.afCustomCodeTemplates.length > 0)
        return this.afCustomCodeTemplates;
      const data = await this.gqlClient.gqlRequest<AfCustomCodeTemplatesQuery>(
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
      logger.error("Error fetching AF custom code templates:", error);
      throw error;
    }
  }

  private async getSupportedCustomModelDescriptor(): Promise<
    typeof this.supportedCustomModelDescriptor
  > {
    try {
      if (this.supportedCustomModelDescriptor)
        return this.supportedCustomModelDescriptor;
      const SupportedCustomModelDescriptor =
        await this.gqlClient.gqlRequest<SupportedCustomModelDescriptorQuery>(
          SUPPORTED_CUSTOM_MODEL_DESCRIPTOR_QUERY,
        );

      this.supportedCustomModelDescriptor =
        SupportedCustomModelDescriptor.supportedCustomModelDescriptor;
      return this.supportedCustomModelDescriptor;
    } catch (error) {
      logger.error("Error fetching supported custom model descriptor:", error);
      throw error;
    }
  }

  async rehydrate(schemaId?: string): Promise<OpaqueSchemaGraph> {
    const arrayBuffer = await getSchemaModelById(
      schemaId || (await this.getSchemaId()),
    );
    await this.getAFCustomCodeTemplates();
    await this.getSupportedCustomModelDescriptor();
    const modelBinary = new Uint8Array(arrayBuffer);

    this.crdtSchemaModel = fromUint8Array(modelBinary);

    // Use Crdt.initModel which handles base64 conversion internally
    const model = Crdt.initModel(this.crdtSchemaModel);

    // 4. Get the schema JSON
    const schemaJson = model.view();

    // 5. Merge with backend-only schema if needed
    this.schema = {
      ...schemaJson,
      // server: latestBackendOnlyAppSchema, // For non-backend-editable apps
    };

    // 6. Parse to ZSchema and create SchemaGraph
    const zSchema = ZTypeCoreApi.parseZSchemaFromJsObject(this.schema);
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
      return ZTypeCoreApi.resolveZSchemaToSchemaGraph(
        assertNotNull(zSchema),
        extraContext,
      );
    });
    this.currSchemaGraph = schemaGraph;
    return schemaGraph;
  }

  private withEnabledFeatures = <T>(function_: () => T): T => {
    return ZTypeCoreApi.withEnabledFeatures<T>([], function_);
  };
}
