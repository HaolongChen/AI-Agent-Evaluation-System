/**
 * HITL Multi-Mutation Flow Test
 * 
 * This test exercises the full HITL flow:
 * 1. startGraphSession - starts evaluation, pauses at humanReviewer
 * 2. submitRubricReview - approves rubric, resumes, pauses at humanEvaluator
 * 3. submitHumanEvaluation - submits evaluation, completes the flow
 */

const GRAPHQL_URL = 'http://localhost:4000/graphql';

// Test configuration - use existing golden set data
const TEST_PROJECT_EX_ID = 'X57jbwZzB76';
const TEST_SCHEMA_EX_ID = 'example-schema-1';
// Use the actual Azure deployment name from .env
const TEST_MODEL_NAME = 'functorz-sweden-central-gpt-5';
const TEST_REVIEWER_ID = 'reviewer-account-001';
const TEST_EVALUATOR_ID = 'evaluator-account-002';

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; path?: string[] }>;
}

interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  scoringScale: { min: number; max: number };
  isHardConstraint: boolean;
}

interface RubricOutput {
  id: string;
  version: string;
  criteria: RubricCriterion[];
  totalWeight: number;
}

interface StartSessionResult {
  sessionId: number;
  threadId: string;
  status: string;
  rubricDraft: RubricOutput | null;
  message: string;
}

interface RubricReviewResult {
  sessionId: number;
  threadId: string;
  status: string;
  rubricFinal: RubricOutput | null;
  message: string;
}

interface HumanEvaluationResult {
  sessionId: number;
  threadId: string;
  status: string;
  finalReport: {
    verdict: string;
    overallScore: number;
    summary: string;
  } | null;
  message: string;
}

async function graphqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<GraphQLResponse<T>> {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  return response.json() as Promise<GraphQLResponse<T>>;
}

async function testHITLFlow(): Promise<boolean> {
  console.log('=== Starting HITL Flow Test ===\n');

  try {
    // Step 1: Start Graph Session
    console.log('Step 1: Starting graph session...');
    const startQuery = `
      mutation StartGraphSession($projectExId: String!, $schemaExId: String!, $copilotType: CopilotType!, $modelName: String!) {
        startGraphSession(
          projectExId: $projectExId
          schemaExId: $schemaExId
          copilotType: $copilotType
          modelName: $modelName
          skipHumanReview: false
          skipHumanEvaluation: false
        ) {
          sessionId
          threadId
          status
          message
          rubricDraft {
            id
            version
            criteria {
              id
              name
              description
              weight
              scoringScale { min max }
              isHardConstraint
            }
            totalWeight
          }
        }
      }
    `;

    const startResult = await graphqlRequest<{ startGraphSession: StartSessionResult }>(startQuery, {
      projectExId: TEST_PROJECT_EX_ID,
      schemaExId: TEST_SCHEMA_EX_ID,
      copilotType: 'DATA_MODEL_BUILDER',
      modelName: TEST_MODEL_NAME,
    });

    if (startResult.errors) {
      console.error('❌ Step 1 Failed:', startResult.errors);
      return false;
    }

    const startData = startResult.data?.startGraphSession;
    if (!startData) {
      console.error('❌ Step 1 Failed: No data returned');
      return false;
    }

    console.log(`  Session ID: ${startData.sessionId}`);
    console.log(`  Thread ID: ${startData.threadId}`);
    console.log(`  Status: ${startData.status}`);
    console.log(`  Message: ${startData.message}`);

    if (startData.status !== 'AWAITING_RUBRIC_REVIEW') {
      console.log(`\n⚠️  Expected status 'AWAITING_RUBRIC_REVIEW', got '${startData.status}'`);
      if (startData.status === 'COMPLETED') {
        console.log('Graph completed without interrupts. Check if interrupt() is being called.');
        return false;
      }
    } else {
      console.log('✅ Step 1 passed: Graph paused at humanReviewer\n');
    }

    if (!startData.rubricDraft) {
      console.error('❌ No rubric draft returned');
      return false;
    }

    console.log(`  Rubric Draft ID: ${startData.rubricDraft.id}`);
    console.log(`  Rubric Criteria Count: ${startData.rubricDraft.criteria.length}`);

    // Step 2: Submit Rubric Review
    console.log('\nStep 2: Submitting rubric review...');
    const reviewQuery = `
      mutation SubmitRubricReview($sessionId: Int!, $threadId: String!, $approved: Boolean!, $reviewerAccountId: String!) {
        submitRubricReview(
          sessionId: $sessionId
          threadId: $threadId
          approved: $approved
          reviewerAccountId: $reviewerAccountId
        ) {
          sessionId
          threadId
          status
          message
          rubricFinal {
            id
            version
            criteria {
              id
              name
              weight
              scoringScale { min max }
            }
            totalWeight
          }
        }
      }
    `;

    const reviewResult = await graphqlRequest<{ submitRubricReview: RubricReviewResult }>(reviewQuery, {
      sessionId: startData.sessionId,
      threadId: startData.threadId,
      approved: true,
      reviewerAccountId: TEST_REVIEWER_ID,
    });

    if (reviewResult.errors) {
      console.error('❌ Step 2 Failed:', reviewResult.errors);
      return false;
    }

    const reviewData = reviewResult.data?.submitRubricReview;
    if (!reviewData) {
      console.error('❌ Step 2 Failed: No data returned');
      return false;
    }

    console.log(`  Session ID: ${reviewData.sessionId}`);
    console.log(`  Status: ${reviewData.status}`);
    console.log(`  Message: ${reviewData.message}`);

    if (reviewData.status !== 'AWAITING_HUMAN_EVALUATION') {
      console.log(`\n⚠️  Expected status 'AWAITING_HUMAN_EVALUATION', got '${reviewData.status}'`);
    } else {
      console.log('✅ Step 2 passed: Graph paused at humanEvaluator\n');
    }

    // Step 3: Submit Human Evaluation
    console.log('\nStep 3: Submitting human evaluation...');

    // Create sample scores based on rubric criteria
    // Use the rubricFinal if available, otherwise use rubricDraft
    const rubricFinal = reviewData.rubricFinal || startData.rubricDraft;
    const scores = rubricFinal.criteria.map((criterion: RubricCriterion) => {
      // Use the max value from the scoring scale, default to 5 if not available
      const maxScore = criterion.scoringScale?.max ?? 5;
      const minScore = criterion.scoringScale?.min ?? 0;
      // Give a score within valid range (75% of max)
      const score = Math.round(minScore + (maxScore - minScore) * 0.75);
      return {
        criterionId: criterion.id,
        score,
        reasoning: `Human evaluation for ${criterion.name}: The output meets the criterion requirements.`,
      };
    });

    const evalQuery = `
      mutation SubmitHumanEvaluation($sessionId: Int!, $threadId: String!, $scores: [EvaluationScoreInput!]!, $overallAssessment: String!, $evaluatorAccountId: String!) {
        submitHumanEvaluation(
          sessionId: $sessionId
          threadId: $threadId
          scores: $scores
          overallAssessment: $overallAssessment
          evaluatorAccountId: $evaluatorAccountId
        ) {
          sessionId
          threadId
          status
          message
          finalReport {
            verdict
            overallScore
            summary
          }
        }
      }
    `;

    const evalResult = await graphqlRequest<{ submitHumanEvaluation: HumanEvaluationResult }>(evalQuery, {
      sessionId: reviewData.sessionId,
      threadId: reviewData.threadId,
      scores,
      overallAssessment: 'Overall, the AI copilot output is satisfactory and meets the evaluation criteria.',
      evaluatorAccountId: TEST_EVALUATOR_ID,
    });

    if (evalResult.errors) {
      console.error('❌ Step 3 Failed:', evalResult.errors);
      return false;
    }

    const evalData = evalResult.data?.submitHumanEvaluation;
    if (!evalData) {
      console.error('❌ Step 3 Failed: No data returned');
      return false;
    }

    console.log(`  Session ID: ${evalData.sessionId}`);
    console.log(`  Status: ${evalData.status}`);
    console.log(`  Message: ${evalData.message}`);

    if (evalData.status !== 'COMPLETED') {
      console.log(`\n⚠️  Expected status 'COMPLETED', got '${evalData.status}'`);
    } else {
      console.log('✅ Step 3 passed: Graph completed successfully\n');
    }

    if (evalData.finalReport) {
      console.log('Final Report:');
      console.log(`  Verdict: ${evalData.finalReport.verdict}`);
      console.log(`  Overall Score: ${evalData.finalReport.overallScore}`);
      console.log(`  Summary: ${evalData.finalReport.summary.substring(0, 100)}...`);
    }

    console.log('\n=== HITL Flow Test Complete ===');
    return true;

  } catch (error) {
    console.error('\n❌ Error during HITL flow test:', error);
    return false;
  }
}

