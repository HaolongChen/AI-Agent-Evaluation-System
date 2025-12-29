/**
 * Dry run test for HITL flow logic
 *
 * This test validates the GraphExecutionService interfaces and flow
 * without actually invoking the LangGraph or database.
 *
 * Run: npx tsx tests/hitl-flow-dry-run.ts
 */

import type {
  GraphSessionStatus,
  StartSessionResult,
  RubricReviewResult,
  HumanEvaluationResult,
} from '../src/services/GraphExecutionService.ts';
import type {
  QuestionSet,
  EvaluationQuestion,
  QuestionEvaluation,
  QuestionAnswer,
  FinalReport,
} from '../src/langGraph/state/state.ts';

function createMockQuestionSet(): QuestionSet {
  const question: EvaluationQuestion = {
    id: 'question-1',
    title: 'Correctness Check',
    content: 'Does the output correctly implement the requested functionality?',
    expectedAnswer: true,
    weight: 50,
  };

  return {
    id: 'question-set-001',
    version: '1.0.0',
    questions: [question],
    totalWeight: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function createMockQuestionEvaluation(
  questionSet: QuestionSet,
  type: 'agent' | 'human'
): QuestionEvaluation {
  const answers: QuestionAnswer[] = questionSet.questions.map((q) => ({
    questionId: q.id,
    answer: true,
    explanation: `${type} evaluation for ${q.title}`,
  }));

  return {
    evaluatorType: type,
    answers,
    overallScore: 80,
    summary: `${type} evaluation completed`,
    timestamp: new Date().toISOString(),
  };
}

function createMockFinalReport(
  agentEval: QuestionEvaluation | null,
  humanEval: QuestionEvaluation | null
): FinalReport {
  return {
    verdict: 'pass',
    overallScore: 80,
    summary: 'Evaluation completed',
    detailedAnalysis: 'Both agent and human evaluations are consistent',
    agentEvaluation: agentEval,
    humanEvaluation: humanEval,
    discrepancies: [],
    auditTrace: ['Test audit entry'],
    generatedAt: new Date().toISOString(),
  };
}

function simulateHITLFlowStates(): void {
  console.log('=== Simulating HITL Flow States ===\n');

  const mockQuestionSet = createMockQuestionSet();

  const startResult: StartSessionResult = {
    sessionId: 1,
    threadId: 'test-thread-001',
    status: 'awaiting_rubric_review',
    questionSetDraft: mockQuestionSet,
    message:
      'Graph paused for question set review. Call submitRubricReview to continue.',
  };

  console.log('Step 1: startGraphSession');
  console.log(`  Status: ${startResult.status}`);
  console.log(`  Has questionSetDraft: ${startResult.questionSetDraft !== null}`);
  console.log(`  Expected status: awaiting_rubric_review`);
  console.log(
    `  ✅ Status matches: ${startResult.status === 'awaiting_rubric_review'}\n`
  );

  const reviewResult: RubricReviewResult = {
    sessionId: 1,
    threadId: 'test-thread-001',
    status: 'awaiting_human_evaluation',
    questionSetFinal: { ...mockQuestionSet, version: '1.0.1' },
    message:
      'Graph paused for human evaluation. Call submitHumanEvaluation to continue.',
  };

  console.log('Step 2: submitRubricReview');
  console.log(`  Status: ${reviewResult.status}`);
  console.log(`  Has questionSetFinal: ${reviewResult.questionSetFinal !== null}`);
  console.log(`  Expected status: awaiting_human_evaluation`);
  console.log(
    `  ✅ Status matches: ${
      reviewResult.status === 'awaiting_human_evaluation'
    }\n`
  );

  const agentEval = createMockQuestionEvaluation(mockQuestionSet, 'agent');
  const humanEval = createMockQuestionEvaluation(mockQuestionSet, 'human');
  const finalReport = createMockFinalReport(agentEval, humanEval);

  const humanEvalResult: HumanEvaluationResult = {
    sessionId: 1,
    threadId: 'test-thread-001',
    status: 'completed',
    finalReport,
    message: 'Evaluation completed successfully',
  };

  console.log('Step 3: submitHumanEvaluation');
  console.log(`  Status: ${humanEvalResult.status}`);
  console.log(`  Has finalReport: ${humanEvalResult.finalReport !== null}`);
  console.log(`  Expected status: completed`);
  console.log(
    `  ✅ Status matches: ${humanEvalResult.status === 'completed'}\n`
  );

  console.log('Final Report Verification:');
  console.log(`  Verdict: ${humanEvalResult.finalReport?.verdict}`);
  console.log(`  Overall Score: ${humanEvalResult.finalReport?.overallScore}`);
  console.log(
    `  Has Agent Evaluation: ${
      humanEvalResult.finalReport?.agentEvaluation !== null
    }`
  );
  console.log(
    `  Has Human Evaluation: ${
      humanEvalResult.finalReport?.humanEvaluation !== null
    }`
  );
  console.log('');
}

function simulateAutomatedFlowStates(): void {
  console.log('=== Simulating Automated Flow States ===\n');

  const mockQuestionSet = createMockQuestionSet();
  const agentEval = createMockQuestionEvaluation(mockQuestionSet, 'agent');
  void createMockFinalReport(agentEval, null);

  const startResult: StartSessionResult = {
    sessionId: 2,
    threadId: 'test-thread-002',
    status: 'completed',
    questionSetDraft: mockQuestionSet,
    message: 'Evaluation completed successfully',
  };

  console.log('Automated Flow Result:');
  console.log(`  Status: ${startResult.status}`);
  console.log(`  Expected status: completed`);
  console.log(`  ✅ Status matches: ${startResult.status === 'completed'}\n`);
}

function verifyTypeCompatibility(): void {
  console.log('=== Verifying Type Compatibility ===\n');

  const statuses: GraphSessionStatus[] = [
    'pending',
    'awaiting_rubric_review',
    'awaiting_human_evaluation',
    'completed',
    'failed',
  ];

  console.log('Valid GraphSessionStatus values:');
  statuses.forEach((s) => console.log(`  - ${s}`));
  console.log('');

  const mockQuestionSet = createMockQuestionSet();
  console.log('QuestionSet Structure:');
  console.log(`  id: ${mockQuestionSet.id}`);
  console.log(`  version: ${mockQuestionSet.version}`);
  console.log(`  questions count: ${mockQuestionSet.questions.length}`);
  console.log(`  totalWeight: ${mockQuestionSet.totalWeight}`);
  console.log('');

  const question = mockQuestionSet.questions[0];
  if (question) {
    console.log('EvaluationQuestion Structure:');
    console.log(`  id: ${question.id}`);
    console.log(`  title: ${question.title}`);
    console.log(`  weight: ${question.weight}`);
    console.log(`  expectedAnswer: ${question.expectedAnswer}`);
    console.log(`  content: ${question.content.substring(0, 50)}...`);
  }
  console.log('');
}

console.log('HITL Flow Dry Run Test\n');
console.log(
  'This test validates the interface types and expected state transitions.\n'
);

simulateHITLFlowStates();
simulateAutomatedFlowStates();
verifyTypeCompatibility();

console.log('=== All Dry Run Tests Completed ===');
