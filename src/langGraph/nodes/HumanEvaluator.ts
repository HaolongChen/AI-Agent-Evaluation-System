import { type RunnableConfig } from "@langchain/core/runnables";
import { interrupt } from "@langchain/langgraph";
import {
  rubricAnnotation,
  type Evaluation,
  type EvaluationScore,
} from "../state/index.ts";

/**
 * Input expected from a human evaluator when resuming from an evaluation interrupt.
 *
 * - `scores`: An array of scores, one for each criterion in the rubric.
 *   - `criterionId`: The ID of the criterion, which must match the IDs defined in the rubric.
 *   - `score`: A numeric score assigned by the evaluator, which should be within the criterion's scoring scale range (see rubric's `scoringScale`).
 *   - `reasoning`: A brief explanation for the assigned score for this criterion.
 * - `overallAssessment`: A summary or overall assessment of the candidate output, reflecting the evaluator's holistic judgment.
 */
export interface HumanEvaluationInput {
  /**
   * Scores for each criterion in the rubric.
   * Each score object must include:
   * - `criterionId`: ID from the rubric criteria.
   * - `score`: Numeric value within the criterion's scoring scale.
   * - `reasoning`: Explanation for the assigned score.
   */
  scores: Array<{
    criterionId: string;
    score: number;
    reasoning: string;
  }>;
  /**
   * Overall assessment summary of the evaluation.
   * Should provide a holistic summary of the candidate output.
   */
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
    throw new Error("No final rubric available for evaluation");
  }

  // Store rubricFinal in a local variable after the null check to help TypeScript narrow the type
  const rubricFinal = state.rubricFinal;

  // Interrupt for human evaluation - pass context as the interrupt value
  // interrupt<I, R>(value: I): R
  // - I is the input type (context shown to human)
  // - R is the return type (what human provides back)
  const humanInput = interrupt<
    {
      rubricFinal: typeof state.rubricFinal;
      query: string;
      context: string | null;
      candidateOutput: string;
      message: string;
    },
    HumanEvaluationInput
  >({
    rubricFinal,
    query: state.query,
    context: state.context,
    candidateOutput: state.candidateOutput,
    message: "Please complete the evaluation using the rubric criteria.",
  });

  // Transform human input into Evaluation format
  const scores: EvaluationScore[] = humanInput.scores.map((s) => {
    const criterion = rubricFinal.criteria.find((c) => c.id === s.criterionId);
    if (!criterion) {
      throw new Error(`Invalid criterion ID: ${s.criterionId}`);
    }
    if (
      s.score < criterion.scoringScale.min ||
      s.score > criterion.scoringScale.max
    ) {
      throw new Error(
        `Score ${s.score} for criterion ${criterion.name} is outside valid range [${criterion.scoringScale.min}, ${criterion.scoringScale.max}]`
      );
    }
    return {
      criterionId: s.criterionId,
      score: s.score,
      reasoning: s.reasoning,
    };
  });

  // Calculate weighted overall score
  const totalWeight = rubricFinal.criteria.reduce(
    (sum, c) => sum + c.weight,
    0
  );
  let weightedSum = 0;

  for (const score of scores) {
    const criterion = rubricFinal.criteria.find(
      (c) => c.id === score.criterionId
    );
    if (criterion) {
      const scoreRange =
        criterion.scoringScale.max - criterion.scoringScale.min;
      // Handle case where min equals max (avoid division by zero)
      const normalizedScore =
        scoreRange > 0
          ? (score.score - criterion.scoringScale.min) / scoreRange
          : score.score >= criterion.scoringScale.min
          ? 1
          : 0;
      weightedSum += normalizedScore * criterion.weight;
    }
  }

  const overallScore = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;

  const evaluation: Evaluation = {
    evaluatorType: "human",
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
