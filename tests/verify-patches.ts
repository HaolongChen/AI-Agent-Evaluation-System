import { prisma } from '../src/config/prisma.ts';

async function verify() {
  const latestSession = await prisma.evaluationSession.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true }
  });

  if (!latestSession) {
    console.log('No session found');
    return;
  }

  console.log('Session ID:', latestSession.id);

  const questions = await prisma.adaptiveRubric.findMany({
    where: { sessionId: latestSession.id, isActive: true },
    orderBy: { id: 'asc' }
  });

  console.log('\n=== Questions (should see [E2E Modified] and weight 33) ===');
  questions.forEach(q => {
    console.log(`ID: ${q.id}, Weight: ${q.weight}, Title: ${q.title}`);
  });

  const finalReport = await prisma.evaluationResult.findFirst({
    where: { sessionId: latestSession.id }
  });

  console.log('\n=== Final Report ===');
  console.log('Verdict:', finalReport?.verdict);
  console.log('Overall Score:', finalReport?.overallScore);
  console.log('Discrepancies:', finalReport?.discrepancies ? 'Yes' : 'No');
}

verify().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
