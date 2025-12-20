import { type RunnableConfig } from '@langchain/core/runnables';
import { HumanMessage } from '@langchain/core/messages';
import { rubricAnnotation, type FinalReport } from '../state/index.ts';
import { getLLM, invokeWithRetry } from '../llm/index.ts';
import { OPENAI_MODEL } from '../../config/env.ts';
import * as z from 'zod';

const reportSchema = z.object({
  executiveSummary: z
    .string()
    .describe('Brief executive summary of the evaluation'),
  detailedFindings: z.string().describe('Detailed findings and analysis'),
  recommendations: z
    .array(z.string())
    .describe('Recommendations for improvement'),
  strengths: z.array(z.string()).describe('Identified strengths'),
  weaknesses: z.array(z.string()).describe('Identified weaknesses'),
});

/**
 * Report Generator Node
 * Generates final verdict, human readable summary, and full audit trace
 */
export async function reportGeneratorNode(
  state: typeof rubricAnnotation.State,
  config?: RunnableConfig
): Promise<Partial<typeof rubricAnnotation.State>> {
  const provider =
    (config?.configurable?.['provider'] as 'azure' | 'gemini' | undefined) ||
    'azure';
  const modelName =
    (config?.configurable?.['model'] as string | undefined) || OPENAI_MODEL;

  if (!state.finalReport) {
    throw new Error('No final report available for generation');
  }

  const llm = getLLM({ provider, model: modelName });
  const llmWithStructuredOutput = llm.withStructuredOutput(reportSchema);

  // Build context for report generation
  const agentScores =
    state.agentEvaluation?.scores
      ?.map((s) => `- ${s.criterionId}: ${s.score} - ${s.reasoning}`)
      .join('\n') || 'No agent evaluation';

  const humanScores =
    state.humanEvaluation?.scores
      ?.map((s) => `- ${s.criterionId}: ${s.score} - ${s.reasoning}`)
      .join('\n') || 'No human evaluation';

  // Build constraints context
  const hardConstraintsInfo =
    state.hardConstraints && state.hardConstraints.length > 0
      ? state.hardConstraints
          .map((constraint, index) => {
            const answer = state.hardConstraintsAnswers?.[index];
            return `- ${constraint} [${
              answer !== undefined
                ? answer
                  ? 'PASS'
                  : 'FAIL'
                : 'NOT EVALUATED'
            }]`;
          })
          .join('\n')
      : 'No hard constraints defined';

  const softConstraintsInfo =
    state.softConstraints && state.softConstraints.length > 0
      ? state.softConstraints
          .map((constraint, index) => {
            const answer = state.softConstraintsAnswers?.[index];
            return `- ${constraint} [${
              answer !== undefined ? answer : 'NOT EVALUATED'
            }]`;
          })
          .join('\n')
      : 'No soft constraints defined';

  // Build rubric criteria context
  const rubricCriteria =
    state.rubricFinal?.criteria
      ?.map(
        (c) =>
          `- ${c.name} (weight: ${c.weight}%, ${
            c.isHardConstraint ? 'HARD' : 'SOFT'
          }): ${c.description}`
      )
      .join('\n') || 'No rubric criteria available';

  // Build analysis context
  const analysisContext = state.analysis || 'No analysis available';

  const prompt = `
You are a report generation expert. Generate a comprehensive evaluation report based on the following information.

QUERY: """${state.query}"""

CONTEXT: """${state.context || 'No additional context'}"""

CANDIDATE OUTPUT: """${state.candidateOutput || 'No candidate output'}"""

ANALYSIS: """${analysisContext}"""

RUBRIC CRITERIA:
${rubricCriteria}

HARD CONSTRAINTS (must pass):
${hardConstraintsInfo}

SOFT CONSTRAINTS (quality indicators):
${softConstraintsInfo}

VERDICT: ${state.finalReport.verdict}
OVERALL SCORE: ${state.finalReport.overallScore}%

AGENT EVALUATION SCORES:
${agentScores}

HUMAN EVALUATION SCORES:
${humanScores}

DISCREPANCIES:
${state.finalReport.discrepancies.join('\n') || 'No discrepancies'}

Generate:
1. A brief executive summary (2-3 sentences)
2. Detailed findings and analysis (reference the constraints and their evaluation results)
3. Recommendations for improvement (based on failed constraints or low scores)
4. Identified strengths (based on passed constraints and high scores)
5. Identified weaknesses (based on failed constraints and low scores)
`;

  const response = await invokeWithRetry(
    () => llmWithStructuredOutput.invoke([new HumanMessage(prompt)], config),
    provider,
    { operationName: 'ReportGenerator.invoke' }
  );

  // Compile the audit trace
  const auditTrace = [
    ...(state.auditTrace || []),
    `[${new Date().toISOString()}] ReportGenerator: Final report generated`,
  ];

  // Update the final report with enhanced content
  const enhancedReport: FinalReport = {
    ...state.finalReport,
    summary: response.executiveSummary,
    detailedAnalysis: `${
      response.detailedFindings
    }\n\nStrengths:\n${response.strengths
      .map((s) => `- ${s}`)
      .join('\n')}\n\nWeaknesses:\n${response.weaknesses
      .map((w) => `- ${w}`)
      .join('\n')}\n\nRecommendations:\n${response.recommendations
      .map((r) => `- ${r}`)
      .join('\n')}`,
    auditTrace,
    generatedAt: new Date().toISOString(),
  };

  // Generate analysis string for backward compatibility
  const analysis = `
# Evaluation Report

## Verdict: ${enhancedReport.verdict.toUpperCase()}
## Overall Score: ${enhancedReport.overallScore}%

## Executive Summary
${response.executiveSummary}

## Detailed Findings
${response.detailedFindings}

## Strengths
${response.strengths.map((s) => `- ${s}`).join('\n')}

## Weaknesses
${response.weaknesses.map((w) => `- ${w}`).join('\n')}

## Recommendations
${response.recommendations.map((r) => `- ${r}`).join('\n')}

## Audit Trace
${auditTrace.map((entry) => `- ${entry}`).join('\n')}
`;

  return {
    finalReport: enhancedReport,
    analysis,
    auditTrace: [
      `[${new Date().toISOString()}] ReportGenerator: Final report generated`,
    ],
  };
}
