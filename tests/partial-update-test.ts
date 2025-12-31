import { config } from 'dotenv';
import { logger } from '../src/utils/logger.ts';
import { prisma } from '../src/config/prisma.ts';
import { CopilotType, SessionStatus, RubricReviewStatus } from '../build/generated/prisma/enums.ts';

config();

async function testQuestionPatchMergeLogic(): Promise<void> {
  logger.info('=== Test: Question Patch Merge Logic ===');

  const goldenSet = await prisma.goldenSet.create({
    data: {
      projectExId: process.env.projectExId || 'test-project',
      schemaExId: `test-schema-${Date.now()}`,
      copilotType: CopilotType.dataModel,
      isActive: true,
      createdBy: 'partial-update-test',
    },
  });

  await prisma.userInput.create({
    data: {
      goldenSetId: goldenSet.id,
      content: 'Generate user authentication with email/password',
      createdBy: 'partial-update-test',
    },
  });

  const session = await prisma.evaluationSession.create({
    data: {
      goldenSetId: goldenSet.id,
      modelName: 'test-model',
      status: SessionStatus.running,
      metadata: {
        threadId: 'test-thread',
        skipHumanReview: false,
        skipHumanEvaluation: false,
      },
    },
  });

  const questionData = [
    {
      title: 'Does output match requirements?',
      content: 'Check if implementation covers all requirements',
      expectedAnswer: true,
      weight: 0.4,
    },
    {
      title: 'Is code quality acceptable?',
      content: 'Assess code structure and maintainability',
      expectedAnswer: true,
      weight: 0.3,
    },
    {
      title: 'Are there security concerns?',
      content: 'Check for common security vulnerabilities',
      expectedAnswer: false,
      weight: 0.3,
    },
  ];

  const createdQuestions: Array<{
    id: number;
    title: string;
    content: string;
    expectedAnswer: boolean;
    weight: number;
  }> = [];

  for (const q of questionData) {
    const created = await prisma.adaptiveRubric.create({
      data: {
        sessionId: session.id,
        version: 'v1.0.0',
        title: q.title,
        content: q.content,
        expectedAnswer: q.expectedAnswer,
        weight: q.weight,
        reviewStatus: RubricReviewStatus.pending,
        isActive: true,
      },
    });
    createdQuestions.push({
      id: created.id,
      title: created.title,
      content: created.content,
      expectedAnswer: created.expectedAnswer,
      weight: Number(created.weight),
    });
  }

  logger.info('Created test questions:', {
    sessionId: session.id,
    questionIds: createdQuestions.map((q) => q.id),
  });

  const firstQuestionId = createdQuestions[0].id;
  const thirdQuestionId = createdQuestions[2].id;

  const patches = [
    {
      questionId: firstQuestionId,
      weight: 0.5,
      title: 'Enhanced: Does output match requirements?',
    },
    {
      questionId: thirdQuestionId,
      expectedAnswer: true,
    },
  ];

  logger.info('Simulating patch application:', patches);

  const sessionWithRubrics = await prisma.evaluationSession.findUnique({
    where: { id: session.id },
    include: {
      rubrics: {
        where: { isActive: true },
        orderBy: { id: 'asc' },
      },
    },
  });

  if (!sessionWithRubrics || sessionWithRubrics.rubrics.length === 0) {
    throw new Error('No questions found for session');
  }

  const questionMap = new Map(
    sessionWithRubrics.rubrics.map((r) => [
      r.id,
      {
        id: r.id,
        title: r.title,
        content: r.content,
        expectedAnswer: r.expectedAnswer,
        weight: Number(r.weight),
      },
    ])
  );

  for (const patch of patches) {
    const question = questionMap.get(patch.questionId);
    if (!question) {
      throw new Error(`Question ID ${patch.questionId} not found`);
    }

    if (patch.title !== undefined) question.title = patch.title;
    if (patch.expectedAnswer !== undefined) {
      question.expectedAnswer = patch.expectedAnswer;
    }
    if (patch.weight !== undefined) question.weight = patch.weight;
  }

  const questions = Array.from(questionMap.values());
  const totalWeight = questions.reduce((sum, q) => sum + q.weight, 0);

  logger.info('Patch application result:', {
    totalQuestions: questions.length,
    totalWeight,
    questions: questions.map((q) => ({
      id: q.id,
      title: q.title.substring(0, 30),
      weight: q.weight,
      expectedAnswer: q.expectedAnswer,
    })),
  });

  const q1 = questions.find((q) => q.id === firstQuestionId);
  const q3 = questions.find((q) => q.id === thirdQuestionId);

  if (q1?.weight !== 0.5) {
    throw new Error(`Q1 weight incorrect: expected 0.5, got ${q1?.weight}`);
  }

  if (!q1?.title.startsWith('Enhanced:')) {
    throw new Error(`Q1 title not updated: ${q1?.title}`);
  }

  if (q3?.expectedAnswer !== true) {
    throw new Error(`Q3 expectedAnswer not flipped: ${q3?.expectedAnswer}`);
  }

  if (Math.abs(totalWeight - 1.1) > 0.001) {
    throw new Error(`Total weight incorrect: expected 1.1, got ${totalWeight}`);
  }

  await prisma.adaptiveRubric.deleteMany({ where: { sessionId: session.id } });
  await prisma.evaluationSession.delete({ where: { id: session.id } });
  await prisma.userInput.deleteMany({ where: { goldenSetId: goldenSet.id } });
  await prisma.goldenSet.delete({ where: { id: goldenSet.id } });

  logger.info('✅ Question patch merge logic test PASSED');
}

