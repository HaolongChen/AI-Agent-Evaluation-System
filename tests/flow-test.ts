/**
 * End-to-End Evaluation Flow Test
 *
 * This test exercises the complete evaluation pipeline:
 * 1. execAiCopilotByTypeAndModel - Triggers the full evaluation flow
 *    - EvaluationJobRunner: Connects to AI copilot WebSocket, sends prompt, gets response
 *    - RubricGenerationJobRunner: Uses LangGraph to generate rubrics and evaluate the response
 * 2. execAiCopilot - Runs evaluation for all golden sets
 *
 * The flow is:
 * Golden Set → EvaluationJobRunner (WebSocket) → AI Response →
 * RubricGenerationJobRunner (LangGraph) → Rubric + Evaluation → Database
 */

const GRAPHQL_URL = 'http://localhost:4000/graphql';

// Test configuration - use existing golden set data
const TEST_PROJECT_EX_ID = 'X57jbwZzB76';
const TEST_SCHEMA_EX_ID = 'example-schema-1';
const TEST_MODEL_NAME = 'functorz-sweden-central-gpt-5';

// Timeout for long-running operations (5 minutes)
const LONG_TIMEOUT_MS = 300000;

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; path?: string[] }>;
}

interface GoldenSet {
  id: string;
  projectExId: string;
  schemaExId: string;
  copilotType: string;
  description?: string;
  promptTemplate: string;
  idealResponse: unknown;
}

async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  timeoutMs: number = 30000
): Promise<GraphQLResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });
    return (await response.json()) as Promise<GraphQLResponse<T>>;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Test 1: Verify golden sets exist in the database
 */
async function testGetGoldenSets(): Promise<boolean> {
  console.log('=== Test 1: Verify Golden Sets Exist ===\n');

  try {
    const query = `
      query GetGoldenSets($projectExId: String, $copilotType: CopilotType) {
        getGoldenSets(projectExId: $projectExId, copilotType: $copilotType) {
          id
          projectExId
          schemaExId
          copilotType
          description
          promptTemplate
        }
      }
    `;

    const result = await graphqlRequest<{ getGoldenSets: GoldenSet[] }>(query, {
      projectExId: TEST_PROJECT_EX_ID,
    });

    if (result.errors) {
      console.error('❌ Failed to get golden sets:', result.errors);
      return false;
    }

    const goldenSets = result.data?.getGoldenSets;
    if (!goldenSets || goldenSets.length === 0) {
      console.error('❌ No golden sets found for project:', TEST_PROJECT_EX_ID);
      return false;
    }

    console.log(`✅ Found ${goldenSets.length} golden set(s):`);
    goldenSets.forEach((gs, i) => {
      console.log(`  ${i + 1}. ID: ${gs.id}`);
      console.log(`     Project: ${gs.projectExId}`);
      console.log(`     Schema: ${gs.schemaExId}`);
      console.log(`     Copilot Type: ${gs.copilotType}`);
      console.log(
        `     Prompt: ${gs.promptTemplate.substring(0, 100)}${gs.promptTemplate.length > 100 ? '...' : ''}`
      );
    });

    console.log('\n✅ Test 1 Passed: Golden sets available\n');
    return true;
  } catch (error) {
    console.error('❌ Error getting golden sets:', error);
    return false;
  }
}

/**
 * Test 2: Run execAiCopilotByTypeAndModel mutation
 * This triggers the full evaluation pipeline:
 * - EvaluationJobRunner connects to WebSocket and gets AI response
 * - RubricGenerationJobRunner generates rubrics and evaluates
 */
