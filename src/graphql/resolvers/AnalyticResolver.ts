import { graphExecutionService } from '../../services/GraphExecutionService.ts';
import { analyticsService } from '../../services/AnalyticsService.ts';
import { goldenSetService } from '../../services/GoldenSetService.ts';
import { EvaluationJobRunner } from '../../jobs/EvaluationJobRunner.ts';
import { RUN_KUBERNETES_JOBS } from '../../config/env.ts';
import {
  applyAndWatchJob,
  type EvalJobResult,
} from '../../kubernetes/utils/apply-from-file.ts';
import { logger } from '../../utils/logger.ts';

// Kubernetes namespace for evaluation jobs
const K8S_NAMESPACE = process.env['KUBERNETES_NAMESPACE'] || 'ai-evaluation';
// Path to the EvaluationJobRunner script for K8s execution
const EVALUATION_JOB_SCRIPT_PATH = 'src/jobs/EvaluationJobRunner.ts';

/**
 * Build WebSocket URL for copilot simulation.
 * The base URL should be configured in environment variables.
 */
function buildWsUrl(projectExId: string): string {
  const wsBaseUrl = process.env['WS_URL'] || 'wss://copilot.functorz.work/';
  const userToken = process.env['userToken'] || '';
  const clientType = process.env['clientType'] || 'WEB';
  return `${wsBaseUrl}userToken=${userToken}&projectExId=${projectExId}&clientType=${clientType}`;
}

