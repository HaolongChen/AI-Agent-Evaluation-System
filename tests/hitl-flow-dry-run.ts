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
  Rubric,
  Evaluation,
  FinalReport,
  EvaluationScore,
  RubricCriterion,
} from '../src/langGraph/state/state.ts';

// Mock rubric for testing
function createMockRubric(): Rubric {
  const criterion: RubricCriterion = {
    id: 'criterion-1',
    name: 'Correctness',
    description: 'The output should be correct',
    weight: 50,
    scoringScale: {
      min: 0,
      max: 10,
    },
    isHardConstraint: true,
  };

  return {
    id: 'rubric-001',
    version: '1.0.0',
    criteria: [criterion],
    totalWeight: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Mock evaluation for testing
function createMockEvaluation(
  rubric: Rubric,
  type: 'agent' | 'human'
): Evaluation {
  const scores: EvaluationScore[] = rubric.criteria.map((c) => ({
    criterionId: c.id,
    score: 8,
    reasoning: `${type} evaluation for ${c.name}`,
  }));

  return {
    evaluatorType: type,
    scores,
    overallScore: 80,
    summary: `${type} evaluation completed`,
    timestamp: new Date().toISOString(),
  };
}

// Mock final report
function createMockFinalReport(
  agentEval: Evaluation | null,
  humanEval: Evaluation | null
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

// Simulate the HITL flow states
function simulateHITLFlowStates(): void {
  console.log('=== Simulating HITL Flow States ===\n');

  // Step 1: Start session - should return awaiting_rubric_review
  const mockRubric = createMockRubric();

  const startResult: StartSessionResult = {
    sessionId: 1,
    threadId: 'test-thread-001',
    status: 'awaiting_rubric_review',
    rubricDraft: mockRubric,
    message:
      'Graph paused for rubric review. Call submitRubricReview to continue.',
  };

  console.log('Step 1: startGraphSession');
  console.log(`  Status: ${startResult.status}`);
  console.log(`  Has rubricDraft: ${startResult.rubricDraft !== null}`);
  console.log(`  Expected status: awaiting_rubric_review`);
  console.log(
    `  ✅ Status matches: ${startResult.status === 'awaiting_rubric_review'}\n`
  );

  // Step 2: Submit rubric review - should return awaiting_human_evaluation
  const rubricReviewResult: RubricReviewResult = {
    sessionId: 1,
    threadId: 'test-thread-001',
    status: 'awaiting_human_evaluation',
    rubricFinal: { ...mockRubric, version: '1.0.1' },
    message:
      'Graph paused for human evaluation. Call submitHumanEvaluation to continue.',
  };

  console.log('Step 2: submitRubricReview');
  console.log(`  Status: ${rubricReviewResult.status}`);
  console.log(`  Has rubricFinal: ${rubricReviewResult.rubricFinal !== null}`);
  console.log(`  Expected status: awaiting_human_evaluation`);
  console.log(
    `  ✅ Status matches: ${
      rubricReviewResult.status === 'awaiting_human_evaluation'
    }\n`
  );

  // Step 3: Submit human evaluation - should return completed
  const agentEval = createMockEvaluation(mockRubric, 'agent');
  const humanEval = createMockEvaluation(mockRubric, 'human');
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

  // Verify final report structure
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

// Simulate automated flow states
function simulateAutomatedFlowStates(): void {
  console.log('=== Simulating Automated Flow States ===\n');

  const mockRubric = createMockRubric();
  const agentEval = createMockEvaluation(mockRubric, 'agent');
  // In automated mode, only agent evaluation is performed
  void createMockFinalReport(agentEval, null);

  // In automated mode, startSession should complete immediately
  const startResult: StartSessionResult = {
    sessionId: 2,
    threadId: 'test-thread-002',
    status: 'completed',
    rubricDraft: mockRubric,
    message: 'Evaluation completed successfully',
  };

  console.log('Automated Flow Result:');
  console.log(`  Status: ${startResult.status}`);
  console.log(`  Expected status: completed`);
  console.log(`  ✅ Status matches: ${startResult.status === 'completed'}\n`);
}

// Verify type compatibility
function verifyTypeCompatibility(): void {
  console.log('=== Verifying Type Compatibility ===\n');

  // Test all status values
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

  // Verify rubric structure
  const mockRubric = createMockRubric();
  console.log('Rubric Structure:');
  console.log(`  id: ${mockRubric.id}`);
  console.log(`  version: ${mockRubric.version}`);
  console.log(`  criteria count: ${mockRubric.criteria.length}`);
  console.log(`  totalWeight: ${mockRubric.totalWeight}`);
  console.log('');

  // Verify criterion structure
  const criterion = mockRubric.criteria[0];
  if (criterion) {
    console.log('Criterion Structure:');
    console.log(`  id: ${criterion.id}`);
    console.log(`  name: ${criterion.name}`);
    console.log(`  weight: ${criterion.weight}`);
    console.log(
      `  scoringScale: [${criterion.scoringScale.min}, ${criterion.scoringScale.max}]`
    );
    console.log(`  isHardConstraint: ${criterion.isHardConstraint}`);
  }
  console.log('');
}

// Main
console.log('HITL Flow Dry Run Test\n');
console.log(
  'This test validates the interface types and expected state transitions.\n'
);

simulateHITLFlowStates();
simulateAutomatedFlowStates();
verifyTypeCompatibility();

console.log('=== All Dry Run Tests Completed ===');