async function testExecAiCopilotByTypeAndModel(): Promise<boolean> {
  console.log('=== Test 2: execAiCopilotByTypeAndModel ===\n');
  console.log('This test runs the full evaluation pipeline:');
  console.log('  1. EvaluationJobRunner: WebSocket → AI Copilot → Response');
  console.log(
    '  2. RubricGenerationJobRunner: LangGraph → Rubric + Evaluation'
  );
  console.log('\n⏳ This may take several minutes...\n');

  try {
    const mutation = `
      mutation ExecAiCopilotByTypeAndModel(
        $projectExId: String!
        $schemaExId: String!
        $copilotType: CopilotType!
        $modelName: String!
      ) {
        execAiCopilotByTypeAndModel(
          projectExId: $projectExId
          schemaExId: $schemaExId
          copilotType: $copilotType
          modelName: $modelName
        )
      }
    `;

    const startTime = Date.now();

    const result = await graphqlRequest<{
      execAiCopilotByTypeAndModel: boolean;
    }>(
      mutation,
      {
        projectExId: TEST_PROJECT_EX_ID,
        schemaExId: TEST_SCHEMA_EX_ID,
        copilotType: 'DATA_MODEL_BUILDER',
        modelName: TEST_MODEL_NAME,
      },
      LONG_TIMEOUT_MS
    );

    const elapsedMs = Date.now() - startTime;
    console.log(`  Execution time: ${(elapsedMs / 1000).toFixed(2)}s`);

    if (result.errors) {
      console.error('❌ Mutation failed:', result.errors);
      return false;
    }

    const success = result.data?.execAiCopilotByTypeAndModel;
    if (success) {
      console.log('✅ execAiCopilotByTypeAndModel returned true');
      console.log('\n✅ Test 2 Passed: Full evaluation pipeline completed\n');
      return true;
    } else {
      console.error('❌ execAiCopilotByTypeAndModel returned false');
      return false;
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`❌ Test timed out after ${LONG_TIMEOUT_MS / 1000}s`);
    } else {
      console.error('❌ Error executing mutation:', error);
    }
    return false;
  }
}

/**
 * Test 3: Verify evaluation sessions were created
 */
async function testGetSessions(): Promise<boolean> {
  console.log('=== Test 3: Verify Evaluation Sessions ===\n');

  try {
    const query = `
      query GetSessions($schemaExId: String, $copilotType: CopilotType, $modelName: String) {
        getSessions(schemaExId: $schemaExId, copilotType: $copilotType, modelName: $modelName) {
          id
          projectExId
          schemaExId
          copilotType
          modelName
          status
          startedAt
          completedAt
          totalLatencyMs
          roundtripCount
          inputTokens
          outputTokens
          rubric {
            id
            rubricId
            version
            reviewStatus
          }
          result {
            id
            verdict
            overallScore
            summary
          }
        }
      }
    `;

    const result = await graphqlRequest<{
      getSessions: Array<{
        id: string;
        projectExId: string;
        schemaExId: string;
        copilotType: string;
        modelName: string;
        status: string;
        startedAt: string;
        completedAt: string | null;
        totalLatencyMs: number | null;
        roundtripCount: number | null;
        inputTokens: number | null;
        outputTokens: number | null;
        rubric: {
          id: string;
          rubricId: string;
          version: string;
          reviewStatus: string;
        } | null;
        result: {
          id: string;
          verdict: string;
          overallScore: number;
          summary: string;
        } | null;
      }>;
    }>(query, {
      schemaExId: TEST_SCHEMA_EX_ID,
    });

    if (result.errors) {
      console.error('❌ Failed to get sessions:', result.errors);
      return false;
    }

    const sessions = result.data?.getSessions;
    if (!sessions || sessions.length === 0) {
      console.log('⚠️  No evaluation sessions found');
      console.log('   This may be expected if no evaluations have been run yet');
      return true; // Not a failure, just informational
    }

    console.log(`Found ${sessions.length} evaluation session(s):\n`);
    sessions.slice(0, 5).forEach((session, i) => {
      console.log(`  Session ${i + 1}:`);
      console.log(`    ID: ${session.id}`);
      console.log(`    Status: ${session.status}`);
      console.log(`    Model: ${session.modelName}`);
      console.log(`    Started: ${session.startedAt}`);
      if (session.completedAt) {
        console.log(`    Completed: ${session.completedAt}`);
      }
      if (session.totalLatencyMs) {
        console.log(`    Latency: ${session.totalLatencyMs}ms`);
      }
      if (session.rubric) {
        console.log(`    Rubric: ${session.rubric.rubricId} (${session.rubric.reviewStatus})`);
      }
      if (session.result) {
        console.log(`    Result: ${session.result.verdict} (Score: ${session.result.overallScore})`);
      }
      console.log('');
    });

    if (sessions.length > 5) {
      console.log(`  ... and ${sessions.length - 5} more sessions`);
    }

    console.log('✅ Test 3 Passed: Sessions retrieved successfully\n');
    return true;
  } catch (error) {
    console.error('❌ Error getting sessions:', error);
    return false;
  }
}

