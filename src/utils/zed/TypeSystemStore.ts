import { ZTypeSystem, type OpaqueSchemaGraph } from './TypeSystem.ts';
import { logger } from '../logger.ts';
import { graphqlUtils } from '../graphql-utils.ts';

export class TypeSystemStore {
  private currSchemaGraph: OpaqueSchemaGraph | null = null;

  get schemaGraph(): OpaqueSchemaGraph | null {
    return this.currSchemaGraph;
  }

  async fetchAppDetailByExId(projectExId: string): Promise<string | null> {
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
            }
          }
          ... on Project {
            lastUploadedSchema {
              crdtModelUrl
            }
          }
          ... on WebApp {
            lastUploadedSchema {
              crdtModelUrl
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
            lastUploadedSchema?: { crdtModelUrl?: string };
          };
        };
      };
      const crdtModelUrl =
        data.data?.fetchAppDetailByExId?.lastUploadedSchema?.crdtModelUrl;

      if (crdtModelUrl) {
        logger.info('Fetched crdtModelUrl:', crdtModelUrl);
        return crdtModelUrl;
      } else {
        logger.warn('No crdtModelUrl found for project:', projectExId);
        return null;
      }
    } catch (error) {
      logger.error('Error fetching app detail:', error);
      throw error;
    }
  }

  async rehydrate(projectExId: string): Promise<void> {
    const crdtModelUrl = await this.fetchAppDetailByExId(projectExId);

    if (!crdtModelUrl) {
      throw new Error(`No schema found for project: ${projectExId}`);
    }

    // TODO: Fetch the schema from crdtModelUrl and parse it
    // const zSchema = await fetchAndParseSchema(crdtModelUrl);
    // this.currSchemaGraph = ZTypeSystem.resolveZSchemaToSchemaGraph(zSchema);

    logger.info('Schema URL fetched, ready to rehydrate:', crdtModelUrl);
  }
}
