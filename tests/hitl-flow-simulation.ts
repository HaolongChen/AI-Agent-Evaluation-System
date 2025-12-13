/**
 * Test file to simulate the entire multi-mutation HITL flow
 *
 * This test simulates:
 * 1. startGraphSession - starts evaluation, pauses at humanReviewer
 * 2. submitRubricReview - approves rubric, resumes, pauses at humanEvaluator
 * 3. submitHumanEvaluation - submits evaluation, completes the flow
 */

import { graphExecutionService } from '../src/services/GraphExecutionService.ts';
import { prisma } from '../src/config/prisma.ts';
import { goldenSetService } from '../src/services/GoldenSetService.ts';

// Mock data for testing
const TEST_PROJECT_EX_ID = 'test-project-123';
const TEST_SCHEMA_EX_ID = 'test-schema-456';
const TEST_MODEL_NAME = 'gpt-4';
const TEST_REVIEWER_ID = 'reviewer-account-001';
const TEST_EVALUATOR_ID = 'evaluator-account-002';

async function simulateHITLFlow() {
  console.log('=== Starting HITL Flow Simulation ===\n');

  try {
    // Step 0: Ensure we have a golden set for testing
    console.log('Step 0: Checking for golden set...');
    // Use 'DATA_MODEL_BUILDER' as key which maps to 'dataModel' internally
    const goldenSets = await goldenSetService.getGoldenSets(
      TEST_PROJECT_EX_ID,
      TEST_SCHEMA_EX_ID,
      'DATA_MODEL_BUILDER'
    );

    if (!goldenSets || goldenSets.length === 0) {
      console.log('No golden set found. Creating a test golden set...');
      await prisma.goldenSet.create({
        data: {
          projectExId: TEST_PROJECT_EX_ID,
          schemaExId: TEST_SCHEMA_EX_ID,
          copilotType: 'dataModel', // Prisma uses the actual enum value
          description: 'Test golden set for HITL simulation',
          promptTemplate:
            'Create a data model for a blog application with users, posts, and comments.',
          idealResponse: {
            entities: ['User', 'Post', 'Comment'],
            relationships: ['User hasMany Posts', 'Post hasMany Comments'],
          },
        },
      });
      console.log('Test golden set created.\n');
    } else {
      console.log(`Found ${goldenSets.length} golden set(s).\n`);
    }

    // Step 1: Start Graph Session
    console.log('Step 1: Starting graph session...');
    console.log(`  Project: ${TEST_PROJECT_EX_ID}`);
    console.log(`  Schema: ${TEST_SCHEMA_EX_ID}`);
    console.log(`  Model: ${TEST_MODEL_NAME}`);
    console.log(`  Skip Human Review: false`);
    console.log(`  Skip Human Evaluation: false`);

    const startResult = await graphExecutionService.startSession(
      TEST_PROJECT_EX_ID,
      TEST_SCHEMA_EX_ID,
      'dataModel',
      TEST_MODEL_NAME,
      false, // skipHumanReview
      false // skipHumanEvaluation
    );

    console.log('\nStart Session Result:');
    console.log(`  Session ID: ${startResult.sessionId}`);
    console.log(`  Thread ID: ${startResult.threadId}`);
    console.log(`  Status: ${startResult.status}`);
    console.log(`  Message: ${startResult.message}`);

    if (startResult.rubricDraft) {
      console.log(`  Rubric Draft ID: ${startResult.rubricDraft.id}`);
      console.log(
        `  Rubric Criteria Count: ${startResult.rubricDraft.criteria.length}`
      );
    }

    // Verify status is awaiting rubric review
    if (startResult.status !== 'awaiting_rubric_review') {
      console.log(
        `\n⚠️  Expected status 'awaiting_rubric_review', got '${startResult.status}'`
      );
      if (startResult.status === 'completed') {
        console.log(
          'Graph completed without interrupts. This might indicate skipHumanReview was true or interrupt not working.'
        );
      }
    } else {
      console.log('\n✅ Graph paused at humanReviewer as expected.\n');
    }

    // Step 2: Submit Rubric Review
    console.log('Step 2: Submitting rubric review...');
    console.log(`  Session ID: ${startResult.sessionId}`);
    console.log(`  Thread ID: ${startResult.threadId}`);
    console.log(`  Approved: true`);
    console.log(`  Reviewer: ${TEST_REVIEWER_ID}`);

    const reviewResult = await graphExecutionService.submitRubricReview(
      startResult.sessionId,
      startResult.threadId,
      true, // approved
      undefined, // no modifications
      'Rubric looks good, approved as-is.',
      TEST_REVIEWER_ID
    );

    console.log('\nRubric Review Result:');
    console.log(`  Session ID: ${reviewResult.sessionId}`);
    console.log(`  Thread ID: ${reviewResult.threadId}`);
    console.log(`  Status: ${reviewResult.status}`);
    console.log(`  Message: ${reviewResult.message}`);

    if (reviewResult.rubricFinal) {
      console.log(`  Final Rubric ID: ${reviewResult.rubricFinal.id}`);
    }

    // Verify status is awaiting human evaluation
    if (reviewResult.status !== 'awaiting_human_evaluation') {
      console.log(
        `\n⚠️  Expected status 'awaiting_human_evaluation', got '${reviewResult.status}'`
      );
    } else {
      console.log('\n✅ Graph paused at humanEvaluator as expected.\n');
    }

    // Step 3: Submit Human Evaluation
    console.log('Step 3: Submitting human evaluation...');

    // Create sample scores based on rubric criteria
    const sampleScores = reviewResult.rubricFinal?.criteria.map(
      (criterion) => ({
        criterionId: criterion.id,
        score: Math.floor(Math.random() * 3) + 8, // Random score 8-10
        reasoning: `Human evaluation for ${criterion.name}: The output meets the criterion requirements.`,
      })
    ) || [
      {
        criterionId: 'criterion-1',
        score: 9,
        reasoning: 'Good overall structure.',
      },
      {
        criterionId: 'criterion-2',
        score: 8,
        reasoning: 'Meets basic requirements.',
      },
    ];

    console.log(`  Session ID: ${reviewResult.sessionId}`);
    console.log(`  Thread ID: ${reviewResult.threadId}`);
    console.log(`  Scores: ${sampleScores.length} criteria evaluated`);
    console.log(`  Evaluator: ${TEST_EVALUATOR_ID}`);

    const evalResult = await graphExecutionService.submitHumanEvaluation(
      reviewResult.sessionId,
      reviewResult.threadId,
      sampleScores,
      'Overall, the AI copilot output is satisfactory and meets the evaluation criteria.',
      TEST_EVALUATOR_ID
    );

    console.log('\nHuman Evaluation Result:');
    console.log(`  Session ID: ${evalResult.sessionId}`);
    console.log(`  Thread ID: ${evalResult.threadId}`);
    console.log(`  Status: ${evalResult.status}`);
    console.log(`  Message: ${evalResult.message}`);

    if (evalResult.finalReport) {
      console.log(`  Final Report Verdict: ${evalResult.finalReport.verdict}`);
      console.log(
        `  Final Report Overall Score: ${evalResult.finalReport.overallScore}`
      );
      console.log(
        `  Final Report Summary: ${evalResult.finalReport.summary.substring(
          0,
          100
        )}...`
      );
    }

    // Verify status is completed
    if (evalResult.status !== 'completed') {
      console.log(
        `\n⚠️  Expected status 'completed', got '${evalResult.status}'`
      );
    } else {
      console.log('\n✅ Graph completed successfully!\n');
    }

    // Step 4: Verify session state
    console.log('Step 4: Verifying final session state...');
    const sessionState = await graphExecutionService.getSessionState(
      evalResult.sessionId
    );

    console.log('\nSession State:');
    console.log(`  Session ID: ${sessionState.sessionId}`);
    console.log(`  Status: ${sessionState.status}`);
    console.log(`  Thread ID: ${sessionState.threadId}`);
    console.log(`  Has Rubric Draft: ${sessionState.rubricDraft !== null}`);
    console.log(`  Has Rubric Final: ${sessionState.rubricFinal !== null}`);
    console.log(
      `  Has Agent Evaluation: ${sessionState.agentEvaluation !== null}`
    );
    console.log(
      `  Has Human Evaluation: ${sessionState.humanEvaluation !== null}`
    );
    console.log(`  Has Final Report: ${sessionState.finalReport !== null}`);

    console.log('\n=== HITL Flow Simulation Complete ===');
    return true;
  } catch (error) {
    console.error('\n❌ Error during HITL flow simulation:', error);
    return false;
  }
}