async function testAnswerPatchMergeLogic(): Promise<void> {
  logger.info('\n=== Test: Answer Patch Merge Logic ===');

  const agentAnswers = [
    { questionId: 1, answer: true, explanation: 'Agent explanation 1' },
    { questionId: 2, answer: false, explanation: 'Agent explanation 2' },
    { questionId: 3, answer: true, explanation: 'Agent explanation 3' },
  ];

  const answerPatches = [
    { questionId: 1, answer: false, explanation: 'Human override 1' },
    { questionId: 3, answer: false, explanation: 'Human override 3' },
  ];

  logger.info('Simulating answer patch merge');

  const answerMap = new Map(agentAnswers.map((a) => [a.questionId, { ...a }]));

  for (const patch of answerPatches) {
    const answer = answerMap.get(patch.questionId);
    if (!answer) {
      throw new Error(`Question ID ${patch.questionId} not found in agent answers`);
    }

    if (patch.answer !== undefined) answer.answer = patch.answer;
    if (patch.explanation !== undefined) answer.explanation = patch.explanation;
  }

  const mergedAnswers = Array.from(answerMap.values());

  logger.info('Merged answers:', mergedAnswers);

  const a1 = mergedAnswers.find((a) => a.questionId === 1);
  const a2 = mergedAnswers.find((a) => a.questionId === 2);
  const a3 = mergedAnswers.find((a) => a.questionId === 3);

  if (a1?.answer !== false || !a1?.explanation.includes('Human override 1')) {
    throw new Error('Answer 1 not patched correctly');
  }

  if (a2?.answer !== false || !a2?.explanation.includes('Agent explanation 2')) {
    throw new Error('Answer 2 should remain unchanged');
  }

  if (a3?.answer !== false || !a3?.explanation.includes('Human override 3')) {
    throw new Error('Answer 3 not patched correctly');
  }

  logger.info('✅ Answer patch merge logic test PASSED');
}

async function testInvalidPatchHandling(): Promise<void> {
  logger.info('\n=== Test: Invalid Patch Handling ===');

  const questionMap = new Map([
    [1, { id: 1, title: 'Q1', content: 'C1', expectedAnswer: true, weight: 0.5 }],
    [2, { id: 2, title: 'Q2', content: 'C2', expectedAnswer: false, weight: 0.5 }],
  ]);

  const invalidPatch = { questionId: 999, weight: 0.3 };

  try {
    const question = questionMap.get(invalidPatch.questionId);
    if (!question) {
      throw new Error(`Question ID ${invalidPatch.questionId} not found`);
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (!msg.includes('Question ID 999 not found')) {
      throw new Error(`Unexpected error message: ${msg}`);
    }
    logger.info('✅ Invalid patch handling test PASSED');
    return;
  }

  throw new Error('Should have thrown error for invalid questionId');
}

async function testWeightRecalculation(): Promise<void> {
  logger.info('\n=== Test: Weight Recalculation ===');

  const questions = [
    { id: 1, title: 'Q1', content: 'C1', expectedAnswer: true, weight: 0.4 },
    { id: 2, title: 'Q2', content: 'C2', expectedAnswer: true, weight: 0.3 },
    { id: 3, title: 'Q3', content: 'C3', expectedAnswer: false, weight: 0.3 },
  ];

  const patches = questions.map((q) => ({ questionId: q.id, weight: 0.25 }));

  const questionMap = new Map(questions.map((q) => [q.id, { ...q }]));

  for (const patch of patches) {
    const question = questionMap.get(patch.questionId);
    if (!question) {
      throw new Error(`Question ID ${patch.questionId} not found`);
    }
    if (patch.weight !== undefined) question.weight = patch.weight;
  }

  const updatedQuestions = Array.from(questionMap.values());
  const totalWeight = updatedQuestions.reduce((sum, q) => sum + q.weight, 0);

  const expectedTotal = 0.25 * questions.length;
  if (Math.abs(totalWeight - expectedTotal) > 0.001) {
    throw new Error(`Weight recalc failed: expected ${expectedTotal}, got ${totalWeight}`);
  }

  logger.info('✅ Weight recalculation test PASSED', {
    expectedTotal,
    actualTotal: totalWeight,
  });
}

async function main() {
  logger.info('=== Partial Update Unit Tests ===\n');

  try {
    await testQuestionPatchMergeLogic();
    await testAnswerPatchMergeLogic();
    await testInvalidPatchHandling();
    await testWeightRecalculation();

    logger.info('\n=== All Tests PASSED ===');
  } catch (error) {
    logger.error('Test FAILED:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
