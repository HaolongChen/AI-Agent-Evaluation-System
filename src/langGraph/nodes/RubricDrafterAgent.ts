import { type RunnableConfig } from '@langchain/core/runnables';
import { HumanMessage } from '@langchain/core/messages';
import { rubricAnnotation, Rubric, RubricCriterion } from '../state/index.ts';
import { getLLM } from '../llm/index.ts';
import * as z from 'zod';

const rubricCriterionSchema = z.object({
  name: z.string().describe('Name of the evaluation criterion'),
  description: z.string().describe('Detailed description of what this criterion evaluates'),
  weight: z.number().min(0).max(100).describe('Weight of this criterion (0-100)'),
  minScore: z.number().describe('Minimum score for this criterion'),
  maxScore: z.number().describe('Maximum score for this criterion'),
  isHardConstraint: z.boolean().describe('Whether this is a hard constraint (must pass) or soft constraint'),
});

const rubricDraftSchema = z.object({
  criteria: z.array(rubricCriterionSchema).describe('List of evaluation criteria'),
  rationale: z.string().describe('Explanation of why these criteria were chosen'),
});

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Rubric Drafter Node
 * Produces rubric draft with criteria and scoring scales
 */
export async function rubricDrafterNode(
  state: typeof rubricAnnotation.State,
  config?: RunnableConfig
): Promise<Partial<typeof rubricAnnotation.State>> {
  const provider = config?.configurable?.['provider'] || 'azure';
  const modelName = config?.configurable?.['model'] || 'gpt-4o';

  const llm = getLLM({ provider, model: modelName });
  const llmWithStructuredOutput = llm.withStructuredOutput(rubricDraftSchema);

  const prompt = `
You are an evaluation rubric expert. Based on the query, context, and schema information, create a comprehensive evaluation rubric.

Query: """${state.query}"""

Context: """${state.context || 'No additional context provided.'}"""

Candidate Output to Evaluate: """${state.candidateOutput || 'No candidate output provided.'}"""

Schema Expression: """${state.schemaExpression || 'No schema information available.'}"""

Create evaluation criteria that:
1. Cover all important aspects of the expected output
2. Include both hard constraints (must pass) and soft constraints (quality indicators)
3. Have clear scoring scales
4. Are weighted by importance

Hard constraints examples: correctness, completeness, safety
Soft constraints examples: clarity, efficiency, best practices

Generate 3-7 criteria with appropriate weights that sum to 100.
`;

  const response = await llmWithStructuredOutput.invoke([new HumanMessage(prompt)], config);

  // Transform LLM response into Rubric format
  const criteria: RubricCriterion[] = response.criteria.map((c) => ({
    id: generateId(),
    name: c.name,
    description: c.description,
    weight: c.weight,
    scoringScale: {
      min: c.minScore,
      max: c.maxScore,
    },
    isHardConstraint: c.isHardConstraint,
  }));

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const now = new Date().toISOString();

  const rubricDraft: Rubric = {
    id: generateId(),
    version: '1.0.0',
    criteria,
    totalWeight,
    createdAt: now,
    updatedAt: now,
  };

  // Extract hard and soft constraints for backward compatibility
  const hardConstraints = criteria
    .filter((c) => c.isHardConstraint)
    .map((c) => `${c.name}: ${c.description}`);
  
  const softConstraints = criteria
    .filter((c) => !c.isHardConstraint)
    .map((c) => `${c.name}: ${c.description}`);

  const timestamp = new Date().toISOString();
  const auditEntry = `[${timestamp}] RubricDrafter: Created rubric with ${criteria.length} criteria (${hardConstraints.length} hard, ${softConstraints.length} soft). Rationale: ${response.rationale}`;

  return {
    rubricDraft,
    hardConstraints,
    softConstraints,
    rubricApproved: false,
    auditTrace: [auditEntry],
  };
}
