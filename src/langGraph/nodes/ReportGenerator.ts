import { type RunnableConfig } from '@langchain/core/runnables';
import { HumanMessage } from '@langchain/core/messages';
import { rubricAnnotation, type FinalReport } from '../state/index.ts';
import { getLLM, invokeWithRetry } from '../llm/index.ts';
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
    (config?.configurable?.['model'] as string | undefined) || 'gpt-4o';


  const llm = getLLM({ provider, model: modelName });
  const llmWithStructuredOutput = llm.withStructuredOutput(reportSchema);

  const answer =
    state.evaluation?.answers
      ?.map(
        (a) =>
          `- ${a.questionId}: ${a.answer ? 'YES' : 'NO'} - ${a.explanation}`
      )
      .join('\n') || 'No agent evaluation';

  // Build evaluation questions context (new model)
  const questionsInfo =
    state.questionSetFinal?.questions
      ?.map(
        (q) =>
          `- ${q.title} (weight: ${q.weight}%, expected: ${
            q.expectedAnswer ? 'YES' : 'NO'
          }): ${q.content}`
      )
      .join('\n') || 'No evaluation questions available';

  // Build analysis context
  const analysisContext = state.analysis || 'No analysis available';

  const prompt = `
You are a report generation expert. Generate a comprehensive evaluation report based on the following information.

QUERY: """${state.query}"""

CONTEXT: """${state.context || 'No additional context'}"""

CANDIDATE OUTPUT: """${state.candidateOutput || 'No candidate output'}"""

ANALYSIS: """${analysisContext}"""

EVALUATION QUESTIONS:
${questionsInfo}

EVALUATION ANSWERS:
${answer}

OVERALL SCORE: ${state.evaluation?.overallScore}%

Generate:
1. A brief executive summary (2-3 sentences)
2. Detailed findings and analysis (reference the questions and their evaluation results)
3. Recommendations for improvement (based on failed questions or incorrect answers)
4. Identified strengths (based on correct answers and high scores)
5. Identified weaknesses (based on incorrect answers and low scores)
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
    overallScore: state.evaluation?.overallScore || 0,
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

## Overall Score: ${state.evaluation?.overallScore}%

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
