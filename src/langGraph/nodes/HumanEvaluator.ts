import { type RunnableConfig } from '@langchain/core/runnables';
import { interrupt } from '@langchain/langgraph';
import { rubricAnnotation, Evaluation, EvaluationScore } from '../state/index.ts';

export interface HumanEvaluationInput {
  scores: Array<{
    criterionId: string;
    score: number;
    reasoning: string;
  }>;
  overallAssessment: string;
}

/**
 * Human Evaluator Node
 * Interrupts execution for human to complete the rubric evaluation
 */
export async function humanEvaluatorNode(
  state: typeof rubricAnnotation.State,
  config?: RunnableConfig
): Promise<Partial<typeof rubricAnnotation.State>> {
  void config;

  if (!state.rubricFinal) {
    throw new Error('No final rubric available for evaluation');
  }

  // Interrupt for human evaluation
  const humanInput = interrupt<HumanEvaluationInput>({
    rubricFinal: state.rubricFinal,
    query: state.query,
    context: state.context,
    candidateOutput: state.candidateOutput,
    message: 'Please complete the evaluation using the rubric criteria.',
  });

  // Transform human input into Evaluation format
  const scores: EvaluationScore[] = humanInput.scores.map((s) => ({
    criterionId: s.criterionId,
    score: s.score,
    reasoning: s.reasoning,
  }));

  // Calculate weighted overall score
  const totalWeight = state.rubricFinal.criteria.reduce((sum, c) => sum + c.weight, 0);
  let weightedSum = 0;

  for (const score of scores) {
    const criterion = state.rubricFinal.criteria.find((c) => c.id === score.criterionId);
    if (criterion) {
      const scoreRange = criterion.scoringScale.max - criterion.scoringScale.min;
      // Handle case where min equals max (avoid division by zero)
      const normalizedScore = scoreRange > 0 
        ? (score.score - criterion.scoringScale.min) / scoreRange
        : (score.score >= criterion.scoringScale.min ? 1 : 0);
      weightedSum += normalizedScore * criterion.weight;
    }
  }

  const overallScore = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;

  const evaluation: Evaluation = {
    evaluatorType: 'human',
    scores,
    overallScore: Math.round(overallScore * 100) / 100,
    summary: humanInput.overallAssessment,
    timestamp: new Date().toISOString(),
  };

  const timestamp = new Date().toISOString();
  const auditEntry = `[${timestamp}] HumanEvaluator: Completed human evaluation. Overall score: ${evaluation.overallScore}%`;

  return {
    humanEvaluation: evaluation,
    auditTrace: [auditEntry],
  };
}
