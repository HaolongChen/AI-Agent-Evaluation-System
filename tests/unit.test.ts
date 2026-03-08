/**
 * Unit Test Suite — AI Agent Evaluation System
 *
 * Self-contained: no DB, no LLM, no network required.
 * Runner: tsx ./tests/unit.test.ts
 */

import assert from 'node:assert/strict';
import { logger } from '../src/utils/logger.ts';
import { copilotTypeValidator } from '../src/utils/validators.ts';
import {
  CopilotMessageType,
  filterCopilotMessagesToSave,
  type CopilotMessage,
} from '../src/utils/types.ts';
import {
  formatDuration,
  formatTokenCount,
  formatPercentage,
} from '../src/utils/formatters.ts';

// ---------------------------------------------------------------------------
// Test runner helpers
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    logger.info(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`  ✗ ${name}: ${msg}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// 1. copilotTypeValidator
// ---------------------------------------------------------------------------

logger.info('\n=== copilotTypeValidator ===');

test('accepts valid camelCase DB values', () => {
  const validValues = [
    'dataModel',
    'uiBuilder',
    'actionflow',
    'logAnalyzer',
    'agentBuilder',
  ] as const;
  for (const v of validValues) {
    const result = copilotTypeValidator.safeParse(v);
    assert.ok(result.success, `Expected "${v}" to be valid`);
  }
});

test('rejects invalid values', () => {
  const invalid = ['DATA_MODEL', 'DataModel', 'ui_builder', '', 'unknown'];
  for (const v of invalid) {
    const result = copilotTypeValidator.safeParse(v);
    assert.ok(!result.success, `Expected "${v}" to be invalid`);
  }
});

// ---------------------------------------------------------------------------
// 2. filterCopilotMessagesToSave
// ---------------------------------------------------------------------------

logger.info('\n=== filterCopilotMessagesToSave ===');

// A minimal helper to build typed messages with the required fields.
function makeMsg(type: CopilotMessageType): CopilotMessage {
  switch (type) {
    case CopilotMessageType.SYSTEM_STATUS:
      return { type, messageId: 'mid', content: 'c', timestamp: 0 };
    case CopilotMessageType.AI_RESPONSE:
      return {
        type,
        messageId: 'mid',
        content: 'c',
        allowEvaluation: true,
        timestamp: 0,
      };
    case CopilotMessageType.EDITABLE_TEXT:
      return {
        type,
        messageId: 'mid',
        content: 'c',
        allowEvaluation: false,
        timestamp: 0,
      };
    case CopilotMessageType.TASK:
      return { type, taskId: 't', name: 'n', timestamp: 0 };
    case CopilotMessageType.HUMAN_INPUT:
      return { type, content: 'c' };
    case CopilotMessageType.HUMAN_OPERATION:
      return { type, operation: 'continue' };
    case CopilotMessageType.FEEDBACK:
      return { type, messageId: 'mid', operation: 'good' };
    case CopilotMessageType.TOOL_CALLS:
      return { type, toolCallsId: 'id', toolCalls: [] };
    case CopilotMessageType.INITIAL_STATE:
      return {
        type,
        sessionId: 's',
        copilotMessages: [],
        currentJobIsRunning: false,
      };
    case CopilotMessageType.STATE_CHANGE:
      return { type, currentJobIsRunning: false };
    case CopilotMessageType.ERROR:
      return { type, content: 'err' };
    case CopilotMessageType.STOP:
      return { type };
    case CopilotMessageType.TERMINATE:
      return { type };
    case CopilotMessageType.TOOL_RESPONSE:
      return {
        type,
        toolCallsId: 'id',
        result: { data: '' },
      };
    case CopilotMessageType.EXEC_ERROR:
      return { type };
    case CopilotMessageType.TASK_REVERT_SUCCESS:
      return { type, taskIds: [] };
    default: {
      // exhaustiveness check
      const _: never = type;
      throw new Error(`Unhandled type: ${_}`);
    }
  }
}

const typesToSave = [
  CopilotMessageType.SYSTEM_STATUS,
  CopilotMessageType.AI_RESPONSE,
  CopilotMessageType.EDITABLE_TEXT,
  CopilotMessageType.TASK,
  CopilotMessageType.HUMAN_INPUT,
  CopilotMessageType.HUMAN_OPERATION,
  CopilotMessageType.FEEDBACK,
];

const typesToDrop = [
  CopilotMessageType.TOOL_CALLS,
  CopilotMessageType.INITIAL_STATE,
  CopilotMessageType.STATE_CHANGE,
  CopilotMessageType.ERROR,
  CopilotMessageType.STOP,
  CopilotMessageType.TERMINATE,
  CopilotMessageType.TOOL_RESPONSE,
  CopilotMessageType.EXEC_ERROR,
  CopilotMessageType.TASK_REVERT_SUCCESS,
];

test('keeps only saveable message types', () => {
  const input: CopilotMessage[] = [
    ...typesToSave.map(makeMsg),
    ...typesToDrop.map(makeMsg),
  ];
  const result = filterCopilotMessagesToSave(input);
  assert.strictEqual(result.length, typesToSave.length);
  for (const msg of result) {
    assert.ok(
      typesToSave.includes(msg.type),
      `Unexpected type kept: ${msg.type}`,
    );
  }
});

test('returns empty array when all messages should be dropped', () => {
  const input: CopilotMessage[] = typesToDrop.map(makeMsg);
  const result = filterCopilotMessagesToSave(input);
  assert.strictEqual(result.length, 0);
});

test('returns all when all messages should be saved', () => {
  const input: CopilotMessage[] = typesToSave.map(makeMsg);
  const result = filterCopilotMessagesToSave(input);
  assert.strictEqual(result.length, typesToSave.length);
});

// ---------------------------------------------------------------------------
// 3. formatDuration
// ---------------------------------------------------------------------------

logger.info('\n=== formatDuration ===');

test('formats seconds only', () => {
  assert.strictEqual(formatDuration(5_000), '5s');
  assert.strictEqual(formatDuration(59_999), '59s');
});

test('formats minutes and seconds', () => {
  assert.strictEqual(formatDuration(60_000), '1m 0s');
  assert.strictEqual(formatDuration(90_000), '1m 30s');
  assert.strictEqual(formatDuration(3599_000), '59m 59s');
});

test('formats hours, minutes, and seconds', () => {
  assert.strictEqual(formatDuration(3_600_000), '1h 0m 0s');
  assert.strictEqual(formatDuration(3_661_000), '1h 1m 1s');
});

// ---------------------------------------------------------------------------
// 4. formatTokenCount
// ---------------------------------------------------------------------------

logger.info('\n=== formatTokenCount ===');

test('formats raw count below 1000', () => {
  assert.strictEqual(formatTokenCount(0), '0');
  assert.strictEqual(formatTokenCount(999), '999');
});

test('formats thousands', () => {
  assert.strictEqual(formatTokenCount(1_000), '1.00K');
  assert.strictEqual(formatTokenCount(1_500), '1.50K');
});

test('formats millions', () => {
  assert.strictEqual(formatTokenCount(1_000_000), '1.00M');
  assert.strictEqual(formatTokenCount(2_500_000), '2.50M');
});

// ---------------------------------------------------------------------------
// 5. formatPercentage
// ---------------------------------------------------------------------------

logger.info('\n=== formatPercentage ===');

test('formats 0 as 0.00%', () => {
  assert.strictEqual(formatPercentage(0), '0.00%');
});

test('formats 1 as 100.00%', () => {
  assert.strictEqual(formatPercentage(1), '100.00%');
});

test('formats 0.5 as 50.00%', () => {
  assert.strictEqual(formatPercentage(0.5), '50.00%');
});

test('formats fractional value correctly', () => {
  assert.strictEqual(formatPercentage(0.123456), '12.35%');
});

// ---------------------------------------------------------------------------
// 6. Weight normalization (extracted from RubricDrafterAgent logic)
// ---------------------------------------------------------------------------

logger.info('\n=== Weight normalization ===');

type DraftQuestion = { weight: number; title: string };

function normalizeWeights(questions: DraftQuestion[]): DraftQuestion[] {
  const totalWeight = questions.reduce((sum, q) => sum + q.weight, 0);
  if (Math.abs(totalWeight - 100) > 0.01 && totalWeight > 0) {
    const factor = 100 / totalWeight;
    return questions.map((q) => ({ ...q, weight: q.weight * factor }));
  }
  return questions;
}

test('normalizes weights that do not sum to 100', () => {
  const input: DraftQuestion[] = [
    { title: 'Q1', weight: 50 },
    { title: 'Q2', weight: 50 },
    { title: 'Q3', weight: 50 },
  ];
  const result = normalizeWeights(input);
  const total = result.reduce((sum, q) => sum + q.weight, 0);
  assert.ok(
    Math.abs(total - 100) < 0.01,
    `Normalized total should be ~100, got ${total}`,
  );
});

test('leaves already-summing weights unchanged', () => {
  const input: DraftQuestion[] = [
    { title: 'Q1', weight: 40 },
    { title: 'Q2', weight: 60 },
  ];
  const result = normalizeWeights(input);
  assert.strictEqual(result[0]?.weight, 40);
  assert.strictEqual(result[1]?.weight, 60);
});

test('does not mutate the original array', () => {
  const input: DraftQuestion[] = [
    { title: 'Q1', weight: 30 },
    { title: 'Q2', weight: 30 },
  ];
  const originalWeights = input.map((q) => q.weight);
  normalizeWeights(input);
  assert.deepStrictEqual(
    input.map((q) => q.weight),
    originalWeights,
  );
});

test('handles single question (weight = 50 → 100)', () => {
  const result = normalizeWeights([{ title: 'Q1', weight: 50 }]);
  assert.ok(
    Math.abs((result[0]?.weight ?? 0) - 100) < 0.01,
    `Expected 100, got ${result[0]?.weight}`,
  );
});

// ---------------------------------------------------------------------------
// 7. overallScore calculation (extracted from GraphExecutionService logic)
// ---------------------------------------------------------------------------

logger.info('\n=== overallScore calculation ===');

type ScoringRubric = {
  weight: number;
  expectedAnswer: boolean;
  judgeAnswer: boolean | undefined;
};

function computeOverallScore(rubrics: ScoringRubric[]): number {
  const totalWeight = rubrics.reduce((sum, r) => sum + r.weight, 0);
  const weightedSum = rubrics.reduce(
    (sum, r) =>
      sum + (r.expectedAnswer === r.judgeAnswer ? r.weight : 0),
    0,
  );
  return Number(totalWeight === 0 ? 0 : (weightedSum / totalWeight) * 100);
}

test('returns 100 when all answers match expected', () => {
  const rubrics: ScoringRubric[] = [
    { weight: 50, expectedAnswer: true, judgeAnswer: true },
    { weight: 50, expectedAnswer: false, judgeAnswer: false },
  ];
  assert.strictEqual(computeOverallScore(rubrics), 100);
});

test('returns 0 when no answers match expected', () => {
  const rubrics: ScoringRubric[] = [
    { weight: 40, expectedAnswer: true, judgeAnswer: false },
    { weight: 60, expectedAnswer: false, judgeAnswer: true },
  ];
  assert.strictEqual(computeOverallScore(rubrics), 0);
});

test('returns partial score with mixed answers', () => {
  const rubrics: ScoringRubric[] = [
    { weight: 60, expectedAnswer: true, judgeAnswer: true },   // correct
    { weight: 40, expectedAnswer: true, judgeAnswer: false },  // wrong
  ];
  const score = computeOverallScore(rubrics);
  assert.ok(
    Math.abs(score - 60) < 0.001,
    `Expected 60, got ${score}`,
  );
});

test('returns 0 for divide-by-zero guard (all weights 0)', () => {
  const rubrics: ScoringRubric[] = [
    { weight: 0, expectedAnswer: true, judgeAnswer: true },
  ];
  assert.strictEqual(computeOverallScore(rubrics), 0);
});

test('returns 0 for empty rubric list', () => {
  assert.strictEqual(computeOverallScore([]), 0);
});

// ---------------------------------------------------------------------------
// 8. auditTrace accumulation (from ReportGenerator pattern)
// ---------------------------------------------------------------------------

logger.info('\n=== auditTrace accumulation ===');

function buildFinalAuditTrace(
  existingTrace: string[],
  newEntry: string,
): string[] {
  return [...existingTrace, newEntry];
}

test('appends new entry to existing trace', () => {
  const existing = ['entry-1', 'entry-2'];
  const result = buildFinalAuditTrace(existing, 'entry-3');
  assert.strictEqual(result.length, 3);
  assert.strictEqual(result[2], 'entry-3');
});

test('does not mutate original trace array', () => {
  const existing = ['entry-1'];
  buildFinalAuditTrace(existing, 'entry-2');
  assert.strictEqual(existing.length, 1);
});

test('works on empty existing trace', () => {
  const result = buildFinalAuditTrace([], 'first-entry');
  assert.deepStrictEqual(result, ['first-entry']);
});

// ---------------------------------------------------------------------------
// 9. Question patch merge logic (in-memory, from partial-update-test.ts)
// ---------------------------------------------------------------------------

logger.info('\n=== Question patch merge logic ===');

type Question = {
  id: number;
  title: string;
  content: string;
  expectedAnswer: boolean;
  weight: number;
};
type QuestionPatch = {
  questionId: number;
  title?: string;
  expectedAnswer?: boolean;
  weight?: number;
};

function applyQuestionPatches(
  questions: Question[],
  patches: QuestionPatch[],
): Question[] {
  const map = new Map(questions.map((q) => [q.id, { ...q }]));
  for (const patch of patches) {
    const q = map.get(patch.questionId);
    if (!q) throw new Error(`Question ID ${patch.questionId} not found`);
    if (patch.title !== undefined) q.title = patch.title;
    if (patch.expectedAnswer !== undefined) q.expectedAnswer = patch.expectedAnswer;
    if (patch.weight !== undefined) q.weight = patch.weight;
  }
  return Array.from(map.values());
}

const baseQuestions: Question[] = [
  { id: 1, title: 'Q1', content: 'C1', expectedAnswer: true, weight: 0.4 },
  { id: 2, title: 'Q2', content: 'C2', expectedAnswer: true, weight: 0.3 },
  { id: 3, title: 'Q3', content: 'C3', expectedAnswer: false, weight: 0.3 },
];

test('patches title and weight on a single question', () => {
  const result = applyQuestionPatches(baseQuestions, [
    { questionId: 1, title: 'Enhanced Q1', weight: 0.5 },
  ]);
  const q1 = result.find((q) => q.id === 1)!;
  assert.strictEqual(q1.title, 'Enhanced Q1');
  assert.strictEqual(q1.weight, 0.5);
  // Other fields unchanged
  assert.strictEqual(q1.expectedAnswer, true);
});

test('patches expectedAnswer', () => {
  const result = applyQuestionPatches(baseQuestions, [
    { questionId: 3, expectedAnswer: true },
  ]);
  const q3 = result.find((q) => q.id === 3)!;
  assert.strictEqual(q3.expectedAnswer, true);
  assert.strictEqual(q3.weight, 0.3); // unchanged
});

test('leaves unpatched questions unchanged', () => {
  const result = applyQuestionPatches(baseQuestions, [
    { questionId: 1, weight: 0.9 },
  ]);
  const q2 = result.find((q) => q.id === 2)!;
  assert.strictEqual(q2.title, 'Q2');
  assert.strictEqual(q2.weight, 0.3);
});

test('throws for non-existent questionId', () => {
  assert.throws(
    () => applyQuestionPatches(baseQuestions, [{ questionId: 999, weight: 0.5 }]),
    /Question ID 999 not found/,
  );
});

test('does not mutate original questions array', () => {
  const origWeight = baseQuestions[0]!.weight;
  applyQuestionPatches(baseQuestions, [{ questionId: 1, weight: 0.9 }]);
  assert.strictEqual(baseQuestions[0]!.weight, origWeight);
});

// ---------------------------------------------------------------------------
// 10. Answer patch merge logic (in-memory, from partial-update-test.ts)
// ---------------------------------------------------------------------------

logger.info('\n=== Answer patch merge logic ===');

type AgentAnswer = {
  questionId: number;
  answer: boolean;
  explanation: string;
};
type AnswerPatch = {
  questionId: number;
  answer?: boolean;
  explanation?: string;
};

function applyAnswerPatches(
  agentAnswers: AgentAnswer[],
  patches: AnswerPatch[],
): AgentAnswer[] {
  const map = new Map(agentAnswers.map((a) => [a.questionId, { ...a }]));
  for (const patch of patches) {
    const a = map.get(patch.questionId);
    if (!a)
      throw new Error(`Question ID ${patch.questionId} not found in agent answers`);
    if (patch.answer !== undefined) a.answer = patch.answer;
    if (patch.explanation !== undefined) a.explanation = patch.explanation;
  }
  return Array.from(map.values());
}

const agentAnswers: AgentAnswer[] = [
  { questionId: 1, answer: true, explanation: 'Agent explanation 1' },
  { questionId: 2, answer: false, explanation: 'Agent explanation 2' },
  { questionId: 3, answer: true, explanation: 'Agent explanation 3' },
];

test('overrides patched answers with human values', () => {
  const result = applyAnswerPatches(agentAnswers, [
    { questionId: 1, answer: false, explanation: 'Human override 1' },
    { questionId: 3, answer: false, explanation: 'Human override 3' },
  ]);
  const a1 = result.find((a) => a.questionId === 1)!;
  const a3 = result.find((a) => a.questionId === 3)!;
  assert.strictEqual(a1.answer, false);
  assert.ok(a1.explanation.includes('Human override 1'));
  assert.strictEqual(a3.answer, false);
  assert.ok(a3.explanation.includes('Human override 3'));
});

test('leaves unpatched answers unchanged', () => {
  const result = applyAnswerPatches(agentAnswers, [
    { questionId: 1, answer: false, explanation: 'Human override 1' },
  ]);
  const a2 = result.find((a) => a.questionId === 2)!;
  assert.strictEqual(a2.answer, false);
  assert.ok(a2.explanation.includes('Agent explanation 2'));
});

test('throws for non-existent questionId in answers', () => {
  assert.throws(
    () => applyAnswerPatches(agentAnswers, [{ questionId: 999, answer: true }]),
    /Question ID 999 not found/,
  );
});

// ---------------------------------------------------------------------------
// 11. Log extraction (from test-log-extraction.ts)
// ---------------------------------------------------------------------------

logger.info('\n=== Log extraction ===');

type JobResult = { response?: string; tasks?: unknown[] | null };

function extractJobResultFromLogs(logs: string): JobResult {
  for (const line of logs.split('\n')) {
    if (line.includes('JOB_RESULT_JSON:')) {
      try {
        const jsonStr = line
          .substring(line.indexOf('JOB_RESULT_JSON:') + 'JOB_RESULT_JSON:'.length)
          .trim();
        const parsed = JSON.parse(jsonStr) as JobResult;
        return parsed;
      } catch {
        // malformed JSON — fall through
      }
    }
  }
  return {};
}

test('extracts response and tasks from valid logs', () => {
  const logs = `
2024-01-01T00:00:00.000Z - some line
JOB_RESULT_JSON: {"response":"AI created the data model","tasks":[{"type":"TASK","taskId":"t-1","name":"Create Entity","timestamp":1234567890}]}
`;
  const result = extractJobResultFromLogs(logs);
  assert.strictEqual(result.response, 'AI created the data model');
  assert.ok(Array.isArray(result.tasks));
  assert.strictEqual((result.tasks as unknown[]).length, 1);
});

test('extracts response with null tasks', () => {
  const logs = `JOB_RESULT_JSON: {"response":"AI completed the task","tasks":null}`;
  const result = extractJobResultFromLogs(logs);
  assert.strictEqual(result.response, 'AI completed the task');
  assert.strictEqual(result.tasks, null);
});

test('returns empty object when no JOB_RESULT_JSON line present', () => {
  const logs = `
2024-01-01T00:00:00.000Z - WebSocket connection established.
2024-01-01T00:00:01.000Z - Some other log message
`;
  const result = extractJobResultFromLogs(logs);
  assert.deepStrictEqual(result, {});
});

test('returns empty object when JSON is malformed', () => {
  const logs = `JOB_RESULT_JSON: {invalid json}`;
  const result = extractJobResultFromLogs(logs);
  assert.deepStrictEqual(result, {});
});

// ---------------------------------------------------------------------------
// Final summary
// ---------------------------------------------------------------------------

logger.info(`\n${'='.repeat(50)}`);
logger.info(`Results: ${passed} passed, ${failed} failed`);
logger.info('='.repeat(50));

if (failed > 0) {
  process.exit(1);
}
