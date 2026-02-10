/**
 * Manual test to verify log extraction logic
 * This simulates how the extractJobResultFromLogs function works
 */

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

interface TaskMessage {
  type: string;
  taskId: string;
  name: string;
  description?: string;
  diff?: unknown;
  isDiffReverted?: boolean;
  timestamp: number;
}

function extractResultFromMockLogs(logs: string): {
  response?: string;
  tasks?: TaskMessage[] | null;
} {
  const lines = logs.split('\n');

  // Search for the line containing the job result JSON
  for (const line of lines) {
    if (line.includes('JOB_RESULT_JSON:')) {
      try {
        const jsonStr = line
          .substring(
            line.indexOf('JOB_RESULT_JSON:') + 'JOB_RESULT_JSON:'.length
          )
          .trim();
        const result = JSON.parse(jsonStr);
        assert.ok(result, 'Extracted data should exist');
        assert.strictEqual(typeof result, 'object', 'Extracted data should be an object');
        assert.ok(result.response, 'Response field should be present');
        logger.info(
          `✓ Extracted job result from logs: ${JSON.stringify(result, null, 2)}`
        );
        return {
          response: result.response,
          tasks: result.tasks,
        };
      } catch (parseErr) {
        logger.error('✗ Failed to parse job result JSON from logs:', parseErr);
      }
    }
  }

  logger.warn('✗ No job result found in logs');
  return {};
}

// Test case 1: Valid logs with response and tasks
logger.info('\n=== Test Case 1: Valid logs with response and tasks ===');
const validLogs = `
2024-01-01T00:00:00.000Z - WebSocket connection established.
2024-01-01T00:00:01.000Z - Received initial state for project test-123.
2024-01-01T00:00:05.000Z - Received AI response for project test-123.
JOB_RESULT_JSON: {"response":"AI created the data model successfully","tasks":[{"type":"TASK","taskId":"task-1","name":"Create Entity","timestamp":1234567890}]}
`;
extractResultFromMockLogs(validLogs);

// Test case 2: Valid logs with response only (no tasks)
logger.info('\n=== Test Case 2: Valid logs with response only ===');
const logsWithoutTasks = `
2024-01-01T00:00:00.000Z - WebSocket connection established.
JOB_RESULT_JSON: {"response":"AI completed the task","tasks":null}
`;
extractResultFromMockLogs(logsWithoutTasks);

// Test case 3: Logs without job result
logger.info('\n=== Test Case 3: Logs without job result ===');
const logsWithoutResult = `
2024-01-01T00:00:00.000Z - WebSocket connection established.
2024-01-01T00:00:01.000Z - Some other log message
`;
extractResultFromMockLogs(logsWithoutResult);

// Test case 4: Invalid JSON in logs
logger.info('\n=== Test Case 4: Invalid JSON in logs ===');
const logsWithInvalidJson = `
2024-01-01T00:00:00.000Z - WebSocket connection established.
JOB_RESULT_JSON: {invalid json}
`;
extractResultFromMockLogs(logsWithInvalidJson);

logger.info('\n=== All test cases completed ===\n');
