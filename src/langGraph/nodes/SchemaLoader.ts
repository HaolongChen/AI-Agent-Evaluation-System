import { type RunnableConfig } from '@langchain/core/runnables';
import { HumanMessage } from '@langchain/core/messages';
import { rubricAnnotation } from '../state/index.ts';
import { getLLM } from '../llm/index.ts';
import { SchemaDownloaderForTest } from '../tools/SchemaDownloader.ts';
import * as z from 'zod';

const schemaExpressionSchema = z.object({
  schemaExpression: z.string().describe('A concise natural language expression of the relevant schema elements'),
  keyEntities: z.array(z.string()).describe('List of key entities identified in the schema'),
  keyRelationships: z.array(z.string()).describe('List of key relationships identified in the schema'),
});

/**
 * Schema Loader Node
 * Loads schema from the project and generates schema expressions
 */
export async function schemaLoaderNode(
  state: typeof rubricAnnotation.State,
  config?: RunnableConfig
): Promise<Partial<typeof rubricAnnotation.State>> {
  const provider = config?.configurable?.['provider'] || 'azure';
  const modelName = config?.configurable?.['model'] || 'gpt-4o';
  const projectExId = config?.configurable?.['projectExId'] as string | undefined;

  // If schema is not needed, skip loading
  if (!state.schemaNeeded) {
    const timestamp = new Date().toISOString();
    const auditEntry = `[${timestamp}] SchemaLoader: Skipped - schema not needed`;
    return {
      schema: null,
      schemaExpression: '',
      auditTrace: [auditEntry],
    };
  }

  // Try to load schema if projectExId is provided
  let schemaData: object | null = null;
  let schemaString = '';

  if (projectExId) {
    try {
      schemaString = await SchemaDownloaderForTest(projectExId);
      schemaData = JSON.parse(schemaString) as object;
    } catch (error) {
      console.error('Error loading schema:', error);
      schemaString = `Error loading schema: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  // Generate schema expression using LLM
  const llm = getLLM({ provider, model: modelName });
  const llmWithStructuredOutput = llm.withStructuredOutput(schemaExpressionSchema);

  const prompt = `
You are a schema analyst. Analyze the provided schema information and generate a concise natural language expression that captures the essential structure.

Query Context: """${state.query}"""

Schema Information: """${schemaString || 'No schema available'}"""

Generate:
1. A natural language expression summarizing the relevant schema elements
2. A list of key entities
3. A list of key relationships

Focus on elements relevant to evaluating the query.
`;

  const response = await llmWithStructuredOutput.invoke([new HumanMessage(prompt)], config);

  const timestamp = new Date().toISOString();
  const auditEntry = `[${timestamp}] SchemaLoader: Loaded schema with ${response.keyEntities.length} entities and ${response.keyRelationships.length} relationships`;

  return {
    schema: schemaData,
    schemaExpression: response.schemaExpression,
    auditTrace: [auditEntry],
  };
}
