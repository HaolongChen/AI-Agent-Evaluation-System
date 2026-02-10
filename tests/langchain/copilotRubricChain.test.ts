import { strict as assert } from 'node:assert';
import { logger } from '../../src/utils/logger.ts';

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', reason);
  logger.error('Promise:', promise);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

const ENV_KEYS = [
  'OPENAI_API_KEY',
  'AZURE_API_KEY',
  'GOOGLE_API_KEY',
  'AZURE_OPENAI_ENDPOINT',
  'AZURE_OPENAI_DEPLOYMENT',
  'AZURE_OPENAI_API_VERSION',
  'LLM_PROVIDER',
];

type EnvSnapshot = Record<string, string | undefined>;

const snapshotEnv = (): EnvSnapshot => {
  const snapshot: EnvSnapshot = {};
  for (const key of ENV_KEYS) {
    snapshot[key] = process.env[key];
  }
  return snapshot;
};

const restoreEnv = (snapshot: EnvSnapshot) => {
  for (const key of ENV_KEYS) {
    const value = snapshot[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
};

const unsetLLMEnv = () => {
  for (const key of ENV_KEYS) {
    process.env[key] = '';
  }
};

async function testFallbackRubricGeneration() {
  const envSnapshot = snapshotEnv();
  try {
    unsetLLMEnv();

    const module =
      await import('../../src/langchain/chains/copilotRubricChain.ts');
    const { generateAdaptiveRubric } = module;

    const result = await generateAdaptiveRubric({
      projectExId: 'proj-test',
      copilotType: 'dataModel',
      copilotInput: 'Design a schema for posts and likes',
      copilotOutput: 'Generated schema with tables post and like_table',
    });

    assert.equal(result.metadata.provider, 'fallback');
    assert.equal(result.metadata.fallbackUsed, true);
    assert.ok(result.questions.length > 0, 'expected fallback questions');
    assert.equal(result.summary, 'Fallback rubric generated without an LLM.');
    if (result.metadata.reason) {
      assert.ok(
        result.metadata.reason.includes('No LLM API key configured'),
        'missing fallback reason',
      );
    }

     logger.info('✅ LangChain fallback rubric test passed');
  } finally {
    restoreEnv(envSnapshot);
  }
}

async function main(): Promise<void> {
  let exitCode = 0;
  try {
    await testFallbackRubricGeneration();
  } catch (error) {
    logger.error('❌ LangChain tests failed');
    logger.error(String(error));
    exitCode = 1;
  }
  process.exit(exitCode);
}

main();
