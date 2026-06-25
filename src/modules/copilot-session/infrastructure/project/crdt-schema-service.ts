import { gql } from "graphql-tag";
import type {
  AfCustomCodeTemplatesQuery,
  FetchAppDetailByExIdQuery,
  FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project,
  FetchAppDetailByExIdQueryVariables,
  ImportProjectSchemaManualMutation,
  ImportProjectSchemaManualMutationVariables,
  SupportedCustomModelDescriptorQuery,
} from "../../../../graphql/generated/types.ts";
import type { IGQLClient } from "../../../account/domain/interface/graphql-client.interface.ts";
import { ZTypeCoreApi } from "../../../shared/domain/interface/type-system.ts";
import {
  genExtraContext,
  type ExtractArray,
} from "../../../shared/domain/service/type-system.service.ts";
import { getSchemaModelById } from "../../../shared/infrastructure/ali-oss.ts";
import { logger } from "../../../shared/infrastructure/logger.ts";
import type { ICrdtSchemaService } from "../interface/crdt-schema.interface.ts";
import { Crdt } from "@functorz/crdt-helper";
import { fromUint8Array } from "js-base64";

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
`;

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

type AfCustomCodeTemplates = Exclude<
  ExtractArray<
    Exclude<AfCustomCodeTemplatesQuery["visibleAfCustomCodeTemplates"], null>
  >,
  null
>[];

type SupportedCustomModelDescriptor =
  | {
      [K in keyof Exclude<
        SupportedCustomModelDescriptorQuery["supportedCustomModelDescriptor"],
        null
      >]: K extends "__typename"
        ? "SupportedCustomModelDescriptor"
        : (unknown | null)[] | null;
    }
  | null;

export class CrdtSchemaService implements ICrdtSchemaService {
  private async getCrdtModelBySchema(schemaId: string): Promise<string> {
    return fromUint8Array(
      new Uint8Array((await getSchemaModelById(schemaId)) as ArrayBufferLike),
    );
  }
  private withEnabledFeatures = <T>(function_: () => T): T => {
    return ZTypeCoreApi.withEnabledFeatures<T>([], function_);
  };

  private async getAFCustomCodeTemplates(
    gqlClient: IGQLClient,
  ): Promise<AfCustomCodeTemplates> {
    try {
      const data = await gqlClient.gqlRequest<AfCustomCodeTemplatesQuery>(
        AF_CUSTOM_CODE_TEMPLATES_QUERY,
      );
      if (!data.visibleAfCustomCodeTemplates) {
        throw new Error("No data returned for visibleAfCustomCodeTemplates");
      }
      return data.visibleAfCustomCodeTemplates.filter((item) => item !== null);
    } catch (error) {
      logger.error("Error fetching AF custom code templates:", error);
      throw error;
    }
  }

  private async getSupportedCustomModelDescriptor(
    gqlClient: IGQLClient,
  ): Promise<SupportedCustomModelDescriptor> {
    try {
      const { supportedCustomModelDescriptor } =
        await gqlClient.gqlRequest<SupportedCustomModelDescriptorQuery>(
          SUPPORTED_CUSTOM_MODEL_DESCRIPTOR_QUERY,
        );

      return supportedCustomModelDescriptor;
    } catch (error) {
      logger.error("Error fetching supported custom model descriptor:", error);
      throw error;
    }
  }

  async getSchemaGraph(
    schemaId: string,
    gqlClient: IGQLClient,
  ): Promise<unknown> {
    const crdtModel = await this.getCrdtModelBySchema(schemaId);
    const data = await this.getSupportedCustomModelDescriptor(gqlClient);
    const codeTemplates = await this.getAFCustomCodeTemplates(gqlClient);
    return this.withEnabledFeatures(() =>
      ZTypeCoreApi.resolveZSchemaToSchemaGraph(
        ZTypeCoreApi.parseZSchemaFromJsObject({
          ...Crdt.initModel(crdtModel).view(),
        }),
        genExtraContext(data, codeTemplates),
      ),
    );
  }
  async importSchema(
    schemaId: string,
    projectExId: string,
    gqlClient: IGQLClient,
  ): Promise<void> {
    const crdtModel = await this.getCrdtModelBySchema(schemaId);
    await gqlClient.gqlRequest<
      ImportProjectSchemaManualMutation,
      ImportProjectSchemaManualMutationVariables
    >(IMPORT_PROJECT_SCHEMA_MANUAL, { crdtModel, projectExId });
  }

  private getProjectDetails(
    data: FetchAppDetailByExIdQuery["fetchAppDetailByExId"],
  ): FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project {
    return data?.__typename === "Project" ? data : data!.project;
  }

  private getSchemaIdFromUrl = (url: string): string => {
    return new URL(url).pathname.split("/")[2];
  };

  private async fetchAppDetailByExId(
    projectExId: string,
    gqlClient: IGQLClient,
  ): Promise<FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project> {
    const data = await gqlClient.gqlRequest<
      FetchAppDetailByExIdQuery,
      FetchAppDetailByExIdQueryVariables
    >(FETCH_APP_DETAIL_QUERY, {
      projectExId: projectExId,
    });
    if (!data || !data.fetchAppDetailByExId) {
      throw new Error(
        `No data returned for fetchAppDetailByExId with projectExId: ${projectExId}`,
      );
    }
    return this.getProjectDetails(data.fetchAppDetailByExId);
  }

  async getSchemaIdByProjectExId(
    projectExId: string,
    gqlClient: IGQLClient,
  ): Promise<string> {
    const appDetail = await this.fetchAppDetailByExId(projectExId, gqlClient);
    const url = appDetail.latestSchema?.crdtModelUrl;
    if (!url) {
      throw new Error("No schema linked to this project");
    }
    return this.getSchemaIdFromUrl(url);
  }
}