async function testAutomatedFlow(): Promise<boolean> {
  console.log('\n=== Starting Automated Flow Test ===\n');

  try {
    const query = `
      mutation RunAutomatedEvaluation($projectExId: String!, $schemaExId: String!, $copilotType: CopilotType!, $modelName: String!) {
        runAutomatedEvaluation(
          projectExId: $projectExId
          schemaExId: $schemaExId
          copilotType: $copilotType
          modelName: $modelName
        ) {
          sessionId
          threadId
          status
          message
          finalReport {
            verdict
            overallScore
            summary
          }
        }
      }
    `;

    const result = await graphqlRequest<{ runAutomatedEvaluation: HumanEvaluationResult }>(query, {
      projectExId: TEST_PROJECT_EX_ID,
      schemaExId: TEST_SCHEMA_EX_ID,
      copilotType: 'DATA_MODEL_BUILDER',
      modelName: TEST_MODEL_NAME,
    });

    if (result.errors) {
      console.error('❌ Automated Flow Failed:', result.errors);
      return false;
    }

    const data = result.data?.runAutomatedEvaluation;
    if (!data) {
      console.error('❌ Automated Flow Failed: No data returned');
      return false;
    }

    console.log(`Session ID: ${data.sessionId}`);
    console.log(`Thread ID: ${data.threadId}`);
    console.log(`Status: ${data.status}`);
    console.log(`Message: ${data.message}`);

    if (data.finalReport) {
      console.log(`Verdict: ${data.finalReport.verdict}`);
      console.log(`Overall Score: ${data.finalReport.overallScore}`);
    }

    console.log('\n✅ Automated Flow Test Complete\n');
    return true;

  } catch (error) {
    console.error('\n❌ Error during automated flow test:', error);
    return false;
  }
}

// Main
async function main() {
  console.log('HITL Multi-Mutation Flow Test\n');
  console.log(`GraphQL Endpoint: ${GRAPHQL_URL}\n`);

  // Test HITL flow
  const hitlSuccess = await testHITLFlow();

  // Test automated flow
  const autoSuccess = await testAutomatedFlow();

  console.log('\n=== Test Summary ===');
  console.log(`HITL Flow: ${hitlSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Automated Flow: ${autoSuccess ? '✅ PASSED' : '❌ FAILED'}`);
}

main().catch(console.error);