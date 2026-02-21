import { ZTypeSystem, type OpaqueSchemaGraph } from './TypeSystem.ts';
import { logger } from '../logger.ts';
import { graphqlUtils } from '../graphql-utils.ts';
import { Crdt } from '@functorz/crdt-helper';
import { login } from '../login.ts';
import { FUNCTORZ_PHONE_NUMBER, FUNCTORZ_PASSWORD } from '../../config/env.ts';
import { fromUint8Array } from 'js-base64';
import type { AfCustomCodeTemplates_visibleAfCustomCodeTemplates } from './AfCustomCodeTemplates.ts';
import type { SupportedCustomModelDescriptor_supportedCustomModelDescriptor } from './ZSchema.ts';

export class TypeSystemStore {
  private currSchemaGraph: OpaqueSchemaGraph | null = null;
  public afCustomCodeTemplates:
    | AfCustomCodeTemplates_visibleAfCustomCodeTemplates[] = [];
  public supportedCustomModelDescriptor: SupportedCustomModelDescriptor_supportedCustomModelDescriptor | null =
    null;

  get schemaGraph(): OpaqueSchemaGraph | null {
    return this.currSchemaGraph;
  }

  private async ensureAuthenticated(): Promise<void> {
    if (graphqlUtils.isTokenValid()) {
      logger.info('Access token is still valid');
      return;
    }

    logger.info('Access token expired or missing, logging in...');

    if (!FUNCTORZ_PHONE_NUMBER || !FUNCTORZ_PASSWORD) {
      throw new Error(
        'Missing FUNCTORZ_PHONE_NUMBER or FUNCTORZ_PASSWORD in environment variables',
      );
    }

    const accessToken = await login(FUNCTORZ_PHONE_NUMBER, FUNCTORZ_PASSWORD);
    graphqlUtils.setAccessToken(accessToken);
    logger.info('Successfully authenticated');
  }

  async fetchAppDetailByExId(projectExId: string): Promise<{
    crdtModelUrl: string;
    crdtPatches?: {
      lastPatchExId: string;
      patches: Array<{ patchBase64: string }>;
    };
  } | null> {
    // Use latestSchema instead of lastUploadedSchema (API change)
    const query = `
      query FetchAppDetailByExId {
        fetchAppDetailByExId(
          projectExId: "${projectExId}"
          appExId: null
          appVersionExId: null
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
        }
      }
    `;

    try {
      await this.ensureAuthenticated();
      const response = await graphqlUtils.accessEndpointWithQuery(query, true);
      const data = response as {
        data?: {
          fetchAppDetailByExId?: {
            latestSchema?: {
              crdtModelUrl: string;
              crdtPatches?: {
                lastPatchExId: string;
                patches: Array<{ patchBase64: string }>;
              };
            };
          };
        };
      };
      const latestSchema = data.data?.fetchAppDetailByExId?.latestSchema;
      logger.info('GraphQL response for fetchAppDetailByExId:', data);
      if (latestSchema) {
        logger.info('Fetched latestSchema:', latestSchema);
        return latestSchema;
      } else {
        logger.error('No latestSchema found for project:', projectExId);
        logger.debug('All information:');
        return null;
      }
    } catch (error) {
      logger.error('Error fetching app detail:', error);
      throw error;
    }
  }

  async getAFCustomCodeTemplates(): Promise<
    AfCustomCodeTemplates_visibleAfCustomCodeTemplates[]
  > {
    const query = `
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
    try {
      if (this.afCustomCodeTemplates) return this.afCustomCodeTemplates;
      await this.ensureAuthenticated();
      const result = await graphqlUtils.accessEndpointWithQuery(query, true);
      return (this.afCustomCodeTemplates =
        result as AfCustomCodeTemplates_visibleAfCustomCodeTemplates[]);
    } catch (error) {
      logger.error('Error fetching AF custom code templates:', error);
      throw error;
    }
  }

  async getSupportedCustomModelDescriptor(): Promise<SupportedCustomModelDescriptor_supportedCustomModelDescriptor> {
    const query = `
      query SupportedCustomModelDescriptor {
        supportedCustomModelDescriptor {
          chatModelDescriptors
          embeddingModelDescriptors
        }
      }
    `;
    try {
      if (this.supportedCustomModelDescriptor)
        return this.supportedCustomModelDescriptor;
      await this.ensureAuthenticated();
      const result = await graphqlUtils.accessEndpointWithQuery(query, true);
      this.supportedCustomModelDescriptor =
        result as SupportedCustomModelDescriptor_supportedCustomModelDescriptor;
      return this.supportedCustomModelDescriptor;
    } catch (error) {
      logger.error('Error fetching supported custom model descriptor:', error);
      throw error;
    }
  }

  async rehydrate(projectExId: string): Promise<OpaqueSchemaGraph> {
    const lastUploadedSchema = await this.fetchAppDetailByExId(projectExId);

    if (!lastUploadedSchema) {
      throw new Error(`No schema found for project: ${projectExId}`);
    }

    // 2. Download the binary CRDT model
    const response = await fetch(lastUploadedSchema.crdtModelUrl);
    const arrayBuffer = await response.arrayBuffer();
    const modelBinary = new Uint8Array(arrayBuffer);

    // 3. Initialize CRDT model and apply patches
    // Convert Uint8Array binary to base64 string for Crdt.initModel
    const binaryBase64 = fromUint8Array(modelBinary);

    // Get patch base64 strings
    const patchBase64Strings = lastUploadedSchema.crdtPatches?.patches?.map(
      (patch) => patch.patchBase64,
    );

    // Use Crdt.initModel which handles base64 conversion internally
    const model = Crdt.initModel(
      binaryBase64,
      patchBase64Strings && patchBase64Strings.length > 0
        ? patchBase64Strings
        : undefined,
    );

    // 4. Get the schema JSON
    const schemaJson = model.view();

    // 5. Merge with backend-only schema if needed
    const fullSchema = {
      ...schemaJson,
      // server: latestBackendOnlyAppSchema, // For non-backend-editable apps
    };

    // 6. Parse to ZSchema and create SchemaGraph
    const zSchema = ZTypeSystem.parseZSchemaFromJsObject(fullSchema);
    const schemaGraph = ZTypeSystem.resolveZSchemaToSchemaGraph(zSchema);

    this.currSchemaGraph = schemaGraph;
    return schemaGraph;
  }
}
