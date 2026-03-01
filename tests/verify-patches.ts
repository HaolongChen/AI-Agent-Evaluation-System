import { prisma } from '../src/config/prisma.ts';
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

async function verify() {
  const latestSession = await prisma.evaluationSession.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true }
  });

  if (!latestSession) {
    logger.info('No session found');
    return;
  }

  assert.ok(latestSession, 'Session should exist');
  logger.info('Session ID:', latestSession.id);

  const questions = await prisma.adaptiveRubric.findMany({
    where: { sessionId: latestSession.id, isActive: true },
    orderBy: { id: 'asc' }
  });

  assert.ok(Array.isArray(questions), 'Questions should be an array');
  assert.ok(questions.length > 0, 'Should have at least one question');

  logger.info('\n=== Questions (should see [E2E Modified] and weight 33) ===');
  questions.forEach(q => {
    logger.info(`ID: ${q.id}, Weight: ${q.weight}, Title: ${q.title}`);
  });

  const finalReport = await prisma.evaluationResult.findFirst({
    where: { sessionId: latestSession.id }
  });

  assert.ok(finalReport, 'Final report should exist');
  assert.ok(['pass', 'fail'].includes(finalReport.verdict), `Invalid verdict: ${finalReport.verdict}`);
  assert.strictEqual(typeof finalReport.overallScore, 'number', 'Overall score should be a number');

  logger.info('\n=== Final Report ===');
  logger.info('Verdict:', finalReport?.verdict);
  logger.info('Overall Score:', finalReport?.overallScore);
}

async function main(): Promise<void> {
  let exitCode = 0;
  try {
    await verify();
  } catch (error) {
    logger.error(String(error));
    exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
  process.exit(exitCode);
}

main();