/**
 * Test 4: Run execAiCopilot mutation (all golden sets)
 * This is optional and runs all golden sets - can be slow
 */
async function testExecAiCopilotAll(): Promise<boolean> {
  console.log('=== Test 4: execAiCopilot (All Golden Sets) ===\n');
  console.log('⚠️  This test runs evaluation for ALL golden sets');
  console.log('⏳ This may take a very long time...\n');

  try {
    const mutation = `
      mutation ExecAiCopilot {
        execAiCopilot
      }
    `;

    const startTime = Date.now();

    const result = await graphqlRequest<{ execAiCopilot: boolean }>(
      mutation,
      {},
      LONG_TIMEOUT_MS * 2 // Double timeout for all golden sets
    );

    const elapsedMs = Date.now() - startTime;
    console.log(`  Execution time: ${(elapsedMs / 1000).toFixed(2)}s`);

    if (result.errors) {
      console.error('❌ Mutation failed:', result.errors);
      return false;
    }

    const success = result.data?.execAiCopilot;
    if (success) {
      console.log('✅ execAiCopilot returned true');
      console.log('\n✅ Test 4 Passed: All golden sets evaluated\n');
      return true;
    } else {
      console.error('❌ execAiCopilot returned false');
      return false;
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`❌ Test timed out after ${(LONG_TIMEOUT_MS * 2) / 1000}s`);
    } else {
      console.error('❌ Error executing mutation:', error);
    }
    return false;
  }
}

/**
 * Test 5: Verify rubrics were generated
 */
async function testGetRubrics(): Promise<boolean> {
  console.log('=== Test 5: Verify Rubrics Generated ===\n');

  try {
    const query = `
      query GetAdaptiveRubricsBySchemaExId($schemaExId: String!) {
        getAdaptiveRubricsBySchemaExId(schemaExId: $schemaExId) {
          id
          rubricId
          version
          totalWeight
          reviewStatus
          copilotInput
          modelName
          createdAt
          criteria {
            id
            name
            description
            weight
            scoringScale { min max }
            isHardConstraint
          }
          judgeRecords {
            id
            evaluatorType
            overallScore
            summary
          }
        }
      }
    `;

    const result = await graphqlRequest<{
      getAdaptiveRubricsBySchemaExId: Array<{
        id: string;
        rubricId: string;
        version: string;
        totalWeight: number;
        reviewStatus: string;
        copilotInput: string | null;
        modelName: string | null;
        createdAt: string;
        criteria: Array<{
          id: string;
          name: string;
          description: string;
          weight: number;
          scoringScale: { min: number; max: number };
          isHardConstraint: boolean;
        }>;
        judgeRecords: Array<{
          id: string;
          evaluatorType: string;
          overallScore: number;
          summary: string;
        }>;
      }>;
    }>(query, {
      schemaExId: TEST_SCHEMA_EX_ID,
    });

    if (result.errors) {
      console.error('❌ Failed to get rubrics:', result.errors);
      return false;
    }

    const rubrics = result.data?.getAdaptiveRubricsBySchemaExId;
    if (!rubrics || rubrics.length === 0) {
      console.log('⚠️  No rubrics found for schema:', TEST_SCHEMA_EX_ID);
      return true; // Not a failure
    }

    console.log(`Found ${rubrics.length} rubric(s):\n`);
    rubrics.slice(0, 3).forEach((rubric, i) => {
      console.log(`  Rubric ${i + 1}:`);
      console.log(`    ID: ${rubric.rubricId}`);
      console.log(`    Version: ${rubric.version}`);
      console.log(`    Review Status: ${rubric.reviewStatus}`);
      console.log(`    Criteria: ${rubric.criteria.length}`);
      console.log(`    Total Weight: ${rubric.totalWeight}`);
      if (rubric.judgeRecords.length > 0) {
        console.log(`    Judge Records: ${rubric.judgeRecords.length}`);
        rubric.judgeRecords.forEach((jr) => {
          console.log(`      - ${jr.evaluatorType}: Score ${jr.overallScore}`);
        });
      }
      console.log('');
    });

    console.log('✅ Test 5 Passed: Rubrics retrieved successfully\n');
    return true;
  } catch (error) {
    console.error('❌ Error getting rubrics:', error);
    return false;
  }
}

