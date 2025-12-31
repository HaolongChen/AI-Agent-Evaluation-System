/**
 * E2E Test: Full Evaluation Flow with Human-in-the-Loop
 *
 * Prerequisites:
 * - Database seeded: `pnpm db:seed`
 * - Environment configured: .env with WS_URL, userToken, projectExId, LLM keys
 *
 * Run: pnpm ts-node ./tests/e2e-full-flow.ts
 */

import { config } from 'dotenv';
import { prisma } from '../src/config/prisma.ts';
import { logger } from '../src/utils/logger.ts';
import { EvaluationJobRunner } from '../src/jobs/EvaluationJobRunner.ts';
import { RubricGenerationJobRunner } from '../src/jobs/RubricGenerationJobRunner.ts';
import { graphExecutionService } from '../src/services/GraphExecutionService.ts';
import { goldenSetService } from '../src/services/GoldenSetService.ts';
import { WS_URL } from '../src/config/env.ts';
import type { QuestionSet, FinalReport } from '../src/langGraph/state/state.ts';

config();

const TEST_CONFIG = {
  useExistingGoldenSet: false,
  goldenSetId: 1,
  projectExId: process.env['projectExId'] || 'X57jbwZzB76',
  schemaExId: 'e2e-test-schema',
  copilotType: 'DATA_MODEL_BUILDER' as const,
  testQuery: 'Create a simple user table with id, name, email, and created_at fields',
  testDescription: 'E2E test: User table creation',
  modelName: process.env['AZURE_OPENAI_DEPLOYMENT'] || 'gpt-4o',
  copilotTimeoutMs: 120000,
  questionSetTimeoutMs: 300000,
  statusPollIntervalMs: 10000,
  statusPollTimeoutMs: 180000,
};

interface TestResult {
  step: string;
  success: boolean;
  duration: number;
  data?: unknown;
  error?: string;
}

const results: TestResult[] = [];

function recordResult(
  step: string,
  success: boolean,
  duration: number,
  data?: unknown,
  error?: string
): void {
  results.push({ step, success, duration, data, error });
  const status = success ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
  logger.info(`[${status}] ${step} (${duration}ms)`);
  if (error) {
    logger.error(`  Error: ${error}`);
  }
}

