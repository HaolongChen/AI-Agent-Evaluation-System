import { prisma } from '../src/config/prisma.ts';
import { evaluationPersistenceService } from '../src/services/EvaluationPersistenceService.ts';
import type { QuestionSet } from '../src/langGraph/state/state.ts';
import { logger } from '../src/utils/logger.ts';
import assert from 'node:assert/strict';

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', reason);
  logger.error('Promise:', promise);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

async function testPatchPersistence() {
  logger.info('=== Testing Patch Persistence ===\n');

  const goldenSet = await prisma.goldenSet.create({
    data: {
      projectExId: 'test-proj',
      copilotType: 'dataModel',
    },
  });

  const session = await prisma.evaluationSession.create({
    data: {
      goldenSetId: goldenSet.id,
      modelName: 'gpt-4o',
      startedAt: new Date(),
      status: 'running',
      metadata: { threadId: 'test-thread' },
    },
  });

  const rubrics = await Promise.all([
    prisma.adaptiveRubric.create({
      data: {
        sessionId: session.id,
        version: '1.0.0',
        title: 'Original Question 1',
        content: 'Content 1',
        expectedAnswer: true,
        weight: 10,
        reviewStatus: 'pending',
        isActive: true,
      },
    }),
    prisma.adaptiveRubric.create({
      data: {
        sessionId: session.id,
        version: '1.0.0',
        title: 'Original Question 2',
        content: 'Content 2',
        expectedAnswer: false,
        weight: 20,
        reviewStatus: 'pending',
        isActive: true,
      },
    }),
  ]);

  logger.info(
    'Created rubrics:',
    rubrics.map((r) => ({ id: r.id, title: r.title, weight: r.weight })),
  );

  const patchedQuestionSet: QuestionSet = {
    version: '1.0.1',
    questions: [
      {
        id: rubrics[0].id,
        title: '[PATCHED] Original Question 1',
        content: 'Content 1',
        expectedAnswer: true,
        weight: 15,
      },
      {
        id: rubrics[1].id,
        title: 'Original Question 2',
        content: '[PATCHED] Content 2',
        expectedAnswer: true,
        weight: 25,
      },
    ],
    totalWeight: 40,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  logger.info('\nApplying patches...');
  await evaluationPersistenceService.updateRubricQuestions(
    session.id,
    patchedQuestionSet,
  );

  const updatedRubrics = await prisma.adaptiveRubric.findMany({
    where: { sessionId: session.id, isActive: true },
    orderBy: { id: 'asc' },
  });

   logger.info(
     '\nUpdated rubrics:',
     updatedRubrics.map((r) => ({
       id: r.id,
       title: r.title,
       content: r.content,
       expectedAnswer: r.expectedAnswer,
       weight: Number(r.weight),
       version: r.version,
     })),
   );

   assert.strictEqual(updatedRubrics[0]?.title, '[PATCHED] Original Question 1', 'Question 1 title should be patched');
   assert.strictEqual(Number(updatedRubrics[0]?.weight), 15, 'Question 1 weight should be 15');
   assert.strictEqual(updatedRubrics[1]?.content, '[PATCHED] Content 2', 'Question 2 content should be patched');
   assert.strictEqual(updatedRubrics[1]?.expectedAnswer, true, 'Question 2 expectedAnswer should be true');
   assert.strictEqual(Number(updatedRubrics[1]?.weight), 25, 'Question 2 weight should be 25');
   assert.strictEqual(updatedRubrics[0]?.version, '1.0.1', 'Version should be updated to 1.0.1');

   const allCorrect =
     updatedRubrics[0]?.title === '[PATCHED] Original Question 1' &&
     Number(updatedRubrics[0]?.weight) === 15 &&
     updatedRubrics[1]?.content === '[PATCHED] Content 2' &&
     updatedRubrics[1]?.expectedAnswer === true &&
     Number(updatedRubrics[1]?.weight) === 25 &&
     updatedRubrics[0]?.version === '1.0.1';

  await prisma.adaptiveRubric.deleteMany({ where: { sessionId: session.id } });
  await prisma.evaluationSession.delete({ where: { id: session.id } });
  await prisma.goldenSet.delete({ where: { id: goldenSet.id } });

  if (allCorrect) {
    logger.info('\n✅ Patch persistence test PASSED');
  } else {
    logger.info('\n❌ Patch persistence test FAILED');
    logger.info('Expected values did not match');
  }
}

async function main(): Promise<void> {
  let exitCode = 0;
  try {
    await testPatchPersistence();
  } catch (error) {
    logger.error(String(error));
    exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
  process.exit(exitCode);
}

main();
