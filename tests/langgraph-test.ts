import { config } from 'dotenv';
import { automatedGraph } from '../src/langGraph/agent.ts';
import { logger } from '../src/utils/logger.ts';

config();

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', reason);
  logger.error('Promise:', promise);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

async function main() {
  logger.info('Starting LangGraph test...');

  try {
    // Test Azure
    logger.info('Testing Azure Provider...');
    const result = await automatedGraph.invoke(
      {
        query: "Hello, world! Please reply with 'Hello from LangGraph!'",
        candidateOutput: "",
      },
      {
        configurable: {
          "thread_id": "session111",
          provider: 'azure',
          model: process.env['AZURE_OPENAI_DEPLOYMENT'] || 'gpt-4o',
          projectExId: undefined,
          skipHumanReview: true,
          skipHumanEvaluation: true,
        },
      }
    );

    logger.info('Graph execution result (Azure):');
    logger.info(JSON.stringify(result, null, 2));

    const analysis = result.analysis || 'No analysis available';
    logger.info('Analysis (Azure):', analysis);
    // Test Gemini (optional)
    if (process.env['GOOGLE_API_KEY'] && process.env['TEST_GEMINI'] === 'true') {
      logger.info('Testing Gemini Provider...');
      const geminiResult = await automatedGraph.invoke(
        {
          query: "Hello, world! Please reply with 'Hello from LangGraph!'",
          candidateOutput: "",
        },
        {
          configurable: {
            thread_id: 'session222',
            provider: 'gemini',
            model: process.env['GEMINI_MODEL'] || 'gemini-2.0-flash',
            projectExId: undefined,
            skipHumanReview: true,
            skipHumanEvaluation: true,
          },
        }
      );
      logger.info('Graph execution result (Gemini):');
      const geminiAnalysis = geminiResult.analysis || 'No analysis available';
      logger.info('Analysis (Gemini):', geminiAnalysis);
    }
  } catch (error) {
    logger.error('Error executing graph:', error);
  }
}

main();
