import { type RunnableConfig } from '@langchain/core/runnables';
import { HumanMessage } from '@langchain/core/messages';
import { rubricAnnotation, Evaluation, EvaluationScore } from '../state/index.ts';
import { getLLM } from '../llm/index.ts';
import * as z from 'zod';

const evaluationScoreSchema = z.object({
  criterionId: z.string().describe('ID of the criterion being scored'),
  criterionName: z.string().describe('Name of the criterion'),
  score: z.number().describe('Score for this criterion'),
  reasoning: z.string().describe('Detailed reasoning for the score'),
  evidence: z.array(z.string()).optional().describe('Specific evidence from the candidate output'),
});

const agentEvaluationSchema = z.object({
  scores: z.array(evaluationScoreSchema).describe('Scores for each criterion'),
  overallAssessment: z.string().describe('Overall assessment summary'),
});

/**
 * Agent Evaluator Node
 * Applies rubric to produce structured agent evaluation
 */
export async function agentEvaluatorNode(
  state: typeof rubricAnnotation.State,
  config?: RunnableConfig
): Promise<Partial<typeof rubricAnnotation.State>> {
  const provider = config?.configurable?.['provider'] || 'azure';
  const modelName = config?.configurable?.['model'] || 'gpt-4o';

  if (!state.rubricFinal) {
    throw new Error('No final rubric available for evaluation');
  }

  const llm = getLLM({ provider, model: modelName });
  const llmWithStructuredOutput = llm.withStructuredOutput(agentEvaluationSchema);

  // Build criteria description for prompt
  const criteriaDescription = state.rubricFinal.criteria
    .map((c) => `
- ${c.name} (ID: ${c.id})
  Description: ${c.description}
  Weight: ${c.weight}%
  Score Range: ${c.scoringScale.min} - ${c.scoringScale.max}
  Type: ${c.isHardConstraint ? 'Hard Constraint' : 'Soft Constraint'}
`)
    .join('\n');

  const prompt = `
You are an expert evaluator. Apply the following evaluation rubric to assess the candidate output.

Query: """${state.query}"""

Context: """${state.context || 'No additional context provided.'}"""

Schema Information: """${state.schemaExpression || 'No schema information available.'}"""

Candidate Output to Evaluate: """${state.candidateOutput || 'No candidate output provided.'}"""

EVALUATION RUBRIC:
${criteriaDescription}

For each criterion:
1. Provide a score within the specified range
2. Explain your reasoning in detail
3. Cite specific evidence from the candidate output

Be objective and thorough in your assessment.
`;

  const response = await llmWithStructuredOutput.invoke([new HumanMessage(prompt)], config);

  // Transform response into Evaluation format
  const scores: EvaluationScore[] = response.scores.map((s) => ({
    criterionId: s.criterionId,
    score: s.score,
    reasoning: s.reasoning,
    evidence: s.evidence,
  }));

  // Calculate weighted overall score
  const totalWeight = state.rubricFinal.criteria.reduce((sum, c) => sum + c.weight, 0);
  let weightedSum = 0;

  for (const score of scores) {
    const criterion = state.rubricFinal.criteria.find((c) => c.id === score.criterionId);
    if (criterion) {
      const normalizedScore = (score.score - criterion.scoringScale.min) / 
        (criterion.scoringScale.max - criterion.scoringScale.min);
      weightedSum += normalizedScore * criterion.weight;
    }
  }

  const overallScore = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;

  const evaluation: Evaluation = {
    evaluatorType: 'agent',
    scores,
    overallScore: Math.round(overallScore * 100) / 100,
    summary: response.overallAssessment,
    timestamp: new Date().toISOString(),
  };

  // Extract hard constraint answers for backward compatibility
  const hardConstraintsAnswers = state.rubricFinal.criteria
    .filter((c) => c.isHardConstraint)
    .map((c) => {
      const score = scores.find((s) => s.criterionId === c.id);
      if (!score) return false;
      const threshold = (c.scoringScale.max - c.scoringScale.min) * 0.7 + c.scoringScale.min;
      return score.score >= threshold;
    });

  // Extract soft constraint answers for backward compatibility
  const softConstraintsAnswers = state.rubricFinal.criteria
    .filter((c) => !c.isHardConstraint)
    .map((c) => {
      const score = scores.find((s) => s.criterionId === c.id);
      return score ? `${c.name}: ${score.score}/${c.scoringScale.max} - ${score.reasoning}` : `${c.name}: Not evaluated`;
    });

  const timestamp = new Date().toISOString();
  const auditEntry = `[${timestamp}] AgentEvaluator: Completed evaluation. Overall score: ${evaluation.overallScore}%`;

  return {
    agentEvaluation: evaluation,
    hardConstraintsAnswers,
    softConstraintsAnswers,
    auditTrace: [auditEntry],
  };
}