export const analyticResolver = {
  Query: {
    getEvaluationResult: async (_: unknown, args: { goldenSetId: number }) => {
      try {
        const result = await analyticsService.getEvaluationResultsByGoldenSet(
          args.goldenSetId
        );
        return result;
      } catch (error) {
        logger.error('Error fetching evaluation results:', error);
        throw new Error('Failed to fetch evaluation results');
      }
    },

    compareModels: async (
      _: unknown,
      args: { goldenSetId: number; modelNames: string[] }
    ) => {
      try {
        const result = await analyticsService.compareModels(
          args.goldenSetId,
          args.modelNames
        );
        return result;
      } catch (error) {
        logger.error('Error comparing models:', error);
        throw new Error('Failed to compare models');
      }
    },

    getDashboardMetrics: async (
      _: unknown,
      args: {
        modelName?: string;
        startDate?: Date;
        endDate?: Date;
      }
    ) => {
      try {
        const result = await analyticsService.getDashboardMetrics(args);
        return result;
      } catch (error) {
        logger.error('Error fetching dashboard metrics:', error);
        throw new Error('Failed to fetch dashboard metrics');
      }
    },
  },

  Mutation: {
    /**
     * Execute AI Copilot evaluation workflow.
     *
     * Complete workflow:
     * 1. Get golden set by ID
     * 2. Find pending userInputs (those without corresponding copilotOutputs)
     *    - r = userInput.length, l = copilotOutput.length
     *    - pending = userInputs[l..r-1]
     * 3. Set isActive[l..r-1] = true
     * 4. For each pending userInput (sequentially, copilot doesn't support concurrency):
     *    a. Run EvaluationJobRunner with userInput.content
     *    b. Wait for editableText result
     *    c. Append copilotOutput to goldenSet
     *    d. Start LangGraph workflow (concurrently - doesn't wait)
     * 5. Return true when all copilot simulations are complete
     */
    execAiCopilot: async (
      _: unknown,
      args: {
        goldenSetId?: number;
        modelName?: string;
        skipHumanReview?: boolean;
        skipHumanEvaluation?: boolean;
      }
    ) => {
      try {
        if (!args.goldenSetId) {
          throw new Error('goldenSetId is required');
        }

        const goldenSetId = args.goldenSetId;
        const modelName = args.modelName ?? 'gpt-4';
        const skipHumanReview = args.skipHumanReview ?? true;
        const skipHumanEvaluation = args.skipHumanEvaluation ?? true;

        logger.info('Starting execAiCopilot workflow', {
          goldenSetId,
          modelName,
        });

        // Step 1: Get pending userInputs
        const {
          goldenSet,
          pendingInputs,
          startIndex,
          totalUserInputs,
          totalCopilotOutputs,
        } = await goldenSetService.getPendingUserInputs(goldenSetId);

        logger.info('Golden set status', {
          goldenSetId,
          projectExId: goldenSet.projectExId,
          totalUserInputs,
          totalCopilotOutputs,
          pendingCount: pendingInputs.length,
          startIndex,
        });

        // If no pending inputs, just run LangGraph on existing data
        if (pendingInputs.length === 0) {
          logger.info('No pending userInputs, running LangGraph workflow only');
          // await graphExecutionService.startSession(
          //   goldenSetId,
          //   modelName,
          //   skipHumanReview,
          //   skipHumanEvaluation
          // );
          return true;
        }

        // Step 2: Set isActive[l..r-1] = true for pending inputs
        await goldenSetService.setIsActiveRange(
          goldenSetId,
          startIndex,
          totalUserInputs,
          true
        );

        // Track LangGraph workflow promises for concurrent execution
        const langGraphPromises: Promise<unknown>[] = [];

        // Step 3: Process each pending userInput sequentially
        for (let i = 0; i < pendingInputs.length; i++) {
          const userInput = pendingInputs[i];
          const absoluteIndex = startIndex + i;

          if (!userInput) {
            logger.warn(`Skipping null userInput at index ${absoluteIndex}`);
            continue;
          }

          logger.info(
            `Processing userInput ${absoluteIndex + 1}/${totalUserInputs}`,
            {
              userInputId: userInput.id,
              contentPreview: userInput.content.substring(0, 100),
            }
          );

          try {
            // Build WebSocket URL for this project
            const wsUrl = buildWsUrl(goldenSet.projectExId);

            let editableText: string;

            if (RUN_KUBERNETES_JOBS) {
              // Run as Kubernetes job
              const jobName = `eval-${
                goldenSet.projectExId
              }-${absoluteIndex}-${Date.now()}`;
              logger.info(`Running evaluation as K8s job: ${jobName}`);

              const k8sResult = (await applyAndWatchJob(
                jobName,
                K8S_NAMESPACE,
                EVALUATION_JOB_SCRIPT_PATH,
                300000, // 5 minute timeout
                'evaluation',
                goldenSet.projectExId,
                wsUrl,
                userInput.content
              )) as EvalJobResult;

              if (k8sResult.status !== 'succeeded' || !k8sResult.editableText) {
                throw new Error(
                  `K8s evaluation job failed: ${
                    k8sResult.reason || 'No editable text returned'
                  }`
                );
              }

              editableText = k8sResult.editableText;
            } else {
              // Run directly in-process
              const jobRunner = new EvaluationJobRunner(
                goldenSet.projectExId,
                wsUrl,
                userInput.content // This is already a string from DB
              );

              jobRunner.startJob();

              // Wait for copilot to complete (sequential - copilot doesn't support concurrency)
              const result = await jobRunner.waitForCompletion();
              editableText = result.editableText;
            }

            logger.info(
              `Copilot simulation complete for index ${absoluteIndex}`,
              {
                editableTextLength: editableText.length,
              }
            );

            // Append copilotOutput to goldenSet
            await goldenSetService.appendCopilotOutput(
              goldenSetId,
              editableText,
              absoluteIndex
            );

            logger.info(`Appended copilotOutput at index ${absoluteIndex}`);

            // Start LangGraph workflow concurrently (don't await)
            const langGraphPromise = graphExecutionService
              .startSession(
                goldenSetId,
                modelName,
                skipHumanReview,
                skipHumanEvaluation
              )
              .then((sessionResult) => {
                logger.info(
                  `LangGraph workflow started for index ${absoluteIndex}`,
                  {
                    sessionId: sessionResult.sessionId,
                    status: sessionResult.status,
                  }
                );
                return sessionResult;
              })
              .catch((error) => {
                logger.error(
                  `LangGraph workflow failed for index ${absoluteIndex}`,
                  error
                );
                // Don't throw - let other workflows continue
                return null;
              });

            langGraphPromises.push(langGraphPromise);

            // Set isActive[i] = false after processing
            // await goldenSetService.setIsActiveAtIndex(
            //   goldenSetId,
            //   absoluteIndex,
            //   false
            // );
          } catch (error) {
            logger.error(
              `Error processing userInput at index ${absoluteIndex}`,
              error
            );
            // Set isActive to false even on error
            await goldenSetService.setIsActiveAtIndex(
              goldenSetId,
              absoluteIndex,
              false
            );
            // Continue with next input instead of failing entire workflow
          }
        }

        // Wait for all LangGraph workflows to complete (they run concurrently)
        if (langGraphPromises.length > 0) {
          logger.info(
            `Waiting for ${langGraphPromises.length} LangGraph workflows to complete`
          );
          await Promise.all(langGraphPromises);
          logger.info('All LangGraph workflows completed');
        }

        return true;
      } catch (error) {
        logger.error('Error executing AI copilot:', error);
        throw new Error('Failed to execute AI copilot');
      }
    },
  },
};
