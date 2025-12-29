import { type RunnableConfig } from '@langchain/core/runnables';
import { HumanMessage } from '@langchain/core/messages';
import {
  rubricAnnotation,
  type QuestionEvaluation,
  type QuestionAnswer,
} from '../state/index.ts';
import { getLLM, invokeWithRetry } from '../llm/index.ts';
import * as z from 'zod';

const answerSchema = z.object({
  questionId: z.number().describe('Question ID'),
  questionTitle: z.string().describe('Title of the question'),
  answer: z.boolean().describe('Your answer (true for YES, false for NO)'),
  explanation: z.string().describe('Detailed explanation for your answer'),
  evidence: z
    .array(z.string())
    .optional()
    .describe('Specific evidence from the candidate output'),
});

const agentEvaluationSchema = z.object({
  answers: z.array(answerSchema).describe('Answers for each question'),
  overallAssessment: z.string().describe('Overall assessment summary'),
});

export async function agentEvaluatorNode(
  state: typeof rubricAnnotation.State,
  config?: RunnableConfig
): Promise<Partial<typeof rubricAnnotation.State>> {
  const provider =
    (config?.configurable?.['provider'] as 'azure' | 'gemini' | undefined) ||
    'azure';
  const modelName =
    (config?.configurable?.['model'] as string | undefined) || 'gpt-4o';

  if (!state.questionSetFinal) {
    throw new Error('No final question set available for evaluation');
  }

  const llm = getLLM({ provider, model: modelName });
  const llmWithStructuredOutput = llm.withStructuredOutput(agentEvaluationSchema);

  const questionsDescription = state.questionSetFinal.questions
    .map(
      (q) => `
- Question ID: ${q.id}
  Title: ${q.title}
  Question: ${q.content}
  Weight: ${q.weight}%
`
    )
    .join('\n');

  const prompt = `
You are an expert evaluator. Answer each yes/no question based on the candidate output.

Query: """${state.query}"""

Context: """${state.context || 'No additional context provided.'}"""

Schema Information: """${
    state.schemaExpression || 'No schema information available.'
  }"""

Candidate Output to Evaluate: """${
    state.candidateOutput || 'No candidate output provided.'
  }"""

EVALUATION QUESTIONS:
${questionsDescription}

For each question:
1. Answer with YES (true) or NO (false)
2. Explain your reasoning in detail
3. Cite specific evidence from the candidate output

Be objective and thorough in your assessment.
`;

  const response = await invokeWithRetry(
    () => llmWithStructuredOutput.invoke([new HumanMessage(prompt)], config),
    provider,
    { operationName: 'AgentEvaluator.invoke' }
  );

  const answers: QuestionAnswer[] = response.answers.map((a) => ({
    questionId: a.questionId,
    answer: a.answer,
    explanation: a.explanation,
    ...(a.evidence && { evidence: a.evidence }),
  }));

  const totalWeight = state.questionSetFinal.questions.reduce(
    (sum, q) => sum + q.weight,
    0
  );
  let correctWeight = 0;

  for (const answer of answers) {
    const question = state.questionSetFinal.questions.find(
      (q) => q.id === answer.questionId
    );
    if (question) {
      const isCorrect = answer.answer === question.expectedAnswer;
      if (isCorrect) {
        correctWeight += question.weight;
      }
    }
  }

  const overallScore = totalWeight > 0 ? (correctWeight / totalWeight) * 100 : 0;

  const evaluation: QuestionEvaluation = {
    evaluatorType: 'agent',
    answers,
    overallScore: Math.round(overallScore * 100) / 100,
    summary: response.overallAssessment,
    timestamp: new Date().toISOString(),
  };

  const timestamp = new Date().toISOString();
  const auditEntry = `[${timestamp}] AgentEvaluator: Completed evaluation. Overall score: ${evaluation.overallScore}%`;

  return {
    agentEvaluation: evaluation,
    auditTrace: [auditEntry],
  };
}
