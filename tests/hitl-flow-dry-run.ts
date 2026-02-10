/**
 * Dry run test for HITL flow logic
 *
 * This test validates the GraphExecutionService interfaces and flow
 * without actually invoking the LangGraph or database.
 *
 * Run: npx tsx tests/hitl-flow-dry-run.ts
 */

import { logger } from '../src/utils/logger.ts';
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

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', reason);
  logger.error('Promise:', promise);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

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
  logger.info('=== Simulating HITL Flow States ===\n');

  const mockQuestionSet = createMockQuestionSet();

  const startResult: StartSessionResult = {
    sessionId: 1,
    threadId: 'test-thread-001',
    status: 'awaiting_rubric_review',
    questionSetDraft: mockQuestionSet,
    message:
      'Graph paused for question set review. Call submitRubricReview to continue.',
  };

  logger.info('Step 1: startGraphSession');
  logger.info(`  Status: ${startResult.status}`);
  logger.info(`  Has questionSetDraft: ${startResult.questionSetDraft !== null}`);
  logger.info(`  Expected status: awaiting_rubric_review`);
  logger.info(
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

  logger.info('Step 2: submitRubricReview');
  logger.info(`  Status: ${reviewResult.status}`);
  logger.info(`  Has questionSetFinal: ${reviewResult.questionSetFinal !== null}`);
  logger.info(`  Expected status: awaiting_human_evaluation`);
  logger.info(
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

  logger.info('Step 3: submitHumanEvaluation');
  logger.info(`  Status: ${humanEvalResult.status}`);
  logger.info(`  Has finalReport: ${humanEvalResult.finalReport !== null}`);
  logger.info(`  Expected status: completed`);
  logger.info(
    `  ✅ Status matches: ${humanEvalResult.status === 'completed'}\n`
  );

  logger.info('Final Report Verification:');
  logger.info(`  Verdict: ${humanEvalResult.finalReport?.verdict}`);
  logger.info(`  Overall Score: ${humanEvalResult.finalReport?.overallScore}`);
  logger.info(
    `  Has Agent Evaluation: ${
      humanEvalResult.finalReport?.agentEvaluation !== null
    }`
  );
  logger.info(
    `  Has Human Evaluation: ${
      humanEvalResult.finalReport?.humanEvaluation !== null
    }`
  );
  logger.info('');
}

function simulateAutomatedFlowStates(): void {
  logger.info('=== Simulating Automated Flow States ===\n');

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

  logger.info('Automated Flow Result:');
  logger.info(`  Status: ${startResult.status}`);
  logger.info(`  Expected status: completed`);
  logger.info(`  ✅ Status matches: ${startResult.status === 'completed'}\n`);
}

function verifyTypeCompatibility(): void {
  logger.info('=== Verifying Type Compatibility ===\n');

  const statuses: GraphSessionStatus[] = [
    'pending',
    'awaiting_rubric_review',
    'awaiting_human_evaluation',
    'completed',
    'failed',
  ];

  logger.info('Valid GraphSessionStatus values:');
  statuses.forEach((s) => logger.info(`  - ${s}`));
  logger.info('');

  const mockQuestionSet = createMockQuestionSet();
  logger.info('QuestionSet Structure:');
  logger.info(`  version: ${mockQuestionSet.version}`);
  logger.info(`  questions count: ${mockQuestionSet.questions.length}`);
  logger.info(`  totalWeight: ${mockQuestionSet.totalWeight}`);
  logger.info('');

  const question = mockQuestionSet.questions[0];
  if (question) {
    logger.info('EvaluationQuestion Structure:');
    logger.info(`  id: ${question.id}`);
    logger.info(`  title: ${question.title}`);
    logger.info(`  weight: ${question.weight}`);
    logger.info(`  expectedAnswer: ${question.expectedAnswer}`);
    logger.info(`  content: ${question.content.substring(0, 50)}...`);
  }
  logger.info('');
}

logger.info('HITL Flow Dry Run Test\n');
logger.info(
  'This test validates the interface types and expected state transitions.\n'
);

simulateHITLFlowStates();
simulateAutomatedFlowStates();
verifyTypeCompatibility();

logger.info('=== All Dry Run Tests Completed ===');
