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

/**
 * Formats human-provided example questions for inclusion in the LLM prompt.
 * Human examples are treated as authoritative and should be incorporated or
 * closely followed in the new draft.
 */
function formatHumanExamples(examples: EvaluationQuestion[]): string {
  if (examples.length === 0) return '';
  const lines = examples.map(
    (q, idx) =>
      `  ${idx + 1}. [ID ${q.id}] "${q.title}" — ${q.content}\n` +
      `     Expected answer: ${q.expectedAnswer ? 'YES' : 'NO'}, Weight: ${q.weight}`,
  );
  return lines.join('\n');
}

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

  // ── Build re-draft context sections ─────────────────────────────────────────

  const attemptNumber = (state.questionDraftAttempts || 0) + 1;

  // Section 1: human-provided authoritative examples (if any)
  const humanExamplesSection =
    state.humanExampleQuestions && state.humanExampleQuestions.length > 0
      ? `
IMPORTANT — Human-Provided Example Questions (treat these as authoritative and incorporate them into your draft):
${formatHumanExamples(state.humanExampleQuestions)}

These questions were provided directly by the human reviewer. Your new draft MUST incorporate or closely follow them.
`
      : '';

  // Section 2: history of previously rejected drafts with feedback (if any)
  const rejectionHistorySection =
    state.rejectionHistory && state.rejectionHistory.length > 0
      ? `
Previous Draft Attempts That Were Rejected (learn from these mistakes — do NOT repeat them):
${state.rejectionHistory
  .map(
    (record) =>
      `--- Attempt ${record.attemptNumber} ---\n` +
      `Feedback: ${record.feedback ?? '(no explicit feedback provided)'}\n` +
      `Rejected questions:\n` +
      record.draft.questions
        .map(
          (q, idx) =>
            `  ${idx + 1}. "${q.title}" — ${q.content}\n` +
            `     Expected: ${q.expectedAnswer ? 'YES' : 'NO'}, Weight: ${q.weight}`,
        )
        .join('\n'),
  )
  .join('\n\n')}
`
      : '';

  // ── Build the full prompt ────────────────────────────────────────────────────

  const prompt = `
You are an evaluation expert. Based on the query, context, and schema information, create yes/no evaluation questions.
${attemptNumber > 1 ? `This is draft attempt #${attemptNumber}. Previous attempts were rejected — address the feedback below carefully.` : ''}
${humanExamplesSection}
Query: """${state.query}"""

Context: """${state.context || 'No additional context provided.'}"""

Candidate Output to Evaluate: """${
    state.candidateOutput || 'No candidate output provided.'
  }"""

Schema Expression: """${
    state.schemaExpression || 'No schema information available.'
  }"""
${rejectionHistorySection}
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

  // Assign IDs in ascending order starting at 1 (matches adaptiveRubric composite key)
  const questions: EvaluationQuestion[] = response.questions
    .map((q, idx) => ({
      id: idx + 1,
      title: q.title,
      content: q.content,
      expectedAnswer: q.expectedAnswer,
      weight: q.weight,
    }))
    // Defensive sort: ensure ascending order even if the LLM or future code reorders
    .sort((a, b) => a.id - b.id);

  const now = new Date().toISOString();

  const questionSetDraft: QuestionSet = {
    version: '1.0.0',
    questions,
    totalWeight,
    createdAt: now,
    updatedAt: now,
  };

  // saveQuestions deletes existing records first, so re-draft cycles are safe
  await evaluationPersistenceService.saveQuestions(
    config?.configurable?.['sessionId'] as number,
    questionSetDraft
  );

  const timestamp = new Date().toISOString();
  const auditEntry = `[${timestamp}] QuestionDrafter (attempt #${attemptNumber}): Created ${questionSetDraft.questions.length} evaluation questions. Rationale: ${response.rationale}`;

  return {
    questionSetDraft,
    questionsApproved: false,
    // Increment attempt counter explicitly (annotation value: (_, next) => next)
    questionDraftAttempts: attemptNumber,
    auditTrace: [auditEntry],
  };
}

export { questionDrafterNode as rubricDrafterNode };
