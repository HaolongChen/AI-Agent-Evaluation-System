import { type RunnableConfig } from '@langchain/core/runnables';
import { HumanMessage } from '@langchain/core/messages';
import { rubricAnnotation, type FinalReport } from '../state/index.ts';
import { getLLM, invokeWithRetry } from '../llm/index.ts';
import * as z from 'zod';

// Verdict threshold constants
const PASS_THRESHOLD = 70;
const FAIL_THRESHOLD = 50;

const reconciliationSchema = z.object({
  discrepancies: z
    .array(z.string())
    .describe('List of discrepancies between agent and human evaluations'),
  reconciledScore: z.number().describe('Final reconciled overall score'),
  reconciliationRationale: z
    .string()
    .describe('Explanation of how discrepancies were resolved'),
  verdict: z
    .enum(['pass', 'fail', 'needs_review'])
    .describe('Final verdict based on reconciled evaluation'),
});

/**
 * Merger Node
 * Combines human and agent evaluations, reconciles differences
 */
export async function mergerNode(
  state: typeof rubricAnnotation.State,
  config?: RunnableConfig
): Promise<Partial<typeof rubricAnnotation.State>> {
  const provider =
    (config?.configurable?.['provider'] as 'azure' | 'gemini' | undefined) ||
    'azure';
  const modelName =
    (config?.configurable?.['model'] as string | undefined) || 'gpt-4o';

  const agentEval = state.agentEvaluation;
  const humanEval = state.humanEvaluation;

  // If only one evaluation is available, use it directly
  if (!agentEval && !humanEval) {
    throw new Error('No evaluations available to merge');
  }

  if (!agentEval || !humanEval) {
    const singleEval = agentEval || humanEval;
    if (!singleEval) {
      throw new Error('No evaluation available');
    }

    const verdict = determineVerdict(singleEval.overallScore);

    const report: FinalReport = {
      verdict,
      overallScore: singleEval.overallScore,
      summary: singleEval.summary,
      detailedAnalysis: `Single evaluation (${singleEval.evaluatorType}) completed.`,
      agentEvaluation: agentEval,
      humanEvaluation: humanEval,
      discrepancies: [],
      auditTrace: state.auditTrace || [],
      generatedAt: new Date().toISOString(),
    };

    const timestamp = new Date().toISOString();
    const auditEntry = `[${timestamp}] Merger: Single evaluation merged. Verdict: ${verdict}`;

    return {
      finalReport: report,
      auditTrace: [auditEntry],
    };
  }

  // Both evaluations available - reconcile differences
  const llm = getLLM({ provider, model: modelName });
  const llmWithStructuredOutput =
    llm.withStructuredOutput(reconciliationSchema);

  const agentAnswersText = agentEval.answers
    .map(
      (a) => `- ${a.questionId}: ${a.answer ? 'YES' : 'NO'}, Explanation: ${a.explanation}`
    )
    .join('\n');

  const humanAnswersText = humanEval.answers
    .map(
      (a) => `- ${a.questionId}: ${a.answer ? 'YES' : 'NO'}, Explanation: ${a.explanation}`
    )
    .join('\n');

  const prompt = `
You are an evaluation reconciliation expert. Compare and reconcile the following agent and human evaluations.

AGENT EVALUATION:
Overall Score: ${agentEval.overallScore}%
Summary: ${agentEval.summary}
Answers:
${agentAnswersText}

HUMAN EVALUATION:
Overall Score: ${humanEval.overallScore}%
Summary: ${humanEval.summary}
Answers:
${humanAnswersText}

Tasks:
1. Identify any significant discrepancies between the evaluations (e.g., where agent and human gave different answers)
2. Determine a final reconciled overall score
3. Explain how discrepancies were resolved
4. Provide a final verdict (pass, fail, or needs_review)

Consider:
- Conflicting answers (YES vs NO) on the same question are critical discrepancies
- Significant score differences (>20%) should be flagged
- The verdict should be "needs_review" if there are unresolvable discrepancies
`;

  const response = await invokeWithRetry(
    () => llmWithStructuredOutput.invoke([new HumanMessage(prompt)], config),
    provider,
    { operationName: 'Merger.invoke' }
  );

  const report: FinalReport = {
    verdict: response.verdict,
    overallScore: response.reconciledScore,
    summary: `Agent Score: ${agentEval.overallScore}%, Human Score: ${humanEval.overallScore}%, Reconciled: ${response.reconciledScore}%`,
    detailedAnalysis: response.reconciliationRationale,
    agentEvaluation: agentEval,
    humanEvaluation: humanEval,
    discrepancies: response.discrepancies,
    auditTrace: state.auditTrace || [],
    generatedAt: new Date().toISOString(),
  };

  const timestamp = new Date().toISOString();
  const auditEntry = `[${timestamp}] Merger: Evaluations merged. Discrepancies: ${response.discrepancies.length}. Verdict: ${response.verdict}`;

  return {
    finalReport: report,
    auditTrace: [auditEntry],
  };
}

function determineVerdict(score: number): 'pass' | 'fail' | 'needs_review' {
  if (score >= PASS_THRESHOLD) {
    return 'pass';
  } else if (score < FAIL_THRESHOLD) {
    return 'fail';
  } else {
    return 'needs_review';
  }
}