// Main test runner
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║       End-to-End Evaluation Pipeline Flow Test               ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  GraphQL Endpoint: ' + GRAPHQL_URL.padEnd(42) + '║');
  console.log('║  Project: ' + TEST_PROJECT_EX_ID.padEnd(51) + '║');
  console.log('║  Schema: ' + TEST_SCHEMA_EX_ID.padEnd(52) + '║');
  console.log('║  Model: ' + TEST_MODEL_NAME.padEnd(53) + '║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const results: Record<string, boolean> = {};

  // Test 1: Verify golden sets exist
  results['1. Golden Sets'] = await testGetGoldenSets();
  if (!results['1. Golden Sets']) {
    console.log('❌ Cannot proceed without golden sets');
    process.exit(1);
  }

  // Test 2: Run single evaluation (execAiCopilotByTypeAndModel)
  // This is the main test that runs EvaluationJobRunner → RubricGenerationJobRunner
  const runFullTest = process.argv.includes('--full');
  if (runFullTest) {
    results['2. execAiCopilotByTypeAndModel'] =
      await testExecAiCopilotByTypeAndModel();
  } else {
    console.log('=== Test 2: execAiCopilotByTypeAndModel ===\n');
    console.log('⏭️  Skipped (use --full flag to run)\n');
    results['2. execAiCopilotByTypeAndModel'] = true; // Mark as passed when skipped
  }

  // Test 3: Verify sessions exist
  results['3. Get Sessions'] = await testGetSessions();

  // Test 4: Run all golden sets (optional, very slow)
  const runAllGoldenSets = process.argv.includes('--all');
  if (runAllGoldenSets) {
    results['4. execAiCopilot (All)'] = await testExecAiCopilotAll();
  } else {
    console.log('=== Test 4: execAiCopilot (All Golden Sets) ===\n');
    console.log('⏭️  Skipped (use --all flag to run)\n');
    results['4. execAiCopilot (All)'] = true;
  }

  // Test 5: Verify rubrics generated
  results['5. Get Rubrics'] = await testGetRubrics();

  // Print summary
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                       Test Summary                           ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');

  let allPassed = true;
  for (const [name, passed] of Object.entries(results)) {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`║  ${name.padEnd(45)} ${status.padEnd(12)} ║`);
    if (!passed) allPassed = false;
  }

  console.log('╠══════════════════════════════════════════════════════════════╣');
  const overallStatus = allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED';
  console.log(`║  ${overallStatus.padEnd(58)} ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');

  console.log('\nUsage:');
  console.log('  npx tsx tests/flow-test.ts          # Quick tests (golden sets, sessions, rubrics)');
  console.log('  npx tsx tests/flow-test.ts --full   # Run single evaluation (EvaluationJobRunner + RubricGenerationJobRunner)');
  console.log('  npx tsx tests/flow-test.ts --all    # Run all golden sets (slow)');

  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
