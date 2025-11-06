import { ZTypeSystem, type OpaqueSchemaGraph } from "./TypeSystem.ts";
import { logger } from "../logger.ts";
import { graphqlUtils } from "../graphql-utils.ts";
import { Crdt } from "@functorz/crdt-helper";

export class TypeSystemStore {
  private currSchemaGraph: OpaqueSchemaGraph | null = null;

  get schemaGraph(): OpaqueSchemaGraph | null {
    return this.currSchemaGraph;
  }

  async fetchAppDetailByExId(projectExId: string): Promise<{
    crdtModelUrl: string;
    crdtPatches?: {
      lastPatchExId: string;
      patches: Array<{ patchBase64: string }>;
    };
  } | null> {
    const query = `
      query FetchAppDetailByExId {
        fetchAppDetailByExId(
          projectExId: "${projectExId}"
          appExId: null
          appVersionExId: null
        ) {
          ... on WechatMiniProgramApp {
            lastUploadedSchema {
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
            lastUploadedSchema {
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
            lastUploadedSchema {
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
      const response = await graphqlUtils.accessEndpointWithQuery(query);
      const data = response as {
        data?: {
          fetchAppDetailByExId?: {
            lastUploadedSchema?: {
              crdtModelUrl: string;
              crdtPatches?: {
                lastPatchExId: string;
                patches: Array<{ patchBase64: string }>;
              };
            };
          };
        };
      };
      const lastUploadedSchema =
        data.data?.fetchAppDetailByExId?.lastUploadedSchema;

      if (lastUploadedSchema) {
        logger.info("Fetched lastUploadedSchema:", lastUploadedSchema);
        return lastUploadedSchema;
      } else {
        logger.warn("No lastUploadedSchema found for project:", projectExId);
        return null;
      }
    } catch (error) {
      logger.error("Error fetching app detail:", error);
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
    const patchBase64Strings = lastUploadedSchema.crdtPatches?.patches.map(
      (patch) => patch.patchBase64
    );
    const model = Crdt.initModelByBinary(
      modelBinary,
      patchBase64Strings as string[],
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
