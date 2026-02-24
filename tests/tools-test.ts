import { config } from 'dotenv';
config();

import { HumanMessage } from '@langchain/core/messages';
import {
  SchemaDownloaderForTest,
  schemaDownloader,
} from '../src/langGraph/tools/SchemaDownloader.ts';
import { getLLM, invokeWithRetry } from '../src/langGraph/llm/index.ts';
import { logger } from '../src/utils/logger.ts';

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', reason);
  logger.error('Promise:', promise);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

const TEST_PROJECT_ID = 'mwLZrNj2ZKB';

async function testSchemaDownloader() {
  logger.info('=== Testing Schema Downloader Tool ===\n');

  try {
    logger.info(`Downloading schema for projectExId: ${TEST_PROJECT_ID}...`);
    const result = await SchemaDownloaderForTest(TEST_PROJECT_ID);
    logger.info('Schema download successful!');
    logger.info(
      'Result preview (first 500 chars):',
      result.substring(0, 500) + '...\n',
    );
    return true;
  } catch (error) {
    logger.error('Schema download failed:', error);
    return false;
  }
}

async function testAzureBindTools() {
  logger.info('=== Testing Azure OpenAI bindTools ===\n');

  try {
    const llm = getLLM({
      provider: 'azure',
      model: 'functorz-sweden-central-gpt-5',
    });

    // Check if bindTools method exists
    if (typeof llm.bindTools !== 'function') {
      logger.error('Azure LLM does not have bindTools method');
      return false;
    }

    const llmWithTools = llm.bindTools([schemaDownloader]);
    logger.info('Azure bindTools successful!');

    // Test invoking with tools
    const response = await invokeWithRetry(
      () =>
        llmWithTools.invoke([
          new HumanMessage(
            `Please use the schema_downloader tool to retrieve the database schema for project ID: ${TEST_PROJECT_ID}`,
          ),
        ]),
      'azure',
      { operationName: 'tools-test.azureBindTools' },
    );

    logger.info('Azure response with tools:');
    logger.info('Content:', response.content);
    logger.info('Tool calls:', JSON.stringify(response.tool_calls, null, 2));
    return true;
  } catch (error) {
    logger.error('Azure bindTools test failed:', error);
    return false;
  }
}

async function testGeminiBindTools() {
  logger.info('\n=== Testing Gemini bindTools ===\n');

  try {
    const llm = getLLM({ provider: 'gemini', model: 'gemini-2.0-flash' });

    // Check if bindTools method exists
    if (typeof llm.bindTools !== 'function') {
      logger.error('Gemini LLM does not have bindTools method');
      return false;
    }

    const llmWithTools = llm.bindTools([schemaDownloader]);
    logger.info('Gemini bindTools successful!');

    // Test invoking with tools
    const response = await invokeWithRetry(
      () =>
        llmWithTools.invoke([
          new HumanMessage(
            `Please use the schema_downloader tool to retrieve the database schema for project ID: ${TEST_PROJECT_ID}`,
          ),
        ]),
      'gemini',
      { operationName: 'tools-test.geminiBindTools' },
    );

    logger.info('Gemini response with tools:');
    logger.info('Content:', response.content);
    logger.info('Tool calls:', JSON.stringify(response.tool_calls, null, 2));
    return true;
  } catch (error) {
    logger.error('Gemini bindTools test failed:', error);
    return false;
  }
}

async function main() {
  logger.info('Starting Tools Tests...\n');

  const schemaResult = await testSchemaDownloader();
  const azureResult = await testAzureBindTools();
  const geminiResult = await testGeminiBindTools();

  logger.info('\n=== Test Summary ===');
  logger.info(`Schema Downloader: ${schemaResult ? '✅ PASS' : '❌ FAIL'}`);
  logger.info(`Azure bindTools: ${azureResult ? '✅ PASS' : '❌ FAIL'}`);
  logger.info(`Gemini bindTools: ${geminiResult ? '✅ PASS' : '❌ FAIL'}`);
}

main();
