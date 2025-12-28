/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from 'dotenv';
import { logger } from '../src/utils/logger.ts';
import { GraphExecutionService } from '../src/services/GraphExecutionService.ts';
import { prisma } from '../src/config/prisma.ts';
import type { Rubric, Evaluation } from '../src/langGraph/state/state.ts';

config();

const graphExecutionService = new GraphExecutionService();

interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function addResult(testName: string, passed: boolean, error?: string): void {
  results.push({ testName, passed, error });
  if (passed) {
    logger.info(`✅ PASSED: ${testName}`);
  } else {
    logger.error(`❌ FAILED: ${testName}`, error);
  }
}

async function setupTestSession(): Promise<{
  sessionId: number;
  threadId: string;
  rubricDraft: Rubric;
}> {
  const goldenSet = await prisma.goldenSet.findFirst({
    where: { isActive: false },
  });

  if (!goldenSet) {
    throw new Error('No inactive golden set found for testing');
  }

  const session = await prisma.evaluationSession.create({
    data: {
      goldenSetId: goldenSet.id,
      status: 'running',
      modelName: 'gpt-4o',
      metadata: {
        threadId: `test-thread-${Date.now()}`,
        skipHumanReview: false,
        skipHumanEvaluation: false,
      },
    },
  });

  const rubricDraft: Rubric = {
    id: `rubric-${Date.now()}`,
    version: '1.0.0',
    criteria: [
      {
        id: 'crit-1',
        name: 'Correctness',
        description: 'Output matches expected result',
        weight: 0.5,
        scoringScale: { min: 0, max: 1 },
        isHardConstraint: true,
      },
      {
        id: 'crit-2',
        name: 'Performance',
        description: 'Response time is acceptable',
        weight: 0.3,
        scoringScale: { min: 0, max: 1 },
        isHardConstraint: false,
      },
      {
        id: 'crit-3',
        name: 'Code Quality',
        description: 'Code follows best practices',
        weight: 0.2,
        scoringScale: { min: 0, max: 1 },
        isHardConstraint: false,
      },
    ],
    totalWeight: 1.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await prisma.adaptiveRubric.create({
    data: {
      rubricId: rubricDraft.id,
      sessionId: session.id,
      version: rubricDraft.version,
      criteria: JSON.parse(JSON.stringify(rubricDraft.criteria)),
      totalWeight: rubricDraft.totalWeight,
      reviewStatus: 'pending',
    },
  });

  return {
    sessionId: session.id,
    threadId: (session.metadata as { threadId: string }).threadId,
    rubricDraft,
  };
}

async function testSingleCriterionPatch(): Promise<void> {
  const testName = 'Single criterion patch updates one criterion';
  try {
    const { sessionId } = await setupTestSession();

    const state = await graphExecutionService.getSessionState(sessionId);
    const originalRubric = state.rubricDraft;

    if (!originalRubric) {
      throw new Error('No rubric draft found');
    }

    const originalCrit1 = originalRubric.criteria.find(
      (c: { id: string }) => c.id === 'crit-1'
    );

    const criteriaPatches = [
      {
        criterionId: 'crit-1',
        name: 'Correctness - Updated',
        weight: 0.6,
      },
    ];

    const mergeMethod = (graphExecutionService as any).mergeRubricPatches.bind(
      graphExecutionService
    );
    const mergedRubric = mergeMethod(originalRubric, criteriaPatches);

    const updatedCrit1 = mergedRubric.criteria.find(
      (c: { id: string }) => c.id === 'crit-1'
    );
    const unchangedCrit2 = mergedRubric.criteria.find(
      (c: { id: string }) => c.id === 'crit-2'
    );

    if (!updatedCrit1 || !unchangedCrit2) {
      throw new Error('Criteria not found after merge');
    }

    const nameUpdated = updatedCrit1.name === 'Correctness - Updated';
    const weightUpdated = updatedCrit1.weight === 0.6;
    const descriptionUnchanged =
      updatedCrit1.description === originalCrit1?.description;
    const crit2Unchanged = unchangedCrit2.name === 'Performance';

    if (!nameUpdated || !weightUpdated || !descriptionUnchanged || !crit2Unchanged) {
      throw new Error(
        `Merge failed: nameUpdated=${nameUpdated}, weightUpdated=${weightUpdated}, descriptionUnchanged=${descriptionUnchanged}, crit2Unchanged=${crit2Unchanged}`
      );
    }

    addResult(testName, true);
  } catch (error) {
    addResult(testName, false, error instanceof Error ? error.message : String(error));
  }
}

async function testMultipleCriteriaPatches(): Promise<void> {
  const testName = 'Multiple criteria patches update multiple criteria';
  try {
    const { sessionId } = await setupTestSession();

    const state = await graphExecutionService.getSessionState(sessionId);
    const originalRubric = state.rubricDraft;

    if (!originalRubric) {
      throw new Error('No rubric draft found');
    }

    const criteriaPatches = [
      {
        criterionId: 'crit-1',
        weight: 0.4,
      },
      {
        criterionId: 'crit-2',
        name: 'Performance - Enhanced',
        weight: 0.4,
      },
      {
        criterionId: 'crit-3',
        weight: 0.2,
      },
    ];

    const mergeMethod = (graphExecutionService as any).mergeRubricPatches.bind(
      graphExecutionService
    );
    const mergedRubric = mergeMethod(originalRubric, criteriaPatches);

    const totalWeight = mergedRubric.criteria.reduce(
      (sum: number, c: { weight: number }) => sum + c.weight,
      0
    );
    const totalWeightRecalculated = Math.abs(mergedRubric.totalWeight - totalWeight) < 0.001;

    const crit1Updated =
      mergedRubric.criteria.find((c: { id: string }) => c.id === 'crit-1')?.weight === 0.4;
    const crit2Updated =
      mergedRubric.criteria.find((c: { id: string }) => c.id === 'crit-2')?.name ===
      'Performance - Enhanced';
    const crit3Updated =
      mergedRubric.criteria.find((c: { id: string }) => c.id === 'crit-3')?.weight === 0.2;

    if (!totalWeightRecalculated || !crit1Updated || !crit2Updated || !crit3Updated) {
      throw new Error(
        `Merge failed: totalWeight=${totalWeightRecalculated}, crit1=${crit1Updated}, crit2=${crit2Updated}, crit3=${crit3Updated}`
      );
    }

    addResult(testName, true);
  } catch (error) {
    addResult(testName, false, error instanceof Error ? error.message : String(error));
  }
}

async function testInvalidCriterionIdValidation(): Promise<void> {
  const testName = 'Invalid criterionId throws validation error';
  try {
    const { sessionId } = await setupTestSession();

    const state = await graphExecutionService.getSessionState(sessionId);
    const originalRubric = state.rubricDraft;

    if (!originalRubric) {
      throw new Error('No rubric draft found');
    }

    const criteriaPatches = [
      {
        criterionId: 'crit-invalid',
        name: 'This should fail',
      },
    ];

    const mergeMethod = (graphExecutionService as any).mergeRubricPatches.bind(
      graphExecutionService
    );

    try {
      mergeMethod(originalRubric, criteriaPatches);
      throw new Error('Should have thrown validation error');
    } catch (validationError) {
      if (
        validationError instanceof Error &&
        validationError.message.includes('Invalid criterionId')
      ) {
        addResult(testName, true);
      } else {
        throw validationError;
      }
    }
  } catch (error) {
    addResult(testName, false, error instanceof Error ? error.message : String(error));
  }
}

async function testSingleScorePatch(): Promise<void> {
  const testName = 'Single score patch updates one score';
  try {
    const { sessionId } = await setupTestSession();

    const state = await graphExecutionService.getSessionState(sessionId);
    const rubric = state.rubricDraft;

    if (!rubric) {
      throw new Error('No rubric found');
    }

    const agentEvaluation: Evaluation = {
      evaluatorType: 'agent',
      scores: [
        { criterionId: 'crit-1', score: 0.8, reasoning: 'Good', evidence: [] },
        { criterionId: 'crit-2', score: 0.6, reasoning: 'OK', evidence: [] },
        { criterionId: 'crit-3', score: 0.7, reasoning: 'Decent', evidence: [] },
      ],
      overallScore: 0.73,
      summary: 'Agent evaluation',
      timestamp: new Date().toISOString(),
    };

    const scorePatches = [
      {
        criterionId: 'crit-1',
        score: 1.0,
        reasoning: 'Actually perfect',
      },
    ];

    const mergeMethod = (graphExecutionService as any).mergeEvaluationPatches.bind(
      graphExecutionService
    );
    const mergedEvaluation = mergeMethod(agentEvaluation, scorePatches, rubric);

    const updatedScore = mergedEvaluation.scores.find(
      (s: { criterionId: string }) => s.criterionId === 'crit-1'
    );
    const unchangedScore = mergedEvaluation.scores.find(
      (s: { criterionId: string }) => s.criterionId === 'crit-2'
    );

    if (!updatedScore || !unchangedScore) {
      throw new Error('Scores not found after merge');
    }

    const scoreUpdated = updatedScore.score === 1.0;
    const reasoningUpdated = updatedScore.reasoning === 'Actually perfect';
    const score2Unchanged = unchangedScore.score === 0.6;

    if (!scoreUpdated || !reasoningUpdated || !score2Unchanged) {
      throw new Error(
        `Merge failed: scoreUpdated=${scoreUpdated}, reasoningUpdated=${reasoningUpdated}, score2Unchanged=${score2Unchanged}`
      );
    }

    addResult(testName, true);
  } catch (error) {
    addResult(testName, false, error instanceof Error ? error.message : String(error));
  }
}

async function testOverallScoreRecalculation(): Promise<void> {
  const testName = 'Overall score is recalculated with weights';
  try {
    const { sessionId } = await setupTestSession();

    const state = await graphExecutionService.getSessionState(sessionId);
    const rubric = state.rubricDraft;

    if (!rubric) {
      throw new Error('No rubric found');
    }

    const agentEvaluation: Evaluation = {
      evaluatorType: 'agent',
      scores: [
        { criterionId: 'crit-1', score: 0.8, reasoning: 'Good', evidence: [] },
        { criterionId: 'crit-2', score: 0.6, reasoning: 'OK', evidence: [] },
        { criterionId: 'crit-3', score: 0.5, reasoning: 'Needs work', evidence: [] },
      ],
      overallScore: 0.73,
      summary: 'Agent evaluation',
      timestamp: new Date().toISOString(),
    };

    const scorePatches = [
      {
        criterionId: 'crit-1',
        score: 1.0,
      },
    ];

    const mergeMethod = (graphExecutionService as any).mergeEvaluationPatches.bind(
      graphExecutionService
    );
    const mergedEvaluation = mergeMethod(agentEvaluation, scorePatches, rubric);

    const expectedScore = 1.0 * 0.5 + 0.6 * 0.3 + 0.5 * 0.2;
    const scoreMatches = Math.abs(mergedEvaluation.overallScore - expectedScore) < 0.001;

    if (!scoreMatches) {
      throw new Error(
        `Overall score mismatch: expected ${expectedScore}, got ${mergedEvaluation.overallScore}`
      );
    }

    addResult(testName, true);
  } catch (error) {
    addResult(testName, false, error instanceof Error ? error.message : String(error));
  }
}

async function testOutOfRangeScoreValidation(): Promise<void> {
  const testName = 'Out of range score throws validation error';
  try {
    const { sessionId } = await setupTestSession();

    const state = await graphExecutionService.getSessionState(sessionId);
    const rubric = state.rubricDraft;

    if (!rubric) {
      throw new Error('No rubric found');
    }

    const agentEvaluation: Evaluation = {
      evaluatorType: 'agent',
      scores: [
        { criterionId: 'crit-1', score: 0.8, reasoning: 'Good', evidence: [] },
      ],
      overallScore: 0.8,
      summary: 'Agent evaluation',
      timestamp: new Date().toISOString(),
    };

    const scorePatches = [
      {
        criterionId: 'crit-1',
        score: 1.5,
      },
    ];

    const mergeMethod = (graphExecutionService as any).mergeEvaluationPatches.bind(
      graphExecutionService
    );

    try {
      mergeMethod(agentEvaluation, scorePatches, rubric);
      throw new Error('Should have thrown validation error');
    } catch (validationError) {
      if (
        validationError instanceof Error &&
        validationError.message.includes('out of range')
      ) {
        addResult(testName, true);
      } else {
        throw validationError;
      }
    }
  } catch (error) {
    addResult(testName, false, error instanceof Error ? error.message : String(error));
  }
}

async function cleanupTestData(): Promise<void> {
  try {
    const testSessions = await prisma.evaluationSession.findMany({
      where: {
        metadata: {
          path: ['threadId'],
          string_starts_with: 'test-thread-',
        },
      },
      select: { id: true },
    });

    const sessionIds = testSessions.map((s) => s.id);

    if (sessionIds.length > 0) {
      await prisma.adaptiveRubric.deleteMany({
        where: { sessionId: { in: sessionIds } },
      });

      await prisma.evaluationSession.deleteMany({
        where: { id: { in: sessionIds } },
      });

      logger.info(`Test data cleaned up successfully: ${sessionIds.length} sessions`);
    }
  } catch (error) {
    logger.error('Error cleaning up test data:', error);
  }
}

async function main(): Promise<void> {
  logger.info('Starting Partial Update Tests...\n');

  await testSingleCriterionPatch();
  await testMultipleCriteriaPatches();
  await testInvalidCriterionIdValidation();
  await testSingleScorePatch();
  await testOverallScoreRecalculation();
  await testOutOfRangeScoreValidation();

  await cleanupTestData();

  logger.info('\n========== TEST RESULTS ==========');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  results.forEach((result) => {
    if (result.passed) {
      logger.info(`✅ ${result.testName}`);
    } else {
      logger.error(`❌ ${result.testName}: ${result.error}`);
    }
  });

  logger.info(`\nTotal: ${results.length} | Passed: ${passed} | Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main();
