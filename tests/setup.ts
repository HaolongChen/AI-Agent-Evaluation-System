/**
 * Vitest global setup
 * 
 * Runs before all tests to set up the test environment
 */

import { beforeAll, afterAll, afterEach } from 'vitest';
import 'reflect-metadata'; // Required for tsyringe DI

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
process.env.PORT = '4001';
process.env.WS_URL = 'ws://test-ws-url/';
process.env.userToken = 'test-token';
process.env.projectExId = 'test-project-id';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.AZURE_OPENAI_ENDPOINT = 'https://test.openai.azure.com';
process.env.AZURE_OPENAI_DEPLOYMENT = 'test-deployment';

// Global test setup
beforeAll(() => {
  console.log('🧪 Starting test suite...');
});

afterAll(() => {
  console.log('✅ Test suite completed');
});

// Clean up after each test
afterEach(() => {
  // Reset any global state if needed
});