async function testAutomatedFlow() {
  console.log('\n=== Testing Automated Flow (No HITL) ===\n');

  try {
    const result = await graphExecutionService.runAutomatedEvaluation(
      TEST_PROJECT_EX_ID,
      TEST_SCHEMA_EX_ID,
      'dataModel',
      TEST_MODEL_NAME
    );

    console.log('Automated Evaluation Result:');
    console.log(`  Session ID: ${result.sessionId}`);
    console.log(`  Thread ID: ${result.threadId}`);
    console.log(`  Has Final Report: ${result.finalReport !== null}`);

    if (result.finalReport) {
      console.log(`  Verdict: ${result.finalReport.verdict}`);
      console.log(`  Overall Score: ${result.finalReport.overallScore}`);
    }

    console.log('\n✅ Automated flow completed!\n');
    return true;
  } catch (error) {
    console.error('\n❌ Error during automated flow:', error);
    return false;
  }
}

// Main execution
async function main() {
  console.log('Starting HITL Integration Tests...\n');
  console.log('Note: This requires a running database and LangGraph setup.\n');

  try {
    // Test HITL flow
    const hitlSuccess = await simulateHITLFlow();

    // Test automated flow
    const autoSuccess = await testAutomatedFlow();

    console.log('\n=== Test Summary ===');
    console.log(`HITL Flow: ${hitlSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Automated Flow: ${autoSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
