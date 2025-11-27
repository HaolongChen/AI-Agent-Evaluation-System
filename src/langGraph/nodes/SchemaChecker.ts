import { type RunnableConfig } from '@langchain/core/runnables';
import { HumanMessage } from '@langchain/core/messages';
import { rubricAnnotation } from '../state/index.ts';
import { getLLM } from '../llm/index.ts';
import * as z from 'zod';

const schemaCheckSchema = z.object({
  isSchemaNeeded: z.boolean().describe('Whether schema information is needed to evaluate the query'),
  reasoning: z.string().describe('Explanation of why schema is or is not needed'),
});

/**
 * Schema Checker Node
 * Determines if domain schema information is needed for evaluation
 */
export async function schemaCheckerNode(
  state: typeof rubricAnnotation.State,
  config?: RunnableConfig
): Promise<Partial<typeof rubricAnnotation.State>> {
  const provider = config?.configurable?.['provider'] || 'azure';
  const modelName = config?.configurable?.['model'] || 'gpt-4o';

  const llm = getLLM({ provider, model: modelName });
  const llmWithStructuredOutput = llm.withStructuredOutput(schemaCheckSchema);

  const prompt = `
You are a schema analysis expert. Analyze the following query, context, and candidate output to determine if domain schema information is needed for proper evaluation.

Schema information is typically needed when:
- The query involves database structures, entities, or relationships
- The evaluation requires understanding data models
- The candidate output references specific data types or schema elements
- Domain-specific validation rules depend on schema constraints

Query: """${state.query}"""

Context: """${state.context || 'No additional context provided.'}"""

Candidate Output: """${state.candidateOutput || 'No candidate output provided.'}"""

Determine if schema information is needed and explain your reasoning.
`;

  const response = await llmWithStructuredOutput.invoke([new HumanMessage(prompt)], config);

  const timestamp = new Date().toISOString();
  const auditEntry = `[${timestamp}] SchemaChecker: Schema needed: ${response.isSchemaNeeded}. Reasoning: ${response.reasoning}`;

  return {
    schemaNeeded: response.isSchemaNeeded,
    auditTrace: [auditEntry],
  };
}
