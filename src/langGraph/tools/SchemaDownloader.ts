// FetchAppDetailsBySchemaId
import { tool } from 'langchain';
import * as z from 'zod';
import { TypeSystemStore } from '../../utils/zed/TypeSystemStore.ts';

/**
 * Safely stringify an object with circular references
 */
function safeStringify(obj: unknown): string {
  const seen = new WeakSet();
  return JSON.stringify(
    obj,
    (_key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      // Handle functions - skip them
      if (typeof value === 'function') {
        return undefined;
      }
      return value;
    },
    2
  );
}

export const schemaDownloader = tool(
  async (input: { projectExId: string }) => {
    const { projectExId } = input;

    if (!projectExId || typeof projectExId !== 'string') {
      throw new Error(`Invalid projectExId: ${JSON.stringify(input)}`);
    }

    const typeSystemStore = new TypeSystemStore();
    await typeSystemStore.rehydrate(projectExId);
    const schemaGraph = typeSystemStore.schemaGraph;
    if (!schemaGraph) {
      throw new Error('Failed to download schema graph.');
    }
    return safeStringify(schemaGraph);
  },
  {
    name: 'schema_downloader',
    description: 'Download the schema graph for a given projectExId.',
    schema: z.object({
      projectExId: z
        .string()
        .nonempty()
        .describe('The external ID of the project.'),
    }),
  }
);

export const SchemaDownloaderForTest = async (projectExId: string) => {
  const result = await schemaDownloader.invoke({ projectExId });
  return result;
};
