/**
 * Test: Project lifecycle — create then delete
 *
 * Verifies that:
 *  1. projectService.createProject() reaches the Functorz backend, completes
 *     the async project-creation flow, and returns a non-empty projectExId string.
 *  2. projectService.deleteProject() calls the backend with that ID without throwing.
 *
 * Prerequisites:
 *  - .env must have FUNCTORZ_PHONE_NUMBER, FUNCTORZ_PASSWORD, ORGANIZATION_EX_ID,
 *    BACKEND_GRAPHQL_URL, SUBSCRIPTION_GRAPHQL_URL, WS_URL, userToken
 *  - Network access to the Functorz backend
 *
 * Run:
 *   pnpm tsx ./tests/project-lifecycle.ts
 */

import { config } from 'dotenv';
config();

import { logger } from '../src/utils/logger.ts';
import { login } from '../src/utils/login.ts';
import { authState } from '../src/utils/graphql-client.ts';
import { projectService } from '../src/services/ProjectService.ts';
import { FUNCTORZ_PHONE_NUMBER, FUNCTORZ_PASSWORD } from '../src/config/env.ts';

// ---------------------------------------------------------------------------
// Process-level safety nets
// ---------------------------------------------------------------------------

process.on('unhandledRejection', (reason) => {
  const msg = reason instanceof Error ? reason.message : JSON.stringify(reason);
  logger.error(`Unhandled Promise Rejection: ${msg}`, reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`, error);
  process.exit(1);
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function assert(condition: boolean, message: string): void {
  if (!condition) {
    logger.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  logger.info('=== Project lifecycle test starting ===');

  // 1. Authenticate
  const missingVars: string[] = [];
  if (!FUNCTORZ_PHONE_NUMBER) missingVars.push('FUNCTORZ_PHONE_NUMBER');
  if (!FUNCTORZ_PASSWORD) missingVars.push('FUNCTORZ_PASSWORD');
  if (!process.env['ORGANIZATION_EX_ID']) missingVars.push('ORGANIZATION_EX_ID');
  if (missingVars.length > 0 || !FUNCTORZ_PHONE_NUMBER || !FUNCTORZ_PASSWORD) {
    logger.error(`Missing required env vars: ${missingVars.join(', ')}. Set them in .env and retry.`);
    process.exit(1);
  }
  logger.info('Step 1: Authenticating...');
  const token = await login(FUNCTORZ_PHONE_NUMBER, FUNCTORZ_PASSWORD);
  authState.setToken(token);
  logger.info('Authentication successful');

  // 2. Create project
  const projectName = `test-project-lifecycle-${Date.now()}`;
  logger.info('Step 2: Creating project', { projectName });

  const projectExId = await projectService.createProject(projectName);

  assert(typeof projectExId === 'string', 'createProject should return a string');
  assert(projectExId.length > 0, 'createProject should return a non-empty projectExId');
  logger.info('Project created successfully', { projectExId, projectName });

  // 3. Delete project
  logger.info('Step 3: Deleting project', { projectExId });
  await projectService.deleteProject(projectExId);
  logger.info('Project deleted successfully', { projectExId });

  logger.info('=== Project lifecycle test PASSED ===');
  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : JSON.stringify(err);
  logger.error(`Test FAILED: ${msg}`, err);
  process.exit(1);
});
