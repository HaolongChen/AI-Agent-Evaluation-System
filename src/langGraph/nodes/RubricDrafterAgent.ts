import { type RunnableConfig } from '@langchain/core/runnables';
import { HumanMessage } from '@langchain/core/messages';
import {
  rubricAnnotation,
  type QuestionSet,
  type EvaluationQuestion,
} from '../state/index.ts';
import { getLLM, invokeWithRetry } from '../llm/index.ts';
import * as z from 'zod';
import { evaluationPersistenceService } from '../../services/EvaluationPersistenceService.ts';

const questionSchema = z.object({
  title: z.string().describe('Short title for this evaluation question'),
  content: z
    .string()
    .describe('The yes/no question to evaluate the candidate output'),
  expectedAnswer: z
    .boolean()
    .describe('Expected answer (true for yes, false for no)'),
  weight: z
    .number()
    .min(0)
    .max(100)
    .describe('Weight of this question (0-100)'),
});

const questionSetDraftSchema = z.object({
  questions: z
    .array(questionSchema)
    .describe('List of yes/no evaluation questions'),
  rationale: z
    .string()
    .describe('Explanation of why these questions were chosen'),
});

export async function questionDrafterNode(
  state: typeof rubricAnnotation.State,
  config?: RunnableConfig
): Promise<Partial<typeof rubricAnnotation.State>> {
  const provider =
    (config?.configurable?.['provider'] as 'azure' | 'gemini' | undefined) ||
    'azure';
  const modelName =
    (config?.configurable?.['model'] as string | undefined) || 'gpt-4o';

  const llm = getLLM({ provider, model: modelName });
  const llmWithStructuredOutput = llm.withStructuredOutput(
    questionSetDraftSchema
  );

  const prompt = `
You are an evaluation expert. Based on the query, context, and schema information, create yes/no evaluation questions.

Query: """${state.query}"""

Context: """${state.context || 'No additional context provided.'}"""

Candidate Output to Evaluate: """${
    state.candidateOutput || 'No candidate output provided.'
  }"""

Schema Expression: """${
    state.schemaExpression || 'No schema information available.'
  }"""

Create 3-10 yes/no questions that:
1. Cover all important aspects of the expected output
2. Can be answered with a clear YES or NO
3. Have clear expected answers (what the correct answer should be)
4. Are weighted by importance (weights should sum to 100)
5. Cannot be answered if solely based on common sense; they must relate to the query, context, or schema information

Example questions:
- "Does the output correctly implement the requested feature?" (expected: yes)
- "Are there any syntax errors in the code?" (expected: no)
- "Does the output follow the specified schema?" (expected: yes)

Generate questions with appropriate weights that sum to 100.
`;

  const response = await invokeWithRetry(
    () => llmWithStructuredOutput.invoke([new HumanMessage(prompt)], config),
    provider,
    { operationName: 'QuestionDrafter.invoke' }
  );

  let totalWeight = response.questions.reduce((sum, q) => sum + q.weight, 0);
  if (Math.abs(totalWeight - 100) > 0.01 && totalWeight > 0) {
    const factor = 100 / totalWeight;
    response.questions.forEach((q) => (q.weight = q.weight * factor));
    totalWeight = response.questions.reduce((sum, q) => sum + q.weight, 0);
  }

  const questions: EvaluationQuestion[] = response.questions.map((q, idx) => ({
    id: idx + 1, // 1-based question index (matches adaptiveRubric composite key)
    title: q.title,
    content: q.content,
    expectedAnswer: q.expectedAnswer,
    weight: q.weight,
  }));

  const now = new Date().toISOString();

  const questionSetDraft: QuestionSet = {
    version: '1.0.0',
    questions: questions,
    totalWeight,
    createdAt: now,
    updatedAt: now,
  };

  await evaluationPersistenceService.saveQuestions(
    config?.configurable?.['sessionId'] as number,
    questionSetDraft
  );

  const timestamp = new Date().toISOString();
  const auditEntry = `[${timestamp}] QuestionDrafter: Created ${questionSetDraft.questions.length} evaluation questions. Rationale: ${response.rationale}`;

  return {
    questionSetDraft,
    questionsApproved: false,
    questionDraftAttempts: (state.questionDraftAttempts || 0) + 1,
    auditTrace: [auditEntry],
  };
}

export { questionDrafterNode as rubricDrafterNode };