async function step1_fetchOrCreateGoldenSet(): Promise<{
  goldenSetId: number;
  projectExId: string;
  schemaExId: string;
  copilotType: string;
  query: string;
}> {
  const start = Date.now();

  try {
    if (TEST_CONFIG.useExistingGoldenSet) {
      const goldenSet = await goldenSetService.getGoldenSet(TEST_CONFIG.goldenSetId);

      if (!goldenSet || goldenSet.userInput.length === 0) {
        throw new Error(
          `Golden set ${TEST_CONFIG.goldenSetId} not found or has no user input. Run 'pnpm db:seed' first.`
        );
      }

      const firstInput = goldenSet.userInput[0];
      if (!firstInput) {
        throw new Error('No user input found in golden set');
      }

      const result = {
        goldenSetId: goldenSet.id,
        projectExId: goldenSet.projectExId,
        schemaExId: goldenSet.schemaExId,
        copilotType: goldenSet.copilotType,
        query: firstInput.content,
      };

      recordResult('Step 1: Fetch Golden Set', true, Date.now() - start, result);
      return result;
    } else {
      const goldenSet = await goldenSetService.updateGoldenSetInput(
        TEST_CONFIG.projectExId,
        TEST_CONFIG.schemaExId,
        TEST_CONFIG.copilotType,
        TEST_CONFIG.testDescription,
        TEST_CONFIG.testQuery
      );

      const firstInput = goldenSet.userInput[0];
      if (!firstInput) {
        throw new Error('Failed to create user input');
      }

      const result = {
        goldenSetId: goldenSet.id,
        projectExId: goldenSet.projectExId,
        schemaExId: goldenSet.schemaExId,
        copilotType: goldenSet.copilotType,
        query: firstInput.content,
      };

      recordResult('Step 1: Create Golden Set', true, Date.now() - start, result);
      return result;
    }
  } catch (error) {
    recordResult(
      'Step 1: Fetch/Create Golden Set',
      false,
      Date.now() - start,
      undefined,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

async function step2_executeCopilot(projectExId: string, query: string): Promise<string> {
  const start = Date.now();

  try {
    logger.info('Connecting to Copilot WebSocket...');
    logger.info(`  Project: ${projectExId}`);
    logger.info(`  Query: ${query.substring(0, 100)}...`);

    const jobRunner = new EvaluationJobRunner(projectExId, WS_URL, query);

    jobRunner.startJob();
    const { editableText } = await jobRunner.waitForCompletion(TEST_CONFIG.copilotTimeoutMs);

    if (!editableText || editableText.trim().length === 0) {
      throw new Error('Copilot returned empty response');
    }

    recordResult('Step 2: Execute Copilot', true, Date.now() - start, {
      responseLength: editableText.length,
      preview: editableText.substring(0, 200),
    });

    return editableText;
  } catch (error) {
    recordResult(
      'Step 2: Execute Copilot',
      false,
      Date.now() - start,
      undefined,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

async function step3_runLangGraphWithHITL(
  goldenSetId: number,
  projectExId: string,
  schemaExId: string,
  copilotType: string,
  query: string,
  candidateOutput: string
): Promise<{
  sessionId: number;
  threadId: string;
  questionSetDraft: QuestionSet | null;
}> {
  const start = Date.now();

  try {
    logger.info('Starting LangGraph workflow with HITL enabled...');

    const skipHumanReview = false;
    const skipHumanEvaluation = false;

    const jobRunner = new RubricGenerationJobRunner(
      goldenSetId,
      projectExId,
      schemaExId,
      copilotType as 'dataModel' | 'uiBuilder' | 'actionflow' | 'logAnalyzer' | 'agentBuilder',
      query,
      '',
      candidateOutput,
      TEST_CONFIG.modelName,
      skipHumanReview,
      skipHumanEvaluation
    );

    jobRunner.startJob();
    const result = await jobRunner.waitForCompletion(TEST_CONFIG.questionSetTimeoutMs);

    if (result.status !== 'succeeded') {
      throw new Error(result.error || 'Question set generation failed');
    }

    if (
      result.graphStatus !== 'awaiting_rubric_review' &&
      result.graphStatus !== 'completed'
    ) {
      throw new Error(
        `Unexpected graph status: ${result.graphStatus}. Expected 'awaiting_rubric_review' or 'completed'`
      );
    }

    const sessionId = result.sessionId;
    const threadId = result.threadId;

    if (!sessionId || !threadId) {
      throw new Error('Missing sessionId or threadId from question set generation');
    }

    recordResult('Step 3: Run LangGraph (HITL)', true, Date.now() - start, {
      sessionId,
      threadId,
      graphStatus: result.graphStatus,
      questionsCount: result.questionSet?.questions?.length,
    });

    return {
      sessionId,
      threadId,
      questionSetDraft: result.questionSet || null,
    };
  } catch (error) {
    recordResult(
      'Step 3: Run LangGraph (HITL)',
      false,
      Date.now() - start,
      undefined,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

async function step4_submitQuestionSetReview(
  sessionId: number,
  threadId: string,
  _questionSetDraft: QuestionSet | null
): Promise<QuestionSet | null> {
  void _questionSetDraft;
  const start = Date.now();

  try {
    logger.info('Submitting question set review with patches...');

    const state = await graphExecutionService.getSessionState(sessionId);
    logger.info(`  Current status: ${state.status}`);

    if (state.status === 'completed') {
      logger.info('  Session already completed, skipping question set review');
      recordResult('Step 4: Submit Question Set Review', true, Date.now() - start, {
        skipped: true,
        reason: 'Session already completed',
      });
      return state.questionSetFinal;
    }

    if (state.status !== 'awaiting_rubric_review') {
      throw new Error(`Cannot submit question set review in status: ${state.status}`);
    }

    if (!state.questionSetDraft || state.questionSetDraft.questions.length === 0) {
      throw new Error('No question set draft available');
    }

    const firstQuestion = state.questionSetDraft.questions[0];
    const questionPatches = [
      {
        questionId: firstQuestion.id,
        weight: firstQuestion.weight * 1.1,
        title: `[E2E Modified] ${firstQuestion.title}`,
      },
    ];

    logger.info(`  Patching question ${firstQuestion.id}: weight ${firstQuestion.weight} -> ${firstQuestion.weight * 1.1}`);

    // Use approved=true with patches: patches represent approved modifications, not rejection
    const approved = true;
    const feedback = 'E2E test: Modified first question weight and title using patches';
    const reviewerAccountId = 'e2e-test-reviewer';

    const submitResult = await graphExecutionService.submitRubricReview(
      sessionId,
      threadId,
      approved,
      undefined,
      questionPatches,
      feedback,
      reviewerAccountId
    );
    
    if(submitResult.status === 'failed') {
      throw new Error(`Question set review submission failed: ${submitResult.message}`);
    }

    recordResult('Step 4: Submit Question Set Review (with patches)', true, Date.now() - start, {
      submitStatus: submitResult.status,
      patchedQuestions: questionPatches.length,
    });

    return submitResult.questionSetFinal || null;
  } catch (error) {
    recordResult(
      'Step 4: Submit Question Set Review',
      false,
      Date.now() - start,
      undefined,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

async function step5_submitHumanEvaluation(
  sessionId: number,
  threadId: string,
  questionSetFinal: QuestionSet | null
): Promise<FinalReport | null> {
  const start = Date.now();

  try {
    logger.info('Submitting human evaluation with patches...');

    const state = await graphExecutionService.getSessionState(sessionId);
    logger.info(`  Current status: ${state.status}`);

    if (state.status === 'completed') {
      logger.info('  Session already completed, returning final report');
      recordResult('Step 5: Submit Human Evaluation', true, Date.now() - start, {
        skipped: true,
        reason: 'Session already completed',
      });
      return state.finalReport;
    }

    if (state.status !== 'awaiting_human_evaluation') {
      throw new Error(`Cannot submit human evaluation in status: ${state.status}`);
    }

    const questionSet = questionSetFinal || state.questionSetFinal;
    if (!questionSet || questionSet.questions.length === 0) {
      throw new Error('No question set available for evaluation');
    }

    const hasAgentEvaluation = !!state.agentEvaluation;
    logger.info(`  Has agent evaluation: ${hasAgentEvaluation}`);

    if (!state.agentEvaluation || !state.agentEvaluation.answers) {
      throw new Error('No agent evaluation available to patch against');
    }

    const firstAnswer = state.agentEvaluation.answers[0];
    const lastAnswer = state.agentEvaluation.answers[state.agentEvaluation.answers.length - 1];

    const answerPatches = [
      {
        questionId: firstAnswer.questionId,
        answer: !firstAnswer.answer,
        explanation: `E2E test: Human override - flipped agent's answer from ${firstAnswer.answer} to ${!firstAnswer.answer}`,
      },
      {
        questionId: lastAnswer.questionId,
        explanation: `E2E test: Human explanation for question ${lastAnswer.questionId}`,
      },
    ];

    logger.info(`  Patching ${answerPatches.length} answers (overriding agent evaluation)`);

    const overallAssessment = 'E2E test: Overall assessment - Modified agent evaluation with human patches';
    const evaluatorAccountId = 'e2e-test-evaluator';

    const submitResult = await graphExecutionService.submitHumanEvaluation(
      sessionId,
      threadId,
      undefined,
      answerPatches,
      overallAssessment,
      evaluatorAccountId
    );
    
    if (submitResult.status === 'failed') {
      throw new Error(`Human evaluation submission failed: ${submitResult.message}`);
    }

    recordResult('Step 5: Submit Human Evaluation (with patches)', true, Date.now() - start, {
      submitStatus: submitResult.status,
      patchedAnswers: answerPatches.length,
      verdict: submitResult.finalReport?.verdict,
      overallScore: submitResult.finalReport?.overallScore,
    });

    return submitResult.finalReport || null;
  } catch (error) {
    recordResult(
      'Step 5: Submit Human Evaluation',
      false,
      Date.now() - start,
      undefined,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

async function step6_verifyFinalReport(sessionId: number): Promise<FinalReport | null> {
  const start = Date.now();

  try {
    logger.info('Verifying final report...');

    const state = await graphExecutionService.getSessionState(sessionId);

    if (state.status !== 'completed') {
      throw new Error(`Session not completed. Status: ${state.status}`);
    }

    if (!state.finalReport) {
      throw new Error('No final report found');
    }

    const report = state.finalReport;

    const validVerdicts = ['pass', 'fail', 'needs_review'];
    if (!report.verdict || !validVerdicts.includes(report.verdict)) {
      throw new Error(`Invalid verdict: ${report.verdict}`);
    }

    if (typeof report.overallScore !== 'number' || report.overallScore < 0) {
      throw new Error(`Invalid overall score: ${report.overallScore}`);
    }

    recordResult('Step 6: Verify Final Report', true, Date.now() - start, {
      verdict: report.verdict,
      overallScore: report.overallScore,
      hasAgentEvaluation: !!report.agentEvaluation,
      hasHumanEvaluation: !!report.humanEvaluation,
      discrepancyCount: report.discrepancies?.length || 0,
      auditTraceCount: report.auditTrace?.length || 0,
    });

    return report;
  } catch (error) {
    recordResult(
      'Step 6: Verify Final Report',
      false,
      Date.now() - start,
      undefined,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

async function runFullE2ETest(): Promise<void> {
  logger.info('\n' + '='.repeat(60));
  logger.info('E2E TEST: Full Evaluation Flow with Human-in-the-Loop');
  logger.info('='.repeat(60) + '\n');

  const totalStart = Date.now();

  try {
    logger.info('Cleaning up old test sessions...');
    await prisma.adaptiveRubricJudgeRecord.deleteMany({
      where: {
        rubric: {
          session: {
            goldenSet: {
              projectExId: TEST_CONFIG.projectExId,
              schemaExId: TEST_CONFIG.schemaExId,
            },
          },
        },
      },
    });
    await prisma.adaptiveRubric.deleteMany({
      where: {
        session: {
          goldenSet: {
            projectExId: TEST_CONFIG.projectExId,
            schemaExId: TEST_CONFIG.schemaExId,
          },
        },
      },
    });
    await prisma.evaluationResult.deleteMany({
      where: {
        session: {
          goldenSet: {
            projectExId: TEST_CONFIG.projectExId,
            schemaExId: TEST_CONFIG.schemaExId,
          },
        },
      },
    });
    await prisma.evaluationSession.deleteMany({
      where: {
        goldenSet: {
          projectExId: TEST_CONFIG.projectExId,
          schemaExId: TEST_CONFIG.schemaExId,
        },
      },
    });
    logger.info('Cleanup complete\n');

    const goldenSetInfo = await step1_fetchOrCreateGoldenSet();
    logger.info(
      `\nGolden Set: ${goldenSetInfo.goldenSetId} (${goldenSetInfo.projectExId}/${goldenSetInfo.schemaExId})\n`
    );

    const copilotOutput = await step2_executeCopilot(
      goldenSetInfo.projectExId,
      goldenSetInfo.query
    );
    logger.info(`\nCopilot Output (${copilotOutput.length} chars)\n`);

    const { sessionId, threadId, questionSetDraft } = await step3_runLangGraphWithHITL(
      goldenSetInfo.goldenSetId,
      goldenSetInfo.projectExId,
      goldenSetInfo.schemaExId,
      goldenSetInfo.copilotType,
      goldenSetInfo.query,
      copilotOutput
    );
    logger.info(`\nSession: ${sessionId}, Thread: ${threadId}\n`);

    const questionSetFinal = await step4_submitQuestionSetReview(sessionId, threadId, questionSetDraft);

    await step5_submitHumanEvaluation(sessionId, threadId, questionSetFinal);

    const finalReport = await step6_verifyFinalReport(sessionId);

    logger.info('\n' + '='.repeat(60));
    logger.info('TEST SUMMARY');
    logger.info('='.repeat(60));

    const passed = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const totalDuration = Date.now() - totalStart;

    logger.info(`\nResults: ${passed} passed, ${failed} failed`);
    logger.info(`Total Duration: ${totalDuration}ms`);

    if (finalReport) {
      logger.info(`\nFinal Report:`);
      logger.info(`  Verdict: ${finalReport.verdict}`);
      logger.info(`  Overall Score: ${finalReport.overallScore}`);
      logger.info(`  Summary: ${finalReport.summary.substring(0, 200)}...`);
    }

    logger.info('\n' + '='.repeat(60));

    if (failed > 0) {
      logger.error('\nTEST FAILED');
      process.exitCode = 1;
    } else {
      logger.info('\nTEST PASSED');
      process.exitCode = 0;
    }
  } catch (error) {
    logger.error('\nTEST ABORTED:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

runFullE2ETest();
